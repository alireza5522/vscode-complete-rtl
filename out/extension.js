"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const vscode = __importStar(require("vscode"));
async function disable(context) {
    try {
        const cssFilePath = vscode.Uri.file(path_1.default.join(context.extensionPath, 'assets', 'rtl.css')).toString();
        const jsFilePath = vscode.Uri.file(path_1.default.join(context.extensionPath, 'assets', 'rtl.js')).toString();
        let preImportArray = await vscode.workspace.getConfiguration().get("vscode_custom_css.imports") || [];
        preImportArray = preImportArray.filter(i => i !== cssFilePath && i !== jsFilePath);
        await vscode.workspace.getConfiguration().update("vscode_custom_css.imports", preImportArray, vscode.ConfigurationTarget.Workspace);
        await vscode.commands.executeCommand("extension.uninstallCustomCSS");
    }
    catch (err) {
        vscode.window.showErrorMessage(`Error while disabling the Extension: ${String(err)}`);
    }
}
async function activate(context) {
    let status = await context.secrets.get('status') || "";
    if (!status || !['init', 'enabled', 'disabled'].includes(status)) {
        await context.secrets.store('status', 'init');
        status = 'init';
        vscode.commands.executeCommand('setContext', 'rtltextdocuments.status', 'init');
    }
    if (['init', 'enabled'].includes(status)) {
        const customStyleExt = vscode.extensions.getExtension('be5invis.vscode-custom-css');
        const extensionId = customStyleExt?.id;
        if (customStyleExt) {
            await customStyleExt.activate();
        }
        else {
            const installOption = 'Install Extension';
            const choice = await vscode.window.showErrorMessage('The required extension is not installed. Please install it to proceed.', installOption);
            if (choice === installOption) {
                vscode.env.openExternal(vscode.Uri.parse(`vscode:extension/${extensionId}`));
            }
        }
    }
    async function do_rtl() {
        // await vscode.commands.executeCommand("workbench.action.reloadWindow");
    }
    function moveCursor(diffs) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // Exit if no active editor
        }
        const currentPositions = editor.selections.map(s => s.active);
        const newPositions = currentPositions.map((cp, idx) => cp.translate(diffs[idx][0], diffs[idx][1])); // Move by `offset` horizontally
        console.log("<>", newPositions[0]);
        // Create a new selection with the updated cursor position
        const newSelections = newPositions.map(newPosition => new vscode.Selection(newPosition, newPosition));
        editor.selections = newSelections;
    }
    let disposable;
    if (status === 'init') {
        const cssFilePath = vscode.Uri.file(path_1.default.join(context.extensionPath, 'assets', 'rtl.css')).toString();
        const jsFilePath = vscode.Uri.file(path_1.default.join(context.extensionPath, 'assets', 'rtl.js')).toString();
        let importsArray = [cssFilePath, jsFilePath];
        let preImportArray = await vscode.workspace.getConfiguration().get("vscode_custom_css.imports") || [];
        importsArray = importsArray.filter(i => !preImportArray.includes(i));
        await context.secrets.store("status", 'enabled');
        await vscode.workspace.getConfiguration().update("vscode_custom_css.imports", [...preImportArray, ...importsArray], vscode.ConfigurationTarget.Workspace);
        await vscode.commands.executeCommand("extension.updateCustomCSS");
        return;
    }
    else if (status === 'enabled') {
        vscode.commands.executeCommand('setContext', 'rtltextdocuments.status', 'enabled');
        disposable = vscode.commands.registerCommand('rtltextdocuments.convertThisFileToRTL', async () => {
            await do_rtl();
        });
        context.subscriptions.push(disposable);
        disposable = vscode.commands.registerCommand('rtltextdocuments.disableRTL', async () => {
            await context.secrets.store("status", 'disabled');
            await disable(context);
        });
        context.subscriptions.push(disposable);
    }
    else if (status === 'disabled') {
        vscode.commands.executeCommand('setContext', 'rtltextdocuments.status', 'disabled');
        disposable = vscode.commands.registerCommand('rtltextdocuments.enableRTL', async () => {
            await context.secrets.store("status", 'init');
            await vscode.commands.executeCommand("extension.installCustomCSS");
        });
        context.subscriptions.push(disposable);
        return;
    }
    else {
        return;
    }
    vscode.window.onDidChangeTextEditorSelection(e => {
        return;
        const newPositions = e.selections.map(s => s.active);
        const lastPositions = context.workspaceState.get('lastPositions') || vscode.window.activeTextEditor?.selections.map(s => s.active) || [];
        const document = vscode.window.activeTextEditor?.document;
        const diffs = [];
        for (let i = 0; i < newPositions.length; i++) {
            const newPos = newPositions[i];
            for (let j = 0; j < lastPositions.length; j++) {
                const lastPos = lastPositions[j];
                let diff = 0;
                if (newPos.line === lastPos.line) {
                    diff = newPos.character - lastPos.character;
                    if (Math.abs(diff) === 2) {
                        diffs.push([0, 0]);
                        continue;
                    }
                    if (lastPos.character === 0) {
                        const newLine = lastPos.line - 1;
                        if (newLine > -1) {
                            const len = document?.lineAt(newLine).text.length || 0;
                            diffs.push([-1, len]);
                        }
                        else {
                            diffs.push([0, 0]);
                            continue;
                        }
                    }
                    else if (lastPos.character === document?.lineAt(lastPos.line).text.length) {
                        const newLine = lastPos.line + 1;
                        if (newLine <= (document?.lineCount || 0)) {
                            diffs.push([1, -lastPos.character]);
                        }
                        else {
                            diffs.push([0, 0]);
                            continue;
                        }
                    }
                    else {
                        diffs.push([0, -2 * diff]);
                    }
                }
                else if (Math.abs(newPos.line - lastPos.line) === 1) {
                    diff = newPos.line - lastPos.line;
                    // Right
                    if (diff > 0 && newPos.character === 0) {
                        const newChar = lastPos.character - 1;
                        const lineLen = document?.lineAt(lastPos.line).text.length || 0;
                        if (newChar > -1) {
                            if (newPos.character === 0) {
                                diffs.push([-1, newChar]);
                            }
                            else {
                                diffs.push([0, 0]);
                                continue;
                            }
                        }
                        else {
                            const newLine = lastPos.line - 1;
                            if (newLine > -1) {
                                diffs.push([-2, 0]);
                            }
                            else {
                                diffs.push([0, 0]);
                                continue;
                            }
                        }
                    }
                    // Left
                    if (diff < 0 && lastPos.character === 0) {
                        const newChar = lastPos.character + 1;
                        const lineLen = document?.lineAt(lastPos.line).text.length || 0;
                        if (newChar <= lineLen) {
                            const newLineLen = document?.lineAt(newPos.line).text.length || 0;
                            if (newPos.character === newLineLen) {
                                diffs.push([1, -newPos.character]);
                            }
                            else {
                                diffs.push([0, 0]);
                                continue;
                            }
                        }
                        else {
                            const newLine = lastPos.line + 1;
                            const lineCount = document?.lineCount || 0;
                            if (newLine <= lineCount) {
                                diffs.push([2, 0]);
                            }
                            else {
                                diffs.push([0, 0]);
                                continue;
                            }
                        }
                    }
                }
            }
            context.workspaceState.update('lastPositions', newPositions);
            moveCursor(diffs);
        }
    });
    vscode.workspace.onDidOpenTextDocument(async (document) => {
        return;
        let text = fs_1.default.readFileSync(document.uri.fsPath).toString();
        text = text.split("\n").map(s => `\u202B${s}\u202C`).join("\n");
        const edit = new vscode.WorkspaceEdit();
        edit.createFile(document.uri, {
            contents: new TextEncoder().encode(text),
            overwrite: true,
            ignoreIfExists: false
        });
        vscode.workspace.applyEdit(edit);
        vscode.workspace.save(document.uri);
    });
}
async function deactivate(context) {
    await disable(context);
}
//# sourceMappingURL=extension.js.map