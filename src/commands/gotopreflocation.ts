import { ExtensionManager } from "../manager";
import { PreferenceTreeItem } from "../tree";
import * as vscode from "vscode";
import { showTextDocumentAtPosition } from "../utils";
import path = require("path");
import { readManifestAST, readManifestFile } from "../manifest";

async function getPreferencePositionInFile(
  filename: string,
  prefName: string,
  cmdName?: string | undefined,
): Promise<vscode.Position | undefined> {
  try {
    const manifest = await readManifestAST(filename);
    return manifest.getPreferencePosition(prefName, cmdName);
  } catch (error) {
    console.log(error);
  }
}

export async function gotoPreferenceManifestLocationCmd(manager: ExtensionManager, args: any[]) {
  manager.logger.debug("goto preference manifest location");
  let prefName: string | undefined;
  let cmdName: string | undefined;
  if (args && args.length > 0) {
    const a0 = args[0];
    if (a0 === undefined) {
      const manifest = await readManifestFile(manager.getActiveWorkspacePackageFilename());
      if (manifest) {
        const items: vscode.QuickPickItem[] | undefined = manifest.preferences?.map((p) => ({
          label: (p.type === "checkbox" ? p.label : p.title) || p.name || "?",
          description: p.name || "?",
        }));
        if (items) {
          const pick = await vscode.window.showQuickPick(items);
          if (pick) {
            prefName = pick.description;
          }
        } else {
          throw Error("No preferences defined");
        }
      }
    } else if (a0 instanceof PreferenceTreeItem) {
      const item = a0 as PreferenceTreeItem;
      if (!item.preference.name) {
        throw Error("No preference name defined");
      }
      prefName = item.preference.name;
      cmdName = item.cmd?.name;
    } else {
      throw Error("Wrong argument type");
    }
  }
  if (prefName) {
    const ws = manager.getActiveWorkspace();
    if (!ws) {
      throw Error("No active workspace");
    }
    const filename = path.join(ws.uri.fsPath, "package.json");
    const pos = await getPreferencePositionInFile(filename, prefName, cmdName);
    const uri = vscode.Uri.file(filename);
    await showTextDocumentAtPosition(uri, pos);
  }
}
