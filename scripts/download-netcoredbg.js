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

// @ts-check
const fs = require('fs');
const tar = require('tar');
const zlib = require('zlib');
const https = require('https');
const http = require('http');
const path = require('path');
const mkdirp = require('mkdirp');

// @ts-ignore
const packagePath = path.join(__dirname, '..');
let downloadUrl = 'https://github.com/Samsung/netcoredbg/releases/download/latest/netcoredbg-linux-master.tar.gz';
const downloadDir = 'debug';
const filename = 'netcoredbg-linux-master.tar.gz';
const downloadPath = path.join(packagePath, downloadDir);
const archivePath = path.join(downloadPath, filename);

function downloadNetCoreDBG() {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(archivePath)) {
            resolve();
            return;
        }
        if (!fs.existsSync(downloadPath)) {
            fs.mkdirSync(downloadPath);
        }
        const file = fs.createWriteStream(archivePath);
        const downloadWithRedirect = url => {
            /** @type { any } */
            const h = url.toString().startsWith('https') ? https : http;
            h.get(url, response => {
                const statusCode = response.statusCode;
                const redirectLocation = response.headers.location;
                if (statusCode >= 300 && statusCode < 400 && redirectLocation) {
                    console.log('Redirect location: ' + redirectLocation);
                    downloadWithRedirect(redirectLocation);
                } else if (statusCode === 200) {
                    response.on('end', () => resolve());
                    response.on('error', e => {
                        file.destroy();
                        reject(e);
                    });
                    response.pipe(file);
                } else {
                    file.destroy();
                    reject(new Error(`Failed to download omnisharp-roslyn with code: ${statusCode}`));
                }
            })

        };
        downloadWithRedirect(downloadUrl);
    });
}

function decompressArchive (archivePath, targetPath) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(archivePath)) {
            reject(new Error(`The archive was not found at ${archivePath}.`));
            return;
        }
        if (!fs.existsSync(targetPath)) {
            mkdirp.sync(targetPath);
        }
        const gunzip = zlib.createGunzip({ finishFlush: zlib.Z_SYNC_FLUSH, flush: zlib.Z_SYNC_FLUSH });
        console.log(`Decompressing the archive to ${targetPath}.`);
        const untar = tar.x({ cwd: targetPath });
        fs.createReadStream(archivePath).pipe(gunzip).pipe(untar)
            .on('error', e => reject(e))
            .on('end', () => resolve(
                removeArchive(archivePath)
            ));
    });
}

function removeArchive(archivePath) {
    console.log(`Removing the archive ${archivePath}.`);
    fs.unlinkSync(archivePath);
}

downloadNetCoreDBG().then(() => {
    decompressArchive(archivePath, downloadPath)
}).
catch(error => {
    console.error(error);
});
