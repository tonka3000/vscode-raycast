import fetch from "node-fetch";

interface NPMDistTags {
  latest?: string;
}

interface NPMResponse {
  _id: string;
  _rev: string;
  "dist-tags": NPMDistTags;
}

const npmVersionCache: Record<string, string> = {};

export async function fetchVersionFromNPMPackage(packageName: string): Promise<string | undefined> {
  const cachedVersion = npmVersionCache[packageName];
  if (cachedVersion && cachedVersion.length > 0) {
    return cachedVersion;
  }
  try {
    const res = await fetch(`https://registry.npmjs.org/${packageName}`);
    const j = (await res.json()) as NPMResponse;
    const version = j["dist-tags"]?.latest;
    if (version && version.length > 0) {
      npmVersionCache[packageName] = version;
      return version;
    }
  } catch (error) {
    // ignore
  }
}

export async function getNPMRaycastAPIVersion(): Promise<string | undefined> {
  return await fetchVersionFromNPMPackage("@raycast/api");
}

export async function getNPMRaycastMigrationVersion(): Promise<string | undefined> {
  return await fetchVersionFromNPMPackage("@raycast/migration");
}
