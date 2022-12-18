import { ExtensionManager } from "./manager";
import * as vscode from "vscode";
import path = require("path");
import * as fs from "fs/promises";
import { getErrorMessage } from "./utils";
import { dirname, isAbsolute, resolve } from "path";

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
  await vscode.commands.executeCommand(cmdID);
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

async function handleWriteCommands(uri: vscode.Uri, manager: ExtensionManager) {
  const params = new URLSearchParams(uri.query);
  const filename = params.get("filename");
  if (!filename) {
    throw new Error("No filepath given");
  }
  if (!isAbsolute(filename)) {
    throw new Error(`Filepath needs to be absolute, ${filename} is relative`);
  }
  const outputFilename = resolve(filename);
  const outputFolder = dirname(outputFilename);
  await fs.mkdir(outputFolder, { recursive: true });
  const cmds = await getCommands();
  manager.logger.debug(`write commands to ${outputFilename}`);
  await fs.writeFile(outputFilename, JSON.stringify(cmds, null, 2));
  manager.logger.debug("write succeeded");
}

async function handleRunCommand(uri: vscode.Uri, manager: ExtensionManager) {
  const params = new URLSearchParams(uri.query);
  const cmd = params.get("cmd");
  if (!cmd) {
    throw Error("Command ID is not provided");
  }
  for (const [key, value] of params.entries()) {
    console.log(`${key} = ${value}`);
  }
  await runCommand(cmd);
}

async function handlePrintCommands(manager: ExtensionManager) {
  const cmds = await getCommands();
  const output = manager.logger.outputchannel;
  if (!output) {
    return;
  }
  output.appendLine("## VSCode Commands");
  for (const cmd of cmds) {
    output.appendLine(`- ${cmd.category ? cmd.category + ": " : ""}${cmd.title} (${cmd.command})`);
  }
  if (cmds && cmds.length > 0) {
    output.appendLine(`\n${cmds.length} comannds found`);
  } else {
    output.appendLine("No command found");
  }
  output.show();
}

export function registerExternalHandlers(manager: ExtensionManager) {
  vscode.window.registerUriHandler({
    async handleUri(uri: vscode.Uri) {
      try {
        if (uri.path === "/writecommands") {
          await handleWriteCommands(uri, manager);
        } else if (uri.path === "/runcommand") {
          await handleRunCommand(uri, manager);
        } else if (uri.path === "/printcommands") {
          await handlePrintCommands(manager);
        }
      } catch (error) {
        manager.logger.error(getErrorMessage(error));
        await vscode.window.showErrorMessage(getErrorMessage(error));
      }
    },
  });
}
