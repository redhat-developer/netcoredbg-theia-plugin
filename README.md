# Debugger for .NET
This plug-in provides [netcoredbg](https://github.com/Samsung/netcoredbg) which implements VSCode Debug Adapter protocol and allows to debug .NET apps under .NET Core runtime.

# Launch configuration
The base launch configuration looks like:
```gson
{
    "type": "netcoredbg",
    "request": "launch",
    "program": "${workspaceFolder}/bin/Debug/<target-framework>/<project-name.dll>",
    "args": [],
    "name": ".NET Core Launch (console)",
    "stopAtEntry": false,
    "console": "internalConsole"
}
```
Before debugging you need to build a project. 
The plugin provides a command to do that. For this you need to click `F1` and select `.Net: Build Project`, after that select your project to build.


