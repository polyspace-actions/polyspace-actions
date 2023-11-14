// Copyright 2023 The MathWorks, Inc.

import { expect } from 'chai';
import { optionsSplit } from '../lib/optionsSplit';

describe('optionsSplit', () => {
    it('split the make command', () => {
        const val = optionsSplit('make -j 4');
        expect(val).to.have.lengthOf(3);
    });

    it('split results-dir ', () => {
        const val = optionsSplit('-options-file out.opts -results-dir "path_to/folder containing a whitespace/temp"');
        expect(val).to.have.lengthOf(4);
    });
});
