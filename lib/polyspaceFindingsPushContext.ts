// Copyright 2023 The MathWorks, Inc.

import * as github from '@actions/github';
import { InputPolyspaceFindingsOptions, PolyspaceFindingsValues} from './options';
import { matchedResults } from './matchedResults';
import { logDebug, logSetFailed } from './log';

async function annotateCommit(findingsOptions: InputPolyspaceFindingsOptions, findingsValues: PolyspaceFindingsValues, commitSha: string) {
    const octokit = github.getOctokit(findingsOptions.GitHubToken);
    const getReq = await octokit.request('GET /repos/{owner}/{repo}/commits/{commit_sha}', {
        ...github.context.repo,
        commit_sha: commitSha,
        mediaType: {
            format: 'diff',
        },
    });

    if (getReq.status === 200) {
        const matches = matchedResults(findingsValues.NonJustifiedResults, getReq.data);
        
        let notShownAbove = '';
        if (findingsValues.NonJustifiedResults.length - matches.length > 0){
            notShownAbove =`, ${findingsValues.NonJustifiedResults.length - matches.length} of which are not shown above`;
        }
        const finding_s = findingsValues.NonJustifiedResults.length == 1 ? 'finding' : 'findings'; 
        
        await octokit.rest.repos.createCommitComment({
            ...github.context.repo,
            commit_sha: commitSha,
            body: `Found ${findingsValues.NonJustifiedResults.length} ${finding_s} in total${notShownAbove}. ${findingsValues.getFormatedAccessString()}`,
        });

        for (const match of matches) {
            await octokit.rest.repos.createCommitComment({
                ...github.context.repo,
                commit_sha: commitSha,
                body: match.messageText,
                path: match.relativeFileName,
                position: match.position,
            });
        }
    }
    else{
        throw new Error('Unable to fetch commit information via REST API');
    }
}

export async function polyspaceFindingsPushContext(findingsOptions : InputPolyspaceFindingsOptions, findingsValues: PolyspaceFindingsValues) {
    if(findingsOptions.SetCommitStatus && !findingsOptions.CommentCommitFindings){
        logSetFailed('Action has no effect when set-commit-status and comment-commit-findings inputs are both set to false.');
    }

    // Create a new Octokit instance
    const octokit = github.getOctokit(findingsOptions.GitHubToken);

    // Get the current commit SHA
    const commitSha = github.context.sha;
    const unjustifiedFindings = findingsValues.NonJustifiedResults.length !== 0;
    const state = unjustifiedFindings ? 'failure' : 'success';

    logDebug(`${unjustifiedFindings} not marked as "justified" in SARIF file`);
    //If Access is not available point to the current commit
    let targetUrl = findingsValues.getAccessString();
    
    if (targetUrl === '') {
        targetUrl = `${github.context.serverUrl}/${github.context.repo.owner}/${github.context.repo.repo}/commit/${commitSha}`;
    }

    // Update the commit status with the number of results
    const finding_s = findingsValues.NonJustifiedResults.length == 1 ? 'finding' : 'findings';

    if (findingsOptions.SetCommitStatus) {
        await octokit.rest.repos.createCommitStatus({
            ...github.context.repo,
            sha: commitSha,
            state: state,
            description: `${findingsValues.NonJustifiedResults.length} ${finding_s} found.`,
            context: 'Polyspace Findings',
            target_url: targetUrl,
        });
    }

    if (findingsOptions.CommentCommitFindings && unjustifiedFindings) {
        //Calculate comments for specific positions in diff
        await annotateCommit(findingsOptions, findingsValues, commitSha);
    }
}