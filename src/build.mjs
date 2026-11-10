import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { resolveMods } from './modrinth.mjs';
import { buildIndex, writeMrpack } from './mrpack.mjs';
import { renderPrompt, renderModList } from './prompt.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (f) => join(root, f);

async function stableLoader(mc) {
  const res = await fetch(`https://meta.fabricmc.net/v2/versions/loader/${mc}`, { headers: { 'User-Agent': 'aleja-modpack-builder/1.0' } });
  if (!res.ok) throw new Error(`meta.fabricmc.net respondió ${res.status}`);
  const list = await res.json();
  const stable = list.find((x) => x.loader.stable);
  if (!stable) throw new Error(`No hay loader estable de Fabric para ${mc}`);
  return stable.loader.version;
}

async function main() {
  const update = process.argv.includes('--update');
  const modsJson = JSON.parse(await readFile(p('mods.json'), 'utf8'));
  let lockFile;
  if (update || !existsSync(p('lock.json'))) {
    const mods = await resolveMods(modsJson);
    lockFile = { minecraft: modsJson.minecraft, loader: await stableLoader(modsJson.minecraft), mods };
    await writeFile(p('lock.json'), JSON.stringify(lockFile, null, 2) + '\n');
  } else {
    lockFile = JSON.parse(await readFile(p('lock.json'), 'utf8'));
    if (lockFile.minecraft !== modsJson.minecraft) throw new Error('lock.json es de otra versión de Minecraft: ejecuta npm run update');
  }
  const index = buildIndex(modsJson, lockFile.mods, lockFile.loader);
  await writeMrpack(index, p('dist/aleja.mrpack'));

  const vars = { version: modsJson.version, publicRepo: modsJson.publicRepo ?? null };
  await writeFile(p('INSTALAR-CON-CLAUDE.md'), renderPrompt(await readFile(p('templates/install-prompt.md'), 'utf8'), vars));
  const readme = renderPrompt(await readFile(p('templates/README.md'), 'utf8'), vars)
    .replaceAll('{{LOADER}}', lockFile.loader)
    .replaceAll('{{MOD_LIST}}', renderModList(lockFile.mods));
  await writeFile(p('README.md'), readme);

  console.table(lockFile.mods.map((m) => ({ slug: m.slug, version: m.versionNumber, cliente: m.env.client, servidor: m.env.server, dep: m.dependencyOf ?? '' })));
  console.log(`Pack ${modsJson.name} ${modsJson.version} · Minecraft ${modsJson.minecraft} · Fabric ${lockFile.loader} · ${lockFile.mods.length} archivos → dist/aleja.mrpack`);
  return { modsJson, lockFile };
}

main().catch((e) => { console.error(`ERROR: ${e.message}`); process.exit(1); });
