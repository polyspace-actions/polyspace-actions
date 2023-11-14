// Copyright 2023 The MathWorks, Inc.

import fs from 'node:fs';
import url from 'node:url';
import { searchFilefolder } from './searchFilefolder';
import { getCwd } from './getCwd';
import { optionsSplit } from './optionsSplit';

// Helper class taking an input option and a filename.
// Returns the option tokens if the file path exists
// Returns an empty array if file can't be found to avoid invalid options
export function getFileOptionPair(option: string | undefined, filepath: string | undefined) {
    if (option && filepath) {
        const filePathDef = searchFilefolder(filepath, getCwd());
        if (filePathDef) {
            return [option, filePathDef];
        }
    }

    return [];
}

// Helper class taking an input option and a value.
// Returns the option tokens for the value
// Returns an empty array if file can't be found to avoid invalid options
export function getOptionPair(option: string | undefined, val: string | undefined): string[] {
    if (option && val) {
        return [option, val];
    }

    return [];
}

// Class to hold all analysis input options
export class InputAnalysisOptions {
    CompilationDatabase: string | undefined;
    BuildCommand: string[] = [];
    OptionsFile: string | undefined;
    ResultsDirectory: string | undefined;
    CheckersFile: string | undefined;
    SourcesFile: string | undefined;
    ConfigureExtraOptions: string[] = [];
    BugFinderExtraOptions: string[] = [];

    constructor(
        CompilationDatabase: string | undefined,
        BuildCommand: string | undefined,
        OptionsFile: string | undefined,
        ResultsDirectory: string | undefined,
        CheckersFile: string | undefined,
        SourcesFile: string | undefined,
        ConfigureExtraOptions: string | undefined,
        BugFinderExtraOptions: string | undefined,
    ) {
        if (CompilationDatabase) {
            this.CompilationDatabase = searchFilefolder(CompilationDatabase, getCwd());
            if (!fs.existsSync(this.CompilationDatabase)) {
                throw new Error(`compilation-database-file ${CompilationDatabase} not found.`);
            }
        } else {
            // are all the else needed to leave the 'undefined'?
            this.CompilationDatabase = CompilationDatabase;
        }

        this.BuildCommand = optionsSplit(BuildCommand);

        if (OptionsFile) {
            this.OptionsFile = searchFilefolder(OptionsFile, getCwd());
            if (!fs.existsSync(this.OptionsFile)) {
                throw new Error(`options-file ${OptionsFile} not found.`);
            }
        } else {
            this.OptionsFile = OptionsFile;
        }
        this.ResultsDirectory = ResultsDirectory;

        if (CheckersFile) {
            this.CheckersFile = searchFilefolder(CheckersFile, getCwd());
            if (!fs.existsSync(this.CheckersFile)) {
                throw new Error(`checkers-file ${CheckersFile} not found.`);
            }
        } else {
            this.CheckersFile = CheckersFile;
        }

        this.SourcesFile = SourcesFile;

        this.ConfigureExtraOptions = optionsSplit(ConfigureExtraOptions);
        this.BugFinderExtraOptions = optionsSplit(BugFinderExtraOptions);
    }
}

// Class to hold all access input options
export class InputAccessOptions {
    ResultsDirectory: string | undefined;
    Host: string | undefined;
    ApiKey: string | undefined;
    Protocol: string | undefined;
    Port: number | undefined;
    ProjectName: string | undefined;
    ParentProject: string | undefined;
    AccessExtraOptions: string[] = [];

    constructor(
        ResultsDirectory: string | undefined,
        Host: string | undefined,
        ApiKey: string | undefined,
        Protocol: string | undefined,
        Port: number | undefined,
        ProjectName: string | undefined,
        ParentProject: string | undefined,
        AccessExtraOptions: string | undefined,
    ) {
        this.Host = Host;
        this.ApiKey = ApiKey;

        if (this.ApiKey && !this.Host) {
            throw new Error('Unable to configure Polyspace Access. Configuration contains api-key but no host.');
        } else if (!this.ApiKey && this.Host) {
            throw new Error('Unable to configure Polyspace Access. Configuration contains host but no api-key.');
        }

        // Ignore "ProjectName" input. It can be set for non Access specific configuration.
        // eslint-disable-next-line prefer-rest-params
        const extraArgs = [Protocol, Port, ProjectName, ParentProject, AccessExtraOptions];
        const noAdditionalOptions = extraArgs.every((entry) => entry === undefined || entry === '');
        if (!this.isMinimalConfiguration() && !noAdditionalOptions) {
            throw new Error('Unable to configure Polyspace Access. Configuration is missing host and api-key.');
        }

        this.Protocol = Protocol;
        this.Port = Port;
        this.ResultsDirectory = ResultsDirectory;
        this.ProjectName = ProjectName;
        this.ParentProject = ParentProject;
        this.AccessExtraOptions = optionsSplit(AccessExtraOptions);
    }

    isMinimalConfiguration() {
        return this.Host && this.ApiKey;
    }
}

// Class to hold all access input options
export class InputResultsExportOptions {
    ResultsDirectory: string | undefined;
    SarifOutputFile: string;

    constructor(
        ResultsDirectory: string | undefined,
        SarifOutputFile: string
    ) {
        this.ResultsDirectory = ResultsDirectory;
        this.SarifOutputFile = SarifOutputFile;
    }
}

export class InputFilteringOptions {
    GitHubToken: string | undefined;
    SourceFileAllowlist: string | undefined;

