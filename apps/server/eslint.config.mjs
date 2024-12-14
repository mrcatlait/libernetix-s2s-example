import s2sServer from "@s2s-server/eslint-config";

export default [
  ...s2sServer,
  {
    ignores: [
      '**/*',
      '!src/**',
      '!integration-tests/**'
    ]
  },
  {
    files: [
      "**/*.spec.ts"
    ],
    rules: {
      "@typescript-eslint/unbound-method": "off"
    }
  }
];
