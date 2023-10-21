import * as vscode from "vscode";
import { ExtensionManager } from "../manager";
import path = require("path");
import { Manifest, readManifestFile } from "../manifest";
import { fileExists } from "../utils";
import { fetchStoreListings } from "../store";

async function getManifest(manager: ExtensionManager): Promise<Manifest | undefined> {
  const ws = manager.getActiveWorkspace();
  if (!ws) {
    throw Error("No active workspace");
  }
  const pkgFilename = path.join(ws.uri.fsPath, "package.json");
  if (await fileExists(pkgFilename)) {
    return await readManifestFile(pkgFilename);
  }
  throw new Error("No manifest file found in current workspace");
}

async function getExtensionIdFromStore(extensionId: string, manager: ExtensionManager): Promise<string> {
  const listings = await fetchStoreListings();
  const extension = listings.data?.find((e) => e.name === extensionId);
  const id = extension?.id;
  if (!id) {
    throw new Error(`Could not find the extension "${extensionId}" in the Raycast Store`);
  }
  return id;
}

export async function extensionIssuesCmd(manager: ExtensionManager) {
  manager.logger.debug("Start Extension Issues");

  const manifest = await getManifest(manager);
  const extensionId = manifest?.name;
  if (!extensionId) {
    throw new Error("Could not get Extension Name");
  }

  manager.logger.debug(`Get Extension ID from store for "${extensionId}"`);
  const storeId = await getExtensionIdFromStore(extensionId, manager);

  const url = `https://www.raycast.com/extension-issues?extensionId=${storeId}`;

  vscode.env.openExternal(vscode.Uri.parse(url));
}
