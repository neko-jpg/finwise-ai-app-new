// 臨時フラットコンフィグ：既存設定を取り込みつつ上書き
import base from "./eslint.config.mjs";              // 既存を読み込む（編集不要）
import tseslint from "typescript-eslint";
import pluginImport from "eslint-plugin-import";
import unusedImports from "eslint-plugin-unused-imports";

const overrides = [
  // no-unused-vars の最終設定（_許容＋rest吸収）
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { import: pluginImport, "@typescript-eslint": tseslint.plugin, "unused-imports": unusedImports },
    languageOptions: { parser: tseslint.parser },
    settings: {
      "import/resolver": {
        typescript: { alwaysTryTypes: true, project: ["./tsconfig.json","./functions/tsconfig.json"] },
      },
    },
    rules: {
      // 未使用 import は自動削除
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["error", {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],
      "@typescript-eslint/no-unused-vars": ["error", {
        args: "after-used",
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        ignoreRestSiblings: true,   // ← destructuringの未使用をrestへ吸収
      }],
    },
  },
  // 型宣言は緩める
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-var": "off",
    },
  },
  // functions配下の解決（必要なら）
  {
    files: ["functions/**/*.ts","functions/**/*.tsx","app/functions/**/*.ts","app/functions/**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { project: ["./functions/tsconfig.json"], tsconfigRootDir: new URL(".", import.meta.url).pathname },
    },
    settings: {
      "import/resolver": {
        typescript: { project: ["./functions/tsconfig.json"] },
      },
    },
  },
];

export default [...(Array.isArray(base) ? base : [base]), ...overrides];
