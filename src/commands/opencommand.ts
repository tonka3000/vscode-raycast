import path = require("path");
import * as vscode from "vscode";
import { ExtensionManager } from "../manager";
import { readManifestFile } from "../manifest";
import { CommandTreeItem } from "../tree";
import { fileExists } from "../utils";

async function findCommandFileInFolder(commandName: string, folder: string): Promise<string> {
  const exts = ["tsx", "ts", "jsx", "js"];
  for (const e of exts) {
    const fn = path.join(folder, `${commandName}.${e}`);
    if (await fileExists(fn)) {
      return fn;
    }
  }
  return path.join(folder, `${commandName}.tsx`); // return default
}

export async function openCommandCmd(manager: ExtensionManager, args: any[] | undefined) {
  manager.logger.debug("open command");
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
    } else if (a0 instanceof CommandTreeItem) {
      const item = a0 as CommandTreeItem;
      if (!item.cmd?.name) {
        throw Error("No command name defined");
      }
      cmdName = item.cmd?.name;
    } else {
      throw Error("Wrong argument type");
    }
  }
  if (cmdName && cmdName.length > 0) {
    const ws = manager.getActiveWorkspace();
    if (ws) {
      const src = path.join(ws.uri.fsPath, "src");
      const fn = await findCommandFileInFolder(cmdName, src);
      manager.logger.debug(`open file ${fn}`);
      await vscode.commands.executeCommand("vscode.open", vscode.Uri.file(fn));
    }
  }
}
