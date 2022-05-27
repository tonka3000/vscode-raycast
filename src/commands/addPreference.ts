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
      if (existingPrefs.includes(text)) {
        return "Preference already exists";
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

export async function addPreferenceCmd(manager: ExtensionManager) {
  manager.logger.debug("add preference to package.json");
  const ws = manager.getActiveWorkspace();
  if (ws) {
    const pkgJSON = path.join(ws.uri.fsPath, "package.json");
    if (await fileExists(pkgJSON)) {
      const bytes = await fs.promises.readFile(pkgJSON);
      const manifest = JSON.parse(bytes.toString()) as Manifest;
      const pref: Preference = {};
      const name = await askName(pref, manifest.preferences?.map((c) => c.name || "") || []);
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
        j.append("preferences", pref);
        j.save();

        vscode.window.showInformationMessage(`Adding preference '${name}' successful`);
      }
    } else {
      throw Error("Workspace does not contain a package.json file");
    }
  } else {
    throw Error("No active Workspace");
  }
}
