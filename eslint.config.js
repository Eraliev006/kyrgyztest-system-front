import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import boundaries from 'eslint-plugin-boundaries'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

const fsdLayers = [
  { type: 'app', pattern: 'src/app/*' },
  { type: 'pages', pattern: 'src/pages/*' },
  { type: 'widgets', pattern: 'src/widgets/*', capture: ['slice'] },
  { type: 'features', pattern: 'src/features/*', capture: ['slice'] },
  { type: 'entities', pattern: 'src/entities/*', capture: ['slice'] },
  { type: 'shared', pattern: 'src/shared/*' },
]

const sameSlice = { slice: '{{ from.element.captured.slice }}' }

export default tseslint.config(
  { ignores: ['dist', 'src/shared/api/generated', 'qa'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      boundaries,
    },
    settings: {
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': fsdLayers,
      'import/resolver': {
        typescript: { project: './tsconfig.app.json' },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // FSD import direction: app -> pages -> widgets -> features -> entities -> shared,
      // and no cross-slice imports within widgets/features/entities (a slice may only
      // import its own internals plus anything from a strictly lower layer).
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { types: 'app' } },
              allow: {
                to: {
                  element: {
                    types: { anyOf: ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] },
                  },
                },
              },
            },
            {
              from: { element: { types: 'pages' } },
              allow: {
                to: {
                  element: {
                    types: { anyOf: ['pages', 'widgets', 'features', 'entities', 'shared'] },
                  },
                },
              },
            },
            {
              from: { element: { types: 'widgets' } },
              allow: { to: { element: { types: { anyOf: ['features', 'entities', 'shared'] } } } },
            },
            {
              from: { element: { types: 'widgets' } },
              allow: { to: { element: { types: 'widgets', captured: sameSlice } } },
            },
            {
              from: { element: { types: 'features' } },
              allow: { to: { element: { types: { anyOf: ['entities', 'shared'] } } } },
            },
            {
              from: { element: { types: 'features' } },
              allow: { to: { element: { types: 'features', captured: sameSlice } } },
            },
            {
              from: { element: { types: 'entities' } },
              allow: { to: { element: { types: 'shared' } } },
            },
            {
              from: { element: { types: 'entities' } },
              allow: { to: { element: { types: 'entities', captured: sameSlice } } },
            },
            {
              from: { element: { types: 'shared' } },
              allow: { to: { element: { types: 'shared' } } },
            },
          ],
        },
      ],
    },
  },
  prettier,
)
