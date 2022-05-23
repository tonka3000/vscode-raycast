import { ExtensionManager } from "../manager";

export async function lintFixCmd(manager: ExtensionManager) {
  manager.logger.debug("start lint-fix process");
  manager.runNpmExec(["ray", "lint", "--fix"]);
}
