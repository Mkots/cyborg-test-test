// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import vm from 'node:vm';
import * as path from 'node:path';
import * as ts from 'typescript';
import { createInstrumenter } from 'istanbul-lib-instrument';

export function instrumentAndLoadModule(filePath: string): any {
    let sourceCode = fs.readFileSync(filePath, 'utf8');

    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        const transpiled = ts.transpileModule(sourceCode, {
            compilerOptions: {
                target: ts.ScriptTarget.ES2020,
                module: ts.ModuleKind.CommonJS,
                esModuleInterop: true,
            },
            fileName: path.basename(filePath),
        });
        sourceCode = transpiled.outputText;
    }

    const instrumenter = createInstrumenter({
        coverageVariable: '__coverage__',
    });
    const instrumented = instrumenter.instrumentSync(sourceCode, filePath);

    (globalThis as any).__coverage__ = (globalThis as any).__coverage__ || {};

    const sandbox: any = {
        module: { exports: {} },
        exports: {},
        require,
        __dirname: path.dirname(filePath),
        __filename: filePath,
        global: globalThis,
        __coverage__: (globalThis as any).__coverage__,
        console,
    };

    vm.createContext(sandbox);

    const wrappedCode = `
    (function (module, exports, require, __filename, __dirname, global) {
      ${instrumented}
    });
  `;

    const script = new vm.Script(wrappedCode, { filename: filePath });
    const wrapperFn = script.runInContext(sandbox);

    wrapperFn(
        sandbox.module,
        sandbox.module.exports,
        sandbox.require,
        sandbox.__filename,
        sandbox.__dirname,
        sandbox.global
    );

    const exported = sandbox.module.exports;

    if (sandbox.__coverage__) {
        for (const fileKey of Object.keys(sandbox.__coverage__)) {
            (globalThis as any).__coverage__[fileKey] = sandbox.__coverage__[fileKey];
        }
    }

    if (exported && typeof exported === 'object' && 'default' in exported) {
        return (exported as any).default;
    }

    return exported;
}