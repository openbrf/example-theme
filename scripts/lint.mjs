/**
 * Lints a packed theme with the check an instance runs at install.
 *
 * Takes the tarball's path, and packs the theme first when given none. Exits
 * non-zero when the package cannot be read or the lint finds an error;
 * warnings are printed and do not fail, as at install.
 */
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { lintThemePackage } from "@openbrf/theme-tools";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const path =
  process.argv[2] ??
  execFileSync(process.execPath, [join(root, "scripts", "pack.mjs")], {
    encoding: "utf8",
  }).trim();

const result = lintThemePackage(await readFile(path));

if (!result.ok) {
  console.error(`${path}: cannot be read (${result.reason})`);
  for (const issue of result.issues) {
    console.error(`  ${issue}`);
  }
  process.exit(1);
}

for (const finding of result.lint.findings) {
  const where = finding.severity === "error" ? "error" : "warning";
  console.error(`${where}: ${JSON.stringify(finding)}`);
}

if (!result.lint.ok) {
  process.exit(1);
}
console.log(
  `${result.manifest.name} ${result.manifest.version}: passes the install lint`,
);
