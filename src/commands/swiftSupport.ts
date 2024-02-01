import * as afs from "fs/promises";
import { ExtensionManager } from "../manager";
import * as vscode from "vscode";
import { fileExists, showTextDocumentAtPosition } from "../utils";
import path = require("path");
import { readManifestFile } from "../manifest";

const raycastSwiftUrl = "https://github.com/raycast/extensions-swift-tools";

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

  const comments = [
    "How to Import from TypeScript file",
    'import { hello } from "swift:../swift" // relative path to the swift directory from the workspace root',
    "",
    "async function exampleFunction() {",
    "  await hello();",
    "}",
    "",
    "Write a global swift function and add @raycast before to make it available in TypeScript",
    "",
    "Warning: You shouldn't have a main.swift file in your project nor a structure marked with @main.",
    "         These are reserved for the Swift-to-TypeScript plugins.",
    "",
    `For more details goto the official repository ${raycastSwiftUrl}`,
  ];

  const source = `import Foundation
import RaycastSwiftMacros

${comments.map((c) => `// ${c}`).join("\n")}

@raycast func hello() -> String {
  "Hello from Swift"
}
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
  if (await fileExists(swiftRootFolder)) {
    throw new Error("Swift folder already exists");
  }
  const swiftFilename = await addSwiftSupport(manager, swiftRootFolder);
  showTextDocumentAtPosition(vscode.Uri.file(swiftFilename));
  vscode.window.showInformationMessage("Swift Support added successfully", ...["More Info"]).then((selected) => {
    if (selected === "More Info") {
      vscode.env.openExternal(vscode.Uri.parse(raycastSwiftUrl));
    }
  });
}
