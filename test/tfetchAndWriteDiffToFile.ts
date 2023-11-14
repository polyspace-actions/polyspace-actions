// Copyright 2023 The MathWorks, Inc.

import { expect } from 'chai';
import fs from 'node:fs';
import path from 'path';

const rewire = require('rewire');

import { spawnProcess } from '../lib/spawnProcess';
import { getCwd } from '../lib/getCwd';
const rewiredModule = rewire('../lib/fetchAndWriteDiffToFile.ts');

const cppsources = 'test_only_cppsource.cpp';
const cppheader = 'test_only_cppheader.hpp';
const csource = 'test_only_csources.c';
const cheader = 'test_only_cheader.h';


async function getFullFilePath(file: string) :Promise<string> {
    const topLevel = await spawnProcess('git', undefined, undefined, ['rev-parse', '--show-toplevel'], false);
    if(typeof(topLevel) == 'string'){
        return path.join(topLevel.trim(), `test/exampleFiles/${file}`);
    }
    return '';
}

async function modifyTestFile(file: string) {
    const fullFilePath = await getFullFilePath(file);
    fs.appendFileSync(fullFilePath, '\ntest string');
}

after(async () => {
    const topLevel = await spawnProcess('git', undefined, undefined, ['rev-parse', '--show-toplevel'], false);
    if(typeof(topLevel) == 'string'){
        const topLevelTrimmed = topLevel.trim();
        //Reset modified files
        await spawnProcess('git', undefined, undefined, ['checkout', path.join(topLevelTrimmed, `test/exampleFiles/${cppsources}`)], false);
        await spawnProcess('git', undefined, undefined, ['checkout', path.join(topLevelTrimmed, `test/exampleFiles/${cppheader}`)], false);
        await spawnProcess('git', undefined, undefined, ['checkout', path.join(topLevelTrimmed, `test/exampleFiles/${csource}`)], false);
        await spawnProcess('git', undefined, undefined, ['checkout', path.join(topLevelTrimmed, `test/exampleFiles/${cheader}`)], false);
    }
});

describe('fetchAndWritePRDiffToFile', () => {

    it('make sure the extensions filter filters it out', async () => {
        await modifyTestFile(cppsources);
        let diff = await spawnProcess('git', undefined, getCwd(), ['diff', '--name-only'], false);
        if(typeof(diff) == 'string'){
            diff = diff.trim().split('\n');
        }
        const array = await rewiredModule.__get__('filterGitOutput')(diff,['.hpp']);
        expect(array).to.not.include(await getFullFilePath(cppsources));
    });

    it('make sure deleted files are not taken into account', async () => {
        fs.rmSync(await getFullFilePath(cheader));
        let diff = await spawnProcess('git', undefined, getCwd(), ['diff', '--name-only'], false);
        if(typeof(diff) == 'string'){
            diff = diff.trim().split('\n');
        }
        const array = await rewiredModule.__get__('filterGitOutput')(diff,['.h']);

        expect(array).to.not.include(await getFullFilePath(cheader));
    });

    it('getRelativeFilesFromDiffString', async () => {
        const gitDiff = fs.readFileSync('test/files.patch', 'utf-8');
        process.env['GITHUB_WORKSPACE'] = `${getCwd()}/example`;
        const array : string[] = await rewiredModule.__get__('getRelativeFilesFromDiffString')(gitDiff);
        expect(array.length).to.not.equal(0);
    });

    it('Test with three source files', () => {
        const files: string[] = ['file1.h', 'file2.cpp', 'file3.c'];
        const expectedContent = '-include-sources file1.h\n-include-sources file2.cpp\n-include-sources file3.c';

        rewiredModule.__get__('generateIncludeSourcesFile')(files, 'output.txt');

        // Read the created file
        const content = fs.readFileSync('output.txt', 'utf-8');

        // Assert the content is correct
        expect(content).to.equal(expectedContent);

        // Clean up: delete the created file
        fs.unlinkSync('output.txt');
    });

    it('Test with an empty file', () => {
        const files: string[] = [];

        expect(rewiredModule.__get__('generateIncludeSourcesFile')(files, 'output_empty.txt')).to.be.undefined;

        const exists = fs.existsSync('output_empty.txt');

        if(exists)
        {
            fs.unlinkSync('output_empty.txt');
            expect(exists).to.be.false;
        }
    
    });
});