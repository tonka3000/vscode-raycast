import * as fs from "fs";
import * as vscode from "vscode";

export function getModTimeSync(filename: string): Date | undefined {
  return fs.statSync(filename)?.mtime;
}

export async function fileExists(filename: string): Promise<boolean> {
  return fs.promises
    .access(filename, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

export function fileExistsSync(p: string): boolean {
  try {
    fs.accessSync(p);
  } catch (err) {
    return false;
  }
  return true;
}

export function capitalizeFirstLetter(name: string | undefined): string | undefined {
  if (name === undefined) {
    return undefined;
  }
  if (name === "") {
    return name;
  }
  return name.replace(/^./, name[0].toUpperCase());
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error";
}

export async function showTextDocumentAtPosition(uri: vscode.Uri, position?: vscode.Position) {
  const openDoc = async (uri: vscode.Uri) => {
    await vscode.commands.executeCommand("vscode.open", uri); // use command to get default behavior of vscode
  };
  if (position) {
    try {
      const doc = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(doc);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(editor.selection);
    } catch (error) {
      await openDoc(uri);
    }
  } else {
    await openDoc(uri);
  }
}
