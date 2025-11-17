import type { Reporter } from 'vitest/node'
import type { SerializedError } from '@vitest/utils'
import { convertVitestToPlaywright } from './convertBlob'

export default class PlaywrightBlobReporter implements Reporter {
    async onTestRunEnd(
        testModules: ReadonlyArray<any>,
        unhandledErrors: ReadonlyArray<SerializedError>
    ): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 100))

        const vitestBlobPath = '.vitest-reports/blob.json'
        const playwrightBlobPath = '.vitest-reports/playwright-blob.zip'

        console.log('Converting Vitest blob to Playwright format...')
        await convertVitestToPlaywright(vitestBlobPath, playwrightBlobPath)
        console.log('Conversion complete!')
    }
}