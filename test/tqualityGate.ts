import { expect } from 'chai';

// Import the parseSarifFile function from the previous example
import { extractURL } from '../lib/sarifParser';

describe('SARIF Parser', () => {
    it('should correctly parse the SARIF file and count the number of results', () => {
        const url = extractURL('https://test-server:9443/metrics/index.html?a=review&p=4342&r=11409&fid=28999620');
        expect(url).to.equal('https://test-server:9443/metrics/index.html?a=review&p=4342&r=11409');
    });
});