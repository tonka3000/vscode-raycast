import fetch from "node-fetch";
import { ExtensionManager } from "./manager";

interface NPMDistTags {
  latest?: string;
}

interface NPMResponse {
  _id: string;
  _rev: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "dist-tags": NPMDistTags;
}

export async function fetchVersionFromNPMPackage(
  manager: ExtensionManager,
  packageName: string,
): Promise<string | undefined> {
  try {
    manager.logger.debug(`Fetch NPM package information for '${packageName}'`);
    const res = await fetch(`https://registry.npmjs.org/${packageName}`);
    const j = (await res.json()) as NPMResponse;
    const version = j["dist-tags"]?.latest;
    if (version && version.length > 0) {
      return version;
    }
  } catch (error) {
    // ignore
  }
}
