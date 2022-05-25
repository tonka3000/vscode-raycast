import path = require("path");
import * as vscode from "vscode";
import { getImageAssetsFromFolder } from "./assets";
import { Logger, LogLevel } from "./logging";
import { readManifestFile } from "./manifest";
import { getErrorMessage } from "./utils";

export class ExtensionManager implements vscode.Disposable {
  private _context: vscode.ExtensionContext;
  private _channel: vscode.OutputChannel;
  public logger: Logger = new Logger();
  private _terminal: vscode.Terminal | null = null;

  constructor(public readonly extensionContext: vscode.ExtensionContext) {
    this._context = extensionContext;
    this._channel = vscode.window.createOutputChannel("Raycast");
    this.logger.outputchannel = this._channel;
    this.logger.level = this.getLogLevel();

    this._context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(async () => {
        this.logger.debug("config changed event");
        await this.updateState();
      })
    );
    this.registerPackageJsonChanges();
  }

  private registerPackageJsonChanges() {
    const triggerUpdateOnChange = (filenames: string[]) => {
      const pkgjson = this.getActiveWorkspacePackageFilename();
      if (pkgjson) {
        const found = filenames.find((f) => f === pkgjson);
        if (found) {
          this.updateState();
        }
      }
    };
    this._context.subscriptions.push(
      vscode.workspace.onDidCreateFiles((e) => {
        triggerUpdateOnChange(e.files.map((f) => f.fsPath));
      })
    );
    this._context.subscriptions.push(
      vscode.workspace.onDidRenameFiles((e) => {
        const files: string[] = [];
        e.files.forEach((f) => {
          files.push(f.newUri.fsPath);
          files.push(f.oldUri.fsPath);
        });
        triggerUpdateOnChange(files);
      })
    );
    this._context.subscriptions.push(
      vscode.workspace.onDidDeleteFiles((e) => {
        triggerUpdateOnChange(e.files.map((f) => f.fsPath));
      })
    );
    this._context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument((e) => {
        const pkgjson = this.getActiveWorkspacePackageFilename();
        if (pkgjson && pkgjson === e.fileName) {
          this.updateState();
        }
      })
    );
  }

  public async updateState(): Promise<void> {
    this.logger.level = this.getLogLevel();
    this.logger.debug("update state");
    await this.updateContext();
  }

  public async updateContext(): Promise<void> {
    const pkgjsonFilename = this.getActiveWorkspacePackageFilename();
    const manifest = await readManifestFile(pkgjsonFilename);
    let isRaycastEnabled = false;
    if (manifest) {
      const deps = manifest.dependencies;
      if (deps) {
        const raycastapi: string | undefined = deps["@raycast/api"];
        if (raycastapi) {
          isRaycastEnabled = true;
        }
      }
    }
    this.logger.debug(`${pkgjsonFilename} raycast enabled: ${isRaycastEnabled}`);
    await this.setContext("raycast.workspaceEnabled", isRaycastEnabled);
  }

  private async setContext(key: string, value: any): Promise<void> {
    try {
      this.logger.debug(`setContext ${key} to ${value}`);
      await vscode.commands.executeCommand("setContext", key, value);
      this.logger.debug("setContent succeeded");
    } catch (error) {}
  }

  public registerCommand(command: string, callback: (...args: any[]) => any, thisArg?: any): vscode.Disposable {
    const safeCallback = async (args: any[], thisArg?: any): Promise<any> => {
      try {
        return await callback(args, thisArg);
      } catch (error) {
        vscode.window.showErrorMessage(getErrorMessage(error));
      }
    };
    const disp = vscode.commands.registerCommand(`raycast.${command}`, safeCallback, thisArg);
    this._context.subscriptions.push(disp);
    return disp;
  }

  public getTerminal(name?: string | undefined): vscode.Terminal {
    const nameid = name ? `raycast_${name}` : "raycast";
    const res = vscode.window.terminals.find((t) => t.name === nameid);
    if (res !== undefined) {
      return res;
    }
    const term = vscode.window.createTerminal(nameid);
    return term;
  }

  public getLogLevel(): LogLevel {
    const config = vscode.workspace.getConfiguration();
    const logleveltext = config.get("raycast.loglevel") as string;
    let result = LogLevel.none;
    switch (logleveltext) {
      case "none":
        {
          result = LogLevel.none;
        }
        break;
      case "debug":
        {
          result = LogLevel.debug;
        }
        break;
      case "info":
        {
          result = LogLevel.info;
        }
        break;
      case "warning":
        {
          result = LogLevel.warning;
        }
        break;
      case "error":
        {
          result = LogLevel.error;
        }
        break;
      case "critical":
        {
          result = LogLevel.critical;
        }
        break;
    }
    return result;
  }

  public runNpmExec(cmd: string[], terminalID?: string | undefined) {
    const term = this.getTerminal(terminalID);
    term.sendText("clear");
    term.show();
    term.sendText(`npm exec ${cmd.join(" ")}`);
  }

  public runNpx(cmd: string[], terminalID?: string | undefined) {
    const term = this.getTerminal(terminalID);
    term.sendText("clear");
    term.show();
    term.sendText(`npx exec ${cmd.join(" ")}`);
  }

  public getActiveWorkspace(): vscode.WorkspaceFolder | undefined {
    const wsf = vscode.workspace.workspaceFolders;
    if (wsf && wsf.length > 0) {
      const ws = wsf[0];
      return ws;
    }
    return undefined;
  }

  public getActiveWorkspacePackageFilename(): string | undefined {
    const ws = this.getActiveWorkspace();
    if (ws) {
      return path.join(ws.uri.fsPath, "package.json");
    }
    return undefined;
  }

  public async getImageAssets(): Promise<string[]> {
    const ws = this.getActiveWorkspace();
    if (!ws) {
      return [];
    }
    const assetsFolder = path.join(ws.uri.fsPath, "assets");
    return await getImageAssetsFromFolder(assetsFolder);
  }

  public dispose() {}
}
