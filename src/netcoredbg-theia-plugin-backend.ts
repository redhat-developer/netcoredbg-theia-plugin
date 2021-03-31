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

/**
 * Plug-in for Theia which registers netcoredbg debugger to debug .Net apps.
 * The netcoredbg is based in https://github.com/Samsung/netcoredbg. 
 */
import * as theia from '@theia/plugin';
import * as cp from 'child_process';

export function start(context: theia.PluginContext) {

    const outputChannel: theia.OutputChannel = theia.window.createOutputChannel('dotnet-log');

    context.subscriptions.push(theia.commands.registerCommand(createBuildCommand(), (...args: any[]) => {
        buildProject(outputChannel);
    }));
}

async function buildProject(outputChannel: theia.OutputChannel) {
    if (!theia.workspace.workspaceFolders) {
        return;
    }

    const projectFiles = await theia.workspace.findFiles(
        /*include*/ '{**/*.csproj}',
        /*exclude*/ '{**/node_modules/**,**/.git/**,**/bower_components/**}',
        /*maxResults*/ 10);

    let projects = new Set();
    for (let resource of projectFiles) {
        if (resource.path.endsWith('.csproj')) {
            let project = resource as theia.Uri;
            projects.add(project.path);
        }
    }

    let projectToBuild = await showProjectsToBuild(Array.from(projects.values()));

    let cmd = 'dotnet';
    let args = ['build', projectToBuild];
    let dotnet = cp.spawn(cmd, args, { env: process.env });

    function handleData(stream: NodeJS.ReadableStream | null) {
        if (!stream) {
            return;
        }
        stream.on('data', chunk => {
            outputChannel.appendLine(chunk.toString());
        });

        stream.on('err', err => {
            outputChannel.appendLine(`ERROR: ${err}`);
        });
    }

    handleData(dotnet.stdout);
    handleData(dotnet.stderr);

    dotnet.on('close', (code, signal) => {
        outputChannel.appendLine(`Done: ${code}`);
        outputChannel.show();
    });

    dotnet.on('error', err => {
        outputChannel.appendLine(`ERROR: ${err}`);
    });
}

function showProjectsToBuild(items: string[]): Promise<string> {
    return new Promise<string>(resolve => {
        const options = {} as theia.QuickPickOptions;
        options.onDidSelectItem = (item => {
            const projectPath = typeof item === 'string' ? item : item.label;
            resolve(projectPath);
        });
        theia.window.showQuickPick(items, options);
    });
}

function createBuildCommand(): theia.CommandDescription {
    return {
        id: 'dotnet-build-project',
        label: ".NET: Build Project"
    }
}

export function stop() {
}
