import { ExtensionManager } from "../manager";

export async function runMigrationCmd(manager: ExtensionManager) {
  manager.logger.debug("run migration process");
  const latestMigration = manager.raycastLatestMigrationVersionFromNPM;
  if (latestMigration) {
    const ws = manager.getActiveWorkspace();
    if (!ws) {
      throw new Error("No active workspace");
    }
    manager.runInTerminal(["npx", "--yes", `@raycast/migration@${latestMigration}`, ws.uri.fsPath]);
    return;
  }
  manager.runNpmExec(["ray", "migrate"]);
}
