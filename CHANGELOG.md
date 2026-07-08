# CHANGELOG

## 2.0.2

- Removed `git-root` in favor of internal utility, to remove a transient version of `execa` deemed a security risk

## 2.0.1

- Fix `init` options (`cjs`, `sourceMap`, `umd`, etc.) not passing through to the generated `rollup` config
- Fix `rollup` CLI command missing the `--source` option
- Fix `react` option not applying to per-format `tsconfig` `include` patterns
- Fix `init` silently skipping the `src/index.ts` / `__tests__/index.test.ts` placeholder files
- Add test suite covering the CLI generators and runtime config builders

## 2.0.0

### BREAKING CHANGES

- `umd` and `sourceMap` options now default to `false`, dropping support without explicit opt-in

## 1.2.3

- [#11](https://github.com/planttheidea/build-tools/pull/11) - Add `release-it` to the list of transferred dependencies

## 1.2.2

- Ensure `fix-types` script updates nested folders

## 1.2.1

- [#10](https://github.com/planttheidea/build-tools/pull/10) - Ensure `prettier` is installed before formatting

## 1.2.0

- [#9](https://github.com/planttheidea/build-tools/pull/9) - Add `"files"` support in `package.json` script

## 1.1.1

- [#8](https://github.com/planttheidea/build-tools/pull/8) - Fix `"types"` declaration file not being formatted on
  generation

## 1.1.0

- [#6](https://github.com/planttheidea/build-tools/pull/6) - simplify `rollup` configuration
- [#7](https://github.com/planttheidea/build-tools/pull/7) - Add automatic generation of top-level `"types"` file for
  legacy node support

## 1.0.6

- Fix `--react` script option throwing an error when applying necessary dependencies

## 1.0.5

- Fix `dev` script reference to vite config

## 1.0.4

- Fix `root` path derivation in `vite` setup
- Fix `include` derivation for source files in `vitest` setup

## 1.0.3

- Forgot to ensure `__tests__` was included in the base TS config

## 1.0.2

- Fix `__tests__` being ignored by ESLint and TS

## 1.0.1

- Fix `license` being nested in `scripts` in the `package.json`
- Change `release` script to `release:stable` for consistency
- Only create `src/index.ts` / `__tests__/index.test.ts` if the folders do not exist

## 1.0.0

- Initial release
