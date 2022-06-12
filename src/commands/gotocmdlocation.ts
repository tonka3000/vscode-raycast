import { ExtensionManager } from "../manager";
import { CommandTreeItem } from "../tree";
import * as vscode from "vscode";
import { showTextDocumentAtPosition } from "../utils";
import path = require("path");
import { readManifestAST, readManifestFile } from "../manifest";

async function getCommandPositionInFile(filename: string, cmdName: string): Promise<vscode.Position | undefined> {
  try {
    const mani = await readManifestAST(filename);
    return mani.getPosition(`commands.[name=${cmdName}]`);
  } catch (error) {}
  return undefined;
}

export async function gotoCommandManifestLocationCmd(manager: ExtensionManager, args: any[] | undefined) {
  manager.logger.debug("goto command manifest location command");
  let cmdName: string | undefined;
  if (args && args.length > 0) {
    const a0 = args[0];
    if (a0 === undefined) {
      const manifest = await readManifestFile(manager.getActiveWorkspacePackageFilename());
      if (manifest) {
        const items: vscode.QuickPickItem[] | undefined = manifest.commands?.map((c) => ({
          label: c.title || c.name || "?",
          description: c.name || "?",
        }));
        if (items) {
          const pick = await vscode.window.showQuickPick(items);
          if (pick) {
            cmdName = pick.description;
          }
        } else {
          throw Error("No commands defined");
        }
      }
    } else if (a0 instanceof CommandTreeItem) {
      const item = a0 as CommandTreeItem;
      if (!item.cmd.name) {
        throw Error("No command name defined");
      }
      cmdName = item.cmd.name;
    } else {
      throw Error("Wrong argument type");
    }
  }

  if (cmdName) {
    const ws = manager.getActiveWorkspace();
    if (!ws) {
      throw Error("No active workspace");
    }
    const filename = path.join(ws.uri.fsPath, "package.json");
    const pos = await getCommandPositionInFile(filename, cmdName);
    const uri = vscode.Uri.file(filename);
    await showTextDocumentAtPosition(uri, pos);
  }
}
