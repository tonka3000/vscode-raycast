import * as fs from "fs";

export async function fileExists(filename: string): Promise<boolean> {
  return fs.promises
    .access(filename, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

export function capitalizeFirstLetter(name: string | undefined): string | undefined {
  if (name === undefined) {
    return undefined;
  }
  if (name === "") {
    return name;
  }
  return name.replace(/^./, name[0].toUpperCase());
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "unknown error";
}
