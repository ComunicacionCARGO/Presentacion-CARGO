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
- Ícono de la pestaña: `img/marca/favicon.png` (32×32, "C" stencil sobre círculo crema). Cada página nueva lleva su `<link rel="icon">` (ya está en `slides/ejemplo`).

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
| `datos/distribucion.xlsx` → `distribucion.js` | Mapa de distribución (se edita en Excel y se convierte con el .bat) |
| `datos/estructura.js` | Áreas de "Nuestra estructura" (red de burbujas y tarjetas) |
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
   - Marcador: el punto rojo se apaga y el blanco se achica a 34 px → se desliza → crece y vuelve el rojo (WAAPI, se puede interrumpir). El tallo nace en el centro del círculo y va detrás (primero en el DOM), así nunca se ve cortado.
   - Avance automático cada `segundosPorAnio` (12 s) si nadie la toca mientras está en pantalla; mover el mouse, clic o flechas reinicia la cuenta.
   - Imagen del año: ilustraciones estilo grabado (`grabados.js`, SVG con tramas). Las fotos reales se convierten en grabado con el filtro `#gr-foto`.
4. **Números y mapa**:
   - Los números cuentan animados.
   - El mapa usa contornos reales **estilizados** (`mapa-sudamerica.js`, Natural Earth 50m, generado con `herramientas/extraer-sudamerica.ps1 -Tolerancia 0.3 -AreaMinima 1.5`).
     - Se simplifica **cada tramo de frontera** una vez, así los vecinos siguen encajando.
     - Se descartan las islas chicas.
     - En JS los bordes se dibujan con curvas cuadráticas por los puntos medios, para que no se vea "low poly".
   - Todo el continente es una pieza de vidrio color fondo, sin fronteras visibles. Laterales en sombra, brillo rojo suave alrededor. Argentina y Brasil van en rojo suave y se levantan en rojo intenso, con los lados estirados hasta la base.
   - Las sedes aparecen como alfileres con tarjetas de vidrio y una línea punteada.
   - **Rendimiento:**
     - Las capas fijas del mapa se pintan **una sola vez** en canvas (SVG → imagen → canvas).
     - Las capas de cada país ocupan solo el recuadro del país.
     - Solo los lados del país levantado se repintan, y solo mientras sube o baja.
     - No volver a SVG en vivo con filtros ni a contornos de alto detalle: trababan la aparición del mapa.

5. **Logros** (cierre):
   - Video de fondo `img/slides/quienes-somos/logros.mp4` (1920×1080, 10,5 s). Su borde de arriba es exactamente `#FFFBF3`, por eso empalma sin costura con el mapa.
   - Cubre todo el ancho de la ventana aunque sea más ancha que 16:9 (`.logros-video` usa `100vw / var(--escala)`) y llega hasta el borde de abajo.
   - El video ya viene preparado para loopear: un solo `<video loop>`, sin fundidos extra. Solo se reproduce cerca de la pantalla.
   - Íconos: cada tarjeta acepta `imagen` (SVG propio en `img/logros/`); si falta, usa el `icono` incluido.
   - Botón rojo "Volver" centrado debajo de las tarjetas (`.logros-volver`, va a la portada con la cortina).
   - Tarjetas de vidrio planas con `backdrop-filter` (acá sí, no son curvas). Flotan con `translate` en `.logro`; la inclinación 3D va en `transform` de `.logro-vidrio`. No poner `opacity` ni filtros en ancestros de las tarjetas: cortan el desenfoque.
   - El texto de cada tarjeta se achica solo (`--t`) si no entra; lo mismo los hitos de la línea de tiempo.

### "Servicio a medida" (`slides/servicio-a-medida/`)

Mapa interactivo de distribución de Argentina (carta 2). Por ahora una sola sección dentro de una `.pista`; lo que venga antes (carátula, servicio de distribución) se agrega como secciones arriba.

