# Change Log

## 0.17

- Add dropdown type for arguments

## 0.16

- Add `Add Swift Support` command

## 0.15

- `Name` is now checked for non allowed characters for Command, Preference and Argument
- The tsx file get opened after creating it via `Add Command`

## 0.14

- Add auto completion for `launchCommand` properties `name`, `extensionName` and `ownerOrAuthorName`
- Remove explicit return types for command templates

## 0.13

- Add `Open Extension Issues Dashboard`

## 0.12

- Add support for new Raycast node process

## 0.11

- Display `disableByDefault` in tree
- Ask for `disableByDefault` when creating a new command

## 0.10

- Display possible migration of the Raycast API in the tree

## 0.9.1

- Fix crash if `transit` folder does not exist

## 0.9

- Add experimental URI protocol handler

## 0.8.1

- Add `.svg` files as whitelisted asset extension

## 0.8

- Add support for command arguments
- Add auto completion for script directives

## 0.7

- Add support for `menu-bar` mode
- Add support for background refresh parameter `interval`
- Add `Open Command File` command
- Add command templates based on `mode`

## 0.6.1

- Fix problem in goto command mode when command name containing special characters

## 0.6.0

- Add Command Preferences to Treeview
- Add Command mode to Treeview

## 0.5.1

- Use dark theme raycast logo
- Treeview get updated after using `Add Command` or `Add Preference`

## 0.5.0

- Add Raycast Treeview

## 0.4.1

- Stop running debugger instead of throw an error to avoid blocking when VSCode does not cleanup crashed debugger instances

## 0.4

- Add `Login` command
- Add `Publish` command
- Add `Attach Debugger` command

## 0.3

- Add `Insert Image Asset`
- Add Code snippets prefix with `raycast`
- Add Image Asset autocompletion for extension icons in `.tsx` files (`source:` and `icon=` are supported)
- Add Image Asset autocompletion for extension icons in `package.json` (`"icon":` is supported)

## 0.2

- Add command to add a Raycast Preference
- Add command to add a Raycast command

## 0.1

- Initial release
