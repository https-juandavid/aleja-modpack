import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { unzipSync, strFromU8 } from 'fflate';
import { buildIndex, writeMrpack } from '../src/mrpack.mjs';

const modsJson = { name: 'Aleja Aventura', version: '1.2.3', minecraft: '26.1.2', mods: [] };
const lock = [{
  slug: 'lootr', projectId: 'P', versionId: 'V', versionNumber: '1', filename: 'lootr.jar',
  url: 'https://cdn.modrinth.com/lootr.jar', sha1: 'aa', sha512: 'bb', size: 123,
  env: { client: 'required', server: 'required' },
}];

test('index has minecraft and fabric-loader dependencies', () => {
  const idx = buildIndex(modsJson, lock, '0.20.1');
  assert.equal(idx.formatVersion, 1);
  assert.equal(idx.game, 'minecraft');
  assert.equal(idx.versionId, '1.2.3');
  assert.equal(idx.name, 'Aleja Aventura');
  assert.deepEqual(idx.dependencies, { minecraft: '26.1.2', 'fabric-loader': '0.20.1' });
});

test('files are mods/<filename> with hashes, env, downloads, fileSize', () => {
  const idx = buildIndex(modsJson, lock, '0.20.1');
  assert.deepEqual(idx.files, [{
    path: 'mods/lootr.jar',
    hashes: { sha1: 'aa', sha512: 'bb' },
    env: { client: 'required', server: 'required' },
    downloads: ['https://cdn.modrinth.com/lootr.jar'],
    fileSize: 123,
  }]);
});

test('writeMrpack produces zip containing modrinth.index.json', async () => {
  const idx = buildIndex(modsJson, lock, '0.20.1');
  const out = join(mkdtempSync(join(tmpdir(), 'mrpack-')), 'x.mrpack');
  await writeMrpack(idx, out);
  const files = unzipSync(new Uint8Array(readFileSync(out)));
  assert.deepEqual(JSON.parse(strFromU8(files['modrinth.index.json'])), idx);
});
