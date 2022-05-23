import { ExtensionManager } from "../manager";

export async function runDevCmd(manager: ExtensionManager) {
  manager.logger.debug("start dev process");
  manager.runNpmExec(["ray", "develop"], "develop");
}
