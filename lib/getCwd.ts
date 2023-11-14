// Copyright 2023 The MathWorks, Inc.

import fs from 'node:fs';
import { isAbsolute, relative } from 'path';
import * as core from '@actions/core';
import { logDebug } from './log';

// Provide a valid working directory from actions input or process cwd.
function getCwdFun(cwd: string | undefined) {
    if (cwd) {
        if (!fs.existsSync(cwd)) {
            fs.mkdirSync(cwd, { recursive: true });
            logDebug(`WorkingDirectory ${cwd} successfully created.`);
        }
    } else { // Set working directory
        cwd = process.cwd();
    }

    return cwd;
}

// Get the relative working directory to the GITHUB_WORKSPACE environment variable
// If the return value is undefined we can assume that we are at the root
export function relativeWorkingDirectory() : string | undefined {
    const cwd = getCwd();

    if (!cwd) {
        return undefined;
    }

    // We already have a relative path
    if (!isAbsolute(cwd)) {
        return cwd;
    }

    // The path is absolute and we want to make it relative to the github_workspace
    const workspace = process.env.GITHUB_WORKSPACE;

    // If GITHUB_WORKSPACE is not available there is no way to get the relative position to it
    if (!workspace) {
        return undefined;
    }
    
    const relativeWorkingDir = relative(workspace, cwd);
    if (relativeWorkingDir && !relativeWorkingDir.startsWith('..') && !isAbsolute(relativeWorkingDir)) {
        return relativeWorkingDir;
    } else {
        // This can be the case if an absolute path to a working directory is given
        // which is not under the GITHUB_WORKSPACE. This is technically possible but
        // should maybe even be considered an error
        logDebug(`Path ${cwd} is not a subfolder of GITHUB_WORKSPACE`);
        return undefined;
    }

}

// Provide a valid working directory from actions input or process cwd.
export function getCwd() : string {
    const cwd = core.getInput('working-directory');
    return getCwdFun(cwd);
}
