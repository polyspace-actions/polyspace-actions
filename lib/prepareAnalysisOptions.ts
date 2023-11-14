// Copyright 2023 The MathWorks, Inc.

import { logDebug } from './log';
import {
    getFileOptionPair,
    getOptionPair,
    ConfigureOptions,
    AnalysisOptions,
    InputAnalysisOptions,
} from './options';

// Prepare the configure command line. Returns an empty list if no configuration could be found.
export function prepareAnalysisOptions(inputOptions: InputAnalysisOptions, configureRun: boolean) {
    const analysisOptions: string[] = [];

    const customOptionsFileCmd = getFileOptionPair(
        AnalysisOptions.OPTIONS_FILE,
        inputOptions.OptionsFile,
    );

    // Here we only use the options file as our configuration
    if (configureRun) {
        analysisOptions.push(...getOptionPair(
            AnalysisOptions.OPTIONS_FILE,
            ConfigureOptions.DEFAULT_PS_OPTS,
        ));
        analysisOptions.push(...customOptionsFileCmd);
    } else {
        analysisOptions.push(...customOptionsFileCmd);
        if (!inputOptions.BugFinderExtraOptions && !analysisOptions) {
            logDebug('Warning: No valid polyspace-configure options or Bug Finder analysis options found. Running analysis in default mode.');
        }
    }

    analysisOptions.push(...getFileOptionPair(
        AnalysisOptions.CHECKERS_FILE,
        inputOptions.CheckersFile,
    ));

    analysisOptions.push(...getOptionPair(
        AnalysisOptions.RESULTS_DIR,
        inputOptions.ResultsDirectory,
    ));
  
    if (inputOptions.BugFinderExtraOptions) {
        analysisOptions.push(...inputOptions.BugFinderExtraOptions);
    }

    logDebug(`Analysis options ${analysisOptions}`);
    return analysisOptions;
}
