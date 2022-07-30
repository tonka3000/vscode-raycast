import { ExtensionManager } from "../../manager";
import { ArgumentTreeItem } from "../../tree";
import { gotoCommandPropertyLocation } from "./common";

export async function gotoCommandArgumentManifestLocationCmd(manager: ExtensionManager, args: any[]) {
  if (args && args.length > 0) {
    const a0 = args[0];
    if (a0 instanceof ArgumentTreeItem) {
      const arg = a0 as ArgumentTreeItem;
      const name = arg.argument.name;
      if (name) {
        return await gotoCommandPropertyLocation({
          manager,
          args,
          property: `arguments.[name=${name}]`,
        });
      }
    }
  }
}
