// Copyright 2023 The MathWorks, Inc.

import { expect, assert } from 'chai';
import fs from 'node:fs/promises';
import { autoAnalysisCommands } from '../lib/autoAnalysisCommands';
import { InputAnalysisOptions } from '../lib/options';

const ccdb = 'ccdb.json';
const outOpts = 'out.opts';
after(async () => {
    fs.rm(ccdb);
    fs.rm(outOpts);
});

describe('auto analysis commands', () => {
    it('make command ', () => {
        const analysisOptions = new InputAnalysisOptions(undefined, 'make -j 4', undefined, undefined, undefined, undefined, undefined, undefined);
        const commands = autoAnalysisCommands('polyspace-bug-finder-server', analysisOptions);
        expect(commands, 'We expect a configure and a bug finder command.').to.have.lengthOf(2);
    });

    it('invalid configuration with build command and ccdb', async () => {
        const fh = await fs.open(ccdb, 'a');
        await fh.close();

        const fhout = await fs.open(outOpts, 'a');
        await fhout.close();

        const analysisOptions = new InputAnalysisOptions(ccdb, 'make -j 4', outOpts, undefined, undefined, undefined, undefined, undefined);
        expect(autoAnalysisCommands.bind(null, 'polyspace-bug-finder-server', analysisOptions), 'functino should throw because of invalid configuration.').to.throw();
    });

    it('No configuration given', () => {
        const analysisOptions = new InputAnalysisOptions(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
        expect(autoAnalysisCommands('polyspace-bug-finder-server', analysisOptions), 'No input should lead to only a bug finder run.').to.have.lengthOf(1);
    });

    it('Error On Non existing CCDB', () => {
        assert.throw(() => {
            const _ = new InputAnalysisOptions('non_existing_file', undefined, 'out.opts', undefined, undefined, undefined, undefined, undefined);
        });
    });
});
