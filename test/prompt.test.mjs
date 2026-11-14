import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPrompt, mrpackUrl, renderModList } from '../src/prompt.mjs';

const tpl = 'v={{VERSION}} repo={{PUBLIC_REPO}} url={{MRPACK_URL}} again={{VERSION}}';

test('renderPrompt replaces VERSION, PUBLIC_REPO and MRPACK_URL', () => {
  const out = renderPrompt(tpl, { version: '1.0.0', publicRepo: 'ana/aleja-modpack' });
  assert.equal(out, 'v=1.0.0 repo=ana/aleja-modpack url=https://api.github.com/repos/ana/aleja-modpack/contents/dist/aleja.mrpack?ref=main again=1.0.0');
});

test('without publicRepo the prompt carries a visible pending notice instead of a URL', () => {
  const out = renderPrompt(tpl, { version: '1.0.0', publicRepo: null });
  assert.match(out, /PENDIENTE: publicar el repo/);
  assert.doesNotMatch(out, /api\.github\.com/);
  assert.doesNotMatch(out, /\{\{/);
});

test('mrpackUrl uses the GitHub API (raw.githubusercontent caches stale packs for minutes)', () => {
  assert.equal(mrpackUrl('o/r'), 'https://api.github.com/repos/o/r/contents/dist/aleja.mrpack?ref=main');
});

test('renderModList lists top-level mods with side labels, skipping dependencies', () => {
  const md = renderModList([
    { slug: 'lootr', versionNumber: '1', env: { client: 'required', server: 'required' } },
    { slug: 'easyauth', versionNumber: '2', env: { client: 'unsupported', server: 'required' } },
    { slug: 'sodium', versionNumber: '3', env: { client: 'required', server: 'unsupported' } },
    { slug: 'geckolib', versionNumber: '4', env: { client: 'required', server: 'required' }, dependencyOf: 'x' },
  ]);
  assert.match(md, /\| lootr \| 1 \| ambos \|/);
  assert.match(md, /\| easyauth \| 2 \| servidor \|/);
  assert.match(md, /\| sodium \| 3 \| cliente \|/);
  assert.doesNotMatch(md, /geckolib/);
});

test('templates contain no stray control characters (broken Windows backslashes)', async () => {
  const { readFile } = await import('node:fs/promises');
  for (const f of ['templates/install-prompt.md', 'templates/update-script-prompt.md', 'templates/README.md']) {
    const s = await readFile(new URL(`../${f}`, import.meta.url), 'utf8');
    assert.deepEqual([...s].filter((c) => c < ' ' && c !== '\n' && c !== '\t' && c !== '\r'), [], f);
  }
});
