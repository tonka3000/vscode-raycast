import { buildCmd } from "./commands/build";
import { runDevCmd } from "./commands/dev";
import { openDocsCmd } from "./commands/opendocs";
import { lintCmd } from "./commands/lint";
import { lintFixCmd } from "./commands/lintfix";
import { runMigrationCmd } from "./commands/migration";
import { ExtensionManager } from "./manager";
import { searchDocsCmd } from "./commands/searchdocs";
import { addCommandCmd } from "./commands/addCommand";
import { addPreferenceCmd } from "./commands/addPreference";
import { insertImageAssetCmd } from "./commands/insertimageasset";
import { loginCmd } from "./commands/login";
import { publicCmd } from "./commands/publish";

export function registerAllCommands(manager: ExtensionManager) {
  manager.registerCommand("lint", async () => lintCmd(manager));
  manager.registerCommand("lintfix", async () => lintFixCmd(manager));
  manager.registerCommand("build", async () => buildCmd(manager));
  manager.registerCommand("rundev", async () => runDevCmd(manager));
  manager.registerCommand("migration", async () => runMigrationCmd(manager));
  manager.registerCommand("opendocs", async () => openDocsCmd(manager));
  manager.registerCommand("searchdocs", async () => searchDocsCmd(manager));
  manager.registerCommand("addcommand", async () => addCommandCmd(manager));
  manager.registerCommand("addpreference", async () => addPreferenceCmd(manager));
  manager.registerCommand("insertimageasset", async () => insertImageAssetCmd(manager));
  manager.registerCommand("login", async () => loginCmd(manager));
  manager.registerCommand("publish", async () => publicCmd(manager));
}
