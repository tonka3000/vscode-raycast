import { CommandMetadata } from "./commands";

const knownCommandMetas: CommandMetadata[] = [
  {
    command: "openInTerminal",
    title: "Create New Terminal",
    category: "Terminal",
  },
  {
    command: "terminal.focus",
    title: "Focus on Terminal View",
    category: "Terminal",
  },
];

export function getFixedCommandMetaData(cmdid: string): CommandMetadata | undefined {
  const meta = knownCommandMetas.find((c) => c.command === cmdid);
  if (meta) {
    return meta;
  }
  return undefined;
}
