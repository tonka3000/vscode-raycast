import { homedir } from "os";
import path = require("path");
import * as fs from "fs/promises";
import { Manifest, readManifestFile } from "./manifest";

export interface LocalManifest extends Manifest {
  manifestFilename: string;
  folder: string;
  devVersion: boolean;
}

export async function getLocalInstalledManifests(): Promise<LocalManifest[] | undefined> {
  const localExtensionsRootFolder = path.join(homedir(), ".config", "raycast", "extensions");
  const extensionsCandidates = await fs.readdir(localExtensionsRootFolder);
  const manifests = await Promise.all(
    extensionsCandidates.map(async (ext): Promise<LocalManifest | null> => {
      const folder = path.join(localExtensionsRootFolder, ext);
      const manifestFilename = path.join(folder, "package.json");
      try {
        const manifest = await readManifestFile(manifestFilename);
        const name = manifest?.name;
        if (!name) {
          return null;
        }
        const devVersion = ext === name;
        return { folder, manifestFilename, devVersion, ...manifest };
      } catch (error) {
        return null;
      }
    }),
  );
  return manifests?.filter((m) => m) as LocalManifest[] | undefined;
}
