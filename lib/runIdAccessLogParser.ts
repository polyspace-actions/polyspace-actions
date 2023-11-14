// Copyright 2023 The MathWorks, Inc.

import fs from 'node:fs';
import { searchFilefolder } from './searchFilefolder';
import { getCwd } from './getCwd';
import { logDebug } from './log';

// Set the file path and regex pattern

const regexPattern = /Upload successful for RUN_ID (\d+)/;

function matchAccessLogString(data: string) {
    // Check for matches using the regex pattern
    const regexMatches = data.match(regexPattern);
    if (regexMatches !== null) {
        return regexMatches[1];
    }
    throw new Error('Unable to interprete Polyspace Access log file to calculate run id.');
}

// Parse a file for the run id that was uploaded to access
export function runIdAccessLogParser(filename: string) {
    const fullpath = searchFilefolder(filename, getCwd());

    // Read the file contents using the fs module
    const data = fs.readFileSync(fullpath, { encoding: 'utf8', flag: 'r' });
    logDebug(`Analyzing Polyspace Access log file ${fullpath} with content: ${data}`);
    const runId = matchAccessLogString(data);
    logDebug(`Found run id ${runId}`);
    return runId;
}
