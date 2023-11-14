// Copyright 2023 The MathWorks, Inc.

import { expect } from 'chai';
import { InputAccessOptions, InputResultsExportOptions } from '../lib/options';
import { prepareResultsExportCommands } from '../lib/prepareResultsExportCommands';

describe('prepareResultsExportCommands', () => {
    it('Prepare a valid command', () => {
        const bin = new InputResultsExportOptions('resdir', 'filename');
        const access = new InputAccessOptions('resdir', undefined, undefined, undefined, undefined, undefined, undefined, undefined);
        const cmds = prepareResultsExportCommands(bin, access);
        expect(cmds.options, 'we expect 6 tokens meaning everything is taken into account').to.lengthOf(8);
    });
});
