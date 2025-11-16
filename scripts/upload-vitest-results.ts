import ReporterPlaywrightReportsServer from '@cyborgtests/reporter-playwright-reports-server'
import * as dotenv from "dotenv";
import {cleanEnv, str, url} from "envalid";

dotenv.config({quiet: true});

const env = cleanEnv(process.env, {
    CT_SERVER_URL: url(),
    CT_TOKEN: str(),
    CI_COMMIT_BRANCH: str({ default: 'local' }),
});

async function main() {
    const playwrightBlobPath = '.vitest-reports/playwright-blob.zip'

    const reporter = new ReporterPlaywrightReportsServer({
        url: env.CT_SERVER_URL,
        reportPath: playwrightBlobPath,
        token: env.CT_TOKEN,
        resultDetails: {
            browser: 'vitest',
            project: 'vitest-tests',
        },
        triggerReportGeneration: true,
    })

    reporter.onBegin({
        version: 'Vitest',
        rootDir: process.cwd(),
    } as any)

    await reporter.onEnd()

    console.log('✓ Results uploaded successfully')
}

main().catch(err => {
    console.error('Upload failed:', err)
    process.exit(1)
})