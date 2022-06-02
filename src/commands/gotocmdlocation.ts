import { ExtensionManager } from "../manager";
import { CommandTreeItem } from "../tree";
import * as vscode from "vscode";
import * as fs from "fs";
import { showTextDocumentAtPosition } from "../utils";
import { ObjectNode, ArrayNode, LiteralNode } from "json-to-ast";
import parse = require("json-to-ast");
import path = require("path");
import { readManifestFile } from "../manifest";

async function getCommandPositionInFile(filename: string, cmdName: string): Promise<vscode.Position | undefined> {
  try {
    const bytes = await fs.promises.readFile(filename);
    const text = bytes.toString();
    const ast = parse(text, { loc: true }) as ObjectNode;
    const prefs = ast.children.find((e) => e.key.value === "commands");
    if (prefs) {
      const ar = prefs.value as ArrayNode;
      for (let i = 0; i < ar.children.length; i++) {
        const e = ar.children[i];
        if (e.type === "Object") {
          const prefNameNode = e.children.find((e) => {
            if (e.key.value === "name") {
              if (e.value.type === "Literal") {
                const l = e.value as LiteralNode;
                const val = l.value?.toString();
                if (val === cmdName) {
                  return val;
                }
              }
            }
          });
          if (prefNameNode) {
            if (!e.loc) {
              return undefined;
            }
            return new vscode.Position(e.loc.start.line, e.loc.start.column);
          }
        }
      }
    }
  } catch (error) {}
  return undefined;
}

export async function gotoCommandManifestLocationCmd(manager: ExtensionManager, args: any[] | undefined) {
  manager.logger.debug("goto command manifest location command");
  let cmdName: string | undefined;
  if (args && args.length > 0) {
    const a0 = args[0];
    if (a0 === undefined) {
      const manifest = await readManifestFile(manager.getActiveWorkspacePackageFilename());
      if (manifest) {
        const items: vscode.QuickPickItem[] | undefined = manifest.commands?.map((c) => ({
          label: c.title || c.name || "?",
          description: c.name || "?",
        }));
        if (items) {
          const pick = await vscode.window.showQuickPick(items);
          if (pick) {
            cmdName = pick.description;
          }
        } else {
          throw Error("No commands defined");
        }
      }
    } else if (a0 instanceof CommandTreeItem) {
      const item = a0 as CommandTreeItem;
      if (!item.cmd.name) {
        throw Error("No command name defined");
      }
      cmdName = item.cmd.name;
    } else {
      throw Error("Wrong argument type");
    }
  }

  if (cmdName) {
    const ws = manager.getActiveWorkspace();
    if (!ws) {
      throw Error("No active workspace");
    }
    const filename = path.join(ws.uri.fsPath, "package.json");
    const pos = await getCommandPositionInFile(filename, cmdName);
    const uri = vscode.Uri.file(filename);
    await showTextDocumentAtPosition(uri, pos);
  }
}
