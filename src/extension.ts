import * as vscode from 'vscode';

const RLM = '\u200F'; // Right-to-Left Mark

export async function activate(context: vscode.ExtensionContext) {
    console.info("[RTL EXTENSION]::ACTIVATED");

    // تابع اصلی برای راست‌چین کردن خطوط
    function applyRTL(editor: vscode.TextEditor) {
        if (!editor) return;

        const fileName = editor.document.fileName;
        if (!fileName.includes(".rtl.")) return; // فقط فایل‌هایی با .rtl. اعمال شود

        editor.edit(editBuilder => {
            for (let i = 0; i < editor.document.lineCount; i++) {
                const line = editor.document.lineAt(i);
                if (!line.text.startsWith(RLM)) {
                    const range = new vscode.Range(i, 0, i, line.text.length);
                    editBuilder.replace(range, RLM + line.text);
                }
            }
        });
    }

    // هنگام فعال شدن، روی editor فعلی اعمال شود
    if (vscode.window.activeTextEditor) {
        applyRTL(vscode.window.activeTextEditor);
    }

    // هنگام تغییر متن یا باز کردن editor جدید
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            const editor = vscode.window.activeTextEditor;
            if (editor && event.document === editor.document) {
                applyRTL(editor);
            }
        })
    );

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor) applyRTL(editor);
        })
    );

    // Command برای اعمال دستی RTL روی فایل فعلی
    let disposable = vscode.commands.registerCommand('rtltextdocuments.toggleRTL', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        applyRTL(editor);
        vscode.window.showInformationMessage("RTL applied to this document.");
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    console.info("[RTL EXTENSION]::DEACTIVATED");
}
