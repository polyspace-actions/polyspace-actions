// Copyright 2023 The MathWorks, Inc.

import { expect } from 'chai';
const rewire = require('rewire');

const rewiredModule = rewire('../lib/runIdAccessLogParser.ts');

describe('optionsSplit', () => {
    it('split the make command', () => {
        const ver = rewiredModule.__get__('matchAccessLogString')('2023-Nov-09 10:39:14.229402 Upload successful for RUN_ID 15001 and PROJECT_ID 4547');
        expect(ver).equals('15001');
    });
});
