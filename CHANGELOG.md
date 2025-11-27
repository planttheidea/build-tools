# CHANGELOG

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
