import { ExtensionManager } from "../manager";
import * as vscode from "vscode";

export async function lintCmd(manager: ExtensionManager) {
  manager.logger.debug("start lint process");
  manager.runNpmExec(["ray", "lint"]);
}
