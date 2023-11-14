// Copyright 2023 The MathWorks, Inc.

import { logDebug, logSetFailed } from './log';
import { getInputFilteringOptions, getInputPullRequestContextOptions } from './GitHubOptions';
import { reviewAnalysis as pullRequestScopeAnalysis } from './pullRequestScopeAnalysis';
import { pushScopeAnalysis } from './pushScopeAnalysis';
async function polyspaceBugFinder() {
    const prOptions = getInputPullRequestContextOptions();
    const filteringOptions = getInputFilteringOptions();

    if(prOptions.PullRequestReducedAnalysis && prOptions.PullRequestNumber){
        logDebug('pull-request-reduced-analysis input set to true and pull-request-number found. \
Running analysis only on filtered set of modified files.');
        pullRequestScopeAnalysis(filteringOptions, getInputPullRequestContextOptions()); 
    } else {
        pushScopeAnalysis(filteringOptions);
    }
}

try {
    polyspaceBugFinder();
}
catch (error) {
    logSetFailed(`Polyspace Bug Finder analysis failed. ${error}`);
}