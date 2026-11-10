import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveMods } from '../src/modrinth.mjs';

// Fake Modrinth API. projects: { slug: { id, client_side, server_side, versions: [...] } }
function fakeFetch(projects) {
  const byId = Object.fromEntries(Object.entries(projects).map(([slug, p]) => [p.id, slug]));
  return async (url) => {
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean); // v2, project, slug, [version]
    const key = decodeURIComponent(parts[2]);
    const slug = projects[key] ? key : byId[key];
    const p = projects[slug];
    if (!p) return { ok: false, status: 404, json: async () => ({}) };
    if (parts[3] === 'version') {
      assert.equal(u.searchParams.get('loaders'), '["fabric"]');
      assert.equal(u.searchParams.get('game_versions'), '["26.1.2"]');
      return { ok: true, status: 200, json: async () => p.versions };
    }
    return { ok: true, status: 200, json: async () => ({ id: p.id, slug, client_side: p.client_side, server_side: p.server_side, loaders: p.loaders ?? ['fabric'] }) };
  };
}

function ver(id, number, type, date, deps = []) {
  return {
    id, version_number: number, version_type: type, date_published: date,
    dependencies: deps,
    files: [{ primary: true, filename: `${id}.jar`, url: `https://cdn.modrinth.com/${id}.jar`, size: 10, hashes: { sha1: `s1-${id}`, sha512: `s512-${id}` } }],
  };
}

const base = (mods) => ({ name: 'T', version: '1.0.0', minecraft: '26.1.2', mods });

test('picks newest release for fabric 26.1.2', async () => {
  const fetch = fakeFetch({ a: { id: 'A', client_side: 'required', server_side: 'required', versions: [
    ver('a20', '2.0', 'beta', '2026-02-01'), ver('a19', '1.9', 'release', '2026-01-01'),
  ] } });
  const lock = await resolveMods(base([{ slug: 'a' }]), { fetch });
  assert.equal(lock.length, 1);
  assert.equal(lock[0].versionNumber, '1.9');
  assert.equal(lock[0].filename, 'a19.jar');
  assert.equal(lock[0].sha512, 's512-a19');
});

test('allowUnstable picks newest of any type', async () => {
  const fetch = fakeFetch({ a: { id: 'A', client_side: 'required', server_side: 'required', versions: [
    ver('a19', '1.9', 'release', '2026-01-01'), ver('a20', '2.0', 'beta', '2026-02-01'),
  ] } });
  const lock = await resolveMods(base([{ slug: 'a', allowUnstable: true }]), { fetch });
  assert.equal(lock[0].versionNumber, '2.0');
});

test('fails naming the mod when no 26.1.2 version', async () => {
  const fetch = fakeFetch({ ghost: { id: 'G', client_side: 'required', server_side: 'required', versions: [] } });
  await assert.rejects(resolveMods(base([{ slug: 'ghost' }]), { fetch }), /ghost/);
});

test('fails when only unstable and not allowed', async () => {
  const fetch = fakeFetch({ wip: { id: 'W', client_side: 'required', server_side: 'required', versions: [
    ver('w1', '0.1', 'alpha', '2026-01-01'),
  ] } });
  await assert.rejects(resolveMods(base([{ slug: 'wip' }]), { fetch }), (e) => /wip/.test(e.message) && /inestable/.test(e.message));
});

test('resolves required dependencies once', async () => {
  const dep = { project_id: 'FAPI', dependency_type: 'required' };
  const fetch = fakeFetch({
    a: { id: 'A', client_side: 'required', server_side: 'required', versions: [ver('a1', '1', 'release', '2026-01-01', [dep, { project_id: 'OPT', dependency_type: 'optional' }])] },
    b: { id: 'B', client_side: 'required', server_side: 'required', versions: [ver('b1', '1', 'release', '2026-01-01', [dep])] },
    'fabric-api': { id: 'FAPI', client_side: 'required', server_side: 'required', versions: [ver('f1', '1', 'release', '2026-01-01')] },
  });
  const lock = await resolveMods(base([{ slug: 'a' }, { slug: 'b' }]), { fetch });
  const fapi = lock.filter((e) => e.slug === 'fabric-api');
  assert.equal(fapi.length, 1);
  assert.equal(fapi[0].dependencyOf, 'a');
  assert.equal(lock.length, 3);
});

test('missing dependency error names the mod that needs it', async () => {
  const fetch = fakeFetch({
    a: { id: 'A', client_side: 'required', server_side: 'required', versions: [ver('a1', '1', 'release', '2026-01-01', [{ project_id: 'X', dependency_type: 'required' }])] },
    xlib: { id: 'X', client_side: 'required', server_side: 'required', versions: [] },
  });
  await assert.rejects(resolveMods(base([{ slug: 'a' }]), { fetch }), (e) => /xlib/.test(e.message) && /dependencia de "a"/.test(e.message));
});

