import * as vscode from "vscode";
import path = require("path");
import { ExtensionManager } from "./manager";
import { Manifest, readManifestFile } from "./manifest";
import { getLocalInstalledManifests } from "./localstore";
import { deduplicate } from "./utils";

function getStringProperties(text: string) {
  const commentIndex = text.indexOf("//");
  const t = commentIndex >= 0 ? text.slice(0, commentIndex) : text;
  const result = [...t.matchAll(/(\w+)\s*:\s*\"(.*?)\"/g)].map((m) => ({
    key: m[1],
    value: m[2],
  }));
  return result;
}

function getMostRightPropertyName(line: string) {
  const li = line.lastIndexOf(":");
  const t = line.slice(0, li + 1);
  const match = t.match(/(\w+):\s*$/g);
  if (match) {
    return match[0].replace(":", "").trim();
  }
}

function manifestCommandsCompletion(manifest: Manifest | undefined) {
  return manifest?.commands
    ?.filter((c) => c.name)
    .map(
      (c) =>
        new vscode.CompletionItem(
          {
            label: c.name || "?",
            detail: " " + (c.title || ""),
          },
          vscode.CompletionItemKind.Value,
        ),
    );
}

async function processLaunchCommand(args: {
  line: vscode.TextLine;
  position: vscode.Position;
  document: vscode.TextDocument;
  extensionManager: ExtensionManager;
}): Promise<vscode.CompletionItem[] | undefined> {
  const beforeText = args.document.getText(new vscode.Range(args.line.range.start, args.position));
  const activeProp = getMostRightPropertyName(beforeText);
  const manifestFilename = args.extensionManager.getActiveWorkspacePackageFilename();
  if (activeProp === "name") {
    const stringProps = getStringProperties(args.line.text);
    const authorOwner = stringProps.find((o) => o.key === "ownerOrAuthorName")?.value;
    const extensionName = stringProps.find((o) => o.key === "extensionName")?.value;
    if (authorOwner && extensionName) {
      const manifests = await getLocalInstalledManifests();
      const extension = manifests?.find(
        (m) => (m.owner === authorOwner || m.author === authorOwner) && m.name === extensionName,
      );
      if (extension) {
        return manifestCommandsCompletion(extension);
      }
    } else if (!authorOwner && !extensionName) {
      const manifest = await readManifestFile(manifestFilename);
      if (!manifest) {
        return;
      }
      return manifestCommandsCompletion(manifest);
    }
  } else if (activeProp === "ownerOrAuthorName") {
    const manifests = await getLocalInstalledManifests();
    const extensionOwnerOrAuthors = deduplicate(
      manifests?.map((m) => m.owner ?? m.author).filter((m) => m) as string[] | undefined,
    );
    return extensionOwnerOrAuthors?.map(
      (o) =>
        new vscode.CompletionItem(
          {
            label: o,
          },
          vscode.CompletionItemKind.User,
        ),
    );
  } else if (activeProp === "extensionName") {
    const manifests = await getLocalInstalledManifests();
    const stringProps = getStringProperties(args.line.text);
    const ownerAuthor = stringProps.find((o) => o.key === "ownerOrAuthorName")?.value;
    if (!ownerAuthor || ownerAuthor.trim().length <= 0) {
      return;
    }
    const extensions = manifests?.filter((m) => (m.owner === ownerAuthor || m.author === ownerAuthor) && m.name);
    console.log(extensions);
    return extensions?.map(
      (o) =>
        new vscode.CompletionItem(
          {
            label: o.name || "?",
            detail: o.title ? ` ${o.title}` : undefined,
            description: o.devVersion ? "Local Install Only" : "Store",
          },
          vscode.CompletionItemKind.Class,
        ),
    );
  }
  return undefined;
}

export function registerRaycastCompletionProvider(extensionManager: ExtensionManager) {
  const tsCompletionProvider = vscode.languages.registerCompletionItemProvider(
    "typescript",
    {
      async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext,
      ) {
        if (!extensionManager.isRaycastEnabled) {
          return;
        }
        const line = document.lineAt(position.line);
        if (line.text.trim().startsWith("launchCommand")) {
          return await processLaunchCommand({ line, position, document, extensionManager });
        }
        return undefined;
      },
    },
    '"',
    "'",
  );
  const tsreactCompletionProvider = vscode.languages.registerCompletionItemProvider(
    "typescriptreact",
    {
      async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext,
      ) {
        if (!extensionManager.isRaycastEnabled) {
          return;
        }
        const line = document.lineAt(position.line);
        if (line.text.trim().startsWith("launchCommand")) {
          return await processLaunchCommand({ line, position, document, extensionManager });
        }
        const text = line.text.substring(0, position.character);
        const sourceIndex = text.lastIndexOf("source:");
        const iconIndex = text.lastIndexOf("icon=");
        if ((sourceIndex > 0 && text.length - sourceIndex < 15) || (iconIndex > 0 && text.length - iconIndex < 15)) {
          const assets = await extensionManager.getImageAssets();
          if (assets && assets.length > 0) {
            return assets.map((a) => new vscode.CompletionItem(a, vscode.CompletionItemKind.File));
          }
        }
        return undefined;
      },
    },
    '"',
    "'",
  );
  const jsonCompletionProvider = vscode.languages.registerCompletionItemProvider(
    "json",
    {
      async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext,
      ) {
        if (!extensionManager.isRaycastEnabled) {
          return;
        }
        const filename = path.basename(document.fileName);
        if (filename !== "package.json") {
          return undefined;
        }
        const line = document.lineAt(position.line);
        const text = line.text.substring(0, position.character);
        const lastColon = text.lastIndexOf(":");
        if (lastColon > 0) {
          const splits = text.substring(0, lastColon).split(":");
          if (splits && splits.length > 0) {
            const last = splits[splits.length - 1];
            if (last.includes('"icon"')) {
              const assets = await extensionManager.getImageAssets();
              if (assets && assets.length > 0) {
                const comps = assets.map((a) => {
                  const c = new vscode.CompletionItem(a, vscode.CompletionItemKind.File);
                  c.range = new vscode.Range(position, position); // required for json files
                  return c;
                });
                return comps;
              }
            }
          }
        }
        return undefined;
      },
    },
    '"',
  );
  extensionManager.context.subscriptions.push(tsCompletionProvider, tsreactCompletionProvider, jsonCompletionProvider);
}
