import { ExtensionManager } from "../manager";

export async function refreshTreeCmd(manager: ExtensionManager) {
  if (manager.treedataprovider) {
    manager.treedataprovider.refresh();
  }
}
