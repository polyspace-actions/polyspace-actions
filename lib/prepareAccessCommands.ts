// Copyright 2023 The MathWorks, Inc.

import { Command } from './Command';
import { getOptionPair, AccessOptions, InputAccessOptions } from './options';
import { prepareAccessConnectionOptions } from './prepareAccessConnectionOptions';

export function prepareAccessCommands(accessOptions: InputAccessOptions) : Command {
    const uploadOptions = prepareAccessConnectionOptions(accessOptions);

    uploadOptions.push(...getOptionPair('-upload', accessOptions.ResultsDirectory));
    uploadOptions.push(...getOptionPair('-project', accessOptions.ProjectName));
    uploadOptions.push(...getOptionPair('-parent-project', accessOptions.ParentProject));
    uploadOptions.push(...getOptionPair('-log', AccessOptions.LOG_FILE));

    if (accessOptions.AccessExtraOptions) {
        uploadOptions.push(...accessOptions.AccessExtraOptions);
    }

    return new Command('polyspace-access', uploadOptions);
}
