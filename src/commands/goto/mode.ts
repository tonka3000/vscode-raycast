import { ExtensionManager } from "../../manager";
import { gotoCommandPropertyLocation } from "./common";

export async function gotoCommandModeManifestLocationCmd(manager: ExtensionManager, args: any[]) {
  return await gotoCommandPropertyLocation({
    manager,
    args,
    property: "mode",
  });
}