    constructor(
        GitHubToken: string | undefined,
        SourceFileAllowlist: string | undefined
    ) {
        this.GitHubToken = GitHubToken;
        this.SourceFileAllowlist = SourceFileAllowlist;
    }

    public getExtensions() : string[] {
        let extensions: string[] = [];
        if (this.SourceFileAllowlist) {
            extensions = this.SourceFileAllowlist.split(',');
        }
        return extensions;
    }
}

function getPullRequestNumber(PullRequestNumber: string | undefined): number | undefined {
    if (PullRequestNumber) {
        const prNumber = parseInt(PullRequestNumber);
        if (!isNaN(prNumber)) {
            return prNumber;
        }
    }
    return undefined;
}

// Class to hold all access input options
export class InputPullRequestContextOptions {
    PullRequestReducedAnalysis: boolean;
    PullRequestNumber: number | undefined;

    constructor(
        PullRequestReducedAnalysis: boolean,
        PullRequestNumber: string | undefined
    ) {
        this.PullRequestReducedAnalysis = PullRequestReducedAnalysis;
        this.PullRequestNumber = getPullRequestNumber(PullRequestNumber);
    }
}

// Class to hold all access input options
export type reviewStatus = 'REQUEST_CHANGES' | 'COMMENT';
        
function isReviewStatus(str: string): str is reviewStatus {
    switch (str) {
        case 'COMMENT':
            return true;
        case 'REQUEST_CHANGES':
            return true;
    }
    return false;
}

export class InputPolyspaceFindingsOptions {
    SarifFile: string;
    GitHubToken: string;
    PullRequestNumber: number | undefined;
    IsPullRequestContext: boolean;
    SetCommitStatus: boolean;
    CommentCommitFindings : boolean;
    ReviewStatus : reviewStatus;
    CommentPullRequestFindings: boolean;

    constructor(
        SarifFile: string,
        GitHubToken : string,
        PullRequestNumber : string | undefined,
        SetCommitStatus: boolean,
        CommentCommitFindings: boolean,
        ReviewStatus: string,
        AnnotatePullRequestFindings: boolean
    ) {
        this.SarifFile = searchFilefolder(SarifFile, getCwd());
        if (!fs.existsSync(this.SarifFile)) {
            throw new Error(`sarif-file ${SarifFile} could not be found.`);
        }

        this.GitHubToken = GitHubToken;
        this.SetCommitStatus = SetCommitStatus;
        this.CommentCommitFindings = CommentCommitFindings;

        if (!isReviewStatus(ReviewStatus)) {
            throw new Error(`review-status value must be either 'COMMENT' or 'REQUEST_CHANGES'. Actual value is ${ReviewStatus}.`);
        }

        this.ReviewStatus = ReviewStatus;
        this.CommentPullRequestFindings = AnnotatePullRequestFindings;
        this.PullRequestNumber = getPullRequestNumber(PullRequestNumber);
        this.IsPullRequestContext = PullRequestNumber ? true : false;
    }
}

export interface CondensedLocation {
    uri: url.URL;
    startLine: number;
}

export interface CondensedResult {
    messageText: string;
    location: CondensedLocation;
    hostedViewerUri? : string;
    justified? : boolean;
}

//Result matched with git diff that contains only the relative location in the commit
export interface MatchedResult {
    messageText: string;
    relativeFileName: string;
    position: number;
}

export class PolyspaceFindingsValues {
    RawResults: CondensedResult[];
    NonJustifiedResults: CondensedResult[];
    AccessUrl: string|undefined;

    constructor(Results: CondensedResult[], AccessUrl: string | undefined) {
        this.RawResults = Results;
        this.NonJustifiedResults = Results.filter((e)=> e.justified !== true);
        this.AccessUrl = AccessUrl;
    }

    public getAccessString() : string {
        // there probably exists a more condensed notation, like:
        return this.AccessUrl || '';
    }

    public getFormatedAccessString() : string{
        if (this.NonJustifiedResults.length >= 0 && this.getAccessString() != '') {
            return `[Show in Polyspace Access.](${this.getAccessString()})`;
        }
        return '';
    }
}

export const ConfigureOptions = {
    OUTPUT_OPTIONS_FILE: '-output-options-file',
    DEFAULT_PS_OPTS: 'polyspace.opts',
    ALLOW_OVERWRITE: '-allow-overwrite',
    COMPILATION_DATABASE: '-compilation-database',
    SOURCES_OPTIONS_FILE: 'sources_to_include.opts',
    OPTIONS_FILE: '-options-file',
};

export const AnalysisOptions = {
    OPTIONS_FILE: '-options-file',
    ALLOW_OVERWRITE: '-allow-overwrite',
    RESULTS_DIR: '-results-dir',
    CHECKERS_FILE: '-checkers-activation-file',
};

export const AccessOptions = {
    RUN_ID: '-run-id',
    LOG_FILE: 'ps_access_log.txt',
};

export const ResultsExportOptions = {
    FORMAT: '-format',
    JSON_SARIF: 'json-sarif',
    RESULTS_DIR: '-results-dir',
    OUTPUT_NAME: '-output-name',
    SARIF_OPTIONS_MODIFIER: '-sarif-content-options',
    RESOLVE_URI: 'show-resolved-uri',
    FILL_ALL_MSG_TEXT: 'fill-all-message-text',
    SHOW_ACCESS_LINK: 'show-access-link',
};
