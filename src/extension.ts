import * as vscode from "vscode";
import { registerAllCommands } from "./cmds";
import { ExtensionManager } from "./manager";

let _EXT_MANAGER: ExtensionManager | null = null;

export function activate(context: vscode.ExtensionContext) {
  _EXT_MANAGER = new ExtensionManager(context);
  _EXT_MANAGER.updateState();
  _EXT_MANAGER.updateContext();
  registerAllCommands(_EXT_MANAGER);
}

export function deactivate() {
  if (_EXT_MANAGER) {
    _EXT_MANAGER.dispose();
  }
}
