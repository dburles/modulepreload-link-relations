// ignore unused exports

import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      curly: ["error", "all"],
      "func-style": ["error", "declaration"],
      "no-console": ["error", { allow: ["warn", "error"] }],
    },
  },
];
