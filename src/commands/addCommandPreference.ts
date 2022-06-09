import { ExtensionManager } from "../manager";
import * as vscode from "vscode";
import { readManifestFile } from "../manifest";
import { PreferencesTreeItem } from "../tree";
import { addPreferenceCmd } from "./addPreference";

export async function addCommandPreferenceCmd(manager: ExtensionManager, args: any[] | undefined) {
  manager.logger.debug("add command preference to package.json");
  const ws = manager.getActiveWorkspace();
  if (ws) {
    let cmdName: string | undefined;
    if (args && args.length > 0) {
      const a0 = args[0];
      if (typeof a0 === "string") {
        const cmdNameText = a0 as string;
        if (cmdNameText.length > 0) {
          cmdName = cmdNameText;
        }
      } else if (a0 instanceof PreferencesTreeItem) {
        const prefs = a0 as PreferencesTreeItem;
        if (prefs.cmd && prefs.cmd.name && prefs.cmd.name.length > 0) {
          cmdName = prefs.cmd.name;
        }
      }
    }
    if (cmdName === undefined) {
      const manifest = await readManifestFile(manager.getActiveWorkspacePackageFilename());
      if (!manifest) {
        throw Error("Could not read manifest file");
      }
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
    }
    await addPreferenceCmd(manager, [cmdName]);
  } else {
    throw Error("No active Workspace");
  }
}
