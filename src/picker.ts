import * as vscode from "vscode";

export interface CustomQuickPickOptions {
  placeholder?: string;
  title?: string;
}

export async function showCustomQuickPick(
  choices: string[],
  options?: CustomQuickPickOptions | undefined,
): Promise<string> {
  return new Promise((resolve) => {
    const quickPick = vscode.window.createQuickPick();
    quickPick.items = choices.map((choice) => ({ label: choice }));

    quickPick.title = options?.title;
    quickPick.placeholder = options?.placeholder;

    quickPick.onDidChangeValue(() => {
      if (!choices.includes(quickPick.value)) {
        quickPick.items = [quickPick.value, ...choices].map((label) => ({ label }));
      } else {
        quickPick.items = [...choices].map((label) => ({ label }));
      }
    });

    quickPick.onDidAccept(() => {
      const selection = quickPick.activeItems[0];
      resolve(selection.label);
      quickPick.hide();
    });
    quickPick.show();
  });
}
