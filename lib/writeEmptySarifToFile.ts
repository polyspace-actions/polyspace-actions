import { logDebug } from './log';
import { getActionInputResultsExportOptions } from './GitHubOptions';
import { getTargetVersion } from './isPolyspaceCallableAndRightVersion';
import { getCwd } from './getCwd';
import fs from 'fs';
import path from 'path';


const empty_sarif =
`{\
  "$schema" : "https://docs.oasis-open.org/sarif/sarif/v2.1.0/cos02/schemas/sarif-schema-2.1.0.json",\
  "version" : "2.1.0",\
  "runs" : [ {\
    "tool" : {\
    "driver" : {\
        "name" : "Bug Finder",\
        "fullName" : "Polyspace Bug Finder Server",\
        "semanticVersion" : "${getTargetVersion()}",\
        "organization" : "MathWorks",\
        "rules" : [ ]\
      }\
    },\
    "artifacts" : [ ],\
    "results" : [ ]\
  } ]\
}`;

export function writeEmptySarifToFile(){
    const resultsExportOptions = getActionInputResultsExportOptions();
    const sarifPath = path.join(getCwd(),resultsExportOptions.SarifOutputFile);
    logDebug(`Writing SARIF file containing no findings to ${sarifPath}`);
    fs.writeFileSync(sarifPath, empty_sarif);
}
