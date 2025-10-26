import { test, expect } from '@playwright/test';
// @ts-ignore
import path from 'node:path';
import { instrumentAndLoadModule } from '../helpers/instrument';
import { attachCoverageReport } from '../helpers/report';

const filePath = path.resolve(__dirname, '../../src/simple.ts');
const Sut = instrumentAndLoadModule(filePath);

const tests = [
    { inputs: [0, 0], expected: 0 },
    { inputs: [0, 1], expected: 1 },
    { inputs: [1, 1], expected: 2 },
    { inputs: [1000, 1000], expected: 2000 },
    { inputs: [100000000000000000, 100000000000000000], expected: 200000000000000000 },
    { inputs: [false, false], expected: false },
    { inputs: [null, null], expected: false },
    { inputs: [undefined, undefined], expected: false },
    { inputs: [NaN, NaN], expected: false },
];

tests.forEach((config) => {
    test(
        `Adding ${config.inputs[0]} and ${config.inputs[1]} should equal ${config.expected}`,
        async ({}, testInfo) => {
            const result = Sut(...config.inputs);
            expect(result).toEqual(config.expected);
        }
    );
});

test('CODE COVERAGE', async ({}, testInfo) => {
    await attachCoverageReport(testInfo);
});

