// Copyright 2023 The MathWorks, Inc.

import { expect } from 'chai';
import * as fs from 'fs';
import { matchedResults, GitDiffFile } from '../lib/matchedResults';
import { sarifParser } from '../lib/sarifParser';
import { CondensedResult } from '../lib/options';
const rewire = require('rewire');
const rewiredModule = rewire('../lib/matchedResults.ts');

describe('matchedResults', () => {
    
    it('Match results for given diff and results sarif', async () => {

        const results = sarifParser('test/results.sarif');
        const gitDiff = fs.readFileSync('test/files.patch', 'utf-8');

        const matches = matchedResults(results.NonJustifiedResults, gitDiff);
        expect(matches.length).to.equal(6);
    });

    it('getAllFilesInGitRepo', async () => {
        const array : string[] = await rewiredModule.__get__('getAllFilesInGitRepo')();
        expect(array.length).to.not.equal(0);
        expect(array).to.contain('test/tmatchedResults.ts');
    });

    it('parseChangedFileString', async () => {
        const gitDiff = fs.readFileSync('test/files.patch', 'utf-8');
        const array : GitDiffFile[] = await rewiredModule.__get__('parseChangedFileString')(gitDiff);
        expect(array.length).to.not.equal(0);

        let contains_maincpp = false;
        array.forEach(diff => {
            if(diff.file === 'example/main.cpp'){
                contains_maincpp = true;
            }
        });
        expect(contains_maincpp).to.equal(true);
    });

    it('longestRepoFileMatch', async () => {
        const result : CondensedResult = {messageText: 'msg', location: {startLine: 2, uri: new URL('file:/home/git/polyspace-actions/actions-runner/_work/polyspace-actions/polyspace-actions/example/main.cpp')}};
        const repoFiles: string[] = ['main.cpp', 'example/test/main.cpp', 'example/test/a.cpp', 'example/main.cpp', 'test/example/main.cpp'];
        const match  = await rewiredModule.__get__('longestRepoFileMatch')(result, repoFiles);
        expect(match).to.equal('example/main.cpp');
    });
});


