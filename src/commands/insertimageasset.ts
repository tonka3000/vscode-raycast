import { ExtensionManager } from "../manager";
import * as vscode from "vscode";

export async function insertImageAssetCmd(manager: ExtensionManager) {
  const editor = vscode.window.activeTextEditor;
  if (editor && editor.document) {
    const assets = await manager.getImageAssets();
    const filename = await vscode.window.showQuickPick(assets, {
      placeHolder: "Choose Image Asset",
    });
    if (filename !== undefined && filename.length > 0) {
      editor
        .edit((builder) => {
          builder.replace(editor.selection, filename);
        })
        .then((success) => {
          if (success) {
            const pos = editor.selection.end;
            editor.selection = new vscode.Selection(pos, pos);
          }
        });
    }
  }
}
