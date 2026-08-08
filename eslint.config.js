//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

export default [
    ...tanstackConfig,
    {
        // Wire typed linting (no-unnecessary-condition etc.) to this project's tsconfig.
        // tanstackConfig sets the legacy `project: true`; it must be disabled when
        // using projectService (the two are mutually exclusive in typescript-eslint).
        languageOptions: {
            parserOptions: {
                project: false,
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            'import/no-cycle': 'off',
            'import/order': 'off',
            'sort-imports': 'off',
            '@typescript-eslint/array-type': 'off',
            '@typescript-eslint/require-await': 'off',
            'pnpm/json-enforce-catalog': 'off',
        },
    },
    {
        ignores: ['eslint.config.js', 'prettier.config.js'],
    },
]
