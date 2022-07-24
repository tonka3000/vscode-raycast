import { ExtensionManager } from "../../manager";
import { Command } from "../../manifest";
import { gotoCommandPropertyLocation } from "./common";

export async function gotoCommandIntervalManifestLocationCmd(manager: ExtensionManager, args: any[]) {
  return await gotoCommandPropertyLocation({
    manager,
    args,
    property: "interval",
    filterCommand: (cmd: Command) => cmd.interval !== undefined,
  });
}
