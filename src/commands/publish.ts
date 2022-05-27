import { ExtensionManager } from "../manager";

export async function publicCmd(manager: ExtensionManager) {
  manager.logger.debug("start publish process");
  manager.runNpmExec(["ray", "publish"]);
}
