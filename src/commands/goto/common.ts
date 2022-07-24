import * as vscode from "vscode";
import { ExtensionManager } from "../../manager";
import { Command, readManifestAST, readManifestFile } from "../../manifest";
import { RaycastTreeItem } from "../../tree";
import { showTextDocumentAtPosition } from "../../utils";

export interface CommandLocationArgs {
  manager: ExtensionManager;
  args: any[];
  property: string;
  filterCommand?: (cmd: Command) => boolean;
}

export async function gotoCommandPropertyLocation(clargs: CommandLocationArgs) {
  let cmdName: string | undefined;
  const args = clargs.args;
  const manager = clargs.manager;
  if (args && args.length > 0) {
    const a0 = args[0];
    if (a0 === undefined) {
      const manifest = await readManifestFile(manager.getActiveWorkspacePackageFilename());
      if (manifest) {
        const filteredCmds = clargs.filterCommand ? manifest.commands?.filter(clargs.filterCommand) : manifest.commands;
        const cmds: vscode.QuickPickItem[] | undefined = filteredCmds?.map((c) => ({
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
    } else if (a0 instanceof RaycastTreeItem) {
      const item = a0 as RaycastTreeItem;
      const itemAny = item as any;
      if (!itemAny.cmd?.name) {
        throw Error("No command name defined");
      }
      cmdName = itemAny.cmd?.name;
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
    const pos = mani.getPosition(`commands.[name=${cmdName}].${clargs.property}`);
    const uri = vscode.Uri.file(filename);
    await showTextDocumentAtPosition(uri, pos);
  }
}
