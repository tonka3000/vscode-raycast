import { ExtensionManager } from "../manager";
import * as vscode from "vscode";
import path = require("path");
import { capitalizeFirstLetter, fileExists, showTextDocumentAtPosition } from "../utils";
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
      if (text.length < 2) {
        return "Command Name needs to have at least 2 characters";
      }
      if (existingCmds.includes(text)) {
        return "Command already exists";
      }
      const pattern = /^[a-zA-Z0-9-._~]*$/;
      if (!pattern.test(text)) {
        return "Only a-z, A-Z, 0-9, -, ., _, ~ are allowed";
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
    validateInput: (text) => {
      if (text.length > 0 && text.length < 2) {
        return "Command Title needs to have at least 2 characters";
      }
      return null;
    },
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
    validateInput: (text) => {
      if (text.length > 0 && text.length < 2) {
        return "Subtitle needs to have at least 2 characters";
      }
      return null;
    },
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
      if (text.length < 12) {
        return "Description needs to have at least 12 characters";
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
  const result = await vscode.window.showQuickPick(["view", "no-view", "menu-bar"], {
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
  const files = (await getAssetsFromFolder(assetsFolder)).filter((f) => f.endsWith(".png") || f.endsWith(".svg"));
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

async function askInterval(cmd: Command): Promise<string | undefined> {
  const result = await vscode.window.showInputBox({
    placeHolder: "e.g. 90s, 1m, 12h, 1d (min. 1m) or leave empty",
    title: "Background Refresh Interval",
    validateInput: (text) => {
      const regexp = /^(\d+)(s|m|h|d)$/;
      if (text.length > 0 && !text.match(regexp)) {
        return "Invalid Interval Format";
      }
      return null;
    },
  });
  if (result !== undefined) {
    if (result.length > 0) {
      cmd.interval = result;
    }
    return result;
  } else {
    return undefined;
  }
}

async function askDisabledByDefault(cmd: Command): Promise<string | undefined> {
  const result = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: "Should the command be visible after the initial installation",
    title: "Command visible after initial Install?",
  });
  if (result !== undefined) {
    if (result === "No") {
      cmd.disabledByDefault = true;
    }
    return result;
  } else {
    return undefined;
  }
}

export function makeCommandFilename(name: string | undefined) {
  if (!name) {
    return name;
  }
  let result = name ?? "";
  result = result.replaceAll(/[\s]/g, "");
  result = `${result[0].toLocaleLowerCase()}${result.slice(1)}`;
  return result;
}

export function makeCommandFunctionName(name: string | undefined) {
  if (!name) {
    return name;
  }
  let result = capitalizeFirstLetter(name) ?? "";
  result = result.replaceAll(/[_\s-\.~]/g, "");
  return result;
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
        if (cmd.mode === "no-view" || cmd.mode === "menu-bar") {
          if ((await askInterval(cmd)) === undefined) {
            return;
          }
        }
        if ((await askDisabledByDefault(cmd)) === undefined) {
          return;
        }

        cmd.name = makeCommandFilename(cmd.name);

        const srcFolder = path.join(ws.uri.fsPath, "src");
        if (!(await fileExists(srcFolder))) {
          fs.promises.mkdir(srcFolder, { recursive: true });
        }
        const tsxFilename = path.join(srcFolder, `${cmd.name}.tsx`);
        if (!(await fileExists(tsxFilename))) {
          let lines: string[] = [
            'import { List } from "@raycast/api";',
            "",
            `export default function ${makeCommandFunctionName(cmd.name)}Command() {`,
            "  return <List />;",
            "}",
            "",
          ];
          switch (cmd.mode) {
            case "no-view":
              {
                lines = [
                  'import { showToast, Toast } from "@raycast/api";',
                  "",
                  "export default async function Main() {",
                  '  await showToast(Toast.Style.Failure, "example no-view command");',
                  "}",
                  "",
                ];
              }
              break;
            case "menu-bar":
              {
                lines = [
                  'import { MenuBarExtra, showHUD } from "@raycast/api";',
                  "",
                  "export default function MenuCommand() {",
                  "  return (",
                  '    <MenuBarExtra title="My Menu">',
                  '      <MenuBarExtra.Item title="Child" onAction={() => showHUD("Child Menu from Menubar")} />',
                  "    </MenuBarExtra>",
                  "  );",
                  "}",
                  "",
                ];
              }
              break;
          }
          fs.promises.writeFile(tsxFilename, lines.join("\n"));
          manager.logger.debug(`Created file ${tsxFilename}`);
        }
        const j = editJsonFile(pkgJSON);
        j.append("commands", cmd);
        j.save();

        showTextDocumentAtPosition(vscode.Uri.file(tsxFilename)).catch(() => {
          vscode.window.showErrorMessage(`Failed to open file ${tsxFilename}`);
        });
        await manager.updateState();
      }
    } else {
      throw Error("Workspace does not contain a package.json file");
    }
  } else {
    throw Error("No active Workspace");
  }
}
