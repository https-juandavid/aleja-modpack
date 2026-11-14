# Crear el actualizador de mods con Claude (una sola vez)

Copia el bloque de abajo y pégaselo a Claude (Claude Code o la app de escritorio con acceso a archivos) en tu PC con Windows. Claude te crea un script con un acceso directo en el escritorio. Desde ese momento, cada vez que tu pareja te diga que hay versión nueva del modpack, das **doble clic** al acceso directo y se actualiza solo: baja únicamente los mods nuevos o los que cambiaron y deja tal cual los que ya tienes.

Requisito: tener ya creada en SKLauncher la instancia **Fabric 26.1.2** (por ejemplo "Aleja Adventures") y haberla abierto una vez.

---

```text
Hola Claude. Quiero que me crees en mi PC (Windows) un script para mantener actualizados los mods del modpack "Aleja Aventura" (Minecraft 26.1.2, Fabric) en mi SKLauncher. NO quiero que instales los mods tú a mano: quiero un script reutilizable que yo ejecute con doble clic cada vez que haya versión nueva. Pregúntame antes de crear o cambiar cualquier archivo.

Datos fijos:
- Pack (formato Modrinth .mrpack, es un zip con modrinth.index.json dentro): https://raw.githubusercontent.com/https-juandavid/aleja-modpack/main/dist/aleja.mrpack
- Repositorio público del pack: https://github.com/https-juandavid/aleja-modpack
- Versión publicada en este momento: 1.4.0

Qué debe hacer el script (PowerShell compatible con Windows PowerShell 5.1, sin módulos externos):

1. Encontrar la instancia de SKLauncher sin suponerla:
   - SKLauncher 4: leer %APPDATA%\.sklauncher\instances.json y quedarse con las instancias cuyo "gameType" sea "fabric" y "minecraftVersion" sea "26.1.2"; la carpeta está en su campo "directory".
   - SKLauncher 3 (si no hay la anterior): el campo "gameDir" de los perfiles en %APPDATA%\.minecraft\launcher_profiles.json cuyo "lastVersionId" contenga "26.1.2" y "fabric".
   - Si hay una sola, usarla. Si hay varias, preferir la que ya tenga mods\.aleja-version; si sigue habiendo varias, mostrarme la lista numerada y preguntarme cuál.
   - Si no hay ninguna, explicarme que cree en SKLauncher una instancia Fabric 26.1.2 (y la abra una vez) y terminar sin hacer nada.
   - Comprobar que el Fabric Loader de la instancia ("loaderVersion" en SKLauncher 4) sea igual o mayor que dependencies["fabric-loader"] del pack; si es menor, avisarme y terminar.

2. Descargar el pack de la URL de arriba a una carpeta temporal NUEVA y leer modrinth.index.json. Si mods\.aleja-version ya tiene la misma versión que el pack Y todos los archivos coinciden (paso 3), decirme "Ya estás al día" y terminar.

3. Calcular qué cambia, comparando por SHA-512 (Get-FileHash -Algorithm SHA512) y no por nombre:
   - Deseados: las entradas de "files" cuyo env.client NO sea "unsupported" (las "unsupported" son solo del servidor y no se instalan).
   - Un .jar de la carpeta mods cuyo hash coincide con un deseado: se queda (no se vuelve a descargar).
   - Un deseado que no está (o cuyo hash no coincide): hay que descargarlo.
   - Un .jar de mods que no corresponde a ningún deseado (versión vieja o mod que se quitó del pack): se mueve a una carpeta mods-respaldo-AAAAMMDD-HHMM dentro de la instancia. NUNCA se borra nada.
   - Mostrarme un resumen (se quedan N, se descargan N, se mueven a respaldo N, con nombres) antes de cambiar nada.

4. Descargar SOLO los que faltan a la carpeta temporal:
   - Únicamente desde URLs que empiecen por https://cdn.modrinth.com/; si alguna no, detenerse sin tocar la carpeta mods.
   - Verificar el SHA-512 de cada uno contra hashes.sha512; si alguno no coincide, detenerse sin tocar la carpeta mods.

5. Solo cuando todo lo descargado esté verificado: mover a respaldo los que sobran, copiar los nuevos a mods y escribir la versión del pack en mods\.aleja-version.

6. Al terminar, mostrar el resumen final (versión instalada, qué se agregó, qué se movió a respaldo) y esperar a que pulse una tecla antes de cerrar la ventana. Si SKLauncher está abierto, recordarme cerrarlo y volverlo a abrir.

Reglas del script: no ejecutar nunca ningún archivo descargado (.jar ni otro); usar TLS 1.2 para las descargas; escribir mensajes en español claro; si algo falla, explicar qué pasó y dejar la carpeta mods como estaba.

Dónde ponerlo:
- Guárdalo en %USERPROFILE%\aleja-modpack\actualizar-mods.ps1, junto con un actualizar-mods.bat que lo ejecute con: powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0actualizar-mods.ps1"
- Crea en mi escritorio un acceso directo "Actualizar mods Aleja" que apunte al .bat.

Cuando lo tengas, muéstrame el script completo y explícame en pocas palabras qué hace, y luego ejecútalo una vez conmigo para comprobar que funciona.
```

---

## Uso diario (para ti)

1. Tu pareja te avisa que hay versión nueva (o la ves en su panel).
2. Cierra SKLauncher y da doble clic a **"Actualizar mods Aleja"** en el escritorio.
3. Revisa el resumen y abre SKLauncher.

Si prefieres que Claude te lo haga todo directamente sin script, usa [INSTALAR-CON-CLAUDE.md](INSTALAR-CON-CLAUDE.md).
