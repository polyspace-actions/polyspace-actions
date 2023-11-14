// Copyright 2023 The MathWorks, Inc.

import { getOptionPair, InputAccessOptions } from './options';

export function prepareAccessConnectionOptions(accessOptions: InputAccessOptions) {
    const uploadOptions: string[] = [];
    uploadOptions.push(...getOptionPair('-host', accessOptions.Host));
    uploadOptions.push(...getOptionPair('-api-key', accessOptions.ApiKey));
    uploadOptions.push(...getOptionPair('-protocol', accessOptions.Protocol));

    if (accessOptions.Port) {
        uploadOptions.push(...getOptionPair('-port', accessOptions.Port.toString()));
    }

    return uploadOptions;
}
