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
| `datos/mejora-continua.js` | "Mejora continua": pantalla partida y temas Calidad / Capacitaciones (`window.MEJORA`) |
| `datos/rse.js` | RSE: tablero "Hacia un impacto CERO" (8 palancas), números (reciclaje y huella de carbono) y comunidad con aliados (`window.RSE`) |
| `img/` | Imágenes (`landing/`, `marca/`, `slides/`, `cartas/`, `linea-de-tiempo/`) |
| `herramientas/` | Scripts para desarrollo (no forman parte del sitio) |

## Piezas importantes (y qué no romper)

### Portada (`landing/landing.js`)

- **3 cartas largas que completan el círculo** (radio 310, `HUECO` de 7° entre cartas; el arco y el ancho salen de la cantidad de cartas, así que con más cartas se acortan). Sin un `preserve-3d` compartido: si se comparte, el navegador recorta las cartas entre sí y aparecen cortes en el vidrio.
- Profundidad con `z-index` (el operario tiene 1000). Como una carta larga queda en parte delante y en parte detrás del operario, cada carta tiene **dos partes** (adelante y atrás, cortadas en la franja donde la curva empieza a verse de espaldas: coseno = radio/perspectiva) con sus capas (sombra, vidrio, borde) y su z-index; `.carta` no arma grupo (sin perspective, opacity ni z-index). Cada franja va en su `.tira-caja` (perspectiva 1600, origen 800 450) con el z-index de su parte. No poner `perspective()` dentro del transform de la franja: Chrome deja de detectar el cursor sobre las franjas giradas.
- Las cartas son **curvas**: franjas de unos 17 px (36 por carta con 3 cartas) sobre el cilindro de la órbita.
- **Contenido = ventana a una foto lejana** (diseño de la persona, medido sobre su carta de 668 × 241 y llevado a 174 de alto, en `ROTULO`). La foto **no va en las franjas** (seguiría la curva): es una capa plana (`.vidrio-foto`, 1100 px de ancho) dentro del vidrio de la parte de adelante, recortada con la silueta como el desenfoque del operario. La foto **nunca se desenfoca** (pedido de la persona). Van dos copias que se mueven juntas: `.vf-superponer` (`mix-blend-mode: overlay` con opacidad .7, así parece más vidrio; en reposo se mezcla con el vidrio: el operario desenfocado y el tinte) y encima `.vf-normal` (modo normal, oscurecida .5) cuya opacidad es `act` (1 con el cursor encima o al abrir). Son dos copias porque el modo de fusión no se puede animar. El fondo de la mezcla es el propio `.carta-vidrio` (su canvas y su tinte), que ya es un grupo aislado. `ubicarFoto` la centra en `CENTRO.x + (centro de la carta − 800) × FOTO_ARRASTRE (.35)` y un poco con el mouse, la agranda con `esc` y `adelante` (cursor, apertura) y usa `foco` (0–100) para la altura. En las franjas quedan el número Oswald en rojo translúcido (.66) y el antetítulo Inter Light (el "¿" cuelga a la izquierda) y el título Oswald (con sombra suave), ubicados por su línea base (Oswald .95, Inter .865 con line-height 1). El grupo va centrado y ocupa como mucho el 74 % del ancho (en las puntas la curva lo aplasta); todas las cartas usan el mismo tamaño (el del título más largo). Datos: `antetitulo`, `titulo`, `portada` (en `img/cartas/`), `foco`. El brillo del vidrio es suave (.2) para no lavar la foto.
  - El vidrio es una capa 2D (copia desenfocada del operario en un canvas) recortada con `clip-path` usando la silueta proyectada. No usar `backdrop-filter` por franja: vuelven las costuras.
  - Borde, brillo y halo en SVG.
  - El contenido se dibuja a resolución `--f` (2× o más) y se reduce.
  - JS replica la proyección 3D: perspectiva 1600, origen (800, 450), centro de órbita (800, 668).
