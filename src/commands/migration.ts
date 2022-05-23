import { ExtensionManager } from "../manager";

export async function runMigrationCmd(manager: ExtensionManager) {
  manager.logger.debug("start migration process");
  manager.runNpmExec(["ray", "migrate"]);
}
