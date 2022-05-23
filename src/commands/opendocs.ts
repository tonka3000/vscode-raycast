import { ExtensionManager } from "../manager";
import { openDocsInBrowser } from "../docs";

export async function openDocsCmd(manager: ExtensionManager) {
  openDocsInBrowser(manager);
}
