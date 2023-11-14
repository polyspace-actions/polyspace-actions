// Copyright 2023 The MathWorks, Inc.

import * as core from '@actions/core';

import { autoAnalysisCommands } from './autoAnalysisCommands';
import { prepareAccessCommands } from './prepareAccessCommands';
import { runExecutables } from './runExecutables';
import { logDebug } from './log';
import { isPolyspaceCallableAndRightVersion } from './isPolyspaceCallableAndRightVersion';
import { getActionInputAnalysisOptions, getActionInputAccessOptions, getActionInputResultsExportOptions } from './GitHubOptions';
import { prepareResultsExportCommands } from './prepareResultsExportCommands';
import { debugPrintCommandArray } from './Command';

export async function integrationAnalysis(sourcesFile: string | undefined) {
    // Analysis Inputs
    const installationFolder = core.getInput('polyspace-installation-folder');
    const analysisOptions = getActionInputAnalysisOptions(sourcesFile);
    const accessInputOptions = getActionInputAccessOptions();
    const resultsExportInputOptions = getActionInputResultsExportOptions();

    // Error out on release version mismatch or polyspace not callable
    await isPolyspaceCallableAndRightVersion(installationFolder);

    const AnalysisCommands = autoAnalysisCommands('polyspace-bug-finder-server', analysisOptions);
    logDebug(`Analysis commands: ${debugPrintCommandArray(AnalysisCommands)}`);

    let integrationAnalysisCommands = AnalysisCommands;

    // Polyspace access run is not mandatory.
    // If there are options check that the configuration is valid
    if (accessInputOptions.isMinimalConfiguration()) {
        const accessCommands = prepareAccessCommands(accessInputOptions);
        logDebug(`Access commands: ${debugPrintCommandArray([accessCommands])}`);
        integrationAnalysisCommands = integrationAnalysisCommands.concat(accessCommands);
    }

    const executed = await runExecutables(installationFolder, integrationAnalysisCommands);
    if (executed.length === integrationAnalysisCommands.length) {
        // Get Polyspace results export command either based of local or server results
        const resultsExportCommand = [
            prepareResultsExportCommands(resultsExportInputOptions, accessInputOptions),
        ];
        logDebug(`Results export commands: ${debugPrintCommandArray(resultsExportCommand)}`);
        await runExecutables(installationFolder, resultsExportCommand);
    }
}
