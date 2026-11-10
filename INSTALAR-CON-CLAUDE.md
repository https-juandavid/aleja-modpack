# Instalar el modpack "Aleja Aventura" con Claude

Copia todo el bloque de abajo y pégaselo a Claude (Claude Code o la app de escritorio con acceso a archivos) en tu PC con Windows. Sirve para instalar la primera vez **y** para actualizar cuando cambien los mods.

---

```text
Hola Claude. Quiero que instales en mi PC (Windows) los mods del modpack "Aleja Aventura", versión 1.0.0, para Minecraft 26.1.2 con Fabric. Uso SKLauncher. Trabaja paso a paso y pregúntame antes de escribir o borrar cualquier cosa.

Datos del modpack:
- Repositorio público: https://github.com/https-juandavid/aleja-modpack
- Archivo del pack dentro del repo: dist/aleja.mrpack
- Descarga directa (si no hay git): https://raw.githubusercontent.com/https-juandavid/aleja-modpack/main/dist/aleja.mrpack

Pasos:

1. Encuentra la carpeta de juego que usa MI SKLauncher. No la supongas: revisa %APPDATA%\.minecraft, la configuración de SKLauncher que haya dentro de esa carpeta y el campo "gameDir" de cada perfil en launcher_profiles.json (y cualquier otro archivo de perfiles de SKLauncher que encuentres). Muéstrame qué carpeta(s) encontraste y qué perfil la usa, y espera a que yo confirme cuál es antes de seguir. La carpeta de mods será <esa carpeta>\mods.

2. Revisa si tengo instalada una versión de Fabric para Minecraft 26.1.2 (busca en <carpeta de juego>\versions algo como "fabric-loader-...-26.1.2"). Si no está, guíame para instalarla desde el propio SKLauncher (en la lista de versiones, elegir Fabric y Minecraft 26.1.2) y espera a que te diga que ya lo hice.

3. Consigue el pack:
   - Si tengo git: clona https://github.com/https-juandavid/aleja-modpack.git en %USERPROFILE%\aleja-modpack, o si esa carpeta ya existe, haz "git pull" dentro de ella.
   - Si no tengo git: descarga https://raw.githubusercontent.com/https-juandavid/aleja-modpack/main/dist/aleja.mrpack.
   Descomprime dist/aleja.mrpack (es un zip) en una carpeta temporal NUEVA y lee el archivo modrinth.index.json.

4. Descarga los mods a esa carpeta temporal (todavía no toques mi carpeta mods). Para cada entrada de "files" cuyo env.client NO sea "unsupported":
   - Descárgala solo si la URL empieza por https://cdn.modrinth.com/ (si alguna no, detente y avísame).
   - Calcula su SHA-512 y compáralo con hashes.sha512. Si alguno no coincide, detente y avísame: mi carpeta mods debe quedar como estaba.
   Las entradas con env.client "unsupported" son solo del servidor: no las instales.

5. Solo cuando TODOS los archivos estén descargados y verificados: si ya existe la carpeta mods, renómbrala a mods-respaldo-AAAAMMDD-HHMM (con la fecha y hora actuales; no borres nada), crea una carpeta mods nueva, copia ahí los .jar verificados y crea el archivo mods\.aleja-version con el texto 1.0.0.

6. Dime qué instalaste (lista de archivos), la versión del pack que quedó (1.0.0) y si hubo algún problema.

Reglas: no ejecutes ningún archivo descargado (.jar, .exe, scripts); solo descárgalos, verifícalos y cópialos. No toques nada fuera de la carpeta de juego, la carpeta temporal y %USERPROFILE%\aleja-modpack.
```

---

## Después de instalar (para ti, no para Claude)

1. En SKLauncher elige el perfil o versión **Fabric 26.1.2**.
2. Dale **6 GB de RAM** en los ajustes de SKLauncher.
3. Entra al servidor con la dirección que te pase tu pareja. También te pasa la **contraseña global** (no está en este repo porque es público).
   - La primera vez: `/register <contraseña-global> <tu-clave> <tu-clave>`
   - Las siguientes: `/login <tu-clave>`
4. Zoom: mantén presionada la tecla **C**.
