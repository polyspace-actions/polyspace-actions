// Copyright 2023 The MathWorks, Inc.

import * as fs from 'fs';

import {
    PolyspaceFindingsValues,
    CondensedResult,
    CondensedLocation
} from './options';

interface Properties {
    justified? : boolean;
}

interface Location {
    physicalLocation : {
        artifactLocation : {
            uri : string
        },
        region : {
            startLine : number,
        }
    }
}

interface Result {
    message: {
        text: string;
    }
    locations: Location[];
    properties?: Properties;
    hostedViewerUri? : string;
}

interface SarifRuns {
    runs: {
        results: Result[];
    }[];
}

export function extractURL(originalURL: string | undefined): string | undefined {
    if (!originalURL) {
        return undefined;
    }
  
    const accessUrl = new URL(originalURL);
    const params = new URLSearchParams(accessUrl.search);
    const baseURL = accessUrl.origin + accessUrl.pathname;
    const aParam = params.get('a');
    const pParam = params.get('p');
    const rParam = params.get('r');

    const newParams = new URLSearchParams();
  
    if (aParam) {
        newParams.set('a', aParam);
    }
    if (pParam) {
        newParams.set('p', pParam);
    }
    if (rParam) {
        newParams.set('r', rParam);
    }

    const newURL = new URL(baseURL);
    newURL.search = newParams.toString();

    return newURL.toString();
}

export function sarifParser(filePath: string): PolyspaceFindingsValues {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const sarifRuns: SarifRuns = JSON.parse(fileContent);

    const results: CondensedResult[] = [];
  
    for (const result of sarifRuns.runs[0].results) {
        const messageText = result.message.text;
        const justified = result.properties?.justified;

        const location: CondensedLocation = {
            uri: new URL(result.locations[0].physicalLocation.artifactLocation.uri),
            startLine: result.locations[0].physicalLocation.region.startLine,
        };
        const hostedViewerUri = result.hostedViewerUri;

        results.push({ messageText, location, hostedViewerUri, justified });
    }

    if (results.length === 0) {
        return new PolyspaceFindingsValues(results, undefined);
    }

    return new PolyspaceFindingsValues(results, extractURL(results[0].hostedViewerUri));
}