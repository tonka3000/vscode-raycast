import * as afs from "fs/promises";
import { ExtensionManager } from "../manager";
import * as vscode from "vscode";
import { fileExists, showTextDocumentAtPosition } from "../utils";
import path = require("path");
import { readManifestFile } from "../manifest";
import which = require("which");

const raycastSwiftUrl = "https://github.com/raycast/extensions-swift-tools";

async function isXcodeInstalled() {
  const resolved = await which("xcode-select", { nothrow: true });
  return resolved ? true : false;
}

async function openXcodeInAppStore() {
  await vscode.env.openExternal(vscode.Uri.parse("https://apps.apple.com/app/xcode/id497799835"));
}

function commentify(lines: string[]) {
  return lines.map((c) => `//${c.length > 0 ? " " : ""}${c}`).join("\n");
}

async function addSwiftSupport(manager: ExtensionManager, rootFolder: string) {
  const manifest = await readManifestFile(manager.getActiveWorkspacePackageFilename());
  const packageName = manifest?.name;
  if (!packageName) {
    throw new Error("Could not get name from manifest");
  }
  const gitignoreFilename = path.join(rootFolder, ".gitignore");
  const gitignore = [".DS_Store", ".build/", ".swiftpm/", ".vscode/", "Package.resolved"];
  const sourcesFolder = path.join(rootFolder, "Sources");
  await afs.mkdir(sourcesFolder, { recursive: true });
  await afs.writeFile(gitignoreFilename, gitignore.join("\n"));
  const swiftPackageFilename = path.join(rootFolder, "Package.swift");
  const swiftPackage = `// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "${packageName}",
    platforms: [.macOS(.v12)],
    dependencies: [
      .package(url: "https://github.com/raycast/extensions-swift-tools.git", from: "1.0.1"),
    ],
    targets: [
      .executableTarget(
        name: "${packageName}",
        dependencies: [
          .product(name: "RaycastSwiftMacros", package: "extensions-swift-tools"),
          .product(name: "RaycastSwiftPlugin", package: "extensions-swift-tools"),
          .product(name: "RaycastTypeScriptPlugin", package: "extensions-swift-tools"),
        ]
      ),
    ]
)`;
  await afs.writeFile(swiftPackageFilename, swiftPackage);

  const example = [
    "",
    "# How to Import from TypeScript file",
    "",
    "Example TypeScript file src/mycommand.tsx :",
    "",
    'import { hello, helloName } from "swift:../swift" // relative path to the swift directory from the workspace root',
    "",
    "async function exampleFunction() {",
    "  await hello();",
    '  await helloName("Michael");',
    "}",
  ];

  const warning = [
    "Warning: You shouldn't have a main.swift file in your project nor a structure marked with @main.",
    "         These are reserved for the Swift-to-TypeScript plugins.",
  ];

  const generalInstructions = [
    "",
    "# How to make a Swift function available in TypeScript",
    "",
    "Write global Swift functions and mark them with the @raycast attribute.",
    "Global functions marked with @raycast are exported to TypeScript.",
    "These functions can have any number of parameters, and one or no return type.",
    "Exported functions can also be asynchronous (async) or throw errors (throws).",
    "",
    "The only restrictions are:",
    "",
    "- Parameters must conform to Decodable",
    "- The return type (if any) must conform to Encodable (or be Void or ()).",
    "- Variadic parameters and parameter packs are not supported.",
    "- Only global functions will be exported. Methods or functions within structs, classes, or enums won't be exported.",
    "",
    `For more details check out the official repository ${raycastSwiftUrl}`,
  ];

  const source = `import Foundation
import RaycastSwiftMacros

@raycast func hello() -> String {
  "Hello from Swift"
}

@raycast func helloName(name:String) -> String{
  "Hello \(name)"
}

${commentify(example)}

${commentify(warning)}

${commentify(generalInstructions)}

`;
  const swiftCodeFilename = path.join(sourcesFolder, `${packageName}.swift`);
  await afs.writeFile(swiftCodeFilename, source);
  return swiftCodeFilename;
}

export async function addSwiftSupportCmd(manager: ExtensionManager) {
  manager.logger.debug("Add Swift support");
  const ws = manager.getActiveWorkspace();
  if (!ws) {
    throw new Error("No active workspace");
  }
  const swiftRootFolder = path.join(ws.uri.fsPath, "swift");
  if (await fileExists(path.join(swiftRootFolder, "Package.swift"))) {
    throw new Error("Swift Support already exist");
  }
  const swiftFilename = await addSwiftSupport(manager, swiftRootFolder);
  showTextDocumentAtPosition(vscode.Uri.file(swiftFilename));
  vscode.window.showInformationMessage("Swift Support added successfully", ...["More Info"]).then((selected) => {
    if (selected === "More Info") {
      vscode.env.openExternal(vscode.Uri.parse(raycastSwiftUrl));
    }
  });
  const xcodeInstalled = await isXcodeInstalled();
  if (!xcodeInstalled) {
    vscode.window
      .showWarningMessage(
        "You need to install Xcode because it is required for Swift for Raycast",
        ...["More Info", "AppStore"],
      )
      .then((selected) => {
        if (selected === "More Info") {
          vscode.env.openExternal(vscode.Uri.parse(raycastSwiftUrl + "#requirements"));
        } else if (selected === "AppStore") {
          openXcodeInAppStore();
        }
      });
  }
}
