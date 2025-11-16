import { parse } from 'flatted'
import { readFile, mkdir } from 'node:fs/promises'
import { dirname, relative, resolve } from 'pathe'
import { createWriteStream } from 'node:fs'
import { randomUUID } from 'node:crypto'
import type { File, Task } from '@vitest/runner'
import { Readable } from 'stream'
import yazl from 'yazl'

interface PlaywrightEvent {
    method: string
    params: any
}

export async function convertVitestToPlaywright(
    vitestBlobPath: string,
    playwrightOutputPath: string
): Promise<void> {
    const content = await readFile(vitestBlobPath, 'utf-8')
    const [version, files, errors, modules, coverage, executionTime] = parse(content)

    const rootDir = process.cwd()
    const events: PlaywrightEvent[] = []

    // 1. Metadata
    events.push({
        method: 'onBlobReportMetadata',
        params: {
            version: 2,
            userAgent: `Vitest/${version}`,
            pathSeparator: '/',
        }
    })

    // 2. Config
    events.push({
        method: 'onConfigure',
        params: {
            config: {
                configFile: undefined,
                globalTimeout: 0,
                maxFailures: 0,
                metadata: {},
                rootDir: rootDir,
                version: version,
                workers: 1,
                globalSetup: undefined,
                globalTeardown: undefined,
                tags: undefined,
                webServer: undefined,
            }
        }
    })

    const suites = convertFilesToSuites(files as File[], rootDir)

    events.push({
        method: 'onProject',
        params: {
            project: {
                metadata: {},
                name: 'default',
                outputDir: relative(rootDir, 'test-results'),
                repeatEach: 1,
                retries: 0,
                testDir: relative(rootDir, rootDir),
                testIgnore: [],
                testMatch: [],
                timeout: 30000,
                suites: suites,
                grep: [],
                grepInvert: [],
                dependencies: [],
                snapshotDir: relative(rootDir, '__snapshots__'),
                teardown: undefined,
                use: {
                    testIdAttribute: undefined
                },
            }
        }
    })

    // 4. Begin
    events.push({
        method: 'onBegin',
        params: undefined
    })

    const startTime = Date.now() - executionTime
    for (const file of files as File[]) {
        convertFileTests(file, events, rootDir, startTime)
    }

    for (const error of errors as any[]) {
        events.push({
            method: 'onError',
            params: { error }
        })
    }

    const hasErrors = (files as File[]).some(f =>
        f.result?.state === 'fail' || f.result?.errors?.length
    ) || (errors as any[]).length > 0

    events.push({
        method: 'onEnd',
        params: {
            result: {
                status: hasErrors ? 'failed' : 'passed',
                startTime: startTime,
                duration: executionTime,
            }
        }
    })

    await writePlaywrightBlob(events, playwrightOutputPath)
}

function convertFilesToSuites(files: File[], rootDir: string): any[] {
    return files.map(file => {
        const relativePath = relative(rootDir, file.filepath)

        return {
            title: file.name,
            location: {
                file: relativePath,
                line: 0,
                column: 0,
            },
            entries: convertTasksToEntries(file.tasks || [], relativePath, rootDir)
        }
    })
}

function convertTasksToEntries(tasks: Task[], filepath: string, rootDir: string): any[] {
    const entries: any[] = []

    for (const task of tasks) {
        if (task.type === 'suite') {
            entries.push({
                title: task.name,
                location: task.location ? {
                    file: filepath,
                    line: task.location.line,
                    column: task.location.column,
                } : {
                    file: filepath,
                    line: 0,
                    column: 0,
                },
                entries: convertTasksToEntries(task.tasks || [], filepath, rootDir)
            })
        } else if (task.type === 'test') {
            entries.push({
                testId: task.id,
                title: task.name,
                location: task.location ? {
                    file: filepath,
                    line: task.location.line,
                    column: task.location.column,
                } : {
                    file: filepath,
                    line: 0,
                    column: 0,
                },
                retries: 0,
                tags: [],
                repeatEachIndex: 0,
                annotations: []
            })
        }
    }

    return entries
}

function convertFileTests(
    file: File,
    events: PlaywrightEvent[],
    rootDir: string,
    startTime: number
): void {
    const relativePath = relative(rootDir, file.filepath)

    const visitTask = (task: Task) => {
        if (task.type === 'test') {
            const resultId = randomUUID()
            const testStartTime = task.result?.startTime || startTime

            // onTestBegin
            events.push({
                method: 'onTestBegin',
                params: {
                    testId: task.id,
                    result: {
                        id: resultId,
                        retry: task.retry ?? 0,
                        workerIndex: 0,
                        parallelIndex: 0,
                        startTime: testStartTime,
                    }
                }
            })

            // onTestEnd
            const status = mapVitestStatusToPlaywright(task.result?.state)
            const errors = task.result?.errors?.map((err: any) => ({
                message: err.message || String(err),
                stack: err.stack,
                location: err.location ? {
                    file: relativePath,
                    line: err.location.line,
                    column: err.location.column,
                } : undefined,
            })) || []

            events.push({
                method: 'onTestEnd',
                params: {
                    test: {
                        testId: task.id,
                        expectedStatus: 'passed',
                        timeout: task.timeout ?? 30000,
                        annotations: (task.meta as any).annotations || []
                    },
                    result: {
                        id: resultId,
                        duration: task.result?.duration || 0,
                        status: status,
                        errors: errors,
                        annotations: undefined,
                    }
                }
            })
        } else if (task.type === 'suite') {
            task.tasks?.forEach(visitTask)
        }
    }

    file.tasks?.forEach(visitTask)
}

function mapVitestStatusToPlaywright(
    vitestStatus?: string
): 'passed' | 'failed' | 'skipped' | 'timedOut' {
    switch (vitestStatus) {
        case 'pass':
            return 'passed'
        case 'fail':
            return 'failed'
        case 'skip':
        case 'todo':
            return 'skipped'
        default:
            return 'passed'
    }
}

async function writePlaywrightBlob(
    events: PlaywrightEvent[],
    outputPath: string
): Promise<void> {
    await mkdir(dirname(outputPath), { recursive: true })

    const zipFile = new yazl.ZipFile()

    const zipFinishPromise = new Promise<void>((resolve, reject) => {
        zipFile.outputStream
            .pipe(createWriteStream(outputPath))
            .on('close', resolve)
            .on('error', reject)
    })

    const jsonlLines = events.map(e => JSON.stringify(e) + '\n')
    const jsonlContent = jsonlLines.join('')

    zipFile.addReadStream(Readable.from([jsonlContent]), 'report.jsonl')
    zipFile.end()

    await zipFinishPromise
}