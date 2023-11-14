// Copyright 2023 The MathWorks, Inc.

import { getInputPolyspaceFindingsOptions } from './GitHubOptions';
import { getCwd } from './getCwd';
import { searchFilefolder } from './searchFilefolder';
import { sarifParser } from './sarifParser';
import { polyspaceFindingsPushContext } from './polyspaceFindingsPushContext';
import { polyspaceFindingsPullRequestContext } from './polyspaceFindingsPullRequestContext';
import { logDebug, logSetFailed } from './log';

export async function polyspaceFindings() {
    const polyspaceFindingsOptions = getInputPolyspaceFindingsOptions();

    const findings = sarifParser(searchFilefolder(polyspaceFindingsOptions.SarifFile, getCwd()));

    if(findings.NonJustifiedResults.length === 0){
        logDebug('No results found in SARIF file.');
    }

    if(polyspaceFindingsOptions.IsPullRequestContext){
        logDebug('Running polyspace-findings action for pull request context.');
        polyspaceFindingsPullRequestContext(polyspaceFindingsOptions, findings);
    }
    else {
        logDebug('Running polyspace-findings action for push context.');
        polyspaceFindingsPushContext(polyspaceFindingsOptions, findings);
    }
}

try{
    polyspaceFindings();
}
catch(error){
    logSetFailed(`Annotation of findings failed. ${error}`);
}
