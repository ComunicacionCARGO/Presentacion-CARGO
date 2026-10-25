# Presentación Grupo CARGO — contexto para Claude

Presentación interactiva de **Grupo CARGO** (logística, Argentina y Brasil) para un cliente (**Ford**).
Publicada en GitHub Pages: https://comunicacioncargo.github.io/Presentacion-CARGO/
Repositorio: https://github.com/ComunicacionCARGO/Presentacion-CARGO (público, rama `main`).

## Quién la usa y cómo trabajamos

- La persona diseña las pantallas en **Illustrator** y no programa. Escribe en español rioplatense (voseo): respondé igual, con pasos simples.
- Cuando manda un diseño, la parte fija tiene que quedar **igual** a la imagen. Medí antes de escribir: tamaños, colores y posiciones con `System.Drawing` en PowerShell (escaneo de píxeles), y compará superponiendo la referencia con `mix-blend-mode: difference`.
- Los datos tienen que poder editarlos personas sin conocimientos técnicos. Van en `datos/*.js`, con comentarios en español, y se edita solo lo que está entre comillas. `**texto**` se convierte en negrita.
- Cada cambio que afecte la edición de datos se documenta en `LEEME - Como editar las cartas.txt`.
- Estética: vidrio vivo ("living glass"), cartas flotantes, 3D y animaciones suaves, con detalles brutalistas e industriales (marcas de registro, tipografía condensada, franjas de la marca).

## Restricciones técnicas

- **Sitio estático, sin build.** HTML, CSS y JS puros, sin npm ni frameworks ni librerías externas, salvo Google Fonts.
- **Tiene que funcionar con doble clic** (`file://`): nada de `fetch` para datos. Los datos se cargan con `<script src="datos/...js">` y variables globales (`window.CARTAS`, `window.PORTADA`, `window.QUIENES_SOMOS`).
- **Escenario fijo de 1600×900** (`.escenario`), escalado a la ventana con `--escala` (`compartido/base.js`). Todas las medidas de los diseños están en px de ese escenario.
- Navegador objetivo: Chrome/Edge.
- El sitio es público: no subir datos sensibles del cliente.

## Marca (manual de identidad)

- Rojo principal `#EF4529`, gris oscuro `#3A3A3A`, blanco base `#FFFBF3`. Acentos con moderación: `#F4A127`, `#4C956C`, `#759AAB`.
- Títulos: **Oswald Bold**. Texto: **Inter** (Light, Regular, SemiBold; Light Italic y ExtraLight Italic en frases). El logo usa una tipografía stencil.
- Recursos gráficos: tres franjas paralelas (rojo, rojo, gris) con curvas o en V y una textura de desgaste sutil (`.grano`).
- Íconos: sólidos y rojos, sin círculo de fondo.

## Estructura

| Ruta | Qué es |
|---|---|
| `index.html`, `landing/` | Portada: título "Tu solución en MARCHA", operario, carrusel 3D de cartas, palabras con caminos |
| `slides/<nombre>/` | Una carpeta por diapositiva (`index.html`, `estilo.css`, `diapositiva.js`) |
| `slides/ejemplo/` | Plantilla mínima de diapositiva |
| `compartido/base.css` | Variables de marca, escenario, grano, cortina |
| `compartido/base.js` | Escalado, cortina de franjas al entrar y salir, `irA(url)`, enlaces `data-transicion`, Esc vuelve (`body[data-volver]`), prepara imágenes antes de abrir la cortina |
| `compartido/desplazamiento.js` | Scroll suave virtual para diapositivas largas (`.pista`) |
| `datos/cartas.js` | Textos de la portada, ajustes del carrusel, palabras flotantes, lista de cartas |
| `datos/quienes-somos.js` | Textos, línea de tiempo, números y sedes |
| `img/` | Imágenes (`landing/`, `marca/`, `slides/`, `cartas/`, `linea-de-tiempo/`) |
| `herramientas/` | Scripts para desarrollo (no forman parte del sitio) |

## Piezas importantes (y qué no romper)

### Portada (`landing/landing.js`)

- Cada carta es un **objeto 3D independiente**, sin un `preserve-3d` compartido. Si se comparte, el navegador recorta las cartas entre sí y aparecen cortes en el vidrio. La profundidad respecto del operario se resuelve con `z-index` (el operario tiene 1000).
- Las cartas son **curvas**: 10 franjas sobre el cilindro de la órbita.
  - El vidrio es una capa 2D (copia desenfocada del operario en un canvas) recortada con `clip-path` usando la silueta proyectada. No usar `backdrop-filter` por franja: vuelven las costuras.
  - Borde, brillo y halo en SVG.
  - El contenido se dibuja a resolución `--f` (2× o más) y se reduce.
  - JS replica la proyección 3D: perspectiva 1600, origen (800, 450), centro de órbita (800, 668).
