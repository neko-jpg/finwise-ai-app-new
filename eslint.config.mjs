// eslint.config.mjs (Flat Config)
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import * as tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";

// 旧式の "extends" や "plugins" を Flat Config として読み込むための互換レイヤ
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  // 無視ファイル（.eslintignore はもう使わない）
  {
    ignores: [
      "node_modules",
      ".next",
      "dist",
      "public/*",
      // 型定義ファイルの警告を黙らせたい場合は次行を残す/調整
      "src/types/*.d.ts",
      "functions/",
      "scripts/"
    ],
  },

  // JS の推奨
  js.configs.recommended,

  // TypeScript の推奨（型情報を使う版）
  ...tseslint.configs.recommendedTypeChecked,

  // Next.js 推奨（core-web-vitals 相当）を互換レイヤで読み込む
  ...compat.extends("plugin:@next/next/core-web-vitals"),

  // 追加設定ブロック（パーサやルールを統一）
  {
    plugins: {
      // Flat Config では plugins はオブジェクトで渡す
      "@next/next": nextPlugin,
      "@typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      // ここにプロジェクト独自の上書きルールを追加（必要なら）
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "@typescript-eslint/no-explicit-any": "off",
    },
    settings: {
      next: { rootDir: ["./"] },
    },
  },
];
