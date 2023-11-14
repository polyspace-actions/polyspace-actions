// Copyright 2023 The MathWorks, Inc.

import parseDiff = require('parse-diff');
import { CondensedResult, MatchedResult } from './options';
import { execSync } from 'child_process';
import { logWarning } from './log';


// Hold the file string and provide an abstraction to find the right position
export class GitDiffFile {
    file: string;
    chunks: parseDiff.Chunk[] = [];

    constructor(file: string, chunks: parseDiff.Chunk[]) {
        this.file = file;
        this.chunks = chunks;
    }

    public getPosition(targetLine: number) : number | undefined {
        let position = 0;

        for (const chunk of this.chunks) {
            const index = chunk.changes.findIndex( function (change) {
                //We don't care about DeleteChanges because we won't have a finding for a deleted line
                return (change.type == 'add' && change.ln == targetLine) ||
                       (change.type == 'normal' && change.ln2 == targetLine);
            });
      
            if (index === -1) {
                // We add one to the length as GitHub interprets the next @@ hunk as a position as well
                // Even though we can't comment on it.
                position += chunk.changes.length + 1;
            } else {
                // Use index +1 because positions start from 1
                return position + index + 1;
            }
        }
    }
}


// We need a factory for the custom diffs because file can be empty
// but we can't null a constructor 
function reducedDiffFactory(diff: parseDiff.File[]) : GitDiffFile[]{
    const customGitDiffs: GitDiffFile[] = [];

    diff.forEach(file => {
        // Check if we can interprete the file or it's just not interesting
        if(!file.deleted && file.to){
            customGitDiffs.push(new GitDiffFile(file.to, file.chunks));
        }
    });
    return customGitDiffs;
}


function parseChangedFileString(diff: string) : GitDiffFile[]{
    const files = parseDiff(diff);
    return reducedDiffFactory(files);
}

// Will this work in every configuration?
function getAllFilesInGitRepo(): string[] {
    try {
        const output = execSync('git ls-tree -r HEAD --name-only', { encoding: 'utf-8' });
        const filePaths = output.trim().split('\n');
        return filePaths;
    } catch (error) {
        logWarning(`Error: ${error}. Cannot call git to retreive all files in repository.`);
        return [];
    }
}

function longestRepoFileMatch(result: CondensedResult, repoFiles: string[]) : string | undefined {
    // Match on filename first
    const pathName = result.location.uri.pathname;
    const relativeFileMatches : string[] = repoFiles.filter(el => pathName.endsWith(el));

    if (relativeFileMatches.length > 0) {
        return relativeFileMatches.reduce((prev, current) => (prev.length > current.length) ? prev : current);
    }
    return undefined;
}

// Returns a map with relative entries mapped to the CondensedResults
function getResultsToRelativePathMapping(results: CondensedResult[], repoFiles: string[]) : Map<string, CondensedResult[]> {
    const relativePathsToResults = new Map<string, CondensedResult[]>();

    // For each Results find the best matching relative path.
    // We assume the results correspond to the current repo
    results.forEach(result => {
        const longestMatch = longestRepoFileMatch(result, repoFiles);
        if (longestMatch !== undefined) {
            const entry = relativePathsToResults.get(longestMatch);
            if (entry) {
                relativePathsToResults.set(longestMatch, entry.concat(result));
            } else {
                relativePathsToResults.set(longestMatch, [result]);
            }
        }   
    });

    return relativePathsToResults;
}

function findMatches(results: CondensedResult[], chunks: GitDiffFile[]) : MatchedResult[]
{
    const comments : MatchedResult[] = [];

    let allRepoFiles = getAllFilesInGitRepo();
    if (allRepoFiles.length === 0) {
        logWarning('No git repository files found. Matching results only with files from diff. This might lead to false matches.');
        allRepoFiles = chunks.map(chunk => chunk.file);
    }
    
    const correspondanceMap = getResultsToRelativePathMapping(results, allRepoFiles);

    chunks.forEach(chunk => {
        const results : CondensedResult[] | undefined = correspondanceMap.get(chunk.file);
        if (results && results.length > 0) {
            results.forEach(res => {
                // Results can exist in the file but their position is not displayed
                const position : number | undefined = chunk.getPosition(res.location.startLine);
                if (position) {
                    comments.push({messageText: res.messageText, relativeFileName: chunk.file, position });
                }
            });
        }
    });

    return comments;
}

export function matchedResults(results: CondensedResult[], changedFileString: string) : MatchedResult[] {
    const displayedDiffs = parseChangedFileString(changedFileString);
    return findMatches(results, displayedDiffs);
}

