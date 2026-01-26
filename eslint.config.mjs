import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc', '**/next-env.d.ts'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
            '^.*/next-env\\.d\\.ts$',
          ],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],


      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/restrict-plus-operands": "off",
      "@typescript-eslint/no-empty-function": "off",

      "@typescript-eslint/adjacent-overload-signatures": "error",
      "@typescript-eslint/array-type": [
        "error",
        {
          "default": "array"
        }
      ],
      "@typescript-eslint/consistent-type-assertions": "error",
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
          "accessibility": "explicit",
          "overrides": { "constructors": "no-public" }
        }
      ],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          "selector": "enumMember",
          "format": ["PascalCase"]
        }
      ],
      "@typescript-eslint/no-empty-interface": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-inferrable-types": [
        "error",
        {
          "ignoreParameters": true
        }
      ],
      "@typescript-eslint/no-misused-new": "error",
      "@typescript-eslint/no-namespace": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-parameter-properties": "off",
      "@typescript-eslint/no-shadow": [
        "error",
        {
          "hoist": "all"
        }
      ],
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/prefer-for-of": "error",
      "@typescript-eslint/prefer-function-type": "error",
      "@typescript-eslint/prefer-namespace-keyword": "error",
      "@typescript-eslint/triple-slash-reference": [
        "error",
        {
          "path": "always",
          "types": "prefer-import",
          "lib": "always"
        }
      ],
      "@typescript-eslint/unified-signatures": "error",

      "arrow-body-style": "error",
      "complexity": "off",
      "constructor-super": "error",
      "curly": "error",
      "dot-notation": "error",
      "eqeqeq": ["error", "smart"],
      "guard-for-in": "error",
      "id-denylist": ["error", "any", "Number", "String", "string", "Boolean", "boolean", "Undefined", "undefined"],
      "id-match": "error",
      "max-classes-per-file": "off",
      "max-len": [
        "error",
        {
          "ignoreRegExpLiterals": false,
          "ignoreStrings": true,
          "ignoreTemplateLiterals": true,
          "ignoreComments": true,
          "ignorePattern": "^import\\s.+\\sfrom\\s.+;$",
          "code": 120
        }
      ],
      "new-parens": "error",
      "no-bitwise": "error",
      "no-caller": "error",
      "no-cond-assign": "error",
      "no-console": "error",
      "no-debugger": "error",
      "no-empty": "error",
      "no-eval": "error",
      "no-fallthrough": "error",
      "no-invalid-this": "off",
      "no-multiple-empty-lines": "off",
      "no-new-wrappers": "error",
      "no-restricted-imports": ["error", "rxjs/Rx"],
      "no-throw-literal": "error",
      "no-trailing-spaces": "error",
      "no-undef-init": "error",
      "no-unsafe-finally": "error",
      "no-unused-labels": "error",
      "no-use-before-define": "off",
      "no-var": "error",
      "object-shorthand": "error",
      "one-var": ["error", "never"],
      "prefer-const": "error",
      "radix": "error",
      "spaced-comment": [
        "error",
        "always",
        {
          "markers": ["/"]
        }
      ],
      "use-isnan": "error",
      "valid-typeof": "off"
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/next-env.d.ts'],
    rules: {
      '@nx/enforce-module-boundaries': 'off',
    },
  },
];
