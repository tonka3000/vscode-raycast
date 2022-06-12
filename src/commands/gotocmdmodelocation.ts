import { ExtensionManager } from "../manager";
import { readManifestAST, readManifestFile } from "../manifest";
import * as vscode from "vscode";
import { CommandModeTreeItem } from "../tree";
import { showTextDocumentAtPosition } from "../utils";

export async function gotoCommandModeManifestLocationCmd(manager: ExtensionManager, args: any[]) {
  let cmdName: string | undefined;
  if (args && args.length > 0) {
    const a0 = args[0];
    if (a0 === undefined) {
      const manifest = await readManifestFile(manager.getActiveWorkspacePackageFilename());
      if (manifest) {
        const cmds: vscode.QuickPickItem[] | undefined = manifest.commands?.map((c) => ({
          label: c.title || c.name || "?",
          description: c.name || "?",
        }));
        if (!cmds) {
          throw Error("No commands in manifest");
        }
        const pick = await vscode.window.showQuickPick(cmds, {
          placeHolder: "Choose Command",
          title: "Command",
        });
        if (pick === undefined) {
          return;
        }
        cmdName = pick.description;
      } else {
        throw Error("Could not read manifest");
      }
    } else if (a0 instanceof CommandModeTreeItem) {
      const item = a0 as CommandModeTreeItem;
      if (!item.cmd.name) {
        throw Error("No command name defined");
      }
      cmdName = item.cmd?.name;
    } else {
      throw Error("Wrong argument type");
    }
  }
  if (cmdName) {
    const filename = manager.getActiveWorkspacePackageFilename();
    if (!filename) {
      throw Error("No active workspace");
    }
    const mani = await readManifestAST(filename);
    const pos = mani.getPosition(`commands.[name=${cmdName}].mode`);
    const uri = vscode.Uri.file(filename);
    await showTextDocumentAtPosition(uri, pos);
  }
}
