import { buildCmd } from "./commands/build";
import { runDevCmd } from "./commands/dev";
import { lintCmd } from "./commands/lint";
import { lintFixCmd } from "./commands/lintfix";
import { runMigrationCmd } from "./commands/migration";
import { ExtensionManager } from "./manager";

export function registerAllCommands(manager: ExtensionManager) {
  manager.registerCommand("lint", async () => lintCmd(manager));
  manager.registerCommand("lintfix", async () => lintFixCmd(manager));
  manager.registerCommand("build", async () => buildCmd(manager));
  manager.registerCommand("rundev", async () => runDevCmd(manager));
  manager.registerCommand("migration", async () => runMigrationCmd(manager));
}