- Cursor sobre una carta: viaja al centro y se levanta. Las cartas que pasan solas bajo el cursor se ignoran hasta que el mouse se mueva. Rueda: cada muesca pasa una carta en el momento (se suman); el touchpad gira mientras desliza y al soltar sigue a la carta siguiente en ese sentido (nunca vuelve atrás). Teclas: flechas, Enter, 1–9.
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
- **"¿Por qué elegirnos?"** (después de la transición): textos en `elegirnosAntetitulo`, `elegirnosTitulo` y `elegirnos` (4 tarjetas: icono, titulo, texto, datos). Medido del diseño de la persona y comprobado con superposición en diferencia: "¿Por qué" Inter Light 74 px con el glifo en x 441, y 106; "ELEGIRNOS?" Oswald Bold 142 px, `letter-spacing -.007em`, glifo de x 478 a 1163 y de y 181 a 297 (cada texto ubicado por su línea base); tarjetas de 327 × 391 desde x 55, y 391, separadas 51,3 px (el diseño no está centrado: se respetó). El título aparece centrado (`translateY(248px)`) y, cuando los anillos están por cerrar (avance ≥ 0,97, sin espera: si no, parecía que el scroll se frenaba), la clase `.arriba` lo sube a su lugar (1 s) y entran las tarjetas 0,2 s después (vidrio transparente como el de Logros: crema .2→.06 con `backdrop-filter`, textos en crema; flotación con ritmos distintos, inclinación 3D y reflejo); al volver se quita enseguida. Íconos: los SVG de la persona (claros, #F2F2F2, viewBox 160 con margen) en `img/estructura/elegirnos/` vía `imagen`, agrandados a 78 px con margen negativo dentro de una caja de 62 px; el ícono va a la izquierda y el título al lado en dos líneas (`.el-cabeza`, `tituloEnDosLineas`: baja la última palabra junto con su artículo, "Excelencia en / el servicio"); si falta el archivo se usa el ícono incluido. Fondo `img/slides/nuestra-estructura/fondo-elegirnos.jpg` (de "Fondo gris.png", bordes recortados, sobre #3A3A3A) con máscara radial que lo funde con el gris; aparece entre 0,8 y 1 del avance. Íconos redibujados en SVG de las diapositivas originales: sello dentado con tilde, nube con circuitos, dos interruptores, tres personas con flecha (`.hueco` = trazo color tarjeta que separa la flecha de las personas).
- **Transición de anillos**: canvas a toda la ventana (`.anillos`, mismo truco de `100vw / var(--escala)`) que dibuja gris afuera + hueco + anillo rojo + hueco + anillo rojo, con grosor fijo (banda 66, hueco 20, proporción de la referencia 54/16,5; colores exactos #3A3A3A y #EF4529). Los anillos están centrados en la burbuja de la Dirección (su posición flotante de cada cuadro, pasada a píxeles de la ventana) y se redibujan en cada cuadro mientras dura la transición, así la siguen. El radio va de la esquina más lejana hasta pasado ese centro, lineal con el avance (scroll/900); el anillo rojo de adelante termina como un punto que se cierra. Va en **2 pasos** (`PASOS`, 450 px cada uno): la diapositiva toma la rueda (captura + `stopImmediatePropagation`) y **nunca hace esperar**: cada muesca de la rueda (|deltaY| ≥ 50) suma un paso al destino en el momento; el touchpad suma de a `UMBRAL_TOUCHPAD` (120 px) por paso. El movimiento es un resorte críticamente amortiguado (`RIGIDEZ` 7,5 ≈ 1 s, mueve `desplazamiento.ir(y, true)` cuadro a cuadro): si cambia el destino a mitad de camino sigue con su impulso, sin frenar ni volver a arrancar, así dos muescas seguidas pasan los dos pasos de una vez (pedido de la persona: que nadie crea que el scroll se trabó). Flechas, Av/Re Pág y espacio también van de a un paso; Inicio/Fin, al primero/último. Paso 1: diana a mitad de camino alrededor de la Dirección; paso 2: todo gris y el título (aparece entre 0,7 y 1). Con una tarjeta abierta, rueda y teclas de scroll no hacen nada. Con avance 1, el bucle de la red no calcula nada.
- **Tarjeta**: vidrio centrado de alto fijo (1040 × 600, así los botones no se mueven al recorrer las áreas), nace desde la burbuja (`transform-origin` calculado), flechas para recorrer las áreas, Esc la cierra antes de volver a la portada. Textos con `--t` que se achica si no entra.
- **Dos tramos de scroll** (diapositiva.js): los anillos van por **pasos** (`PARADAS` 0 → 450 → 900); desde "¿Por qué elegirnos?" (900) hasta el final (`MAXIMO` 5500: pantalla partida, "Políticas y Certificaciones" y las tres secciones de RSE) el scroll es **libre, como una web** (pedido de la persona): cada muesca mueve 100 px, el touchpad lo que desliza, flechas 120 px, Av/Re Pág y espacio 760 px, con el mismo resorte pero más ágil (`RIGIDEZ_LIBRE` 13). `enLibre(dir)` decide el tramo; al subir, el scroll libre frena en 900 y el mismo gesto no entra en los anillos (`topeLibre`, se libera con una pausa de 220 ms o cambio de sentido). La `.pista-espacio` mide 6400. Pasado 900, `--bajada` (y − 900) sube juntos `.anillos`, `.seccion-mejora` y `.mc-tramo`. Con un tema abierto (`body.capitulo-abierto`), la rueda y ↑ ↓ mandan `capitulo-paso` en vez de mover el scroll.

### "Mejora continua" (`slides/nuestra-estructura/mejora.js` y `mejora.css`, datos en `datos/mejora-continua.js`)

- **Pantalla partida** (`.mc-elegir`, diseño de la persona medido sobre su imagen de 1921 px = 1600, ×0,8329; comprobado con superposición en diferencia): ya no hay portada "Mejora CONTINUA" (la persona la sacó). Un solo SVG de x −1200 a 2800 (la banda llega a los bordes de cualquier ventana) y y 0 a 1500. La banda va arriba a la izquierda (eje y 80,2), dobla con una curva (radio de eje 98,1), baja en diagonal (pendiente 0,4133, la misma de "¿Quiénes somos?") y vuelve a doblar abajo a la derecha (radio 130,7; eje y 854,8). Capas: línea clara con brillo metálico (degradé `#mc-brillo`) de 90,4 de ancho y encima dos rojas de 34,6 corridas 17,5 y −27,9 hacia el lado gris (así queda: línea clara del lado gris, rojo, hueco claro, rojo). `camino(d, o)` arma el camino corrido "o" px (mismos centros de curva, radios ± o); `d` = x de la diagonal en y 450 (781,6 en reposo, ±220 con el cursor, 3200/−1800 al elegir, barriendo la pantalla). La zona gris (arriba de la banda y a la derecha de la diagonal) continúa el gris de "¿Por qué elegirnos?": el SVG y la zona gris suben 6 px (`SOLAPE`) por encima de la sección para pisarse con ese gris (si no, quedaba una rendija clara de 1 px). Al elegir un tema, las dos fotos se desvanecen (.3 s) mientras la banda barre, así no se ven sus bordes. Lado crema = **Calidad** (izquierda), lado gris = **Capacitaciones** (derecha); el lado se calcula con la posición del cursor (`ladoEn`).
  - Fondos ya preparados (no se difumina ni se mezcla en el navegador): `fondo-calidad.jpg` (foto difuminada sobre crema, opacidad medida fila por fila: .42–.46 arriba, se apaga hasta y 833; hacia la banda se apaga en diagonal, paralelo a la banda: de 278 a 88 px a la izquierda de la línea x = 781,6 − 0,4133·(y − 450), espejo del de Capacitaciones) y `fondo-capacitaciones.jpg` (foto difuminada en modo **aclarar** sobre el gris, al 42 %, oculta arriba de y 190 y aparece de 88 a 278 px a la derecha de esa misma diagonal), a media resolución, cubriendo x −200..1800 y y 0..1000. La de Capacitaciones se recorta con la zona gris (`clipPath`). Se regeneran con `herramientas\fondos-pantalla-partida.ps1` desde `img/slides/nuestra-estructura/originales/` (calidad.webp, capacitaciones.webp). Ojo en PowerShell: `[Math]::Min(1, x)` redondea a entero (usar 1.0); el antivirus bloquea `Add-Type` con C#. El título CALIDAD va en rojo (`.mc-bloque-0 .mc-m-titulo`).
- **Políticas y Certificaciones** (`.mc-poli`, pedido de la persona: salieron del tema Calidad): sección crema de 1000 px dentro de `.mc-tramo` (top 900, debajo de la pantalla partida, el tramo sigue con RSE), con scroll común. Su fondo usa el truco de `100vw` y continúa el crema que queda debajo de la banda, sin cortes. Título rojo Oswald 64 (`politicasCertificacionesTitulo`), selector de políticas (pestañas + cita + directrices) y sellos de certificaciones, sin texto arriba (`certificacionesTexto` vacío), justo debajo de las directrices más largas (`.s-cert` en y 586). Cada política tiene su `color` (Calidad #759AAB, Seguridad #F4A127, Ambiental #4C956C) que va como `--c` en su pestaña, en `.po-detalle` y en el sello con el mismo código (`politicaDe`); entran con `.visible` cuando `bajada` > 1000. El teclado y el hover de la pantalla partida solo actúan con `bajada` entre 800 y 1100.
- **Temas** (`.capitulo`, fondo del color del lado elegido: `tema-claro` para Calidad, `tema-oscuro` para Capacitaciones; la C del isologo en la lupa pasa a crema solo en oscuro): encabezado con franjitas, número y nombre, pestañas con marca roja que se desliza, secciones que se recorren con rueda, flechas, pestañas o botones ‹ ›; Esc (captura) cierra y las franjas vuelven. Calidad: S.C.O.P.E. (acróstico), Objetivos (números calados), Pilares (chevrons + lupa de S.C.O.P.E. en SVG con la C del isologo pasada a crema; el arco rojo gira hacia el pilar). Políticas y Certificaciones ya no están en el tema (ver arriba). Capacitaciones: #Exp Aprende (captura de la plataforma `exp-aprende.jpg`, recortada de la diapositiva original, en una ventana que se inclina con el mouse) y Trabajo en equipo.
### RSE (`slides/nuestra-estructura/rse.js`, `rse-numeros.js`, `rse-comunidad.js` y `rse.css`, datos en `datos/rse.js`)

- Pedido de la persona: resumir sus 9 diapositivas de sustentabilidad de forma interactiva. Tres secciones de 900 px dentro de `.mc-tramo` (que mide 4600), en este orden: el **tablero** "Hacia un impacto CERO" (`.mc-rse`, y 1900), **"Lo que hacemos, EN NÚMEROS"** (`.mc-num`, y 2800, los gráficos "debajo del medidor") y **"Acompañamos a la COMUNIDAD"** (`.mc-com`, y 3700). Cada script calcula sus umbrales con su `offsetTop` (la sección queda entera en pantalla con `bajada` = top + 900).
- **Estética de esta parte** (excepción al manual pedida por la persona): fondo **crema** como el resto: **un solo fondo** para las tres secciones (`.rse-fondo-comun` en `.mc-tramo`, de y 1900 al final, truco de `100vw`, antes que las secciones en el DOM); las secciones no tienen fondo propio, así sombras, resplandores y manchas pasan de una a otra sin cortes (con un fondo por sección quedaban líneas). Encima, una **trama orgánica** como el ejemplo de la persona pero invertida, verde sobre crema (`.rse-trama`; la de íconos de hojas y pinos no le gustó): `dibujarTrama()` en rse.js arma una vez un SVG de 1600 × 1200 que se repite (ondas paralelas en forma de lente, algunas cortadas en trazos; campos de puntos en semitono; filas de rayitas; manchas orgánicas; destellos de cuatro puntas; círculos; puntitos), con azar de semilla fija y todo al .13 de opacidad que aparece con un fundido de 1,6 s cuando `bajada` pasa el top del tablero + 100 (rse.js pone `.visible`) y se funde arriba con una máscara de 420 px y **acento verde** (`--acento: var(--verde)`, `--acento-luz` #5FB383) en lugar del rojo; el rojo queda solo en el camioncito y en "HOY". Vidrio vivo: tarjetas translúcidas (`--vidrio`, `backdrop-filter`) sobre manchas suaves (`.rse-orbes`: degradés radiales verde, ámbar y celeste que derivan con CSS, sin filtros).
- **Títulos**: texto chico arriba (Inter Light 38) y la palabra grande abajo (Oswald 104, `letter-spacing .05em`, verde), en y 84 (no antes: arriba a la izquierda está el botón Volver). Datos: `titulo` (chico) y `tituloGrande`.
- **Tablero**: izquierda, texto y 8 palancas en 2 × 4 (fichas de vidrio claro tipo fader: riel gris con marcas, mango blanco con línea verde que sube con rebote, llenado verde, LED, número de tecla e ícono verde). Derecha: medidor SVG (centro 358, 290; radio 250; 48 segmentos verde → ámbar → rojo de izquierda a derecha) y tarjeta de vidrio con la acción (al pasar el cursor se ve; al soltar vuelve la última elegida). Al empezar, la tarjeta (`.inicio`) invita a usar las palancas: título centrado Oswald 54 verde y una flecha a la izquierda que las señala (se mueve y sus puntos corren hacia la punta).
- **Medidor al revés** (pedido de la persona): CERO a la izquierda, HOY (máximo) a la derecha. La aguja arranca en 0 y, la primera vez que se ve, sube al máximo encendiendo todas las luces; cada palanca la baja (`objetivo = 1 − activas / N`) y apaga los segmentos que quedan a la derecha de la aguja. Con las 8 todo queda apagado y solo brilla "CERO" (verde con resplandor); "HOY" se atenúa. Detrás del arco hay un resplandor propio (`.rse-halo`, centro 1178, 360): rojo que **parpadea como alarma** (`rse-alarma`, 1,1 s) con opacidad igual a la posición de la aguja (rse.js la pone en cada cuadro), así se va apagando con cada palanca; en cero se enciende el verde (`.completo`). La mancha verde de fondo se movió detrás de las palancas para no competir con ese resplandor.
- **En números**: dos tarjetas de vidrio (`.nu-flota` flota con `translate` en CSS; `.nu-vidrio` se inclina hasta 4° hacia el cursor con `--rx`/`--ry`; contenido en `.nu-panel` de 648 px). Izquierda, reciclaje con ZYCLAR: contadores (kg y árboles) y 12 columnas de "fardos" (bloques de 500 kg que caen uno por uno; el cursor muestra los kg). Derecha, huella de carbono: barras de m³ tenues y la línea del índice dibujada como una **ruta** (curva Catmull-Rom → Bézier, gris con carril punteado; lo recorrido se pinta de verde) con un camioncito que la recorre al entrar (3,8 s) y sigue al mouse (muestra mes, índice y m³). La baja "−20 %" se calcula sola con los promedios de los años `comparacionDesde`/`comparacionHasta`. Datos leídos de capturas: los marcados "verificar" en `datos/rse.js` pueden estar mal, y los kg mensuales de 2024 suman 68.234 aunque el total dice 65.916 (ya avisado a la persona).
- **Comunidad**: tres acciones con foto (`img/rse/acciones/`, recortadas de la captura de la persona: baja resolución, pedir las originales) y los 9 aliados en fichas blancas agrupados por `grupo` (Ambiente / Comunidad). Logos en `img/rse/aliados/`, recortados de la captura y con el fondo gris vuelto transparente (mejor reemplazarlos por los originales).
- Aguja: resorte poco amortiguado (rebota como un instrumento) con temblor leve mientras no está en cero; el bucle corre solo con la sección visible. Con las 8: `.completo`, lectura "IMPACTO CERO" en verde y, 0,9 s después, la tarjeta final con "Reiniciar". Teclas 1–8 solo con el tablero en pantalla (`bajada` entre top + 500 y top + 1250). Entrada con `.visible` (`bajada` > top + 150); `.asentado` quita las demoras de entrada para que el hover responda enseguida.

- Certificaciones: solo las que figuran en las diapositivas de la persona (ISO 9001, 45001 y 14001, certificadas por IRAM e IQNET); en internet no hay un listado oficial. No agregar otras sin confirmarlas.

### Pendientes conocidos

- La portada tiene 3 cartas (se sacaron Nuestro TMS, Tecnología y Ubicación Estratégica). Servicio a medida tiene solo el mapa de distribución.
- Los puntos del mapa de distribución se interpretaron de capturas: verificarlos con la empresa (sobre todo los destinos propios: Jesús María, Rafaela, Paraná, La Plata).
- Línea de tiempo: el texto de 2020 es provisorio ("Completar…"). En 1994 quizás falta una "y" entre los nombres.
- Las sedes del mapa son estimadas a partir de fuentes públicas: verificarlas con la empresa.
- Mejora continua: confirmar la directriz de Calidad que termina en "con los colaboradores, accionistas." (parece incompleta en la diapositiva original).
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
