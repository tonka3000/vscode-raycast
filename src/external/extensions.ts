import * as vscode from "vscode";

export interface ExtensionMetadata {
  id: string;
  active: boolean;
  version: string;
  publisher: string;
  displayName: string;
  description?: string;
}

export function getExtensions(): ExtensionMetadata[] {
  const exts = vscode.extensions.all;
  const result: ExtensionMetadata[] = [];
  for (const e of exts) {
    result.push({
      id: e.id,
      active: e.isActive,
      version: e.packageJSON.version as string,
      publisher: e.packageJSON.publisher as string,
      displayName: e.packageJSON.displayName,
      description: e.packageJSON.description,
    });
  }
  return result;
}
