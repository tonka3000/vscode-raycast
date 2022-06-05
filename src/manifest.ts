import { fileExists, fileExistsSync } from "./utils";
import * as fs from "fs";

export enum PreferenceType {
  textfield = "textfield",
  password = "password",
  checkbox = "checkbox",
  dropdown = "dropdown",
  appPicker = "appPicker",
}

export interface Command {
  name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  mode?: string;
  icon?: string;
}

export interface PreferenceData {
  title?: string;
  value?: string;
}

export interface Preference {
  name?: string;
  description?: string;
  type?: string;
  required?: boolean;
  title?: string;
  placeholder?: string;
  default?: string | boolean;
  data?: PreferenceData[];
  label?: string;
}

export interface Manifest {
  name?: string;
  title?: string;
  icon?: string;
  description?: string;
  commands?: Command[];
  preferences?: Preference[];
  dependencies?: Record<string, string>;
}

export async function readManifestFile(filename: string | undefined): Promise<Manifest | undefined> {
  if (filename === undefined) {
    return undefined;
  }
  if (await fileExists(filename)) {
    const bytes = await fs.promises.readFile(filename);
    const manifest = JSON.parse(bytes.toString()) as Manifest;
    return manifest;
  }
  return undefined;
}

export function readManifestFileSync(filename: string | undefined): Manifest | undefined {
  if (filename === undefined) {
    return undefined;
  }
  if (fileExistsSync(filename)) {
    const bytes = fs.readFileSync(filename);
    const manifest = JSON.parse(bytes.toString()) as Manifest;
    return manifest;
  }
  return undefined;
}
