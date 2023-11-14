// Copyright 2023 The MathWorks, Inc.

import {
    getOptionPair,
    ResultsExportOptions,
    AccessOptions,
    InputResultsExportOptions,
    InputAccessOptions,
} from './options';
import { prepareAccessConnectionOptions } from './prepareAccessConnectionOptions';
import { runIdAccessLogParser } from './runIdAccessLogParser';
import { Command } from './Command';

// Prepare the configure command line. Returns an empty list if no configuration could be found.
export function prepareResultsExportCommands(exportInputOptions: InputResultsExportOptions, accessInputOptions: InputAccessOptions) {
    const resultsExportOptions: string[] = [];

    resultsExportOptions.push(...[
        ResultsExportOptions.SARIF_OPTIONS_MODIFIER,
        `${ResultsExportOptions.RESOLVE_URI},${ResultsExportOptions.FILL_ALL_MSG_TEXT},${ResultsExportOptions.SHOW_ACCESS_LINK}`
    ]);
  
    resultsExportOptions.push(...getOptionPair(
        ResultsExportOptions.FORMAT,
        ResultsExportOptions.JSON_SARIF,
    ));

    resultsExportOptions.push(...getOptionPair(
        ResultsExportOptions.OUTPUT_NAME,
        exportInputOptions.SarifOutputFile,
    ));

    // Take the results either from a local repository or from the server if it's configured
    if (accessInputOptions && accessInputOptions.isMinimalConfiguration()) {
        resultsExportOptions.push(...prepareAccessConnectionOptions(accessInputOptions));
        resultsExportOptions.push(...getOptionPair(
            AccessOptions.RUN_ID,
            runIdAccessLogParser(AccessOptions.LOG_FILE),
        ));
    } else {
        resultsExportOptions.push(...getOptionPair(
            ResultsExportOptions.RESULTS_DIR,
            exportInputOptions.ResultsDirectory,
        ));
    }

    const ResultsExportCommand = new Command('polyspace-results-export', resultsExportOptions);
    return ResultsExportCommand;
}
