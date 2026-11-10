# Instalar el modpack "Aleja Aventura" con Claude

Copia todo el bloque de abajo y pégaselo a Claude (Claude Code o la app de escritorio con acceso a archivos) en tu PC con Windows. Sirve para instalar la primera vez **y** para actualizar cuando cambien los mods.

---

```text
Hola Claude. Quiero que instales en mi PC (Windows) los mods del modpack "Aleja Aventura", versión 1.0.0, para Minecraft 26.1.2 con Fabric. Uso SKLauncher. Trabaja paso a paso y pregúntame antes de escribir o borrar cualquier cosa.

Datos del modpack:
- Repositorio público: https://github.com/PENDIENTE: publicar el repo del modpack en GitHub
- Archivo del pack dentro del repo: dist/aleja.mrpack
- Descarga directa (si no hay git): PENDIENTE: publicar el repo del modpack en GitHub

Pasos:

1. Encuentra la carpeta de juego que usa MI SKLauncher. No la supongas: revisa %APPDATA%\.minecraft, la configuración de SKLauncher que haya dentro de esa carpeta y el campo "gameDir" de cada perfil en launcher_profiles.json (y cualquier otro archivo de perfiles de SKLauncher que encuentres). Muéstrame qué carpeta(s) encontraste y qué perfil la usa, y espera a que yo confirme cuál es antes de seguir. La carpeta de mods será <esa carpeta>\mods.

2. Revisa si tengo instalada una versión de Fabric para Minecraft 26.1.2 (busca en <carpeta de juego>\versions algo como "fabric-loader-...-26.1.2"). Si no está, guíame para instalarla desde el propio SKLauncher (en la lista de versiones, elegir Fabric y Minecraft 26.1.2) y espera a que te diga que ya lo hice.

3. Si ya existe la carpeta mods, renómbrala a mods-respaldo-AAAAMMDD-HHMM (con la fecha y hora actuales) y crea una carpeta mods vacía. No borres nada.

4. Consigue el pack:
   - Si tengo git: clona https://github.com/PENDIENTE: publicar el repo del modpack en GitHub.git en %USERPROFILE%\aleja-modpack, o si esa carpeta ya existe, haz "git pull" dentro de ella.
   - Si no tengo git: descarga PENDIENTE: publicar el repo del modpack en GitHub.
   Descomprime dist/aleja.mrpack (es un zip) en una carpeta temporal NUEVA y lee el archivo modrinth.index.json.

5. Para cada entrada de "files" cuyo env.client NO sea "unsupported":
   - Descárgala solo si la URL empieza por https://cdn.modrinth.com/ (si alguna no, detente y avísame).
   - Calcula su SHA-512 y compáralo con hashes.sha512. Si alguno no coincide, detente sin copiar nada y avísame.
   Las entradas con env.client "unsupported" son solo del servidor: no las instales.

6. Cuando todas estén verificadas, copia los .jar a la carpeta mods y crea el archivo mods\.aleja-version con el texto 1.0.0.

7. Dime qué instalaste (lista de archivos), la versión del pack que quedó (1.0.0) y si hubo algún problema.

Reglas: no ejecutes ningún archivo descargado (.jar, .exe, scripts); solo descárgalos, verifícalos y cópialos. No toques nada fuera de la carpeta de juego, la carpeta temporal y %USERPROFILE%\aleja-modpack.
```

---

## Después de instalar (para ti, no para Claude)

1. En SKLauncher elige el perfil o versión **Fabric 26.1.2**.
2. Dale **6 GB de RAM** en los ajustes de SKLauncher.
3. Entra al servidor con la dirección que te pase tu pareja. La primera vez escribe `/register <tu-clave> <tu-clave>`, y las siguientes `/login <tu-clave>`.
4. Zoom: mantén presionada la tecla **C**.
