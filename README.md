# Raycast for VSCode

> <span style="color:red; font-weight:bold;">This is NOT an official tool by Raycast company!!</span>

The extension should help you to develop [Raycast](https://raycast.com) extensions by providing

- Commands for common tasks
- Debugging
- Auto-Completion
- Snippets

and more

## Features

- ✅ Run lint process
- ✅ Run fix-lint process
- ✅ Run build process
- ✅ Run develop mode
- ✅ Run migration (also available in the tree-view)
- ✅ Login
- ✅ Publish extensions
- ✅ `Attach Debugger` command

  Attach a nodejs debugger to the running Raycast node process.

  ⚠️ Make sure that Raycast is running and you have started a non native extension at least once, otherwise the node process does not run ⚠️

- ✅ Add preference (`default` and `data` are not support for now)
- ✅ Add command
- ✅ Add command argument
- ✅ Open Command File
- ✅ Image Asset filename via dropdown into active text editor
- ✅ Image Asset auto completion for
  - icons in `.tsx` files (`source:` and `icon=` are supported)
  - icons in `package.json` (`"icon":` is supported)
- ✅ Builtin code snippet - just type raycast in a `.tsx` file
- ✅ Open [Documentation](https://developers.raycast.com)
- ✅ Search in [Documentation](https://developers.raycast.com)
- ✅ Raycast Tree-view for easy navigation
- ✅ Auto Completion for script directives
- ✅ Open the Extension Issues Dashboard
- ✅ Add Swift support with one command

## Requirements

You need to install the same requirements which are mention on [https://developers.raycast.com](https://developers.raycast.com/).

## URI Handler Support

🚧 Experimental

You can run a command inside VSCode from outside of VSCode via custom URI handler.
The URI handler can run commands with the following schema `vscode://tonka3000.raycast/runcommand?cmd=<cmdid>`.
`cmdid` needs to be replaced by the internal command id of the specific VSCode command which you wanna trigger.

E.g. you can run the command `Terminal: Create New Terminal` when you use it's internal ID `workbench.action.terminal.new`.
The full command would look like `vscode://tonka3000.raycast/runcommand?cmd=workbench.action.terminal.new`.

To run this example from the MacOS terminal you need to enter the following line into your terminal

`open "vscode://tonka3000.raycast/runcommand?cmd=workbench.action.terminal.new"`

⚠️ Arguments for commands are right now not supported.

### Limitations

Some commands of VSCode can not be run in a specific context, which is a limitation of VSCode itself.
This can lead to errors.

## Troubleshooting

If you have problems with the extension just file a issue on [GitHub](https://github.com/tonka3000/vscode-raycast/issues). It's mostly a good idea to attach the log output of this extension to the issue. You can active the logger by adding `"raycast.loglevel": "debug"` to your `settings.json` file. Just copy the content of the `Raycast` output pane into your GitHub issue.

## Contributions

Pull Requests are welcome 😁

## License

MIT
