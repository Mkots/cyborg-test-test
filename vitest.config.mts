import {defineConfig} from 'vitest/config';


export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        reporters: ['blob', './reporters/vitets-playwright-blob-reporter.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['blob'],
            thresholds: {
                global: {
                    statements: 80,
                    branches: 80,
                    functions: 80,
                    lines: 80,
                },
            },
        },
        projects: [
            {
                test: {
                    name: 'vitests',
                    include: ['**/tests/unit/**/*.vitest.(ts|js)'],
                }
            }
        ],
    },
});