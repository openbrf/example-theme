# example-theme

The reference theme for [Open BRF](https://github.com/openbrf/openbrf): a
data-only token set that extends the default theme, to start your own from.

It changes what a theme usually changes first. The trust accent is green
instead of brass, in light and dark; controls have a slightly rounder corner;
and the register's monospace face, Spline Sans Mono, is bundled in the package
rather than loaded from anywhere. Everything it does not state it inherits from
`porttavlan`, the default theme.

A theme is pure data: no JavaScript, so installing one needs no restart and
carries no supply-chain risk. The format, every token and the rules a theme is
held to are in the
[token contract](https://github.com/openbrf/openbrf/blob/main/docs/theme-contract.md).

## What is in here

| Path                                 | What it is                                              |
| ------------------------------------ | ------------------------------------------------------- |
| `theme.json`                         | The manifest: identity, token values, fonts, variants   |
| `fonts/spline-sans-mono-latin.woff2` | The bundled typeface                                    |
| `fonts/OFL.txt`                      | Its licence, which the font requires to travel with it  |
| `scripts/pack.mjs`                   | Packs the theme into `dist/example-theme-<version>.tgz` |
| `scripts/lint.mjs`                   | Runs the install lint on the packed theme               |
| `test/`                              | The lint as a test, plus a check that it can still fail |

## Making your own

Copy the repository, rename the theme in `theme.json` and `package.json` (a
name is lowercase words joined by hyphens, and unique in the catalog), and
change the values. Then check it the way an instance will:

```sh
npm install
npm run lint   # packs the theme and runs the install lint on the tarball
npm test
```

`npm run lint` uses
[`@openbrf/theme-tools`](https://www.npmjs.com/package/@openbrf/theme-tools),
the same package the core runs when a board installs a theme, so you see the
same refusal before you publish. The lint is a gate: it refuses a theme that
renders the statutory register below WCAG AA, one that carries anything
executable, and one that loads a font from outside the package or bundles one
with no licence.

A font you bundle needs its own licence file and a declaration in `theme.json`.
Do not link a font from a CDN: that discloses every viewer's IP address to a
third party.

## Releasing

A release is made by `.github/workflows/release.yml` and only by a pushed tag.
The catalog lists a theme only if its tarball is an asset of an immutable GitHub
release, with a build attestation from that workflow on the release's tag. The
repository needs GitHub's immutable releases setting on before the first one.

1. Set `version` in `theme.json` and `package.json` in a pull request, and merge
   it.
2. Tag the merged commit and push the tag:

   ```sh
   git tag v0.1.0
   git push origin v0.1.0
   ```

The workflow refuses a tag that is not on `main` or that does not match the
manifest's version, lints and tests, packs the tarball once, attests it,
attaches it to the release and publishes. Its run summary shows the `sha512`
and size to state in the catalog entry.

Do not publish a release from the GitHub UI first: that creates the tag after
the release is already immutable, and the tarball can no longer be attached.

To be installable from the curated catalog, a release is then listed with a pull
request to [`openbrf/catalog`](https://github.com/openbrf/catalog).

## Licence

[MIT-0](LICENSE): no conditions, so you can start a proprietary theme from this
one without keeping a notice. The bundled font is under the SIL Open Font
License 1.1; see `fonts/OFL.txt`.
