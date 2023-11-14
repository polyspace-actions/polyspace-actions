// Copyright 2023 The MathWorks, Inc.

import * as core from '@actions/core';

// Abstraction to facilitate support of other platforms
// Log to core.debugg
export function logDebug(log : string) {
    core.debug(log);
}

// Abstraction to facilitate support of other platforms
// Log to core.error
export function logSetFailed(log : string) {
    core.setFailed(log);
}

// Abstraction to facilitate support of other platforms
// Log to core.warnign
export function logWarning(log : string) {
    core.warning(log);
}