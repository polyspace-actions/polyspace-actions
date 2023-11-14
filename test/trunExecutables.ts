// Copyright 2023 The MathWorks, Inc.

import { expect } from 'chai';
import  { runExecutables } from '../lib/runExecutables';
import { Command } from '../lib/Command';
import { getCwd } from '../lib/getCwd';

describe('runExecutables', () => {
    it('Single git status command for testing', async () => {
        const val = await runExecutables(undefined, [new Command('git', ['status'])], getCwd(), false);
        expect(val).to.have.lengthOf(1);
    });

    it('Run example command with two tokens', async () => {
        const val = await runExecutables(undefined, [new Command('git', ['status', '--porcelain'])], getCwd(), false);
        expect(val).to.have.lengthOf(1);
    });

    it('Run two commands', async () => {
        const val = await runExecutables(undefined, [new Command('git', ['status']), new Command('git', ['status'])], getCwd(), false);
        expect(val).to.have.lengthOf(2);
    });

    it('run non existing command', async () => {
        const val = await runExecutables(undefined, [new Command('gitNonExisting', ['status'])], getCwd(), false);
        expect(val).to.have.lengthOf(0);
    });
});
