// Copyright 2023 The MathWorks, Inc.

import { getPushReducedAnalysis } from './GitHubOptions';
import { fetchAndWriteGitDiffToFile } from './fetchAndWriteDiffToFile';
import { integrationAnalysis } from './integrationAnalysis';
import { logDebug } from './log';
import { InputFilteringOptions }  from './options';
import { writeEmptySarifToFile }  from './writeEmptySarifToFile';

export async function pushScopeAnalysis(options: InputFilteringOptions){
    if(!options.GitHubToken){
        throw new Error('No github-token found. Fetching modified files in the context of this pull request requires a github-token.');
    }
    
    if(getPushReducedAnalysis() && options.GitHubToken){
        logDebug('push-reduced-analysis input set to true and pull-request-number found. \
        Running analysis only on filtered set of modified files.');

        //Handle empty files
        const sourcesFile = await fetchAndWriteGitDiffToFile(options.GitHubToken, options.getExtensions());
        if (sourcesFile) {
            integrationAnalysis(sourcesFile);
        } else {
            // eslint-disable-next-line no-console
            console.log('push-reduced-analysis input set to true. No files to analyze after applying allow list filter. Stopping analysis.');
            writeEmptySarifToFile();
        }
    } else {
        integrationAnalysis(undefined);
    }
}