// Copyright 2023 The MathWorks, Inc.

// A command is an ensemble of an executable and an array of strings containing the options
export class Command {
    binary: string;
    options: string[] = [];

    constructor(binary : string, tokens: string[]) {
        this.binary = binary;
        this.options = this.options.concat(tokens);
    }

    // Debugging convenience function
    toStringArray(): string[] {
        return ['executable: ', this.binary, ' with options: ', this.options.join(' ')];
    }
}

export function debugPrintCommandArray(commands: Command[]): string {
    let dbg = '';

    if (!commands) {
        return dbg;
    }
    let cmdArray : string[] = [];
    commands.forEach((command) => {
        cmdArray = cmdArray.concat(command.toStringArray().join(''));
    });
    dbg = cmdArray.join('\n');

    return dbg;
}
