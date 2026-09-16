import { ExtensionManager } from "../manager";

export async function refreshTreeCmd(manager: ExtensionManager) {
  await manager.updateState();
  await manager.fetchRaycastVersionFromNPM();
}
