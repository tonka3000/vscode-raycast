import { ExtensionManager } from "../manager";

export async function updateAPICmd(manager: ExtensionManager) {
  manager.logger.debug("start raycast API update process");
  const latestVersion = manager.raycastAPINPMVersion;
  if (!latestVersion || latestVersion.length <= 0) {
    throw new Error("Could not get latest version of the raycast API");
  }
  manager.runNpm(["i", `@raycast/api@^${latestVersion}`]);
}
