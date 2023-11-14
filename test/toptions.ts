// Copyright 2023 The MathWorks, Inc.

import { assert } from 'chai';
import { InputAccessOptions } from '../lib/options';

describe('Access options', () => {
    it('Test Access Options host but missing API key', () => {
        assert.throw(() => {
            const _ = new InputAccessOptions('ps_results', 'host', undefined, undefined, undefined, undefined, undefined,undefined);
        });
    });

    it('Test Access Options host but missing API key', () => {
        assert.throw(() => {
            const _ = new InputAccessOptions(undefined, 'host', undefined, undefined, undefined, undefined, undefined,undefined);
        });
    });

    it('Test Access Options apikey but missing Host', () => {
        assert.throw(() => {
            const _ = new InputAccessOptions('ps_results', undefined, 'apikey', undefined, undefined, undefined, undefined, undefined);
        });
    });

    it('Test that there is no issue if both are present', () => {
        assert.doesNotThrow(() => {
            const _ = new InputAccessOptions('ps_results', 'someHost', 'apikey', undefined, undefined, undefined, undefined, undefined);
        });
    });

    it('Test that we throw if neither host nor api key are present but other configurations', () => {
        assert.throws(() => {
            const _ = new InputAccessOptions('ps_results', undefined, undefined, undefined, 10, undefined, '', undefined);
        });
    });

    it('Test that we don\'t throw if there are only invalid strings', () => {
        assert.doesNotThrow(() => {
            const _ = new InputAccessOptions('ps_results', undefined, undefined, '', undefined, '', undefined, undefined);
        });
    });

    it('Test that we throw if there are is only the last one set', () => {
        assert.throws(() => {
            const _ = new InputAccessOptions('ps_results', undefined, undefined, '', undefined, 'set', undefined, undefined);
        });
    });
});
