const API = 'https://api.modrinth.com/v2';
const HEADERS = { 'User-Agent': 'aleja-modpack-builder/1.0' };
const RANK = { unsupported: 0, optional: 1, required: 2 };

async function getJson(fetch, url, what) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`Modrinth respondió ${res.status} al pedir ${what}`);
  return res.json();
}

function envFor(project, side) {
  if (side === 'server') return { client: 'unsupported', server: 'required' };
  if (side === 'client') return { client: 'required', server: 'unsupported' };
  if (side === 'both') return { client: 'required', server: 'required' };
  return { client: project.client_side ?? 'required', server: project.server_side ?? 'required' };
}

// A required dependency goes exactly where the mod needing it goes. Its own Modrinth side metadata is
// ignored: Fabric refuses to start if a mod's required dependency is missing (e.g. Terralith → lithostitched).
function restrict(_env, parentEnv) {
  return { client: parentEnv.client, server: parentEnv.server };
}

function widen(a, b) {
  return {
    client: RANK[a.client] >= RANK[b.client] ? a.client : b.client,
    server: RANK[a.server] >= RANK[b.server] ? a.server : b.server,
  };
}

// isDependency: a lib required by a chosen mod; prefer a release but accept whatever its author ships.
function pickVersion(slug, versions, allowUnstable, isDependency) {
  if (!versions.length) throw new Error(`El mod "${slug}" no tiene versión de Fabric para 26.1.2`);
  const sorted = [...versions].sort((a, b) => b.date_published.localeCompare(a.date_published));
  const release = sorted.find((v) => v.version_type === 'release');
  const chosen = allowUnstable ? sorted[0] : (release ?? (isDependency ? sorted[0] : undefined));
  if (!chosen) throw new Error(`El mod "${slug}" solo tiene versiones inestables para 26.1.2 (marca allowUnstable si es intencional)`);
  return chosen;
}

export async function resolveMods(modsJson, { fetch = globalThis.fetch } = {}) {
  const mc = modsJson.minecraft;
  const query = `loaders=${encodeURIComponent('["fabric"]')}&game_versions=${encodeURIComponent(`["${mc}"]`)}`;
  const byProject = new Map(); // projectId -> entry
  const queue = modsJson.mods.map((m) => ({ ...m, ref: m.slug }));

  while (queue.length) {
    const item = queue.shift();
    const project = await getJson(fetch, `${API}/project/${encodeURIComponent(item.ref)}`, `el proyecto ${item.ref}`);
    // Multi-loader files list dependencies for every loader; skip the non-Fabric ones.
    if (item.dependencyOf && Array.isArray(project.loaders) && !project.loaders.includes('fabric')) continue;
    let env = envFor(project, item.side);
    if (item.parentEnv) env = restrict(env, item.parentEnv);

    const existing = byProject.get(project.id);
    if (existing) {
      existing.env = widen(existing.env, env);
      if (!item.dependencyOf) delete existing.dependencyOf;
      continue;
    }

    const versions = await getJson(fetch, `${API}/project/${encodeURIComponent(item.ref)}/version?${query}`, `las versiones de ${project.slug}`);
    let v;
    try {
      v = pickVersion(project.slug, versions, item.allowUnstable, Boolean(item.dependencyOf));
    } catch (e) {
      if (item.dependencyOf) e.message += ` (dependencia de "${item.dependencyOf}")`;
      throw e;
    }
    const file = v.files.find((f) => f.primary) ?? v.files[0];
    const entry = {
      slug: project.slug, projectId: project.id, versionId: v.id, versionNumber: v.version_number,
      filename: file.filename, url: file.url, sha1: file.hashes.sha1, sha512: file.hashes.sha512, size: file.size, env,
    };
    if (item.dependencyOf) entry.dependencyOf = item.dependencyOf;
    byProject.set(project.id, entry);

    for (const d of v.dependencies ?? []) {
      if (d.dependency_type !== 'required' || !d.project_id) continue;
      queue.push({ ref: d.project_id, dependencyOf: project.slug, parentEnv: env });
    }
  }
  return [...byProject.values()];
}
