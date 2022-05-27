import { ExtensionManager } from "../manager";

export async function loginCmd(manager: ExtensionManager) {
  manager.logger.debug("start login process");
  manager.runNpmExec(["ray", "login"]);
}
