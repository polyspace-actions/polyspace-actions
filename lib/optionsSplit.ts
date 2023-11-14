// Copyright 2023 The MathWorks, Inc.

import { parseArgsStringToArgv } from 'string-argv';

// Split command line options to a string array
export function optionsSplit(options: string | undefined): string[] {
    if (options) {
        return parseArgsStringToArgv(options);
    }
    return [];
}
