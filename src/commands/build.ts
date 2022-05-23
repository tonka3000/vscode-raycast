import { ExtensionManager } from "../manager";

export async function buildCmd(manager: ExtensionManager) {
  manager.logger.debug("start build process");
  manager.runNpmExec(["ray", "build"]);
}
