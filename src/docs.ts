import { ExtensionManager } from "./manager";
import * as vscode from "vscode";

const docsBaseURL = "https://developers.raycast.com";

export async function openDocsInBrowser(manager: ExtensionManager) {
  manager.logger.debug("open docs in browser");
  vscode.env.openExternal(vscode.Uri.parse(docsBaseURL));
}

export async function searchInDocs(manager: ExtensionManager, query: string) {
  const safeQuery = encodeURIComponent(query);
  manager.logger.debug(`search ${query} in docs`);
  const url = `${docsBaseURL}/?q=${safeQuery}`;
  vscode.env.openExternal(vscode.Uri.parse(url));
}
