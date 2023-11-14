// Copyright 2023 The MathWorks, Inc.

import fs from 'node:fs';
import path from 'path';
import { logDebug } from './log';

export function searchFilefolder(filename: string, cwd: string): string {
    if (!filename) {
        return '';
    }

    let cwdRes = cwd;
    if (!cwdRes) {
        cwdRes = process.cwd();
    }

    let fullpath = filename;
    if (!path.isAbsolute(filename)) {
        fullpath = path.join(cwdRes, filename);
        logDebug(`Searching for ${filename} under path: ${fullpath}`);
    }

    if (fs.existsSync(fullpath)) {
        logDebug(`${filename} found.`);
        // eslint-disable-next-line consistent-return
        return path.resolve(fullpath);
    }

    logDebug(`${filename} not found.`);
    return '';
}
