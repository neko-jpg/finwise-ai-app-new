// eslint.config.mjs
import tseslint from 'typescript-eslint'
import pluginImport from 'eslint-plugin-import'

export default [
  { ignores: ['.next/**', 'dist/**'] },
  ...tseslint.configs.recommended, // ← メタパッケージの推奨セット
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser, // これでOK（parser同梱）
    },
    plugins: { import: pluginImport, '@typescript-eslint': tseslint.plugin },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['./tsconfig.json', './functions/tsconfig.json'],
        },
      },
    },
    rules: {
      'import/no-unresolved': 'error',
      // ここにプロジェクトの好みで追記
      '@typescript-eslint/no-unused-vars': ['error', {
        args: 'after-used',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
    },
  },
  // Cloud Functions 専用の解決設定
  {
    files: ['functions/**/*.ts', 'functions/**/*.tsx', 'app/functions/**/*.ts', 'app/functions/**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./functions/tsconfig.json'], // ← functions/ の tsconfig を明示
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: ['./functions/tsconfig.json'],
        },
        node: {
          // functions 下の node_modules を解決
          paths: ['functions/node_modules'],
          extensions: ['.ts', '.js'],
        },
      },
    },
  },
  // 型宣言 (*.d.ts) は any を許容（宣言の性質上、許される）
  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-var': 'off',
    },
  }
]
