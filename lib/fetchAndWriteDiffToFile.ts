// Copyright 2023 The MathWorks, Inc.

import path from 'path';
import parseDiff = require('parse-diff');
import { existsSync, writeFileSync } from 'fs';
import * as github from '@actions/github';
import { logDebug } from './log';
import { ConfigureOptions } from './options';
import { relativeWorkingDirectory } from './getCwd';

function filterNonExistentFiles(files: string[]) : string[]
{
    return files.filter(existsSync);
}

//An empty extensions filter will allow any file
function filterFileExtensions(files: string[], extensions: string[]) : string[]
{
    if (extensions.length === 0) {
        return files;
    }

    return files.filter((file: string) => {
        return extensions.includes(path.parse(file).ext);
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterGitOutput(diff: string[], extensions: string[]) : string[]
{
    return filterFileExtensions(filterNonExistentFiles(diff), extensions);
}

function generateIncludeSourcesFile(files: string[], optionsFile: string): string | undefined {

    if (files.length !== 0) {
        const content = files.map((file) => `-include-sources ${file}`).join('\n');
        writeFileSync(optionsFile, content);
        return path.resolve(optionsFile);
    }
    return undefined;
}

// Take a list of relative file paths (to git repo) and relativise them to the current working directory
// Remove files that are not under the current working directory
function filterFilesToWorkingDirectory(files: string[]): string[] {
    const relativeWorkingDir = relativeWorkingDirectory();
    
    if (!relativeWorkingDir) {
        return files;
    }

    return files.filter((file) => {
        return file.startsWith(relativeWorkingDir);
    });
}

function getRelativeFilesFromDiffString(diffString : string) : string[] {
    const diff = parseDiff(diffString);

    const files : string[] = [];
    diff.forEach(file => {
        if(file.to){
            files.push(file.to);
        }
    });
    return files;

}

export async function fetchAndWriteGitDiffToFile(GitHubToken: string, extensions: string[]) : Promise<string | undefined>
{
    // Create a new Octokit instance
    const octokit = github.getOctokit(GitHubToken);
  
    const response = await octokit.request('GET /repos/{owner}/{repo}/commits/{commit_sha}', {
        ...github.context.repo,
        commit_sha: github.context.sha,
        mediaType: {
            format: 'diff',
        },
    });
    
    if(response.status !==200)
    {
        throw new Error(`API request returned status code ${response.status}. Unable to access list of files impacted by this pull request.`);
    }

    const files = getRelativeFilesFromDiffString(response.data);
    logDebug(`Files in the commit:\n${files.join('\n')}`);

    const filteredRelativeFiles = filterFilesToWorkingDirectory(files);
    logDebug(`Files in the commit and in the working directory:\n${filteredRelativeFiles.join('\n')}`);
    
    const filteredFiles = filterGitOutput(files, extensions);
    logDebug(`Filtered files:\n${filteredFiles.join('\n')}`);

    return generateIncludeSourcesFile(filteredFiles, ConfigureOptions.SOURCES_OPTIONS_FILE);
}

export async function fetchAndWritePRDiffToFile(GitHubToken: string, PullRequestNumber: number, extensions: string[]) : Promise<string | undefined>
{
    // Create a new Octokit instance
    const octokit = github.getOctokit(GitHubToken);
  
    const response = await octokit.rest.pulls.listFiles({
        ...github.context.repo,
        pull_number: PullRequestNumber,
    });

    if(response.status !==200)
    {
        throw new Error(`API request returned status code ${response.status}. Unable to access list of files impacted by this pull request.`);
    }

    const files: string[] = response.data.map(entry => { return entry.filename });
  
    logDebug(`Files in pull request:\n${files.join('\n')}`);
    const filteredFiles = filterGitOutput(files, extensions);
    logDebug(`Filtered files:\n${filteredFiles.join('\n')}`);

    return generateIncludeSourcesFile(filteredFiles, ConfigureOptions.SOURCES_OPTIONS_FILE);
}