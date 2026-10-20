/**
 * Packs the theme into dist/<name>-<version>.tgz and prints the file's path.
 *
 * The package is the files an instance reads and nothing else: theme.json, the
 * fonts directory and the licence. `writeThemeArchive` is the writer the core
 * tests its own reader with, and it is deterministic, so packing the same
 * sources twice gives the same bytes and the sha512 the catalog states stays
 * meaningful.
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { writeThemeArchive } from "@openbrf/theme-tools";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function* walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      yield* walk(path);
    } else if (entry.isFile()) {
      yield path;
    }
  }
}

const files = new Map();
const add = async (path, name = relative(root, path)) =>
  files.set(name.split("\\").join("/"), await readFile(path));

await add(join(root, "theme.json"));
// `.txt` is a file type a package may carry; a bare `LICENSE` is not.
await add(join(root, "LICENSE"), "LICENSE.txt");
for await (const path of walk(join(root, "fonts"))) {
  await add(path);
}

const manifest = JSON.parse(files.get("theme.json").toString("utf8"));
const output = join(root, "dist", `${manifest.name}-${manifest.version}.tgz`);

await mkdir(dirname(output), { recursive: true });
await writeFile(output, writeThemeArchive(files));
console.log(output);
