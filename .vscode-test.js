// .vscode-test.js
const { defineConfig } = require("@vscode/test-cli");

module.exports = defineConfig(
  ["1.101.0", "stable"].map((version) => ({
    label: `unitTests-${version}`,
    version,
    files: "out/test/**/*.test.js",
    workspaceFolder: "./",
    mocha: {
      ui: "tdd",
      timeout: 20000,
    },
  })),
);
