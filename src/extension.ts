import * as vscode from "vscode";
import { registerAllCommands } from "./cmds";
import { ExtensionManager } from "./manager";

let _EXT_MANAGER: ExtensionManager | null = null;

export async function activate(context: vscode.ExtensionContext) {
  _EXT_MANAGER = new ExtensionManager(context);
  await _EXT_MANAGER.updateState();
  await _EXT_MANAGER.updateContext();
  await _EXT_MANAGER.setLoaded();
  registerAllCommands(_EXT_MANAGER);
}

export function deactivate() {
  if (_EXT_MANAGER) {
    _EXT_MANAGER.dispose();
  }
}
