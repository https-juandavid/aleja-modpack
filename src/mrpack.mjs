import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { zipSync, strToU8 } from 'fflate';

export function buildIndex(modsJson, lock, loaderVersion) {
  return {
    formatVersion: 1,
    game: 'minecraft',
    versionId: modsJson.version,
    name: modsJson.name,
    files: lock.map((e) => ({
      path: `mods/${e.filename}`,
      hashes: { sha1: e.sha1, sha512: e.sha512 },
      env: { client: e.env.client, server: e.env.server },
      downloads: [e.url],
      fileSize: e.size,
    })),
    dependencies: { minecraft: modsJson.minecraft, 'fabric-loader': loaderVersion },
  };
}

export async function writeMrpack(index, outPath) {
  await mkdir(dirname(outPath), { recursive: true });
  const zip = zipSync({ 'modrinth.index.json': strToU8(JSON.stringify(index, null, 2)) });
  await writeFile(outPath, zip);
}
