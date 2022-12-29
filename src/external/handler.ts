import { ExtensionManager } from "../manager";
import * as vscode from "vscode";
import path = require("path");
import * as fs from "fs";
import * as afs from "fs/promises";
import { getErrorMessage } from "../utils";
import { dirname, isAbsolute, resolve } from "path";
import { getCommands, runCommand } from "./commands";
import { getExtensions } from "./extensions";

function transitFolder(manager: ExtensionManager): string {
  const result = path.join(manager.context.globalStorageUri.fsPath, "transit");
  return result;
}

async function writeExtensions(manager: ExtensionManager) {
  const exts = getExtensions();
  const transitFolder = path.join(manager.context.globalStorageUri.fsPath, "transit");
  const commandsFilename = path.join(transitFolder, "extensions.json");
  await afs.mkdir(transitFolder, { recursive: true });
  manager.logger.debug(`write extensions to ${commandsFilename}`);
  await afs.writeFile(commandsFilename, JSON.stringify(exts));
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
  await afs.mkdir(outputFolder, { recursive: true });
  const cmds = await getCommands();
  manager.logger.debug(`write commands to ${outputFilename}`);
  await afs.writeFile(outputFilename, JSON.stringify(cmds, null, 2));
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
  await runCommand(cmd, manager);
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

interface Request {
  command: string;
  args?: Record<string, any>;
}

/**
 * Process an incoming file request from disk
 */
async function processFileRequest(requestFilename: string, manager: ExtensionManager) {
  const data = await afs.readFile(requestFilename, "utf-8");
  const request = JSON.parse(data) as Request;
  if (request.command === "writecommands") {
    const filename = request?.args?.filename as string | undefined;
    if (filename) {
      await handleWriteCommands(
        vscode.Uri.parse(`vscode://tonka3000.raycast/writecommands?filename=${filename}`),
        manager
      );
    }
  } else {
    manager.logger.debug(`Unknown request command '${request.command}'`);
  }
}

let watcher: fs.FSWatcher;

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
  const tsFolder = transitFolder(manager);
  manager.logger.debug(`start watching transit folder ${tsFolder}`);
  watcher = fs.watch(tsFolder, async (_, filename) => {
    try {
      manager.logger.debug(`${filename} changed`);
      if (filename === "request.json") {
        if (vscode.window.state.focused) {
          await processFileRequest(path.join(tsFolder, filename), manager);
        } else {
          manager.logger.debug("Ignore changed file because window is not focused");
        }
      }
    } catch (error) {
      const msg = getErrorMessage(error);
      manager.logger.error(msg);
      await vscode.window.showErrorMessage(msg);
    }
  });
}
