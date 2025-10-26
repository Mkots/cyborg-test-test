// DOESN'T WORK!!
import type {
    Reporter,
    TestCase,
    TestResult
} from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

class CoverageReporter implements Reporter {
    private coverageDir = './coverage';

    async onTestEnd(test: TestCase, result: TestResult) {
        const coverageData = this.loadCoverageData();

        if (!coverageData) return;

        const formattedCoverage = this.formatCoverageForPlaywright(coverageData);

        result.attachments.push({
            name: 'Unit Test Coverage',
            contentType: 'application/json',
            body: Buffer.from(JSON.stringify(formattedCoverage, null, 2))
        });

        const htmlPath = path.join(this.coverageDir, 'index.html');
        if (fs.existsSync(htmlPath)) {
            result.attachments.push({
                name: 'coverage-report.html',
                contentType: 'text/html',
                body: fs.readFileSync(htmlPath)
            });
        }
    }

    private loadCoverageData() {
        const summaryPath = path.join(this.coverageDir, 'coverage-summary.json');

        if (!fs.existsSync(summaryPath)) {
            return null;
        }

        return JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    }

    private formatCoverageForPlaywright(coverageData: any) {

        const files = Object.entries(coverageData).map(([filePath, data]: [string, any]) => {
            return {
                url: `file://${filePath}`,
                total: data.lines?.total || 0,
                covered: data.lines?.covered || 0,
                percentage: data.lines?.pct || 0,
                functions: {
                    total: data.functions?.total || 0,
                    covered: data.functions?.covered || 0,
                    percentage: data.functions?.pct || 0
                },
                branches: {
                    total: data.branches?.total || 0,
                    covered: data.branches?.covered || 0,
                    percentage: data.branches?.pct || 0
                },
                statements: {
                    total: data.statements?.total || 0,
                    covered: data.statements?.covered || 0,
                    percentage: data.statements?.pct || 0
                }
            };
        });

        return {
            type: 'unit-test-coverage',
            timestamp: new Date().toISOString(),
            summary: coverageData.total,
            files: files
        };
    }
}

export default CoverageReporter;