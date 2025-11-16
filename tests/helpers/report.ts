// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';
import { createCoverageMap } from 'istanbul-lib-coverage';
import { createContext } from 'istanbul-lib-report';
import { create as createReporter } from 'istanbul-reports';
import type { TestInfo } from '@playwright/test';

export async function attachCoverageReport(testInfo: TestInfo) {
    const coverage = (global as any).__coverage__;
    if (!coverage) return;

    const coverageMap = createCoverageMap(coverage);
    const outputDir = path.join(testInfo.outputDir, 'coverage');

    fs.mkdirSync(outputDir, { recursive: true });

    const context = createContext({
        dir: outputDir,
        coverageMap,
    });

    const htmlReporter = createReporter('html');
    htmlReporter.execute(context);

    const indexHtml = fs.readFileSync(path.join(outputDir, 'index.html'), 'utf8');

    await testInfo.attach('coverage.html', {
        body: indexHtml,
        contentType: 'text/html',
    });
}
