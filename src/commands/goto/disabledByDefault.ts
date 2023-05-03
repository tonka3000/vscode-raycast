import { ExtensionManager } from "../../manager";
import { Command } from "../../manifest";
import { gotoCommandPropertyLocation } from "./common";

export async function gotoCommandDisabledByDefaultManifestLocationCmd(manager: ExtensionManager, args: any[]) {
  return await gotoCommandPropertyLocation({
    manager,
    args,
    property: "disabledByDefault",
    filterCommand: (cmd: Command) => cmd.disabledByDefault !== undefined,
  });
}
