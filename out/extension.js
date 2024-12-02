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
const vscode = __importStar(require("vscode"));
async function disable(context) {
    try {
        const cssFilePath = vscode.Uri.file(path_1.default.join(context.extensionPath, 'assets', 'rtl.css')).toString();
        const jsFilePath = vscode.Uri.file(path_1.default.join(context.extensionPath, 'assets', 'rtl.js')).toString();
        let preImportArray = await vscode.workspace.getConfiguration().get("vscode_custom_css.imports") || [];
        preImportArray = preImportArray.filter(i => i !== cssFilePath && i !== jsFilePath);
        await vscode.workspace.getConfiguration().update("vscode_custom_css.imports", preImportArray, vscode.ConfigurationTarget.Workspace);
        await vscode.workspace.getConfiguration('editor').update("fontFamily", undefined, vscode.ConfigurationTarget.Global);
        await vscode.commands.executeCommand("vccsilent.uninstallCustomCSS");
        await vscode.commands.executeCommand("fixChecksums.restore");
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
    const previousVersion = context.globalState.get('vscodeVersion');
    const currentVersion = vscode.version;
    if (previousVersion !== currentVersion) {
        context.globalState.update('vscodeVersion', currentVersion);
        if (previousVersion) {
            status = 'init';
        }
    }
    if (['init', 'enabled'].includes(status)) {
        let extensionId = 'be5invis.vscode-custom-css';
        let otherExt = vscode.extensions.getExtension(extensionId);
        vscode.extensions.onDidChange(async () => {
            otherExt = vscode.extensions.getExtension(extensionId);
            if (otherExt && !otherExt.activate) {
                extensionId = 'alirezakay.rtltextdocuments';
                otherExt = vscode.extensions.getExtension(extensionId);
                await otherExt?.activate();
            }
        });
        if (otherExt?.isActive) {
            vscode.window.showErrorMessage('The extension `vscode-custom-css` is not compatible with `rtltextdocuments`. Please uninstall or disable it to proceed!\n\nRELOAD window after deactivating `vscode-custom-css` extension', { modal: true });
            return;
        }
        extensionId = 'alirezakay.vscode-custom-css-silent';
        otherExt = vscode.extensions.getExtension(extensionId);
        if (otherExt) {
            await otherExt.activate();
        }
        else {
            const installOption = 'Install Extension';
            const choice = await vscode.window.showErrorMessage('The required extension `vscode-custom-css-silent` is not installed. Please install it to proceed.', installOption);
            if (choice === installOption) {
                vscode.env.openExternal(vscode.Uri.parse(`vscode-insiders://${extensionId}`, true));
                vscode.env.openExternal(vscode.Uri.parse(`vscode://${extensionId}`, true));
            }
        }
        extensionId = 'rimuruchan.vscode-fix-checksums-next';
        otherExt = vscode.extensions.getExtension(extensionId);
        if (otherExt) {
            await otherExt.activate();
        }
        else {
            const installOption = 'Install Extension';
            const choice = await vscode.window.showErrorMessage('The required extension `vscode-fix-checksums-next` is not installed. Please install it to proceed.', installOption);
            if (choice === installOption) {
                vscode.env.openExternal(vscode.Uri.parse(`vscode-insiders://${extensionId}`, true));
                vscode.env.openExternal(vscode.Uri.parse(`vscode://${extensionId}`, true));
            }
        }
    }
    let disposable;
    if (status === 'enabled') {
        const cssFilePath = vscode.Uri.file(path_1.default.join(context.extensionPath, 'assets', 'rtl.css')).toString();
        const jsFilePath = vscode.Uri.file(path_1.default.join(context.extensionPath, 'assets', 'rtl.js')).toString();
        let preImportArray = await vscode.workspace.getConfiguration().get("vscode_custom_css.imports") || [];
        const importsArray = preImportArray.filter(i => [cssFilePath, jsFilePath].includes(i));
        if (importsArray[0] && importsArray[1]) {
            console.info("[RTL EXTENSION]::ENABLED");
            vscode.commands.executeCommand('setContext', 'rtltextdocuments.status', 'enabled');
            disposable = vscode.commands.registerCommand('rtltextdocuments.disableRTL', async () => {
                await context.secrets.store("status", 'disabled');
                await disable(context);
            });
            context.subscriptions.push(disposable);
        }
        else {
            status = 'init';
        }
    }
    if (status === 'init') {
        console.info("[RTL EXTENSION]::INIT");
        const cssFilePath = vscode.Uri.file(path_1.default.join(context.extensionPath, 'assets', 'rtl.css')).toString();
        const jsFilePath = vscode.Uri.file(path_1.default.join(context.extensionPath, 'assets', 'rtl.js')).toString();
        let importsArray = [cssFilePath, jsFilePath];
        let preImportArray = await vscode.workspace.getConfiguration().get("vscode_custom_css.imports") || [];
        importsArray = importsArray.filter(i => !preImportArray.includes(i));
        await context.secrets.store("status", 'enabled');
        await vscode.workspace.getConfiguration().update("vscode_custom_css.imports", [...preImportArray, ...importsArray], vscode.ConfigurationTarget.Workspace);
        await vscode.workspace.getConfiguration('editor').update("fontFamily", "vazircode, Consolas, 'Courier New', monospace", vscode.ConfigurationTarget.Global);
        await vscode.commands.executeCommand("vccsilent.updateCustomCSS");
        await vscode.commands.executeCommand("fixChecksums.apply");
        return;
    }
    else if (status === 'disabled') {
        console.info("[RTL EXTENSION]::DISABLED");
        vscode.commands.executeCommand('setContext', 'rtltextdocuments.status', 'disabled');
        disposable = vscode.commands.registerCommand('rtltextdocuments.enableRTL', async () => {
            await context.secrets.store("status", 'init');
            await vscode.commands.executeCommand("vccsilent.updateCustomCSS");
            await vscode.commands.executeCommand("fixChecksums.apply");
        });
        context.subscriptions.push(disposable);
        return;
    }
    else {
        if (status !== 'enabled') {
            return;
        }
    }
    function isRTL(text = "") {
        const rtlRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
        return rtlRegex.test(text.trimStart());
    }
    function cursorMove(def, to, by = "character", select = false) {
        return () => {
            const editor = vscode.window.activeTextEditor;
            let line = editor?.selection.active.line;
            line = line === 0 ? line : (line ? line : -1);
            if (line > -1) {
                const text = (editor?.document.getText().split("\n")[line]) || "";
                if (isRTL(text[0])) {
                    if (by === "word") {
                        if (to === "left") {
                            if (select) {
                                vscode.commands.executeCommand("cursorWordEndLeftSelect");
                            }
                            else {
                                vscode.commands.executeCommand("cursorWordEndLeft");
                            }
                        }
                        else if (to === "right") {
                            if (select) {
                                vscode.commands.executeCommand("cursorWordStartRightSelect");
                            }
                            else {
                                vscode.commands.executeCommand("cursorWordStartRight");
                            }
                        }
                    }
                    else {
                        vscode.commands.executeCommand("cursorMove", { to: to, by, select });
                    }
                }
                else {
                    vscode.commands.executeCommand("cursorMove", { to: def, by, select });
                }
            }
        };
    }
    const commands = [
        // left
        { name: "cursorLeft", callback: cursorMove("left", "right") },
        { name: "cursorLeftSelect", callback: cursorMove("left", "right", "character", true) },
        { name: "cursorWordLeft", callback: cursorMove("left", "right", "word") },
        { name: "cursorWordLeftSelect", callback: cursorMove("left", "right", "word", true) },
        { name: "cursorHome", callback: cursorMove("wrappedLineStart", "wrappedLineEnd", "wrappedLine") },
        { name: "cursorHomeSelect", callback: cursorMove("wrappedLineStart", "wrappedLineEnd", "wrappedLine", true) },
        // right
        { name: "cursorRight", callback: cursorMove("right", "left") },
        { name: "cursorRightSelect", callback: cursorMove("right", "left", "character", true) },
        { name: "cursorWordEndRight", callback: cursorMove("right", "left", "word") },
        { name: "cursorWordEndRightSelect", callback: cursorMove("right", "left", "word", true) },
        { name: "cursorEnd", callback: cursorMove("wrappedLineEnd", "wrappedLineStart", "wrappedLine") },
        { name: "cursorEndSelect", callback: cursorMove("wrappedLineEnd", "wrappedLineStart", "wrappedLine", true) },
    ];
    commands.forEach((cmd) => {
        vscode.commands.registerCommand(cmd.name, cmd.callback);
    });
}
async function deactivate(context) {
    await disable(context);
}
//# sourceMappingURL=extension.js.map