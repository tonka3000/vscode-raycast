import { CommandMetadata } from "./commands";

const knownCommandMetas: CommandMetadata[] = [
  {
    command: "workbench.action.terminal.new",
    title: "Create New Terminal",
    category: "Terminal",
  },
  {
    command: "openInTerminal",
    title: "Open New External Terminal",
    category: "Terminal",
  },
  {
    command: "workbench.action.terminal.kill",
    title: "Kill Terminal",
    category: "Terminal",
  },
  {
    command: "terminal.focus",
    title: "Focus on Terminal View",
    category: "Terminal",
  },
  {
    command: "workbench.action.reloadWindow",
    title: "Reload Window",
    category: "Developer",
  },
  {
    command: "vscode.openFolder",
    title: "Open Folder...",
    category: "File",
  },
  {
    command: "workbench.action.findInFiles",
    title: "Find in Files",
    category: "Search",
  },
  {
    command: "workbench.extensions.search",
    title: "Show Extensions",
    category: "View",
  },
];

export function getFixedCommandMetaData(cmdid: string): CommandMetadata | undefined {
  const meta = knownCommandMetas.find((c) => c.command === cmdid);
  if (meta) {
    return meta;
  }
  return undefined;
}
