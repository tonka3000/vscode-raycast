import path = require("path");
import * as vscode from "vscode";
import { ExtensionManager } from "./manager";
import { Command, Manifest, Preference, readManifestFileSync } from "./manifest";
import { fileExistsSync, getModTimeSync } from "./utils";

export class RaycastTreeDataProvider implements vscode.TreeDataProvider<RaycastTreeItem> {
  private manifest: Manifest | undefined;
  private manifestLastModTime: Date | undefined;
  private _onDidChangeTreeData: vscode.EventEmitter<RaycastTreeItem | undefined | null | void> =
    new vscode.EventEmitter<RaycastTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<RaycastTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  constructor(private manager: ExtensionManager) {}

  getTreeItem(element: RaycastTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: RaycastTreeItem): Thenable<RaycastTreeItem[]> {
    if (!this.manager.isRaycastEnabled) {
      return Promise.resolve([]);
    }
    if (element === undefined) {
      return Promise.resolve([
        new CommandsTreeItem(vscode.TreeItemCollapsibleState.Expanded),
        new PreferencesTreeItem(vscode.TreeItemCollapsibleState.Collapsed),
      ]);
    } else {
      const mani = this.getManifest();
      if (element instanceof CommandsTreeItem) {
        const cmds = mani?.commands || [];
        return Promise.resolve(
          cmds.map(
            (c) =>
              new CommandTreeItem(
                c,
                this.manager,
                this.manifest,
                (c.preferences && c.preferences.length) || c.mode
                  ? vscode.TreeItemCollapsibleState.Collapsed
                  : vscode.TreeItemCollapsibleState.None
              )
          )
        );
      } else if (element instanceof PreferencesTreeItem) {
        const cmd = element.cmd;
        let prefs = mani?.preferences || [];
        if (cmd && cmd.name && cmd.name.length > 0) {
          prefs = cmd.preferences || [];
        }
        return Promise.resolve(
          prefs.map(
            (p) => new PreferenceTreeItem(p, this.manager, this.manifest, vscode.TreeItemCollapsibleState.None, cmd)
          )
        );
      } else if (element instanceof CommandTreeItem) {
        const prefs = element.cmd?.preferences || [];
        const children: RaycastTreeItem[] = [];
        if (element.cmd.mode) {
          children.push(new CommandModeTreeItem(element.cmd));
        }
        if (element.cmd.interval) {
          children.push(new CommandIntervalTreeItem(element.cmd));
        }
        children.push(
          new PreferencesTreeItem(
            prefs.length > 0 ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None,
            element.cmd
          )
        );
        return Promise.resolve(children);
      }
    }
    return Promise.resolve([]);
  }

