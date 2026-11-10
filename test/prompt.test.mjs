import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPrompt, mrpackUrl, renderModList } from '../src/prompt.mjs';

const tpl = 'v={{VERSION}} repo={{PUBLIC_REPO}} url={{MRPACK_URL}} again={{VERSION}}';

test('renderPrompt replaces VERSION, PUBLIC_REPO and MRPACK_URL', () => {
  const out = renderPrompt(tpl, { version: '1.0.0', publicRepo: 'ana/aleja-modpack' });
  assert.equal(out, 'v=1.0.0 repo=ana/aleja-modpack url=https://raw.githubusercontent.com/ana/aleja-modpack/main/dist/aleja.mrpack again=1.0.0');
});

test('without publicRepo the prompt carries a visible pending notice instead of a URL', () => {
  const out = renderPrompt(tpl, { version: '1.0.0', publicRepo: null });
  assert.match(out, /PENDIENTE: publicar el repo/);
  assert.doesNotMatch(out, /raw\.githubusercontent/);
  assert.doesNotMatch(out, /\{\{/);
});

test('mrpackUrl builds the raw GitHub url', () => {
  assert.equal(mrpackUrl('o/r'), 'https://raw.githubusercontent.com/o/r/main/dist/aleja.mrpack');
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
