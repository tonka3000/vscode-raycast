import { ExtensionManager } from "../manager";

export async function updateInternalState(manager: ExtensionManager) {
  await manager.updateState();
  manager.refreshTree();
}
