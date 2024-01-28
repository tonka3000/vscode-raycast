import { ExtensionManager } from "../manager";
import * as vscode from "vscode";
import path = require("path");
import { fileExists } from "../utils";
import * as fs from "fs";
import { Command, Manifest, Preference, PreferenceType } from "../manifest";
import editJsonFile = require("edit-json-file");

async function askName(pref: Preference, existingPrefs: string[]): Promise<string | undefined> {
  const result = await vscode.window.showInputBox({
    title: "Name",
    placeHolder: "Enter Preference Name",
    validateInput: (text) => {
      if (text.length <= 0) {
        return "Preference Name could not be empty";
      }
      if (text.length < 2) {
        return "Command Name needs to have at least 2 characters";
      }
      if (existingPrefs.includes(text)) {
        return "Preference already exists";
      }
      const pattern = /^[a-zA-Z0-9-._~]*$/;
      if (!pattern.test(text)) {
        return "Only a-z, A-Z, 0-9, -, ., _, ~ are allowed";
      }
      return null;
    },
  });
  if (result !== undefined) {
    pref.name = result;
    return result;
  }
  return undefined;
}

async function askTitle(pref: Preference): Promise<string | undefined> {
  const result = await vscode.window.showInputBox({
    placeHolder: pref.type === PreferenceType.checkbox ? "Enter Title or leave empty" : "Enter Title",
    title: "Title",
    validateInput: (text) => {
      if (text.length > 0 && text.length < 2) {
        return "Title needs to have at least 2 characters";
      }
      if (pref.type !== PreferenceType.checkbox && text.length <= 0) {
        return `Title could not be empty when the type is ${pref.type}`;
      }
      return null;
    },
  });
  if (result !== undefined) {
    if (result.length > 0) {
      pref.title = result;
    }
    return result;
  } else {
    return undefined;
  }
}

async function askPlaceholder(pref: Preference): Promise<string | undefined> {
  const result = await vscode.window.showInputBox({
    placeHolder: "Enter Placeholder",
    title: "Placeholder",
  });
  if (result !== undefined) {
    if (result.length > 0) {
      pref.placeholder = result;
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
      if (text.length < 8) {
        return "Description needs to have at least 8 characters";
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

async function askType(pref: Preference): Promise<string | undefined> {
  const result = await vscode.window.showQuickPick(["textfield", "password", "checkbox", "dropdown", "appPicker"], {
    placeHolder: "Choose Type",
    title: "Type",
  });
  if (result !== undefined) {
    if (result.length > 0) {
      pref.type = result;
    }
    return result;
  } else {
    return undefined;
  }
}

async function askRequired(pref: Preference): Promise<string | undefined> {
  const result = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: "Is Required",
    title: "Required Preference",
  });
  if (result !== undefined) {
    if (result.length > 0) {
      pref.required = result === "Yes";
    }
    return result;
  } else {
    return undefined;
  }
}

async function askLabel(pref: Preference): Promise<string | undefined> {
  const result = await vscode.window.showInputBox({
    placeHolder: "Enter Label",
    title: "Label",
    validateInput: (text) => {
      if (text.length <= 0) {
        return "Label can not be empty";
      }
      return null;
    },
  });
  if (result !== undefined) {
    if (result.length > 0) {
      pref.label = result;
    }
    return result;
  } else {
    return undefined;
  }
}

export async function addPreferenceCmd(manager: ExtensionManager, args: any[] | undefined) {
  manager.logger.debug("add preference to package.json");
  const ws = manager.getActiveWorkspace();
  if (ws) {
    let cmdName: string | undefined;
    if (args && args.length > 0) {
      const a0 = args[0];
      if (typeof a0 === "string") {
        const cmdNameText = a0 as string;
        if (cmdNameText.length > 0) {
          cmdName = cmdNameText;
        }
      }
    }
    const pkgJSON = path.join(ws.uri.fsPath, "package.json");
    if (await fileExists(pkgJSON)) {
      const bytes = await fs.promises.readFile(pkgJSON);
      const manifest = JSON.parse(bytes.toString()) as Manifest;
      const pref: Preference = {};
      let existingCmds: string[] = [];
      if (cmdName) {
        const c = manifest.commands?.find((c) => c.name === cmdName);
        if (c && c.preferences && c.preferences) {
          existingCmds = c.preferences.map((p) => p.name || "") || [];
        }
      } else {
        existingCmds = manifest.preferences?.map((c) => c.name || "") || [];
      }
      const name = await askName(pref, existingCmds);
      if (name) {
        if ((await askDescription(pref)) === undefined) {
          return;
        }
        if ((await askType(pref)) === undefined) {
          return;
        }
        if ((await askRequired(pref)) === undefined) {
          return;
        }
        if ((await askTitle(pref)) === undefined) {
          return;
        }
        if ((await askPlaceholder(pref)) === undefined) {
          return;
        }
        if (pref.type === PreferenceType.dropdown) {
          pref.data = [
            { title: "Title 1", value: "Value 1" },
            { title: "Title 2", value: "Value 2" },
          ];
        }
        if (pref.type === PreferenceType.checkbox) {
          if ((await askLabel(pref)) === undefined) {
            return;
          }
        }
        // TODO add user based 'default' and 'data' handling

        const j = editJsonFile(pkgJSON);
        if (cmdName && cmdName.length > 0) {
          const index = manifest.commands?.findIndex((c) => c.name === cmdName);
          if (index === undefined) {
            throw Error(`Could not find command ${cmdName}`);
          }
          j.append(`commands.${index}.preferences`, pref);
        } else {
          j.append("preferences", pref);
        }
        j.save();

        vscode.window.showInformationMessage(`Adding preference '${name}' successful`);
        await manager.updateState();
      }
    } else {
      throw Error("Workspace does not contain a package.json file");
    }
  } else {
    throw Error("No active Workspace");
  }
}