- **Datos editables en Excel**: `datos/distribucion.xlsx` → doble clic en `datos/Actualizar mapa de distribucion.bat` → `herramientas/excel-a-datos.ps1` reescribe `datos/distribucion.js` (`window.DISTRIBUCION`). No usa Excel instalado: lee el .xlsx como zip (soporta inlineStr y sharedStrings, coma o punto decimal, avisa errores). `herramientas/datos-a-excel.ps1` hace lo inverso (crea el Excel desde el JS, con listas desplegables). Funciones comunes en `comun-excel.ps1` (los textos con acentos van con códigos `#a`, `#o`… por ser scripts ASCII).
- **Contornos**: `mapa-argentina.js`, generado con `herramientas/extraer-argentina.ps1` desde Natural Earth 10m admin-1 (`ne_10m_admin_1_states_provinces.geojson`, -Tolerancia 0.06 -AreaMinima 0.08). Arma una topología propia: corta cada anillo en tramos entre puntos de unión y simplifica cada tramo una sola vez. CABA queda cubierta por Buenos Aires. Sin Malvinas (como las referencias).
- **Mapa**: misma técnica que el de "¿Quiénes somos?" (lienzos pintados una vez al doble de resolución, cara de vidrio con blancos apenas distintos por provincia, halo rojo). W = 405, `rotateX(30deg) rotateZ(-4deg)`, perspectiva 2000 con origen 50% 70% (así entra entera, con Tierra del Fuego).
  - Zonas: SVG sin filtros con el color de cada región (opacidad .6); al pasar por una región del panel, las demás se apagan.
  - Provincia elegida: sube en rojo (lados y cara creados la primera vez) y quedan solo las rutas que salen o llegan.
  - Red: SVG con `translateZ(1px)`; rutas curvas con degradé, flecha (`marker`) y flujo animado (`stroke-dashoffset`). Los extremos suben con la provincia.
  - Bases: solo el ícono, HTML parado (contra-rotación `rotateZ(4deg) rotateX(-30deg)`); el nombre aparece en la etiqueta al pasar el cursor. Solo el `svg` recibe el cursor (el contenedor tiene `pointer-events: none`), así el área sensible es la del dibujo.
- **Panel derecho**: capas (Red propia, Redespachantes, Zonas), barras de lead time sobre escala 0–144 h y detalle de provincia. Esc deselecciona antes de volver a la portada (listener en captura).
- Todas las rutas se dibujan a la vez (sin escalonar), a los 0,8 s.
- **Invitación a interactuar**: ondas que laten en el piso bajo cada base; una mano que "toca" al sudoeste de la base con más rutas (desaparece al pasar por una provincia o usar un filtro); y un recorrido automático tras 15 s sin uso (`SEGUNDOS_SIN_USO`), que elige cada provincia con bases durante 5 s (`SEGUNDOS_POR_PROVINCIA`) y una pausa con todo el país. Cualquier movimiento del mouse, clic, rueda o tecla lo detiene. `seleccionar(k, auto)` distingue lo que elige el recorrido.

### "Nuestra estructura" (`slides/nuestra-estructura/`, carta 3)

Red de áreas: datos en `datos/estructura.js` (`window.ESTRUCTURA`, 18 áreas tomadas de las capturas de la persona). Una sola sección dentro de una `.pista`.

