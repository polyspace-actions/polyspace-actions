// Copyright 2023 The MathWorks, Inc.

import * as core from '@actions/core';

import {
    InputAnalysisOptions,
    InputAccessOptions,
    InputResultsExportOptions,
    InputPullRequestContextOptions,
    InputPolyspaceFindingsOptions,
    InputFilteringOptions
} from './options';


export function getPushReducedAnalysis() : boolean {
    return core.getBooleanInput('push-reduced-analysis');
}

export function getActionInputAnalysisOptions(SourcesFile: string | undefined): InputAnalysisOptions {
    // Analysis Inputs
    const CompilationDatabase = core.getInput('compilation-database-file');
    const BuildCommand = core.getInput('build-command');
    const OptionsFile = core.getInput('options-file');
    const ResultsDirectory = core.getInput('results-dir');
    const CheckersFile = core.getInput('checkers-file');

    // Extra Options
    const ConfigureExtraOptions = core.getInput('configure-extra-options');
    const BugFinderExtraOptions = core.getInput('bugfinder-extra-options');

    return new InputAnalysisOptions(
        CompilationDatabase,
        BuildCommand,
        OptionsFile,
        ResultsDirectory,
        CheckersFile,
        SourcesFile,
        ConfigureExtraOptions,
        BugFinderExtraOptions,
    );
}

export function getActionInputAccessOptions(): InputAccessOptions {
    // Analysis Inputs
    const ResultsDirectory = core.getInput('results-dir');

    // Access Inputs
    const Host = core.getInput('host', { required: false });
    const ApiKey = core.getInput('api-key', { required: false });
    const Protocol = core.getInput('protocol');
    const PortString : string | undefined = core.getInput('port');
    let PortNumber : number | undefined;
    if (PortString) {
        PortNumber = parseInt(PortString, 10);
    }
    const ProjectName = core.getInput('project-name');
    const ParentProject = core.getInput('parent-project');

    // Extra Options
    const AccessExtraOptions = core.getInput('access-extra-options');

    return new InputAccessOptions(
        ResultsDirectory,
        Host,
        ApiKey,
        Protocol,
        PortNumber,
        ProjectName,
        ParentProject,
        AccessExtraOptions,
    );
}

export function getActionInputResultsExportOptions(): InputResultsExportOptions {
    // Analysis Inputs
    const ResultsDirectory = core.getInput('results-dir');

    // Access Inputs
    const SarifOutputFile = core.getInput('sarif-file',{ required: true });

    return new InputResultsExportOptions(
        ResultsDirectory,
        SarifOutputFile,
    );
}

export function getInputFilteringOptions(): InputFilteringOptions {
    const GitHubToken = core.getInput('github-token');
    const SourceFileAllowlist = core.getInput('source-file-allow-list');
    
    return new InputFilteringOptions(
        GitHubToken,
        SourceFileAllowlist
    );
}

export function getInputPullRequestContextOptions(): InputPullRequestContextOptions {
    const PullRequestReducedAnalysis: boolean = core.getBooleanInput('pull-request-reduced-analysis'); 
    const PullRequestNumber = core.getInput('pull-request-number');
    
    return new InputPullRequestContextOptions(
        PullRequestReducedAnalysis,
        PullRequestNumber,
    );
}

export function getInputPolyspaceFindingsOptions() : InputPolyspaceFindingsOptions {
    const SarifFile: string = core.getInput('sarif-file', { required: true });
    const GitHubToken: string = core.getInput('github-token', { required: true });
    
    const SetCommitStatus: boolean = core.getBooleanInput('set-commit-status', { required: false });
    const CommentCommitFindings: boolean = core.getBooleanInput('comment-commit-findings', { required: false });
    const ReviewStatus: string = core.getInput('review-status', { required: false });

    const PullRequestNumber: string = core.getInput('pull-request-number', { required: false });
    const CommentPullRequestFindings: boolean = core.getBooleanInput('comment-pull-request-findings', { required: false });

    return new InputPolyspaceFindingsOptions(SarifFile, GitHubToken, PullRequestNumber, SetCommitStatus, CommentCommitFindings, ReviewStatus, CommentPullRequestFindings); 
}