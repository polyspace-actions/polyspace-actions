// Copyright 2023 The MathWorks, Inc.

import { fetchAndWritePRDiffToFile } from './fetchAndWriteDiffToFile';
import { integrationAnalysis } from './integrationAnalysis';
import { InputFilteringOptions, InputPullRequestContextOptions }  from './options';
import { writeEmptySarifToFile }  from './writeEmptySarifToFile';

export async function reviewAnalysis(filteringOptions: InputFilteringOptions, options: InputPullRequestContextOptions) {
    if (!filteringOptions.GitHubToken){
        throw new Error('No github-token found. Fetching modified files in the context of this pull request requires a github-token.');
    }
    if(!options.PullRequestNumber){
        throw new Error('No pull-request-number found. Fetching modified files in the context of this pull request requires a pull request number.');
    }

    //Handle empty files
    const sourcesFile = await fetchAndWritePRDiffToFile(filteringOptions.GitHubToken, options.PullRequestNumber, filteringOptions.getExtensions());
    if (sourcesFile) {
        integrationAnalysis(sourcesFile);
    }
    else{
        // eslint-disable-next-line no-console
        console.log('No files to analyze after applying allow list filter. Stopping analysis.');
        writeEmptySarifToFile();
    }
}