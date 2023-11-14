// Copyright 2023 The MathWorks, Inc.

import { logDebug } from './log';
import { ConfigureOptions, getOptionPair, InputAnalysisOptions } from './options';

// Prepare the configure command line. Returns an empty list if no configuration could be found.
export function prepareConfigureOptions(inputOptions: InputAnalysisOptions) {
    const configureOptions: string[] = [];

    const standardOpts = [ConfigureOptions.OUTPUT_OPTIONS_FILE,
        ConfigureOptions.DEFAULT_PS_OPTS,
        ConfigureOptions.ALLOW_OVERWRITE,
    ];

    if (inputOptions.ConfigureExtraOptions) {
        standardOpts.push(...inputOptions.ConfigureExtraOptions);
    }

    // Append options file with sources to analyze if available
    standardOpts.push(...getOptionPair(ConfigureOptions.OPTIONS_FILE, inputOptions.SourcesFile)
    );

    // Make sure not more than one strategy is chosen
    if (inputOptions.CompilationDatabase && inputOptions.BuildCommand.length > 0) {
        throw new Error('Action inputs "compilation-database-file" and "build-command" both set at the same time. Specify only one input or the other.');
    }

    // No configure strategy is set.
    if (!inputOptions.CompilationDatabase && inputOptions.BuildCommand.length === 0) {
        logDebug('Neither configuration inputs "compilation-database-file" or "build-command" are set. Skipping configuration step and running analysis using "options-file" input.');
        return [];
    }

    // Try strategies using ccdbs first
    if (inputOptions.CompilationDatabase) {
        const CompilationDatabaseOption = getOptionPair(
            ConfigureOptions.COMPILATION_DATABASE,
            inputOptions.CompilationDatabase,
        );

        configureOptions.push(...CompilationDatabaseOption);

        // Extra configure options will always trigger a run of configure
        configureOptions.push(...standardOpts);
    } else { // only build command
        // Extra configure options will always trigger a run of configure
        configureOptions.push(...standardOpts);
        configureOptions.push(...inputOptions.BuildCommand);
    }

    logDebug(`Configuration options ${configureOptions.join(',')}`);
    return configureOptions;
}
