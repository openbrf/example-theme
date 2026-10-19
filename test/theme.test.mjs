import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

import {
  lintThemePackage,
  readThemeArchive,
  writeThemeArchive,
} from "@openbrf/theme-tools";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pack = () =>
  execFileSync(process.execPath, [join(root, "scripts", "pack.mjs")], {
    encoding: "utf8",
  }).trim();

test("the packed theme passes the install lint with no finding", async () => {
  const result = lintThemePackage(await readFile(pack()));

  assert.equal(result.ok, true);
  assert.equal(result.lint.ok, true);
  assert.deepEqual(result.lint.findings, []);
});

test("packing twice gives the same bytes", async () => {
  const digest = async () =>
    createHash("sha512")
      .update(await readFile(pack()))
      .digest("hex");

  assert.equal(await digest(), await digest());
});

test("the package carries the manifest, the licences and the declared font", async () => {
  const files = readThemeArchive(await readFile(pack()));

  assert.deepEqual([...files.keys()].sort(), [
    "LICENSE.txt",
    "fonts/OFL.txt",
    "fonts/spline-sans-mono-latin.woff2",
    "theme.json",
  ]);
});

test("the manifest and package.json state the same version", async () => {
  const manifest = JSON.parse(await readFile(join(root, "theme.json"), "utf8"));
  const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));

  assert.equal(manifest.version, pkg.version);
  assert.equal(manifest.name, pkg.name);
});

test("the lint refuses this theme once its accent is unreadable", async () => {
  const files = new Map(readThemeArchive(await readFile(pack())));
  const manifest = JSON.parse(
    new TextDecoder().decode(files.get("theme.json")),
  );
  // Light text on a light ground: the pair the lint measures, made to fail.
  manifest.modes.light["on-accent-trust"] =
    manifest.modes.light["accent-trust"];
  files.set("theme.json", new TextEncoder().encode(JSON.stringify(manifest)));

  const result = lintThemePackage(writeThemeArchive(files));

  assert.equal(result.ok, true);
  assert.equal(result.lint.ok, false);
  assert.ok(
    result.lint.findings.some((finding) => finding.rule === "contrast"),
  );
});