- **Ubicación**: anillos elípticos por `nivel` (0 centro, 1–3 hacia afuera; tamaños 164/122/98/80 px), en el orden de la lista; después 500 pasadas de separación (círculo + nombre) que además las alejan de la zona del título. Funciona aunque se agreguen áreas.
- **Caminos**: cada área se une con la dirección, sus vecinas de anillo y las más cercanas del anillo interior. Misma curva que los caminos de la portada (`C x0+dx*.15,y0+dy*.6 x3-dx*.45,y3-dy*.05`), gris .26 y 0,8 px, con un degradé propio por camino (`userSpaceOnUse` de burbuja a burbuja) que es transparente en el borde de cada burbuja y llega a la opacidad normal en 34 px (`FUNDIDO`), así no las tocan; al resaltar, el degradé pasa a rojo .7. Se recalculan en cada cuadro con la posición flotante de cada burbuja, así siempre quedan unidos. Mensajes rojos (hasta 16) viajan por los caminos (posición calculada con la Bézier, sin medir el DOM); al pasar el cursor por un área se encienden sus caminos y salen mensajes desde ella.
- **Burbujas**: botones con disco de vidrio (sin `backdrop-filter`, para no cargar el cuadro), ícono incluido rojo (o `imagen` SVG en `img/estructura/`), flotación en JS y paralaje por nivel; el fondo también se mueve. Al pasar el cursor crecen 1,22. Cada 2,6 s late una burbuja al azar; la del centro late siempre.
- **Escenas fijas + pista vacía**: las secciones están en `.escenas` (no se desplazan); la `.pista` solo tiene un espacio de 1800 px para que `desplazamiento.js` dé el recorrido (0–900). El scroll maneja la transición.
- **"¿Por qué elegirnos?"** (después de la transición): textos en `elegirnosAntetitulo`, `elegirnosTitulo` y `elegirnos` (4 tarjetas: icono, titulo, texto, datos). Medido del diseño de la persona y comprobado con superposición en diferencia: "¿Por qué" Inter Light 74 px con el glifo en x 441, y 106; "ELEGIRNOS?" Oswald Bold 142 px, `letter-spacing -.007em`, glifo de x 478 a 1163 y de y 181 a 297 (cada texto ubicado por su línea base); tarjetas de 327 × 391 desde x 55, y 391, separadas 51,3 px (el diseño no está centrado: se respetó). El título aparece centrado (`translateY(248px)`) y, 450 ms después de terminar los anillos, la clase `.arriba` lo sube a su lugar y entran las tarjetas (vidrio transparente como el de Logros: crema .2→.06 con `backdrop-filter`, textos en crema; flotación con ritmos distintos, inclinación 3D y reflejo); al volver se quita enseguida. Íconos: los SVG de la persona (claros, #F2F2F2, viewBox 160 con margen) en `img/estructura/elegirnos/` vía `imagen`, agrandados a 78 px con margen negativo dentro de una caja de 62 px; el ícono va a la izquierda y el título al lado en dos líneas (`.el-cabeza`, `tituloEnDosLineas`: baja la última palabra junto con su artículo, "Excelencia en / el servicio"); si falta el archivo se usa el ícono incluido. Fondo `img/slides/nuestra-estructura/fondo-elegirnos.jpg` (de "Fondo gris.png", bordes recortados, sobre #3A3A3A) con máscara radial que lo funde con el gris; aparece entre 0,8 y 1 del avance. Íconos redibujados en SVG de las diapositivas originales: sello dentado con tilde, nube con circuitos, dos interruptores, tres personas con flecha (`.hueco` = trazo color tarjeta que separa la flecha de las personas).
- **Transición de anillos**: canvas a toda la ventana (`.anillos`, mismo truco de `100vw / var(--escala)`) que dibuja gris afuera + hueco + anillo rojo + hueco + anillo rojo, con grosor fijo (banda 66, hueco 20, proporción de la referencia 54/16,5; colores exactos #3A3A3A y #EF4529). Los anillos están centrados en la burbuja de la Dirección (su posición flotante de cada cuadro, pasada a píxeles de la ventana) y se redibujan en cada cuadro mientras dura la transición, así la siguen. El radio va de la esquina más lejana hasta pasado ese centro, lineal con el avance (scroll/900); el anillo rojo de adelante termina como un punto que se cierra. Va en **2 pasos** (`PASOS`, 450 px cada uno): la diapositiva toma la rueda (captura + `stopImmediatePropagation`) y **nunca hace esperar**: cada muesca de la rueda (|deltaY| ≥ 50) suma un paso al destino en el momento; el touchpad suma de a `UMBRAL_TOUCHPAD` (120 px) por paso. El movimiento es un resorte críticamente amortiguado (`RIGIDEZ` 7,5 ≈ 1 s, mueve `desplazamiento.ir(y, true)` cuadro a cuadro): si cambia el destino a mitad de camino sigue con su impulso, sin frenar ni volver a arrancar, así dos muescas seguidas pasan los dos pasos de una vez (pedido de la persona: que nadie crea que el scroll se trabó). Flechas, Av/Re Pág y espacio también van de a un paso; Inicio/Fin, al primero/último. Paso 1: diana a mitad de camino alrededor de la Dirección; paso 2: todo gris y el título (aparece entre 0,7 y 1). Con una tarjeta abierta, rueda y teclas de scroll no hacen nada. Con avance 1, el bucle de la red no calcula nada.
- **Tarjeta**: vidrio centrado de alto fijo (1040 × 600, así los botones no se mueven al recorrer las áreas), nace desde la burbuja (`transform-origin` calculado), flechas para recorrer las áreas, Esc la cierra antes de volver a la portada. Textos con `--t` que se achica si no entra.

### Pendientes conocidos

- Quedan diapositivas por diseñar: Nuestro TMS, Tecnología, Ubicación Estratégica (hoy apuntan a `slides/ejemplo`). Servicio a medida tiene solo el mapa de distribución.
- Los puntos del mapa de distribución se interpretaron de capturas: verificarlos con la empresa (sobre todo los destinos propios: Jesús María, Rafaela, Paraná, La Plata).
- Las cartas todavía no tienen portadas (`img/cartas/`, 1200×800).
- Línea de tiempo: el texto de 2020 es provisorio ("Completar…"). En 1994 quizás falta una "y" entre los nombres.
- Las sedes del mapa son estimadas a partir de fuentes públicas: verificarlas con la empresa.
- Mejoras ofrecidas: fuentes locales para funcionar sin internet, logo en SVG.

### Fondos que manda la persona

- Llegan como PNG de Illustrator de 1921×1081 con bordes de 1 px semitransparentes. Se recortan esos bordes y se guardan en JPG (calidad 88) sobre el color de fondo: `img/landing/fondo.jpg` a 1920×1080 sobre `#FFFBF3`, `fondo-45.jpg` a 1921×1081 sobre `#EF4529` (bordes en el rojo exacto, para que no haya costura).

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
