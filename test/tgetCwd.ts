// Copyright 2023 The MathWorks, Inc.

import { expect } from 'chai';
import fs from 'node:fs';
const rewire = require('rewire');

const rewiredModule = rewire('../lib/getCwd.ts');


after(async () => {
    fs.rmdirSync('not_existing');
    fs.rmdirSync('not_existing2/folder2');
});

describe('getCwd', () => {
    it('create non existing directory', () => {
        const val = rewiredModule.__get__('getCwdFun')('not_existing');
        expect(fs.existsSync(val)).to.equal(true);
    });
    it('create non existing directory', () => {
        const val = rewiredModule.__get__('getCwdFun')('not_existing2/folder2');
        expect(fs.existsSync(val)).to.equal(true);
    });
});
