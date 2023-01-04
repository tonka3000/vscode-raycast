import * as vscode from "vscode";
import { ExtensionManager } from "../manager";
import { readManifestAST } from "../manifest";
import { showTextDocumentAtPosition } from "../utils";

async function getDependencyPositionInFile(filename: string): Promise<vscode.Position | undefined> {
  try {
    const mani = await readManifestAST(filename);
    return mani.getPosition(`dependencies.@raycast/api`);
  } catch (error) {}
  return undefined;
}

export async function runMigrationCmd(manager: ExtensionManager) {
  manager.logger.debug("run migration process");
  const ws = manager.getActiveWorkspace();
  if (!ws) {
    throw new Error("No active workspace");
  }
  const pkgJSONFilename = manager.getActiveWorkspacePackageFilename();
  if (pkgJSONFilename) {
    // open package.json guarantee that the file change mechanism works for package.json
    // This is required otherwise the extension update mechanism will not get triggered
    try {
      const pos = await getDependencyPositionInFile(pkgJSONFilename);
      await showTextDocumentAtPosition(vscode.Uri.file(pkgJSONFilename), pos);
    } catch (error) {
      // ignore
    }
  }
  const latestMigration = manager.raycastLatestMigrationVersionFromNPM;
  if (latestMigration) {
    manager.runInTerminal(["npx", "--yes", `@raycast/migration@${latestMigration}`, ws.uri.fsPath]);
  } else {
    manager.runNpmExec(["ray", "migrate"]);
  }
}
