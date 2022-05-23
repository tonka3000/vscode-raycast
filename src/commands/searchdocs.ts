import { ExtensionManager } from "../manager";
import * as vscode from "vscode";
import { searchInDocs } from "../docs";

export async function searchDocsCmd(manager: ExtensionManager) {
  const query = await vscode.window.showInputBox({
    value: "",
    placeHolder: "Enter Search Term",
    validateInput: (text: string) => {
      return text === "" ? "Search Term could not be empty" : null;
    },
  });
  if (query && query.length > 0) {
    searchInDocs(manager, query);
  }
}
