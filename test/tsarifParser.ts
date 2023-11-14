import { expect } from 'chai';
import { sarifParser } from '../lib/sarifParser';

describe('optionsSplit', () => {
    it('test sarif parser for SARIF with hostedViewerUri', () => {
        const val = sarifParser('test/exampleSarif.json');
        expect(val.RawResults).to.have.lengthOf(7);
    });
    it('test sarif parser for SARIF without hostedViewerUri', () => {
        const val = sarifParser('test/exampleSarifNoAccess.json');
        expect(val.RawResults).to.have.lengthOf(7);
    });
    it('test that justified taken into account', () => {
        const val = sarifParser('test/exampleSarif.json');
        
        const matches = val.RawResults.filter((e) => {return e.justified === true});
        expect(val.RawResults.length - matches.length).to.equal(val.NonJustifiedResults.length);
    });
});
