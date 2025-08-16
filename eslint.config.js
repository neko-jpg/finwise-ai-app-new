import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

// mimic CommonJS variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const config = [
    ...compat.extends("next/core-web-vitals"),
    {
        rules: {
            "no-restricted-imports": ["error", {
                paths: [
                    { name: "@/lib/types", message: "Use '@/domain' instead" },
                    { name: "@/lib/user",  message: "Use '@/domain' instead" }
                ]
            }]
        }
    }
];

export default config;
