import { ExtensionManager } from "../manager";
import * as vscode from "vscode";
import path = require("path");
import { capitalizeFirstLetter, fileExists } from "../utils";
import * as fs from "fs";
import { Command, Manifest } from "../manifest";
import editJsonFile = require("edit-json-file");
import { showCustomQuickPick } from "../picker";
import { getAssetsFromFolder } from "../assets";

async function askName(cmd: Command, existingCmds: string[]): Promise<string | undefined> {
  const result = await vscode.window.showInputBox({
    title: "Name",
    placeHolder: "Enter Command Name",
    validateInput: (text) => {
      if (text.length <= 0) {
        return "Name could not be empty";
      }
      if (existingCmds.includes(text)) {
        return "Command already exists";
      }
      return null;
    },
  });
  if (result !== undefined) {
    cmd.name = result;
    return result;
  }
  return undefined;
}

async function askTitle(cmd: Command): Promise<string | undefined> {
  const result = await vscode.window.showInputBox({
    value: capitalizeFirstLetter(cmd.name),
    placeHolder: "Enter Command Title or leave empty",
    title: "Title",
  });
  if (result !== undefined) {
    if (result.length > 0) {
      cmd.title = result;
    }
    return result;
  } else {
    return undefined;
  }
}

async function askSubtitle(cmd: Command): Promise<string | undefined> {
  const result = await vscode.window.showInputBox({
    placeHolder: "Enter Subtitle or leave empty",
    title: "Subtitle",
  });
  if (result !== undefined) {
    if (result.length > 0) {
      cmd.subtitle = result;
    }
    return result;
  } else {
    return undefined;
  }
}

async function askDescription(cmd: Command): Promise<string | undefined> {
  const result = await vscode.window.showInputBox({
    placeHolder: "Enter Description",
    title: "Description",
    validateInput: (text) => {
      if (text.length <= 0) {
        return "Description could not be empty";
      }
      return null;
    },
  });
  if (result !== undefined) {
    if (result.length > 0) {
      cmd.description = result;
    }
    return result;
  } else {
    return undefined;
  }
}

async function askMode(cmd: Command): Promise<string | undefined> {
  const result = await vscode.window.showQuickPick(["view", "no-view"], {
    placeHolder: "Choose Command Mode",
    title: "Mode",
  });
  if (result !== undefined) {
    if (result.length > 0) {
      cmd.mode = result;
    }
    return result;
  } else {
    return undefined;
  }
}

async function askIcon(cmd: Command, rootFolder: string): Promise<string | undefined> {
  const assetsFolder = path.join(rootFolder, "assets");
  const files = (await getAssetsFromFolder(assetsFolder)).filter((f) => f.endsWith(".png"));
  const result = await showCustomQuickPick(["", ...files], {
    placeholder: "Enter or choose icon or leave empty",
    title: "Icon",
  });
  if (result !== undefined) {
    if (result.length > 0) {
      cmd.icon = result;
    }
    return result;
  } else {
    return undefined;
  }
}

export async function addCommandCmd(manager: ExtensionManager) {
  manager.logger.debug("add command to package.json");
  const ws = manager.getActiveWorkspace();
  if (ws) {
    const pkgJSON = path.join(ws.uri.fsPath, "package.json");
    if (await fileExists(pkgJSON)) {
      const bytes = await fs.promises.readFile(pkgJSON);
      const manifest = JSON.parse(bytes.toString()) as Manifest;
      const cmd: Command = {};
      const commandID = await askName(cmd, manifest.commands?.map((c) => c.name || "") || []);
      if (commandID) {
        if ((await askTitle(cmd)) === undefined) {
          return;
        }
        if ((await askDescription(cmd)) === undefined) {
          return;
        }
        if ((await askMode(cmd)) === undefined) {
          return;
        }
        if ((await askSubtitle(cmd)) === undefined) {
          return;
        }
        if ((await askIcon(cmd, ws.uri.fsPath)) === undefined) {
          return undefined;
        }

        const srcFolder = path.join(ws.uri.fsPath, "src");
        if (!(await fileExists(srcFolder))) {
          fs.promises.mkdir(srcFolder, { recursive: true });
        }
        const tsxFilename = path.join(srcFolder, `${cmd.name}.tsx`);
        if (!(await fileExists(tsxFilename))) {
          const lines: string[] = [
            'import { List } from "@raycast/api";',
            "",
            `export default function ${capitalizeFirstLetter(cmd.name)?.replace("_", "")}Command(): JSX.Element {`,
            "  return <List />;",
            "}",
            "",
          ];
          fs.promises.writeFile(tsxFilename, lines.join("\n"));
        }
        const j = editJsonFile(pkgJSON);
        j.append("commands", cmd);
        j.save();

        vscode.window.showInformationMessage(`Adding command '${commandID}' successful`);
        await manager.updateState();
      }
    } else {
      throw Error("Workspace does not contain a package.json file");
    }
  } else {
    throw Error("No active Workspace");
  }
}
