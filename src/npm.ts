import fetch from "node-fetch";

interface NPMDistTags {
  latest?: string;
}

interface NPMResponse {
  _id: string;
  _rev: string;
  "dist-tags": NPMDistTags;
}

export async function fetchRaycastAPIVersionFromNPM(): Promise<string | undefined> {
  try {
    const res = await fetch("https://registry.npmjs.org/@raycast/api");
    const j = (await res.json()) as NPMResponse;
    const version = j["dist-tags"]?.latest;
    if (version && version.length > 0) {
      return version;
    }
  } catch (error) {
    // ignore
  }
}

let raycastAPINPMVersion: string | undefined;

export async function getNPMRaycastAPIVersion(): Promise<string | undefined> {
  if (!raycastAPINPMVersion || raycastAPINPMVersion.length <= 0) {
    raycastAPINPMVersion = await fetchRaycastAPIVersionFromNPM();
  }
  return raycastAPINPMVersion;
}
