// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        ignores: [
            "dist",
            "node_modules",
            "eslint.config.mjs",
            "jest.config.js",
            "tests",
            "**/*.spec.ts",
            "coverage",
        ],
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                extraFileExtensions: [".mjs"],
            },
        },

        rules: {
            // "no-console": "warn",
            "dot-notation": "error",
            "@typescript-eslint/no-misused-promises": "off",
            "@typescript-eslint/no-unsafe-assignment": "off",
        },
    },
);
