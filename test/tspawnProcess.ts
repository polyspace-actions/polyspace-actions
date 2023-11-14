// Copyright 2023 The MathWorks, Inc.

import { expect } from 'chai';
import { getCwd } from '../lib/getCwd';
import { spawnProcess } from '../lib/spawnProcess';

describe('spawnProcess', () => {
    it('Pipe to stdout so nothing in return object', async () => {
        const val = await spawnProcess('git', undefined, getCwd(), ['status'], true);
        expect(val).to.equal('');
    });

    it('Don\'t pipe to stdout so return object contains string', async () => {
        const val = await spawnProcess('git', undefined, getCwd(), ['status'], false);
        expect(val).to.not.equal(null);
    });

});
