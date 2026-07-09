import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["node_modules"] },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.jest   
      }
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-console": "off",
      "no-undef": "error",
      "no-unused-vars": ["error", {
        "caughtErrorsIgnorePattern": "^_"
      }],
    },
  },
];
