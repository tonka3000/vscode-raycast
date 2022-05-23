import * as vscode from "vscode";
import { Logger, LogLevel } from "./logging";

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
  }

  public async updateState(): Promise<void> {
    this.logger.level = this.getLogLevel();
    this.logger.debug("update state");
  }

  public registerCommand(command: string, callback: (...args: any[]) => any, thisArg?: any): vscode.Disposable {
    const disp = vscode.commands.registerCommand(`raycast.${command}`, callback, thisArg);
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

  public dispose() {}
}
