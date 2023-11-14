// Copyright 2023 The MathWorks, Inc.

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const expect = chai.expect;

const rewire  = require('rewire');
import { isPolyspaceCallableAndRightVersion } from '../lib/isPolyspaceCallableAndRightVersion';
const rewiredModule = rewire('../lib/isPolyspaceCallableAndRightVersion.ts');


describe('isPolyspaceCallableAndRightVersion', () => {
    it('non existing installation folder',async () => {
        await expect(isPolyspaceCallableAndRightVersion('non existing installationFolder')).to.eventually.be.rejectedWith(Error);
    });
    it('Polyspace not on the path', async () => {
        await expect(isPolyspaceCallableAndRightVersion('')).to.eventually.be.rejectedWith(Error);
    });
    it('polyspace return value not zero ', async () => {
        await expect(rewiredModule.__get__('getPolyspaceConfigureOutputString')('/mathworks/devel/jobarchive/BR2023bd/latest_pass/matlab',['-invalidArgs'])).to.eventually.be.rejectedWith(Error);
    });

    it('releaseMismatch 23a', () => {
        const ver = rewiredModule.__get__('matchConfigureStringVersion')(' polyspace-configure (R2023a) other noise not interesting');
        chai.expect(ver).to.equal('R2023a');
    });

    it('releaseMismatch 23b', () => {
        const ver = rewiredModule.__get__('matchConfigureStringVersion')(' polyspace-configure (R2023b) other noise not interesting');
        chai.expect(ver).to.equal('R2023b');
    });

    it('releaseMismatch 2022a version', () => {
        const ver = rewiredModule.__get__('matchConfigureStringVersion')(' polyspace-configure (R2022a)');
        chai.expect(ver, 'We expect no version to be found in an empty string.').to.equal('R2022a');
    });

    it('releaseMismatch empty', () => {
        const ver = rewiredModule.__get__('matchConfigureStringVersion')('');
        chai.expect(ver === undefined, 'We expect no version to be found in an empty string.').to.equal(true);
    });
});
