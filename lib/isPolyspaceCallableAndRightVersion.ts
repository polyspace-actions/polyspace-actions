// Copyright 2023-2024 The MathWorks, Inc.

import { spawnProcess } from './spawnProcess';
import { getCwd } from './getCwd';

export function getTargetVersion() {
    return 'R2024a';
}

// and matches its output to get the current polyspace version
// Takes the output of a run of polyspace-configure -h
function matchConfigureStringVersion(configureString: string) : string | undefined {
    const regex = /polyspace-configure \((R\d{4}[ab]).*\)/;
    let versionString: string | undefined;

    if (configureString) {
        const out = regex.exec(configureString);

        if (out && out.length === 2) {
            // eslint-disable-next-line prefer-destructuring
            versionString = out[1].toString();
        }
    }

    return versionString;
}

async function getPolyspaceConfigureOutputString(installationFolder: string, args: string[] = ['-h']) : Promise<string | undefined>
{
    // Try and call polyspace-configure
    let prc: string | undefined;
    try {
        const prcResult = await spawnProcess('polyspace-configure', installationFolder, getCwd(), args, false);
        if (typeof(prcResult) == 'string') {
            prc = prcResult;
        }
    } catch(err) {
        //Rejected with return value after program finished normally
        if (typeof(err) === 'number') {
            throw new Error(`Polyspace is callable but Process finished with Error code ${err}.`);
        } else {
            if (installationFolder) {
                throw new Error(`Polyspace not callable. Check that Polyspace executables are available in the folder specified with polyspace-installation-folder: ${installationFolder}`);
            }
            throw new Error('Polyspace not callable. Check that the path to the Polyspace executables is part of the PATH environment variable.');
        }
    }
    return prc;
}

// Checks the status of polyspace before an action is run
// We want polyspace to be callable and have the right version.
// If there is a failure this function will throw.
export async function isPolyspaceCallableAndRightVersion(installationFolder: string) {
    const prc = await getPolyspaceConfigureOutputString(installationFolder);
    let version : string | undefined;
    if (prc) {
        version = matchConfigureStringVersion(prc);
    }
    if (!version) { // Stdout of polyspace-configure -h is empty or too old for version string.
        throw new Error(`Polyspace version could not be found. Expected version ${getTargetVersion()}`);
    } else if (version !== getTargetVersion()) {
        throw new Error(`Polyspace version ${version} not compatible with chosen Polyspace Actions. Expected Polyspace version ${getTargetVersion()}.`);
    }
}