test('dependency with only unstable versions falls back to newest', async () => {
  const fetch = fakeFetch({
    a: { id: 'A', client_side: 'required', server_side: 'required', versions: [ver('a1', '1', 'release', '2026-01-01', [{ project_id: 'L', dependency_type: 'required' }])] },
    lib: { id: 'L', client_side: 'required', server_side: 'required', versions: [ver('l1', '0.1', 'beta', '2026-01-01'), ver('l2', '0.2', 'beta', '2026-02-01')] },
  });
  const lock = await resolveMods(base([{ slug: 'a' }]), { fetch });
  assert.equal(lock.find((e) => e.slug === 'lib').versionNumber, '0.2');
});

test('dependency inherits required from the mod that needs it', async () => {
  const fetch = fakeFetch({
    g: { id: 'G', client_side: 'required', server_side: 'required', versions: [ver('g1', '1', 'release', '2026-01-01', [{ project_id: 'GL', dependency_type: 'required' }])] },
    z: { id: 'Z', client_side: 'required', server_side: 'unsupported', versions: [ver('z1', '1', 'release', '2026-01-01', [{ project_id: 'Y', dependency_type: 'required' }])] },
    geckolib: { id: 'GL', client_side: 'required', server_side: 'optional', versions: [ver('gl1', '1', 'release', '2026-01-01')] },
    yacl: { id: 'Y', client_side: 'optional', server_side: 'optional', versions: [ver('y1', '1', 'release', '2026-01-01')] },
  });
  const lock = await resolveMods(base([{ slug: 'g' }, { slug: 'z', side: 'client' }]), { fetch });
  assert.deepEqual(lock.find((e) => e.slug === 'geckolib').env, { client: 'required', server: 'required' });
  assert.deepEqual(lock.find((e) => e.slug === 'yacl').env, { client: 'required', server: 'unsupported' });
});

test('required dependency goes wherever its mod goes, even if Modrinth marks it unsupported there', async () => {
  // Real case: Terralith (client optional) requires lithostitched (client_side "unsupported" on Modrinth),
  // and Fabric refuses to start the client without it.
  const fetch = fakeFetch({
    terralith: { id: 'T', client_side: 'optional', server_side: 'required', versions: [ver('t1', '1', 'release', '2026-01-01', [{ project_id: 'L', dependency_type: 'required' }])] },
    lithostitched: { id: 'L', client_side: 'unsupported', server_side: 'required', versions: [ver('l1', '1', 'release', '2026-01-01')] },
  });
  const lock = await resolveMods(base([{ slug: 'terralith' }]), { fetch });
  assert.deepEqual(lock.find((e) => e.slug === 'lithostitched').env, { client: 'optional', server: 'required' });
});

test('dependencies of other loaders are ignored', async () => {
  const fetch = fakeFetch({
    a: { id: 'A', client_side: 'required', server_side: 'required', versions: [ver('a1', '1', 'release', '2026-01-01', [{ project_id: 'KF', dependency_type: 'required' }])] },
    'kotlin-lang-forge': { id: 'KF', client_side: 'required', server_side: 'required', loaders: ['forge', 'neoforge'], versions: [] },
  });
  const lock = await resolveMods(base([{ slug: 'a' }]), { fetch });
  assert.deepEqual(lock.map((e) => e.slug), ['a']);
});

test('dependency already listed explicitly is not duplicated', async () => {
  const fetch = fakeFetch({
    a: { id: 'A', client_side: 'required', server_side: 'required', versions: [ver('a1', '1', 'release', '2026-01-01', [{ project_id: 'FAPI', dependency_type: 'required' }])] },
    'fabric-api': { id: 'FAPI', client_side: 'required', server_side: 'required', versions: [ver('f1', '1', 'release', '2026-01-01')] },
  });
  const lock = await resolveMods(base([{ slug: 'fabric-api' }, { slug: 'a' }]), { fetch });
  assert.equal(lock.filter((e) => e.slug === 'fabric-api').length, 1);
});

test('env comes from project client_side/server_side, side override wins', async () => {
  const fetch = fakeFetch({
    s: { id: 'S', client_side: 'optional', server_side: 'required', versions: [ver('s1', '1', 'release', '2026-01-01')] },
    n: { id: 'N', client_side: 'optional', server_side: 'required', versions: [ver('n1', '1', 'release', '2026-01-01')] },
  });
  const lock = await resolveMods(base([{ slug: 's', side: 'server' }, { slug: 'n' }]), { fetch });
  assert.deepEqual(lock.find((e) => e.slug === 's').env, { client: 'unsupported', server: 'required' });
  assert.deepEqual(lock.find((e) => e.slug === 'n').env, { client: 'optional', server: 'required' });
});
