import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/scripts/**',
      '**/*.js',
      '**/*.jsx',
      '**/*.mjs',
      '**/*.cjs',
    ],
  },
  ...compat.extends('next', 'next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {},
  },
];

export default eslintConfig;
