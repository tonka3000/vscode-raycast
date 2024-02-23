import * as vscode from "vscode";
import { ExtensionManager } from "../manager";
import { Argument, ArgumentType, readManifestFile } from "../manifest";
import { ArgumentsTreeItem, PreferencesTreeItem } from "../tree";
import editJsonFile = require("edit-json-file");

async function askName(arg: Argument, existingArgs: string[]): Promise<string | undefined> {
  const result = await vscode.window.showInputBox({
    title: "Name",
    placeHolder: "Enter Argument Name",
    validateInput: (text) => {
      if (text.length <= 0) {
        return "Name could not be empty";
      }
      if (text.length < 2) {
        return "Argument Name needs to have at least 2 characters";
      }
      if (existingArgs.includes(text)) {
        return "Argument already exists";
      }
      const pattern = /^[a-zA-Z0-9-._~]*$/;
      if (!pattern.test(text)) {
        return "Only a-z, A-Z, 0-9, -, ., _, ~ are allowed";
      }
      return null;
    },
  });
  if (result !== undefined) {
    arg.name = result;
    return result;
  }
  return undefined;
}

async function askType(arg: Argument): Promise<string | undefined> {
  const result = await vscode.window.showQuickPick(["text", "password", "dropdown"], {
    placeHolder: "Choose Type",
    title: "Type",
  });
  if (result !== undefined) {
    if (result.length > 0) {
      arg.type = result;
    }
    return result;
  } else {
    return undefined;
  }
}

async function askPlaceholder(arg: Argument): Promise<string | undefined> {
  const result = await vscode.window.showInputBox({
    placeHolder: "Enter Placeholder",
    title: "Placeholder",
    validateInput: (text) => {
      if (text.length <= 0) {
        return "Placeholder could not be empty";
      }
      return null;
    },
  });
  if (result !== undefined) {
    if (result.length > 0) {
      arg.placeholder = result;
    }
    return result;
  } else {
    return undefined;
  }
}

async function askRequired(arg: Argument): Promise<string | undefined> {
  const result = await vscode.window.showQuickPick(["Yes", "No"], {
    placeHolder: "Is Required",
    title: "Required Preference",
  });
  if (result !== undefined) {
    if (result.length > 0) {
      arg.required = result === "Yes";
    }
    return result;
  } else {
    return undefined;
  }
}

export async function addCommandArgumentCmd(manager: ExtensionManager, args: any[] | undefined) {
  manager.logger.debug("add command argument to package.json");
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
      } else if (a0 instanceof ArgumentsTreeItem) {
        const args = a0 as PreferencesTreeItem;
        if (args.cmd && args.cmd.name && args.cmd.name.length > 0) {
          cmdName = args.cmd.name;
        }
      }
    }
    if (cmdName === undefined) {
      const manifest = await readManifestFile(manager.getActiveWorkspacePackageFilename());
      if (!manifest) {
        throw Error("Could not read manifest file");
      }
      const cmds: vscode.QuickPickItem[] | undefined = manifest.commands?.map((c) => ({
        label: c.title || c.name || "?",
        description: c.name || "?",
      }));
      if (!cmds) {
        throw Error("No commands in manifest");
      }
      const pick = await vscode.window.showQuickPick(cmds, {
        placeHolder: "Choose Command",
        title: "Command",
      });
      if (pick === undefined) {
        return;
      }
      cmdName = pick.description;
    }
    const pkgJSON = manager.getActiveWorkspacePackageFilename();
    if (!pkgJSON) {
      throw Error("No active workspace");
    }
    const argument: Argument = {};
    const manifest = await readManifestFile(pkgJSON);
    const index = manifest?.commands?.findIndex((c) => c.name === cmdName);
    if (index === undefined) {
      throw Error("Could not find command");
    }
    const cmd = manifest?.commands ? manifest.commands[index] : undefined;
    const existingArgs = cmd?.arguments?.map((a) => a.name || "") || [];

    if ((await askName(argument, existingArgs)) === undefined) {
      return;
    }
    if ((await askPlaceholder(argument)) === undefined) {
      return;
    }
    if ((await askType(argument)) === undefined) {
      return;
    }
    if ((await askRequired(argument)) === undefined) {
      return;
    }
    if (argument.type === ArgumentType.dropdown) {
      argument.data = [
        { title: "Title 1", value: "Value 1" },
        { title: "Title 2", value: "Value 2" },
      ];
    }
    const j = editJsonFile(pkgJSON);
    j.append(`commands.${index}.arguments`, argument);
    j.save();

    vscode.window.showInformationMessage(`Adding argument '${argument.name}' successful to ${cmd?.name}`);
    await manager.updateState();
  } else {
    throw Error("No active Workspace");
  }
}
