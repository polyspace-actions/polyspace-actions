// Copyright 2023 The MathWorks, Inc.

import { spawn } from 'child_process';
import path from 'path';
import { getCwd } from './getCwd';
import { logDebug } from './log';

// Default for command line option is -h
// The installationFolder can also be empty, in which case we'll look on the path.
// Stdio io is piped to the current process when pipeOutput is set.
async function spawnProcessAsyncPrivate(executableName: string, installationFolder: string | undefined, _cwd: string = getCwd(), args: string[] = ['-h'], inheritOutput = true) {
    let program = executableName;
    if (installationFolder) {
        program = path.join(installationFolder, '/polyspace/bin/', executableName);
    }

    logDebug(`Starting executable: ${program} with options: ${args}`);

    const options: {
        cwd: string;
        stdio: 'pipe' | 'ignore' | 'inherit';
    } = {
        cwd: _cwd,
        stdio: 'pipe',
    };

    if (inheritOutput) {
        options.stdio = 'inherit';
    }

    return new Promise((resolve, reject) => {
        const child = spawn(program, args, options);
        let stdoutData = '';

        if (child.stdout !=  null) {
            child.stdout.on('data', (data) => {
                stdoutData += data.toString('utf-8');
                // Pipe stdout
                if (inheritOutput) {
                    process.stdout.write(data.toString('utf-8'));
                }
            });
        }

        if (child.stderr != null) {
            child.stderr.on('data', (data) => {
                // Pipe stderr
                if (inheritOutput) {
                    process.stderr.write(data.toString('utf-8'));
                }
            });
        }

        child.on('error', (error) => { 
            logDebug(error.toString());
            reject(error); });

        child.on('exit', (code) => {
            logDebug(`${program} exited with code : ${code}`);
            if (code === 0) {
                resolve(stdoutData);
            } else {
                reject(code);
            }
        });
    });
}

// Default for command line option is -h
// The installationFolder can also be empty, in which case we'll look on the path.
// Stdio io is piped to the current process when pipeOutput is set.
export async function spawnProcess(
    executableName: string,
    installationFolder: string | undefined,
    _cwd: string = getCwd(),
    args: string[] = ['-h'],
    inheritOutput = true)
{
    return spawnProcessAsyncPrivate(executableName, installationFolder, _cwd, args, inheritOutput);
}