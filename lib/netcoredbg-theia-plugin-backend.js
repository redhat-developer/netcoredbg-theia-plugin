"use strict";
/*
 * Copyright (c) 2012-2019 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Plug-in for Theia which registers netcoredbg debugger to debug .Net apps.
 * The netcoredbg is based in https://github.com/Samsung/netcoredbg.
 */
var theia = require("@theia/plugin");
var cp = require("child_process");
function start(context) {
    var outputChannel = theia.window.createOutputChannel('dotnet-log');
    outputChannel.show();
    context.subscriptions.push(theia.commands.registerCommand(createBuildCommand(), function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        buildProject(outputChannel);
    }));
}
exports.start = start;
function buildProject(outputChannel) {
    return __awaiter(this, void 0, void 0, function () {
        function handleData(stream) {
            if (!stream) {
                return;
            }
            stream.on('data', function (chunk) {
                outputChannel.appendLine(chunk.toString());
            });
            stream.on('err', function (err) {
                outputChannel.appendLine("ERROR: " + err);
            });
        }
        var e_1, _a, projectFiles, projects, projectFiles_1, projectFiles_1_1, resource, project, projectToBuild, cmd, args, dotnet;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!theia.workspace.workspaceFolders) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, theia.workspace.findFiles(
                        /*include*/ '{**/*.csproj}', 
                        /*exclude*/ '{**/node_modules/**,**/.git/**,**/bower_components/**}', 
                        /*maxResults*/ 10)];
                case 1:
                    projectFiles = _b.sent();
                    projects = new Set();
                    try {
                        for (projectFiles_1 = __values(projectFiles), projectFiles_1_1 = projectFiles_1.next(); !projectFiles_1_1.done; projectFiles_1_1 = projectFiles_1.next()) {
                            resource = projectFiles_1_1.value;
                            if (resource.path.endsWith('.csproj')) {
                                project = resource;
                                projects.add(project.path);
                            }
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (projectFiles_1_1 && !projectFiles_1_1.done && (_a = projectFiles_1.return)) _a.call(projectFiles_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    return [4 /*yield*/, showProjectsToBuild(Array.from(projects.values()))];
                case 2:
                    projectToBuild = _b.sent();
                    cmd = 'dotnet';
                    args = ['build', projectToBuild];
                    dotnet = cp.spawn(cmd, args, { env: process.env });
                    handleData(dotnet.stdout);
                    handleData(dotnet.stderr);
                    dotnet.on('close', function (code, signal) {
                        outputChannel.appendLine("Done: " + code);
                        outputChannel.show();
                    });
                    dotnet.on('error', function (err) {
                        outputChannel.appendLine("ERROR: " + err);
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function showProjectsToBuild(items) {
    return new Promise(function (resolve) {
        var options = {};
        options.onDidSelectItem = (function (item) {
            var projectPath = typeof item === 'string' ? item : item.label;
            resolve(projectPath);
        });
        theia.window.showQuickPick(items, options);
    });
}
function createBuildCommand() {
    return {
        id: 'dotnet-build-project',
        label: ".NET: Build Project"
    };
}
function stop() {
}
exports.stop = stop;
//# sourceMappingURL=netcoredbg-theia-plugin-backend.js.map