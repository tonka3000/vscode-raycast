import * as vscode from "vscode";
import { ExtensionManager } from "../manager";
import { getFixedCommandMetaData } from "./known";

export interface CommandMetadata {
  command: string;
  title: string;
  category?: string;
}

export async function getCommands(): Promise<CommandMetadata[]> {
  const result: CommandMetadata[] = [];
  const cmds = await vscode.commands.getCommands(false);
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
  const unresolvedCommandIDs: string[] = [];
  const resolvedCommandIDS = result.map((c) => c.command);
  cmds.forEach((c) => {
    if (!resolvedCommandIDS.includes(c)) {
      unresolvedCommandIDs.push(c);
    }
  });
  const unresolvedCommads: CommandMetadata[] = unresolvedCommandIDs?.map((c) => {
    const fm = getFixedCommandMetaData(c);
    if (fm) {
      return fm;
    }
    return {
      command: c,
      title: c,
    };
  });
  const all = [...result, ...unresolvedCommads];
  return all;
}

export async function runCommand(cmdID: string, manager: ExtensionManager) {
  manager.logger.debug(`Run command ${cmdID}`);
  await vscode.commands.executeCommand(cmdID);
}