  private getManifest(): Manifest | undefined {
    try {
      const ws = this.manager.getActiveWorkspace();
      if (!ws) {
        throw Error("No active workspace");
      }
      const pkg = path.join(ws.uri.fsPath, "package.json");
      const mtime = getModTimeSync(pkg);
      if (this.manifest) {
        if (this.manifestLastModTime && mtime && this.manifestLastModTime.getSeconds() === mtime.getSeconds()) {
          this.manager.logger.debug("return cached manifest, no filechange in package.json");
          return this.manifest;
        }
      }
      if (fileExistsSync(pkg)) {
        this.manager.logger.debug("read in package.json");
        const mani = readManifestFileSync(pkg);
        this.manifestLastModTime = mtime;
        this.manifest = mani;
        return mani;
      } else {
        this.manifest = undefined;
      }
    } catch (error) {
      // ignore errors
    }
    return undefined;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

export class RaycastTreeItem extends vscode.TreeItem {
  constructor(public label?: string, public readonly collapsibleState?: vscode.TreeItemCollapsibleState) {
    super(label || "", collapsibleState);
  }
}

class CommandsTreeItem extends RaycastTreeItem {
  constructor(public readonly collapsibleState: vscode.TreeItemCollapsibleState) {
    super("Commands", collapsibleState);
    this.contextValue = "commands";
    this.iconPath = new vscode.ThemeIcon("terminal");
  }
}

export class CommandTreeItem extends RaycastTreeItem {
  constructor(
    public readonly cmd: Command,
    public readonly manager: ExtensionManager,
    public readonly manifest: Manifest | undefined,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(cmd.title || cmd.name || "?", collapsibleState);
    this.description = cmd.subtitle;
    this.tooltip = cmd.description;
    this.contextValue = "command";
    const ws = manager.getActiveWorkspace();
    if (ws) {
      const assetName: string | undefined = cmd.icon ? cmd.icon : manifest?.icon;
      if (assetName) {
        this.iconPath = path.join(ws.uri.fsPath, "assets", assetName);
      }
    }
    this.command = {
      command: "vscode.open",
      title: "",
      arguments: [path.join(ws?.uri.fsPath || "", "src", `${cmd.name}.tsx`)],
    };
  }
}

export class PreferencesTreeItem extends RaycastTreeItem {
  constructor(public readonly collapsibleState: vscode.TreeItemCollapsibleState, public readonly cmd?: Command) {
    super("Preferences", collapsibleState);
    this.contextValue = cmd === undefined ? "preferences" : "command-preferences";
    this.iconPath = new vscode.ThemeIcon("gear");
  }
}

function getPrefThemeIcon(type: string | undefined): vscode.ThemeIcon | undefined {
  let icon: string | undefined;
  switch (type) {
    case "checkbox":
      {
        icon = "symbol-boolean";
      }
      break;
    case "textfield":
      {
        icon = "symbol-string";
      }
      break;
    case "password":
      {
        icon = "gist-secret";
      }
      break;
    case "dropdown":
      {
        icon = "array";
      }
      break;
    case "appPicker":
      {
        icon = "browser";
      }
      break;
  }
  if (!icon) {
    icon = "gear";
  }
  return new vscode.ThemeIcon(icon);
}

export class PreferenceTreeItem extends RaycastTreeItem {
  constructor(
    public readonly preference: Preference,
    public readonly manager: ExtensionManager,
    public readonly manifest: Manifest | undefined,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly cmd?: Command
  ) {
    super(preference.title || preference.name || "?", collapsibleState);
    if (preference.type === "checkbox") {
      this.label = preference.label || preference.name || "?";
    }
    this.iconPath = getPrefThemeIcon(preference.type);
    this.description = preference.required === undefined ? undefined : preference.required ? "required" : undefined;
    this.tooltip = preference.description;

    this.contextValue = "preference";
    this.command = {
      command: "raycast.goto.preference",
      title: "",
      arguments: [this],
    };
  }
}

function getCommandModeIcon(type: string | undefined): vscode.ThemeIcon | undefined {
  let icon: string | undefined;
  switch (type) {
    case "view":
      {
        icon = "eye";
      }
      break;
    case "no-view":
      {
        icon = "eye-closed";
      }
      break;
    case "menu-bar":
      {
        icon = "window";
      }
      break;
  }
  if (!icon) {
    icon = "eye";
  }
  return new vscode.ThemeIcon(icon);
}

export class CommandModeTreeItem extends RaycastTreeItem {
  constructor(public readonly cmd: Command) {
    super("Mode", vscode.TreeItemCollapsibleState.None);
    this.description = cmd.mode ? cmd.mode : "";
    this.iconPath = getCommandModeIcon(cmd.mode);
    this.contextValue = "mode";
    this.command = {
      command: "raycast.goto.command.mode",
      title: "",
      arguments: [this],
    };
  }
}

export class CommandIntervalTreeItem extends RaycastTreeItem {
  constructor(public readonly cmd: Command) {
    super("Interval", vscode.TreeItemCollapsibleState.None);
    this.description = cmd.interval ? cmd.interval : "";
    this.iconPath = new vscode.ThemeIcon("sync");
    this.contextValue = "interval";
    this.command = {
      command: "raycast.goto.command.interval",
      title: "",
      arguments: [this],
    };
  }
}