- Cursor sobre una carta: viaja al centro y se levanta. Las cartas que pasan solas bajo el cursor se ignoran hasta que el mouse se mueva. Rueda: gira y se acomoda en la carta más cercana. Teclas: flechas, Enter, 1–9.
- Palabras con caminos: Inter ExtraLight Italic, gris con baja opacidad, líneas de 0,7 px que convergen hacia una elipse alrededor del carrusel, sin tocar las cartas.

### "¿Quiénes somos?" (`slides/quienes-somos/`)

Es una diapositiva larga con scroll. Tiene una capa fija (logo y pregunta) y una `.pista` que se desliza:

1. **Franjas en V** (SVG), medidas del diseño: bandas de 37 px, huecos de 11 px, pendiente 0,413, bordes a 427/464/476/513/525 px en los costados.
2. **45 años**: `fondo-45.jpg` (sus bordes son exactamente `#EF4529`, por eso no hay costura), el camión con paralaje solo vertical y el lema.
3. **Línea de tiempo**, igual al diseño:
   - Línea blanca a 534,5–544,5; línea clara a 579–590; franja gris a 590–625.
   - Puntos de 34 px; marcador de 56 px con borde de 11,5 y tallo hasta 607.
   - Años en Oswald 114 px (activo) o al 60% y opacidad 33% (resto), con `letter-spacing -.04em`. Posiciones: 121 + i·1358/(n−1).
   - Marcador: el punto rojo se apaga y el blanco se achica a 34 px → se desliza → crece y vuelve el rojo (WAAPI, se puede interrumpir).
   - Imagen del año: ilustraciones estilo grabado (`grabados.js`, SVG con tramas). Las fotos reales se convierten en grabado con el filtro `#gr-foto`.
4. **Números y mapa**:
   - Los números cuentan animados.
   - El mapa usa contornos reales (`mapa-sudamerica.js`, Natural Earth 50m, generado con `herramientas/extraer-sudamerica.ps1`).
   - Todo el continente es una pieza de vidrio color fondo, sin fronteras visibles. Laterales en sombra, brillo rojo suave alrededor. Argentina y Brasil van en rojo suave y se levantan en rojo intenso, con los lados estirados hasta la base.
   - Las sedes aparecen como alfileres con tarjetas de vidrio y una línea punteada.
   - **Rendimiento:** las capas fijas del mapa se pintan **una sola vez** en canvas (SVG → imagen → canvas). Solo los lados del país levantado se repintan, y solo mientras sube o baja. No volver a SVG en vivo con filtros: trababa la aparición del mapa.

### Pendientes conocidos

- Quedan diapositivas por diseñar: Cobertura, Almacenamiento, Transporte, Tecnología, Indicadores (hoy apuntan a `slides/ejemplo`).
- Las cartas todavía no tienen portadas (`img/cartas/`, 1200×800).
- Línea de tiempo: el texto de 2020 es provisorio ("Completar…"). En 1994 quizás falta una "y" entre los nombres.
- Las sedes del mapa son estimadas a partir de fuentes públicas: verificarlas con la empresa.
- Mejoras ofrecidas: fuentes locales para funcionar sin internet, logo en SVG, fondo de la portada en alta resolución.

## Verificar cambios

- **Servidor local para previsualizar:**
  `powershell -ExecutionPolicy Bypass -File herramientas\servidor-local.ps1 -Root <carpeta del proyecto> -Port 5500`
  (en segundo plano). Después abrí `http://localhost:5500/` en el navegador integrado con el viewport en 1600×900.
- En una diapositiva larga se puede saltar a una sección con `desplazamiento.ir(y, true)` desde la consola.
- **Ojo con el navegador integrado oculto:**
  - No dibuja cuadros: `requestAnimationFrame` se detiene y `img.decode()` no termina hasta que se toma una captura. Las capturas pueden mostrar cuadros atrasados.
  - Para medir animaciones, registrá valores con JS (por ejemplo, una traza de `getComputedStyle` en cada cuadro). Para rendimiento, usá `PerformanceObserver` con `longtask`.

## Git y publicación

- No hay `git` en el PATH: usar el que trae GitHub Desktop, en `%LOCALAPPDATA%\GitHubDesktop\app-*\resources\app\git\cmd\git.exe`.
- Commits en español, describiendo el cambio. Subir con `git push origin main`. GitHub Pages se actualiza en 1–2 minutos (recargar con Ctrl+F5).
- La primera vez en cada computadora, el push abre la ventana "Connect to GitHub" (Git Credential Manager): la persona inicia sesión una vez con la cuenta ComunicacionCARGO.
- PowerShell 5.1: los scripts `.ps1` con caracteres no ASCII fuera de comentarios fallan (los lee como ANSI). Los avisos de LF/CRLF de git son normales.
