import * as afs from "fs/promises";
import { ExtensionManager } from "../manager";
import * as vscode from "vscode";
import { fileExists } from "../utils";
import path = require("path");
import { readManifestFile } from "../manifest";

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

  const source = `import Foundation
import RaycastSwiftMacros

@raycast func hello() -> String {
  "Hello from Swift"
}
`;
  await afs.writeFile(path.join(sourcesFolder, `${packageName}.swift`), source);
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
  await addSwiftSupport(manager, swiftRootFolder);
  vscode.window.showInformationMessage("Swift Support added successfully");
}
