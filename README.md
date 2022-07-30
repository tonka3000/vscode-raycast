# Raycast for VSCode

> <span style="color:red; font-weight:bold;">This is NOT an official tool by Raycast company!!</span>

This is a [Raycast](https://raycast.com) extension for VSCode. This should help you to develop [Raycast](https://raycast.com) extensions.

## Features

- ✅ Run lint process
- ✅ Run fix-lint process
- ✅ Run build process
- ✅ Run develop mode
- ✅ Run migration
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
- ✅ Raycast Treeview for easy navigation
- ✅ Auto Completion for script directives

## Requirements

You need to install the same requirements which are mention on [https://developers.raycast.com](https://developers.raycast.com/).

## Troubleshooting

If you have problems with the extension just file a issue on [GitHub](https://github.com/tonka3000/vscode-raycast/issues). It's mostly a good idea to attach the log output of this extension to the issue. You can active the logger by adding `"raycast.loglevel": "debug"` to your `settings.json` file. Just copy the content of the `Raycast` output pane into your GitHub issue.

## Contributions

Pull Requests are welcome :-D

## License

MIT
