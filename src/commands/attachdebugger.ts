import { ExtensionManager } from "../manager";
import * as vscode from "vscode";
import util = require("util");
const exec = util.promisify(require("child_process").exec);

async function getRaycastNodePid(manager: ExtensionManager): Promise<number | null> {
  try {
    const { stdout, stderr } = await exec("ps -eo pid,command");
    const splits = stdout.split("\n") as string[];
    for (const s of splits) {
      if (s.includes("Raycast.app") && s.includes("bin/node")) {
        manager.logger.debug(`found Raycast node process: ${s}`);
        const st = s.trim();
        const m = st.match(/([0-9]+)/g);
        if (m && m.length > 0) {
          const pidText = m[0];
          const pid = parseInt(pidText);
          return pid;
        }
      }
    }
  } catch (error) {}
  return null;
}

export async function attachDebuggerCmd(manager: ExtensionManager) {
  const pid = await getRaycastNodePid(manager);
  if (!pid) {
    throw Error(
      "Could not get Raycast node process. Make sure Raycast is running and an extension was started at least once"
    );
  }
  manager.logger.debug(`${pid}`);
  const ws = manager.getActiveWorkspace();
  if (!ws) {
    throw Error("No Active Workspace");
  }
  const name = "Attach Running Raycast Process";
  if (vscode.debug.activeDebugSession?.workspaceFolder === ws) {
    throw Error("Debugger already attached");
  }
  vscode.debug.startDebugging(ws, {
    name: name,
    processId: `${pid}`,
    request: "attach",
    skipFiles: ["<node_internals>/**"],
    localRoot: "${workspaceFolder}",
    remoteRoot: "${workspaceFolder}",
    type: "node",
  });
}
