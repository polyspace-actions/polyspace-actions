// Copyright 2023 The MathWorks, Inc.

import * as github from '@actions/github';
import { InputPolyspaceFindingsOptions, PolyspaceFindingsValues} from './options';
import { matchedResults } from './matchedResults';
import { logSetFailed } from './log';

interface Comment {
    /** @description The relative path to the file that necessitates a review comment. */
    path: string;
    /** @description The position in the diff where you want to add a review comment. Note this value is not the same as the line number in the file. For help finding the position value, read the note below. */
    position?: number;
    /** @description Text of the review comment. */
    body: string;
    /** @example 28 */
    line?: number;
    /** @example RIGHT */
    side?: string;
    /** @example 26 */
    start_line?: number;
    /** @example LEFT */
    start_side?: string;
}

async function getPullRequestAnnotations(findingsOptions: InputPolyspaceFindingsOptions, findingsValues: PolyspaceFindingsValues ) : Promise<Comment[]|undefined> {
    const comments : Comment[] = [];
    const octokit = github.getOctokit(findingsOptions.GitHubToken);

    const getReq = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pr_number}', {
        ...github.context.repo,
        pr_number: findingsOptions.PullRequestNumber,
        mediaType: {
            format: 'diff',
        },
    });

    if (getReq.status === 200) {
        const matches = matchedResults(findingsValues.NonJustifiedResults, getReq.data);

        matches.forEach(match => {
            comments.push({body:match.messageText, position: match.position, path:match.relativeFileName});
        });
        return comments;
    }
    else{
        logSetFailed(`REST API request to get pull request diff failed with code ${getReq.status}. No annotations added.`);
    }
}

export async function polyspaceFindingsPullRequestContext(findingsOptions: InputPolyspaceFindingsOptions, findingsValues: PolyspaceFindingsValues) {
    if(!findingsOptions.PullRequestNumber){
        throw new Error('pull-request-number is undefined. Unable to run polyspace-findings in pull request context.');
    }

    // Create a new Octokit instance
    const octokit = github.getOctokit(findingsOptions.GitHubToken);

    let comments : Comment[] | undefined;
    if (findingsOptions.CommentPullRequestFindings) {
        comments = await getPullRequestAnnotations(findingsOptions, findingsValues);
    }

    const finding_s = findingsValues.NonJustifiedResults.length == 1 ? 'finding' : 'findings';

    await octokit.rest.pulls.createReview({
        ...github.context.repo,
        pull_number: findingsOptions.PullRequestNumber,
        body : `Found ${findingsValues.NonJustifiedResults.length} ${finding_s} in total. ${findingsValues.getFormatedAccessString()}`,
        event: findingsOptions.ReviewStatus,
        comments: comments
    });
}