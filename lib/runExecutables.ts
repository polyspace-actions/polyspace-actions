// Copyright 2023 The MathWorks, Inc.

import { spawnProcess } from './spawnProcess';
import { getCwd } from './getCwd';
import { logSetFailed } from './log';
import { Command, debugPrintCommandArray } from './Command';

// Takes a list of lists with [executable, command] entries.
export async function runExecutables(
    installFolder: string | undefined,
    executableCommandsTuple: Command[] = [],
    cwd = getCwd(),
    pipeOutput = true,
) {
    let successfulLaunches : string[] = [];
    try {
        // Loop through pairs of executables and commands
        for (const command of executableCommandsTuple) {
            if (command.options) {
                const prc = await spawnProcess(command.binary, installFolder, cwd, command.options, pipeOutput);
                if (typeof(prc) == 'string') {
                    successfulLaunches = successfulLaunches.concat(prc);
                }
            }
        }
    } catch (error) {
        logSetFailed(`${error} during execution of commands: ${debugPrintCommandArray(executableCommandsTuple)}`);
    }

    return successfulLaunches;
}
