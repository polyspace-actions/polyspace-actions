// Copyright 2023 The MathWorks, Inc.

import { Command } from './Command';
import { InputAnalysisOptions } from './options';
import { prepareConfigureOptions } from './prepareConfigureOptions';
import { prepareAnalysisOptions } from './prepareAnalysisOptions';

// Common functionality for configuring and running an analysis.
export function autoAnalysisCommands(analysisBinary : string, inputOptions : InputAnalysisOptions): Command[] {
    let commands : Command[] = [];

    const configureOptions = prepareConfigureOptions(inputOptions);

    const configureRunNeeded = configureOptions.length !== 0;
    const analyzeOptions = prepareAnalysisOptions(inputOptions, configureRunNeeded);

    if (configureRunNeeded) {
        commands.push(new Command('polyspace-configure', configureOptions));
    }

    // In the worst case we let a default analysis run
    commands = commands.concat(new Command(analysisBinary, analyzeOptions));

    return commands;
}
