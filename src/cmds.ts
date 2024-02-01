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
import { attachDebuggerCmd } from "./commands/attachdebugger";
import { refreshTreeCmd } from "./commands/refreshtree";
import { gotoPreferenceManifestLocationCmd } from "./commands/gotopreflocation";
import { gotoCommandManifestLocationCmd } from "./commands/gotocmdlocation";
import { addCommandPreferenceCmd } from "./commands/addCommandPreference";
import { gotoCommandModeManifestLocationCmd } from "./commands/goto/mode";
import { gotoCommandIntervalManifestLocationCmd } from "./commands/goto/interval";
import { openCommandCmd } from "./commands/opencommand";
import { gotoCommandArgumentManifestLocationCmd } from "./commands/goto/argument";
import { addCommandArgumentCmd } from "./commands/addCommandArgument";
import { updateInternalState } from "./commands/updateInternalState";
import { gotoCommandDisabledByDefaultManifestLocationCmd } from "./commands/goto/disabledByDefault";
import { extensionIssuesCmd } from "./commands/extensionIssues";
import { addSwiftSupportCmd } from "./commands/swiftSupport";

export function registerAllCommands(manager: ExtensionManager) {
  manager.registerCommand("lint", async () => lintCmd(manager));
  manager.registerCommand("lintfix", async () => lintFixCmd(manager));
  manager.registerCommand("build", async () => buildCmd(manager));
  manager.registerCommand("rundev", async () => runDevCmd(manager));
  manager.registerCommand("migration", async () => runMigrationCmd(manager));
  manager.registerCommand("updateinternalstate", async () => updateInternalState(manager));
  manager.registerCommand("opendocs", async () => openDocsCmd(manager));
  manager.registerCommand("opencommand", async (...args: any[]) => openCommandCmd(manager, args));
  manager.registerCommand("searchdocs", async () => searchDocsCmd(manager));
  manager.registerCommand("addcommand", async () => addCommandCmd(manager));
  manager.registerCommand("addpreference", async (...args: any[]) => addPreferenceCmd(manager, args));
  manager.registerCommand("addcommandpreference", async (...args: any[]) => addCommandPreferenceCmd(manager, args));
  manager.registerCommand("insertimageasset", async () => insertImageAssetCmd(manager));
  manager.registerCommand("login", async () => loginCmd(manager));
  manager.registerCommand("publish", async () => publicCmd(manager));
  manager.registerCommand("attachdebugger", async () => attachDebuggerCmd(manager));
  manager.registerCommand("refreshtree", async () => refreshTreeCmd(manager));
  manager.registerCommand("extensionissues", async () => extensionIssuesCmd(manager));
  manager.registerCommand("goto.preference", async (...args: any[]) =>
    gotoPreferenceManifestLocationCmd(manager, args),
  );
  manager.registerCommand("goto.command", async (...args: any[]) => gotoCommandManifestLocationCmd(manager, args));
  manager.registerCommand("goto.command.mode", async (...args: any[]) =>
    gotoCommandModeManifestLocationCmd(manager, args),
  );
  manager.registerCommand("goto.command.disabledbydefault", async (...args: any[]) =>
    gotoCommandDisabledByDefaultManifestLocationCmd(manager, args),
  );
  manager.registerCommand("goto.command.interval", async (...args: any[]) =>
    gotoCommandIntervalManifestLocationCmd(manager, args),
  );
  manager.registerCommand("goto.command.argument", async (...args: any[]) =>
    gotoCommandArgumentManifestLocationCmd(manager, args),
  );
  manager.registerCommand("command.arguments.add", async (...args: any[]) => addCommandArgumentCmd(manager, args));
  manager.registerCommand("addswiftsupport", async () => addSwiftSupportCmd(manager));
}
