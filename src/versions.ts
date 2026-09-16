import * as semver from "semver";

export function isAPIUpdateAvailable(latest: string | undefined, declared: string | undefined): boolean {
  if (!latest || !declared || !semver.valid(latest) || !semver.validRange(declared)) {
    return false;
  }
  const minimum = semver.minVersion(declared);
  return minimum !== null && semver.gt(latest, minimum);
}
