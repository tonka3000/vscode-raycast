import { ExtensionManager } from "./manager";
import * as vscode from "vscode";
import path = require("path");
import * as fs from "fs/promises";
import { getErrorMessage } from "./utils";

interface CommandMetadata {
  command: string;
  title: string;
  category?: string;
}

interface ExtensionMetadata {
  id: string;
  active: boolean;
  version: string;
  publisher: string;
  displayName: string;
  description?: string;
}

async function getCommands(): Promise<CommandMetadata[]> {
  const result: CommandMetadata[] = [];
  const cmds = await vscode.commands.getCommands();
  const exts = vscode.extensions.all;
  for (const ext of exts) {
    if (!ext.isActive) {
      continue;
    }
    const contr = ext.packageJSON.contributes;
    if (contr) {
      const cmdMetas = contr.commands as CommandMetadata[] | undefined;
      if (!cmdMetas) {
        continue;
      }
      for (const c of cmdMetas) {
        if (cmds.includes(c.command)) {
          result.push(c);
        }
      }
    }
  }
  return result;
}

async function runCommand(cmdID: string) {
  vscode.commands.executeCommand(cmdID);
}

async function writeCommands(manager: ExtensionManager) {
  const cmds = await getCommands();
  const transitFolder = path.join(manager.context.globalStorageUri.fsPath, "transit");
  const commandsFilename = path.join(transitFolder, "commands.json");
  await fs.mkdir(transitFolder, { recursive: true });
  manager.logger.debug(`write commands to ${commandsFilename}`);
  await fs.writeFile(commandsFilename, JSON.stringify(cmds));
  manager.logger.debug("write succeeded");
  await writeExtensions(manager);
}

function getExtensions(): ExtensionMetadata[] {
  const exts = vscode.extensions.all;
  const result: ExtensionMetadata[] = [];
  for (const e of exts) {
    result.push({
      id: e.id,
      active: e.isActive,
      version: e.packageJSON.version as string,
      publisher: e.packageJSON.publisher as string,
      displayName: e.packageJSON.displayName,
      description: e.packageJSON.description,
    });
  }
  return result;
}

async function writeExtensions(manager: ExtensionManager) {
  const exts = getExtensions();
  const transitFolder = path.join(manager.context.globalStorageUri.fsPath, "transit");
  const commandsFilename = path.join(transitFolder, "extensions.json");
  await fs.mkdir(transitFolder, { recursive: true });
  manager.logger.debug(`write extensions to ${commandsFilename}`);
  await fs.writeFile(commandsFilename, JSON.stringify(exts));
  manager.logger.debug("write succeeded");
}

export function registerExternalHandlers(manager: ExtensionManager) {
  vscode.window.registerUriHandler({
    async handleUri(uri: vscode.Uri) {
      try {
        if (uri.path === "/commands") {
          writeCommands(manager);
        } else if (uri.path === "/runcommand") {
          const params = new URLSearchParams(uri.query);
          const cmd = params.get("cmd");
          if (!cmd) {
            throw Error("Command ID is not provided");
          }
          await runCommand(cmd);
        }
      } catch (error) {
        manager.logger.error(getErrorMessage(error));
      }
    },
  });
}
