import path from 'path';
import * as vscode from 'vscode';

async function disable(context: vscode.ExtensionContext) {
    try {
        const fontFilePath = vscode.Uri.file(
            path.join(context.extensionPath, 'assets', 'cascadia.css')
        ).toString();
        const cssFilePath = vscode.Uri.file(
            path.join(context.extensionPath, 'assets', 'rtl.css')
        ).toString();
        const jsFilePath = vscode.Uri.file(
            path.join(context.extensionPath, 'assets', 'rtl.js')
        ).toString();
        let preImportArray: Array<string> = await vscode.workspace.getConfiguration().get("vscode_custom_css_silent.imports") || [];
        preImportArray = preImportArray.filter(i => i !== cssFilePath && i !== jsFilePath && i !== fontFilePath);

        await vscode.workspace.getConfiguration().update("vscode_custom_css_silent.imports", preImportArray, vscode.ConfigurationTarget.Workspace);
        await vscode.workspace.getConfiguration('editor').update("fontFamily", undefined, vscode.ConfigurationTarget.Global);
        await vscode.commands.executeCommand("vccsilent.uninstallCustomCSS");
    }
    catch (err: Error | any) {
        vscode.window.showErrorMessage(`Error while disabling the Extension: ${String(err)}`);
    }
}

export async function activate(context: vscode.ExtensionContext) {
    let status: string = await context.secrets.get('status') || "";
    if (!status || !['init', 'enabled', 'disabled'].includes(status)) {
        await context.secrets.store('status', 'init');
        status = 'init';
        await vscode.commands.executeCommand('setContext', 'rtltextdocuments.status', 'init');
    }

    if (['init', 'enabled'].includes(status)) {
        let extensionId = 'be5invis.vscode-custom-css';
        let otherExt = vscode.extensions.getExtension(extensionId);
        if (otherExt?.isActive) {
            vscode.window.showErrorMessage('The extension `vscode-custom-css` is not compatible with `rtltextdocuments`. Please uninstall or disable it to proceed!\n\nRELOAD window after deactivating `vscode-custom-css` extension', { modal: true });
            return;
        }
        extensionId = 'alirezakay.vscode-custom-css-silent';
        otherExt = vscode.extensions.getExtension(extensionId);
        try {
            if (otherExt && !otherExt.isActive) {
                await otherExt.activate();
                await context.secrets.store('status', 'init');
                status = 'init';
                await vscode.commands.executeCommand('setContext', 'rtltextdocuments.status', 'init');
                await activate(context);
                return;
            }
        } catch { }
    }

    let disposable;
    if (status === 'enabled') {
        const vccsilentStatus = await vscode.commands.executeCommand('vccsilent.getStatus');        
        if (vccsilentStatus === "disabled") {
            vscode.window.showWarningMessage(`The 'vscode-custom-css-silent' got disabled internally; rtl-text-document is now being disabled as well! You can re-enable it using the command palette: 'Enable RTL-Text-Documents Extension'`);
            await context.secrets.store('status', 'disabled');
            status = 'disabled';
            await vscode.commands.executeCommand('setContext', 'rtltextdocuments.status', 'disabled');
            await activate(context);
            return;
        }
        const fontFilePath = vscode.Uri.file(
            path.join(context.extensionPath, 'assets', 'cascadia.css')
        ).toString();
        const cssFilePath = vscode.Uri.file(
            path.join(context.extensionPath, 'assets', 'rtl.css')
        ).toString();
        const jsFilePath = vscode.Uri.file(
            path.join(context.extensionPath, 'assets', 'rtl.js')
        ).toString();
        let preImportArray: Array<string> = await vscode.workspace.getConfiguration().get("vscode_custom_css_silent.imports") || [];
        const importsArray = preImportArray.filter(i => [fontFilePath, cssFilePath, jsFilePath].includes(i));
        if (importsArray[0] && importsArray[1] && importsArray[2]) {
            console.info("[RTL EXTENSION]::ENABLED");
            await vscode.workspace.getConfiguration('editor').update("wordWrap", "on", vscode.ConfigurationTarget.Global);
            await vscode.workspace.getConfiguration('editor').update("fontFamily", "unikode, Consolas, 'Courier New', monospace", vscode.ConfigurationTarget.Global);
            await vscode.commands.executeCommand('setContext', 'rtltextdocuments.status', 'enabled');
            disposable = vscode.commands.registerCommand('rtltextdocuments.disableRTL', async () => {
                await context.secrets.store("status", 'disabled');
                await disable(context);
            });
            context.subscriptions.push(disposable);
            disposable = vscode.commands.registerCommand('rtltextdocuments.reInitializeRTL', async () => {
                await context.secrets.store('status', 'init');
                status = 'init';
                await vscode.commands.executeCommand('setContext', 'rtltextdocuments.status', 'init');
                await activate(context);
                return;
            });
            context.subscriptions.push(disposable);
            await vscode.commands.executeCommand("vccsilent.checkCustomCSS");
        }
        else {
            await context.secrets.store('status', 'init');
            status = 'init';
            await vscode.commands.executeCommand('setContext', 'rtltextdocuments.status', 'init');
        }
    }
    if (status === 'init') {
        console.info("[RTL EXTENSION]::INIT");
        await vscode.workspace.getConfiguration('editor').update("wordWrap", "on", vscode.ConfigurationTarget.Global);
        const fontFilePath = vscode.Uri.file(
            path.join(context.extensionPath, 'assets', 'cascadia.css')
        ).toString();
        const cssFilePath = vscode.Uri.file(
            path.join(context.extensionPath, 'assets', 'rtl.css')
        ).toString();
        const jsFilePath = vscode.Uri.file(
            path.join(context.extensionPath, 'assets', 'rtl.js')
        ).toString();
        let importsArray = [fontFilePath, cssFilePath, jsFilePath];
        let preImportArray: Array<string> = await vscode.workspace.getConfiguration().get("vscode_custom_css_silent.imports") || [];
        importsArray = importsArray.filter(i => !preImportArray.includes(i));
        await context.secrets.store("status", 'enabled');
        await vscode.workspace.getConfiguration().update("vscode_custom_css_silent.imports", [...preImportArray, ...importsArray], vscode.ConfigurationTarget.Workspace);
        await vscode.workspace.getConfiguration('editor').update("fontFamily", "unikode, Consolas, 'Courier New', monospace", vscode.ConfigurationTarget.Global);
        await vscode.commands.executeCommand("vccsilent.updateCustomCSS");
        return;
    }
    else if (status === 'disabled') {
        console.info("[RTL EXTENSION]::DISABLED");
        await vscode.workspace.getConfiguration('editor').update("wordWrap", undefined, vscode.ConfigurationTarget.Global);
        await vscode.commands.executeCommand('setContext', 'rtltextdocuments.status', 'disabled');
        disposable = vscode.commands.registerCommand('rtltextdocuments.enableRTL', async () => {
            await context.secrets.store('status', 'init');
            status = 'init';
            await vscode.commands.executeCommand('setContext', 'rtltextdocuments.status', 'init');
            await activate(context);
            return;
        });
        context.subscriptions.push(disposable);
        return;
    }
    else {
        if (status !== 'enabled') {
            return;
        }
    }

    function isRTL(text: string = ""): boolean {
        const rtlRegex = /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
        return rtlRegex.test(text.trimStart());
    }

    function cursorMove(def: string, to: string, by: string = "character", select: boolean = false): any {
        return async () => {
            const editor = vscode.window.activeTextEditor;
            let line = editor?.selection.active.line;
            line = line === 0 ? line : (line ? line : -1);
            if (line > -1) {
                const text = (editor?.document.getText().split("\n")[line]) || "";
                if (isRTL(text[0])) {
                    if (by === "word") {
                        if (to === "left") {
                            if (select) {
                                await vscode.commands.executeCommand("cursorWordEndLeftSelect");
                            }
                            else {
                                await vscode.commands.executeCommand("cursorWordEndLeft");
                            }
                        }
                        else if (to === "right") {
                            if (select) {
                                await vscode.commands.executeCommand("cursorWordStartRightSelect");
                            }
                            else {
                                await vscode.commands.executeCommand("cursorWordStartRight");
                            }
                        }
                    }
                    else {
                        await vscode.commands.executeCommand("cursorMove", { to: to, by, select });
                    }
                }
                else {
                    if (by === "word") {
                        if (to === "right") {
                            if (select) {
                                await vscode.commands.executeCommand("cursorWordEndLeftSelect");
                            }
                            else {
                                await vscode.commands.executeCommand("cursorWordEndLeft");
                            }
                        }
                        else if (to === "left") {
                            if (select) {
                                await vscode.commands.executeCommand("cursorWordStartRightSelect");
                            }
                            else {
                                await vscode.commands.executeCommand("cursorWordStartRight");
                            }
                        }
                    }
                    else {
                        await vscode.commands.executeCommand("cursorMove", { to: def, by, select });
                    }
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

export async function deactivate(context: vscode.ExtensionContext) {
    await disable(context);
}
