import { fileExists, fileExistsSync } from "./utils";
import { ObjectNode, ValueNode, Location } from "json-to-ast";
import * as fs from "fs";
import parse = require("json-to-ast");
import * as vscode from "vscode";

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
  preferences?: Preference[];
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
  try {
    if (filename === undefined) {
      return undefined;
    }
    if (await fileExists(filename)) {
      const bytes = await fs.promises.readFile(filename);
      const manifest = JSON.parse(bytes.toString()) as Manifest;
      return manifest;
    }
  } catch (error) {}
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

export async function readManifestAST(filename: string) {
  const bytes = await fs.promises.readFile(filename, "utf-8");
  return new ManifestAST(bytes);
}

export class ManifestAST {
  private rootNode: ObjectNode;
  private manifest: Manifest;
  constructor(public readonly jsonContent: string) {
    this.rootNode = parse(jsonContent, { loc: true }) as ObjectNode;
    this.manifest = JSON.parse(jsonContent) as Manifest;
  }

  getObject(path: string): ValueNode | undefined {
    return getObject(this.rootNode, path);
  }

  getPosition(path: string): vscode.Position | undefined {
    return getPosition(this.rootNode, path);
  }

  getCommand(name: string): ObjectNode | undefined {
    const index = this.manifest.commands?.findIndex((c) => c.name === name);
    if (index === undefined || index < 0) {
      return undefined;
    }
    const o = this.getObject(`commands.${index}`);
    if (!o) {
      return undefined;
    }
    if (o.type === "Object") {
      return o;
    }
  }

  getPreference(prefName: string, cmdName?: string | undefined): ObjectNode | undefined {
    try {
      let cmdPrefix = "";
      if (cmdName && cmdName.length > 0) {
        cmdPrefix = `commands.[name=${cmdName}].`;
      }
      const o = this.getObject(`${cmdPrefix}preferences.[name=${prefName}]`);
      if (o && o.type === "Object") {
        return o;
      }
    } catch (error) {
      console.log(error);
    }
    return undefined;
  }
  getPreferencePosition(prefName: string, cmdName?: string | undefined): vscode.Position | undefined {
    return parserLocationToVSCode(this.getPreference(prefName, cmdName)?.loc);
  }
}

function getObject(root: ValueNode, path: string): ValueNode | undefined {
  try {
    const splits = path.split(".");
    let cursor = root;
    for (const s of splits) {
      if (s.length <= 0) {
        return undefined;
      }
      const num = Number(s);
      const queryRegex = /\[(\w+)=(.+)\]/; // e.g. [myvar=myval]
      const match = s.match(queryRegex);
      if (match) {
        const key = match[1];
        const val = match[2];
        if (cursor.type === "Array") {
          for (const c of cursor.children) {
            if (c.type === "Object") {
              const result = c.children.find(
                (e) => e.key.value === key && e.value.type === "Literal" && e.value.value === val
              );
              if (result) {
                cursor = c;
                break;
              }
            } else {
              return undefined;
            }
          }
        } else {
          return undefined;
        }
      } else if (!isNaN(num) && Number.isInteger(num)) {
        if (cursor.type === "Array") {
          const e = cursor.children[num];
          if (e.type === "Array") {
            cursor = e;
          } else if (e.type === "Object") {
            cursor = e;
          } else {
            return undefined;
          }
        } else {
          return undefined;
        }
      } else {
        const obj = cursor as ObjectNode;
        const keyObject = obj.children.find((e) => e.key.value === s);
        if (!keyObject) {
          return undefined;
        }
        cursor = keyObject.value;
      }
    }
    return cursor;
  } catch (error) {}
}

function parserLocationToVSCode(loc?: Location): vscode.Position | undefined {
  if (!loc) {
    return undefined;
  }
  return new vscode.Position(loc.start.line - 1, loc.start.column - 1);
}

function getPosition(root: ValueNode, path: string): vscode.Position | undefined {
  const obj = getObject(root, path);
  return parserLocationToVSCode(obj?.loc);
}
