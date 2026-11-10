const PENDING = 'PENDIENTE: publicar el repo del modpack en GitHub';

export const mrpackUrl = (publicRepo) => `https://raw.githubusercontent.com/${publicRepo}/main/dist/aleja.mrpack`;

export function renderPrompt(template, { version, publicRepo }) {
  return template
    .replaceAll('{{VERSION}}', version)
    .replaceAll('{{PUBLIC_REPO}}', publicRepo ?? PENDING)
    .replaceAll('{{MRPACK_URL}}', publicRepo ? mrpackUrl(publicRepo) : PENDING);
}

function sideLabel(env) {
  if (env.client === 'unsupported') return 'servidor';
  if (env.server === 'unsupported') return 'cliente';
  return 'ambos';
}

export function renderModList(lockMods) {
  const rows = lockMods
    .filter((m) => !m.dependencyOf)
    .map((m) => `| ${m.slug} | ${m.versionNumber} | ${sideLabel(m.env)} |`);
  return ['| Mod | Versión | Dónde va |', '|---|---|---|', ...rows].join('\n');
}
