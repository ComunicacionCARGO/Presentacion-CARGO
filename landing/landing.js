/* =========================================================
   PORTADA — arma el carrusel a partir de datos/cartas.js
   y lo anima (giro, paralaje, selección y apertura).
   ========================================================= */
(function () {
  const AJ = Object.assign({
    antetitulo: 'Tu solución en',
    titulo: 'MARCHA',
    sello: '',
    segundosPorVuelta: 40,
    sentido: 1,
    intensidadParalaje: 1,
    mostrarNombres: true,
    palabrasSimultaneas: 4,
    palabras: []
  }, window.PORTADA || {});
  const CARTAS = window.CARTAS || [];

  const $ = (s) => document.querySelector(s);
  const fondo = $('.fondo'), textos = $('.textos'), mundo = $('.mundo'), operario = $('.operario');
  const NS = 'http://www.w3.org/2000/svg';
  const RAD = Math.PI / 180;

  function crear(tag, clase, padre) {
    const el = document.createElement(tag);
    if (clase) el.className = clase;
    if (padre) padre.appendChild(el);
    return el;
  }

  function svgEl(tag, attrs, padre) {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (padre) padre.appendChild(el);
    return el;
  }

  // ---------- Textos ----------
  $('.antetitulo').textContent = AJ.antetitulo;
  $('.hud-sello span').textContent = AJ.sello;
  const h1 = $('.titulo');
  h1.setAttribute('aria-label', AJ.titulo);
  [...AJ.titulo].forEach((letra, i) => {
    const s = document.createElement('span');
    s.textContent = letra;
    s.style.setProperty('--i', i);
    s.setAttribute('aria-hidden', 'true');
    h1.appendChild(s);
  });

  // ---------- Medidas del carrusel (px del escenario 1600×900) ----------
  // Las cartas son largas y entre todas completan el círculo, con un hueco chico entre una y otra.
  const N = CARTAS.length;
  const radio = 310;                             // radio del círculo de cartas
  const paso = N ? 360 / N : 0;
  const HUECO = 7;                               // grados libres entre una carta y la siguiente
  const ARCO = N ? Math.min(150, paso - HUECO) : 0;   // grados que ocupa cada carta
  const ANCHO = Math.round(radio * ARCO * RAD), ALTO = 174, ESQUINA = 18;   // tamaño de cada carta
  const TIRAS = Math.max(10, Math.round(ANCHO / 17));  // franjas por carta: más = curva más suave
  const ANCHO_TIRA = ANCHO / TIRAS;
  const SOLAPE = .6;                             // las franjas se pisan apenas para no dejar rendijas
  const CENTRO = { x: 800, y: 668 };             // centro del carrusel
  const PERSPECTIVA = 1600, ORIGEN = { x: 800, y: 450 };
  const dosDigitos = (n) => String(n).padStart(2, '0');

  // Resolución interna del contenido de las cartas (2× como mínimo, más en pantallas grandes)
  const escalaPantalla = Math.min(innerWidth / 1600, innerHeight / 900) * (devicePixelRatio || 1);
  const F = Math.min(4, Math.max(2, Math.ceil(escalaPantalla * 1.5)));
  mundo.style.setProperty('--f', F);
  mundo.style.setProperty('--ancho', ANCHO + 'px');

  // Contorno de un tramo de la carta (franjas j0 a j1), con centro de la carta en 0,0.
  // Las puntas reales llevan esquinas redondeadas; donde el tramo se corta, un borde recto.
  // Cada franja es plana, así que en los bordes largos alcanza un punto por unión de franjas.
  function contorno(j0, j1) {
    const w = ANCHO / 2, h = ALTO / 2, r = ESQUINA;
    const izq = j0 === 0, der = j1 === TIRAS - 1;
    const uA = j0 * ANCHO_TIRA - w, uB = (j1 + 1) * ANCHO_TIRA - w;
    const p = [];
    const curva = (cu, cv, desde) => {
      for (let k = 0; k < 6; k++) {
        const a = (desde + k * 15) * RAD;
        p.push([cu + r * Math.cos(a), cv + r * Math.sin(a)]);
      }
    };
    const recta = (u0, u1, v, corte) => {
      p.push([u0, v, corte]);
      const lim = [];
      for (let j = j0 + 1; j <= j1; j++) {
        const b = j * ANCHO_TIRA - w;
        if ((b - u0) * (b - u1) < 0) lim.push(b);
      }
      if (u1 < u0) lim.reverse();
      lim.forEach((b) => p.push([b, v]));
    };
    recta(izq ? -w + r : uA, der ? w - r : uB, -h);
    if (der) { curva(w - r, -h + r, -90); p.push([w, -h + r]); curva(w - r, h - r, 0); }
    else p.push([uB, -h]);
    recta(der ? w - r : uB, izq ? -w + r : uA, h, !der);   // si la derecha es un corte, se llega sin trazo
    if (izq) { curva(-w + r, h - r, 90); p.push([-w, h - r]); curva(-w + r, -h + r, 180); }
    else p.push([uA, h]);
    return { p, cierreCorte: !izq };
  }

  // Desenfoques compartidos por todas las cartas
  const filtros = svgEl('svg', { width: 0, height: 0, style: 'position:absolute' }, document.body);
  filtros.innerHTML =
    '<defs>' +
    '<filter id="desenfoque-sombra" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>' +
    '<filter id="desenfoque-halo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>' +
    '</defs>';

  // ---------- Foto y título de cada carta ----------
  const nombreCarta = (d) => [d.antetitulo, d.titulo].filter(Boolean).join(' ');
  // La foto de cada carta es un fondo plano y lejano: no sigue la curva. Va en el vidrio
  // de la parte de adelante (una capa 2D recortada con la silueta de la carta) y se mueve
  // más lento que la carta, así la carta parece una ventana que la deja ver.
  const FOTO_ANCHO = 1100;                        // ancho de la foto en pantalla (px del escenario)
  const FOTO_ARRASTRE = .35;                      // cuánto acompaña la foto al movimiento de la carta (0 = quieta)
  const precarga = crear('div', '', document.body);   // base.js espera estas imágenes antes de abrir la cortina
  precarga.hidden = true;

  // Ubica la foto en pantalla: sigue de lejos al centro de la carta (FOTO_ARRASTRE),
  // un poco al mouse, y crece cuando la carta se acerca (al pasar el cursor o al abrirla).
  // "foco" elige qué altura de la foto queda en el medio de la ventana.
  function ubicarFoto(ca, grados, rot, kp) {
    const th = grados * RAD, Rc = radio + ca.adelante;
    const x = Rc * Math.sin(th), z = Rc * Math.cos(th), y = ca.sube;
    const y2 = y * rot.cX - z * rot.sX, z2 = y * rot.sX + z * rot.cX;
    const x3 = x * rot.cY + z2 * rot.sY, z3 = -x * rot.sY + z2 * rot.cY;
    const f = PERSPECTIVA / (PERSPECTIVA - z3);
    const cx = ORIGEN.x + (CENTRO.x + x3 - ORIGEN.x) * f;   // centro de la carta en pantalla
    const s = ca.esc * (1 + ca.adelante / radio * .9);
    const w = FOTO_ANCHO * s, h = ca.fotoAlto * s;
    const fx = CENTRO.x + (cx - CENTRO.x) * FOTO_ARRASTRE - px * 14 * kp;
    const fy = CENTRO.y + ca.sube * FOTO_ARRASTRE - py * 8 * kp;
    const margen = ALTO * .7 * s;                           // la ventana siempre queda cubierta
    const arriba = Math.max(fy + margen - h, Math.min(fy - margen, fy - h * ca.foco / 100));
    const tr = `translate(${(fx - w / 2).toFixed(1)}px, ${arriba.toFixed(1)}px) scale(${s.toFixed(4)})`;
    ca.foto[0].style.transform = tr;
  }

  // Título como en el diseño de la persona (medido sobre su carta de 668 × 241 y llevado
  // a 174 px de alto): número Oswald rojo, antetítulo Inter Light y título Oswald, cada uno
  // ubicado por su línea base. El grupo va centrado y ocupa como mucho la parte central
  // de la carta (en las puntas la curva lo aplasta); si alguno no entra, se achican todos
  // por igual, así las tres cartas tienen títulos del mismo tamaño.
  const ROTULO_MAX = ANCHO * .74;
  const ROTULO = {
    num:  { tam: 136.5, base: 143.7, x: 0 },
    ante: { tam: 38.3,  base: 68.6,  x: 128.9 },
    tit:  { tam: 75.1,  base: 137.2, x: 147.6 }
  };
  const BASE_OSWALD = .95, BASE_INTER = .865;     // línea base desde arriba, con line-height 1
  const medidor = document.createElement('canvas').getContext('2d');
  const anchoTexto = (fuente, t) => { medidor.font = fuente; return medidor.measureText(t).width; };
  function medirRotulo(d, i) {
    const R = ROTULO, ante = d.antetitulo || '';
    const fAnte = `300 ${R.ante.tam}px Inter`;
    const colgado = /^[¿¡]/.test(ante) ? anchoTexto(fAnte, ante[0]) : 0;   // el "¿" queda colgado a la izquierda
    const ancho = Math.max(
      anchoTexto(`700 ${R.num.tam}px Oswald`, dosDigitos(i + 1)),
      ante ? R.ante.x + anchoTexto(fAnte, ante) - colgado : 0,
      R.tit.x + anchoTexto(`700 ${R.tit.tam}px Oswald`, d.titulo || ''));
    return { ancho, colgado };
  }
  function ubicarRotulos() {
    const medidas = CARTAS.map(medirRotulo);
    const t = Math.min(1, ...medidas.map((m) => ROTULO_MAX / m.ancho));
    cartas.forEach((ca, i) => ubicarRotulo(ca.a, medidas[i], t));
  }
  function ubicarRotulo(a, m, t) {
    const R = ROTULO, { ancho, colgado } = m;
    const gx = (ANCHO - ancho * t) / 2, cy = ALTO / 2;
    const fija = (k, v) => a.style.setProperty(k, v.toFixed(2));
    const lugar = (pre, r, base, menos) => {
      fija(`--${pre}s`, r.tam * t);
      fija(`--${pre}x`, gx + r.x * t - (menos || 0) * t);
      fija(`--${pre}y`, cy + (r.base - cy) * t - base * r.tam * t);
    };
    lugar('n', R.num, BASE_OSWALD);
    lugar('a', R.ante, BASE_INTER, colgado);
    lugar('t', R.tit, BASE_OSWALD);
  }

  // ---------- Construcción de las cartas ----------
  // Una carta larga puede quedar en parte delante del operario y en parte detrás.
  // Por eso cada carta tiene dos "partes" (la de adelante y la de atrás), cada una con
  // sus capas y su propio z-index, y cada franja también lleva el z-index de su parte.
  function crearParte(a, id, conOperario) {
    // 1. Sombra y halo
    const base = svgEl('svg', { class: 'carta-base', viewBox: '0 0 1600 900' }, a);
    const sombra = svgEl('path', { fill: 'rgba(150,40,20,.3)', filter: 'url(#desenfoque-sombra)', transform: 'translate(0 22)' }, base);
    const halo = svgEl('path', { fill: 'none', stroke: '#EF4529', 'stroke-width': 10, filter: 'url(#desenfoque-halo)' }, base);
    // 2. Vidrio esmerilado (la copia del operario solo hace falta adelante)
    const vidrio = crear('div', 'carta-vidrio', a);
    const vidrioOperario = conOperario ? crear('canvas', 'vidrio-operario', vidrio) : null;
    const tinte = crear('div', 'vidrio-tinte', vidrio);
    // 4. Borde, reflejo y luz del cursor
    const refl = svgEl('svg', { class: 'carta-reflejo', viewBox: '0 0 1600 900' }, a);
    const defs = svgEl('defs', {}, refl);
    const recorte = svgEl('path', {}, svgEl('clipPath', { id: id + '-recorte' }, defs));
    const gradBrillo = svgEl('linearGradient', { id: id + '-brillo', gradientUnits: 'userSpaceOnUse' }, defs);
    [[0, 0], [.5, .2], [1, 0]].forEach(([o, op]) => {   // suave: no tiene que lavar la foto
      svgEl('stop', { offset: o, 'stop-color': '#fff', 'stop-opacity': op }, gradBrillo);
    });
    const gradLuz = svgEl('radialGradient', { id: id + '-luz', gradientUnits: 'userSpaceOnUse', r: 150 }, defs);
    svgEl('stop', { offset: 0, 'stop-color': '#fff', 'stop-opacity': .7 }, gradLuz);
    svgEl('stop', { offset: 1, 'stop-color': '#fff', 'stop-opacity': 0 }, gradLuz);
    const g = svgEl('g', { 'clip-path': `url(#${id}-recorte)` }, refl);
    svgEl('rect', { width: 1600, height: 900, fill: `url(#${id}-brillo)` }, g);
    const luz = svgEl('rect', { width: 1600, height: 900, fill: `url(#${id}-luz)` }, g);
    const borde = svgEl('path', { fill: 'none', 'stroke-linejoin': 'round' }, refl);
    return {
      base, sombra, halo, vidrio, vidrioOperario, tinte, refl, recorte, gradBrillo, gradLuz, luz, borde,
      capas: [base, vidrio, refl], visible: true, z: null
    };
  }

  const cartas = CARTAS.map((datos, i) => {
    const a = crear('a', 'carta', mundo);
    a.href = datos.destino || '#';
    a.setAttribute('aria-label', nombreCarta(datos));
    const id = 'carta' + i;
    const partes = [crearParte(a, id + 'a', true), crearParte(a, id + 'b', false)];

    // 3. Franjas con el contenido: el número de vidrio rojo y el título en dos partes
    //    ("¿Quiénes" / "SOMOS?"). La foto no va acá (seguiría la curva) sino en el vidrio.
    const modelo = document.createElement('div');
    modelo.className = 'contenido';
    if (!datos.portada) a.classList.add('sin-foto');
    if (AJ.mostrarNombres) {
      crear('span', 'r-num', modelo).textContent = dosDigitos(i + 1);
      if (datos.antetitulo) crear('span', 'r-ante', modelo).textContent = datos.antetitulo;
      crear('span', 'r-tit', modelo).textContent = datos.titulo || '';
    }
    const anchoTira = (ANCHO_TIRA + SOLAPE) * F;
    const tiras = [];
    for (let j = 0; j < TIRAS; j++) {
      // cada franja va en su propia caja con perspectiva: así lleva su z-index respecto del operario
      // (la perspectiva en la caja, no dentro del transform: si no, Chrome no detecta el cursor)
      const caja = crear('div', 'tira-caja', a);
      const t = crear('div', 'tira', caja);
      t.caja = caja;
      t.style.width = anchoTira + 'px';
      t.style.height = ALTO * F + 'px';
      t.style.left = (CENTRO.x - anchoTira / 2) + 'px';
      t.style.top = (CENTRO.y - ALTO * F / 2) + 'px';
      const c = modelo.cloneNode(true);
      c.style.left = -(j * ANCHO_TIRA - SOLAPE / 2) * F + 'px';
      t.appendChild(c);
      tiras.push(t);
    }
    // Foto de fondo (plana) dentro del vidrio de la parte de adelante.
    // Si la imagen no existe, la carta queda de vidrio con su número y su título.
    const ca = { a, foco: Math.max(0, Math.min(100, datos.foco === undefined ? 50 : +datos.foco || 0)), foto: null, fotoAlto: FOTO_ANCHO * 9 / 16 };
    // Una sola copia de la foto, en modo de fusión "superponer" y algo transparente: se mezcla
    // con el vidrio. Con el cursor encima o al abrir no cambia, solo se agranda (pedido de la persona).
    if (datos.portada) {
      ca.foto = ['vf-superponer'].map((clase) => {
        const el = crear('div', 'vidrio-foto ' + clase, partes[0].vidrio);
        el.style.backgroundImage = `url("${datos.portada}")`;
        el.style.width = FOTO_ANCHO + 'px';
        el.style.height = ca.fotoAlto + 'px';
        return el;
      });
      const prueba = crear('img', '', precarga);
      prueba.alt = '';
      prueba.onload = () => {
        ca.fotoAlto = FOTO_ANCHO * prueba.naturalHeight / prueba.naturalWidth;
        ca.foto.forEach((el) => { el.style.height = ca.fotoAlto + 'px'; });
      };
      prueba.onerror = () => { a.classList.add('sin-foto'); ca.foto.forEach((el) => el.remove()); ca.foto = null; };
      prueba.src = datos.portada;
    }

    return Object.assign(ca, {
      partes, tiras,
      ang: new Float64Array(TIRAS),                       // ángulo de cada franja en el cuadro actual
      tiraZ: new Array(TIRAS).fill(''), tiraAdelante: new Array(TIRAS).fill(null),
      opTxt: null,
      esc: .3, sube: 0, adelante: 0, op: 0, act: 0   // valores animados
    });
  });
  // Títulos: se miden ahora y otra vez con las fuentes ya cargadas
  ubicarRotulos();
  if (document.fonts) document.fonts.ready.then(ubicarRotulos);

  // Copia desenfocada del operario para el vidrio (se calcula una sola vez)
  function prepararVidrio() {
    const escala = .5;
    const lienzo = document.createElement('canvas');
    lienzo.width = Math.round(operario.naturalWidth * escala);
    lienzo.height = Math.round(operario.naturalHeight * escala);
    const ctx = lienzo.getContext('2d');
    ctx.filter = `blur(${15 * (operario.naturalWidth / 581) * escala}px) saturate(1.4)`;
    ctx.drawImage(operario, 0, 0, lienzo.width, lienzo.height);
    cartas.forEach((ca) => {
      const cv = ca.partes[0].vidrioOperario;
      cv.width = lienzo.width;
      cv.height = lienzo.height;
      cv.getContext('2d').drawImage(lienzo, 0, 0);
    });
  }
  if (operario.complete && operario.naturalWidth) prepararVidrio();
  else operario.addEventListener('load', prepararVidrio);

  // ---------- Estado ----------
  const base = (360 / AJ.segundosPorVuelta) * AJ.sentido;
  let giro = 0;
  let vel = 0;
  let activa = -1;        // carta bajo el cursor
  let elegida = -1;       // carta que se está abriendo
  let frente = 0;         // carta más cercana al frente
  let objetivo = null;    // giro al que se dirige (teclado, rueda, cursor)
  let pausaHasta = 0;
  let abriendo = false;
  let listaDesde = 0;     // momento en que terminó de entrar la página
  let mx = 0, my = 0, px = 0, py = 0;
  let ex = 800, ey = 450; // cursor en coordenadas del escenario

  const normalizar = (g) => ((g % 360) + 540) % 360 - 180;

  document.addEventListener('pagina-lista', () => {
    listaDesde = performance.now();
    vel = base * 14;   // entrada con giro rápido
  });

  function activar(i) {
    if (abriendo) return;
    if (activa >= 0) cartas[activa].a.classList.remove('activa');
    activa = i;
    if (i >= 0) cartas[i].a.classList.add('activa');
  }

  // Lleva la carta i al frente del carrusel
  function centrar(i) {
    objetivo = giro + normalizar(i * paso - giro);
  }

  // ---------- Mouse ----------
  // Al pasar el cursor por una carta, esa carta viaja al centro y se levanta.
  // Mientras viaja, otras cartas pasan por debajo del cursor: esas se ignoran
  // hasta que el mouse se vuelva a mover hacia otra carta.
  let centrando = false;
  let bajoCursor = -1;    // carta que está bajo el cursor (-1 = ninguna)
  let ignorar = null;     // carta que llegó sola bajo el cursor
  let cx = -1, cy = -1;   // última posición del cursor

  const cartaEn = (el) => {
    const c = el && el.closest ? el.closest('.carta') : null;
    return c ? cartas.findIndex((ca) => ca.a === c) : -1;
  };

  function revisarCursor() {
    if (centrando || abriendo) return;
    if (ignorar !== null && bajoCursor === ignorar) return;
    ignorar = null;
    if (bajoCursor < 0) {
      if (activa >= 0) { activar(-1); pausaHasta = performance.now() + 1200; }
    } else if (bajoCursor !== activa) {
      activar(bajoCursor);
      centrar(bajoCursor);
      centrando = true;
    }
  }

  function terminarCentrado() {
    centrando = false;
    bajoCursor = cx < 0 ? -1 : cartaEn(document.elementFromPoint(cx, cy));
    if (bajoCursor >= 0 && bajoCursor !== activa) ignorar = bajoCursor;
  }

  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    if (e.clientX === cx && e.clientY === cy) return;  // el mouse no se movió de verdad
    cx = e.clientX;
    cy = e.clientY;
    mx = (cx / innerWidth) * 2 - 1;
    my = (cy / innerHeight) * 2 - 1;
    const k = Math.min(innerWidth / 1600, innerHeight / 900);
    ex = (cx - (innerWidth - 1600 * k) / 2) / k;
    ey = (cy - (innerHeight - 900 * k) / 2) / k;
    bajoCursor = cartaEn(e.target);
    revisarCursor();
  });
  document.addEventListener('pointerleave', () => {
    mx = 0; my = 0; bajoCursor = -1; revisarCursor();
  });

  // ---------- Rueda del mouse: gira el carrusel ----------
  // Cada muesca de la rueda pasa a la carta siguiente (o anterior) en el momento,
  // y las muescas seguidas se suman. Con el touchpad gira mientras se desliza y,
  // al soltar, sigue hasta la carta siguiente en ese sentido (nunca vuelve atrás).
  let finRueda = 0, inicioGesto = null;
  addEventListener('wheel', (e) => {
    e.preventDefault();
    if (abriendo || !N) return;
    const d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 800 : 1);
    if (!d) return;
    activar(-1);
    centrando = false;
    ignorar = bajoCursor;
    pausaHasta = performance.now() + 5000;
    clearTimeout(finRueda);
    const actual = objetivo === null ? giro : objetivo;
    if (Math.abs(d) >= 50) {                       // muesca de la rueda del mouse: una carta por muesca
      inicioGesto = null;
      objetivo = Math.round(actual / paso) * paso + Math.sign(d) * paso;   // hacia abajo: la carta siguiente
      return;
    }
    if (inicioGesto === null) inicioGesto = actual;
    objetivo = actual + d * .25;
    finRueda = setTimeout(() => {
      const fin = objetivo === null ? giro : objetivo;
      const movido = fin - inicioGesto;
      inicioGesto = null;
      objetivo = Math.abs(movido) < 3 ? Math.round(fin / paso) * paso
        : (movido < 0 ? Math.floor(fin / paso) : Math.ceil(fin / paso)) * paso;
    }, 140);
  }, { passive: false });

  // En pantallas táctiles un toque abre la carta (antes el primer toque solo la levantaba y parecía
  // que no funcionaba); deslizar el dedo hacia un costado gira el carrusel una carta.
  // El toque lo resuelve el propio carrusel (no el clic del navegador: como las cartas giran, el dedo
  // podía apoyarse en una franja y levantarse en otra, y el clic se perdía). Al apoyar el dedo el
  // carrusel se frena; arrastrando a los costados gira con el dedo y al soltar sigue hasta la carta
  // siguiente en ese sentido.
  let tactilHasta = 0;                          // después de un toque, el clic del navegador no cuenta
  cartas.forEach((ca, i) => {
    ca.a.addEventListener('click', (e) => {
      e.preventDefault();
      if (performance.now() < tactilHasta) return;
      abrir(i);
    });
  });

  let dedo = null;
  const escalaPortada = () => Math.min(innerWidth / 1600, innerHeight / 900) || 1;
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch' || !e.isPrimary || abriendo || !N) return;
    dedo = { x: e.clientX, y: e.clientY, carta: cartaEn(e.target), giro0: objetivo === null ? giro : objetivo, girando: false };
    activar(-1);
    centrando = false;
    pausaHasta = performance.now() + 6000;
    objetivo = giro;                            // se frena donde está
  });
  document.addEventListener('pointermove', (e) => {
    if (!dedo || e.pointerType !== 'touch') return;
    const dx = e.clientX - dedo.x, dy = e.clientY - dedo.y;
    if (!dedo.girando && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) dedo.girando = true;
    if (dedo.girando) objetivo = dedo.giro0 - (dx / escalaPortada()) * .22;   // hacia la izquierda: la carta siguiente
  });
  document.addEventListener('pointerup', (e) => {
    if (!dedo || e.pointerType !== 'touch') return;
    const d = dedo; dedo = null;
    tactilHasta = performance.now() + 450;
    pausaHasta = performance.now() + 5000;
    if (d.girando) {
      const fin = objetivo === null ? giro : objetivo, movido = fin - d.giro0;
      objetivo = (movido < 0 ? Math.floor(fin / paso) : Math.ceil(fin / paso)) * paso;
      return;
    }
    // toque: abre la carta que estaba bajo el dedo (o la que quedó ahí al levantarlo)
    const i = d.carta >= 0 ? d.carta : cartaEn(document.elementFromPoint(e.clientX, e.clientY));
    if (i >= 0) abrir(i);
  });
  document.addEventListener('pointercancel', () => { dedo = null; });

  // ---------- Teclado ----------
  function enfocar(i) {
    i = ((i % N) + N) % N;
    activar(-1);
    centrando = false;
    ignorar = bajoCursor;
    centrar(i);
    pausaHasta = performance.now() + 5000;
  }

  addEventListener('keydown', (e) => {
    if (!N || abriendo) return;
    if (e.key === 'ArrowRight') enfocar(frente + 1);
    else if (e.key === 'ArrowLeft') enfocar(frente - 1);
    else if (e.key === 'Enter') abrir(activa >= 0 ? activa : frente);
    else if (/^[1-9]$/.test(e.key) && +e.key <= N) abrir(+e.key - 1);
  });

  // ---------- Abrir diapositiva ----------
  function abrir(i) {
    if (abriendo) return;
    activar(i);
    abriendo = true;
    elegida = i;
    centrar(i);  // la trae al frente mientras avanza
    document.body.classList.add('abriendo');
    irA(CARTAS[i].destino, 350);
  }

  // ---------- HUD ----------
  const hudNum = $('.hud-num'), hudNom = $('.hud-nom');
  $('.hud-total').textContent = '/ ' + dosDigitos(N);
  let hudActual = -1;
  function actualizarHud(i) {
    if (i === hudActual || i < 0) return;
    hudActual = i;
    hudNum.textContent = dosDigitos(i + 1);
    hudNom.textContent = nombreCarta(CARTAS[i]);
  }

  // ---------- Caminos: palabras que aparecen y convergen hacia las cartas ----------
  const caminos = $('.caminos');
  const svg = caminos.querySelector('svg');
  // Los caminos terminan sobre esta elipse, un poco antes de llegar a las cartas
  const ELIPSE = { rx: 400, ry: 178 };
  // Lugares posibles [x, y, lado]: 'izq' = el texto empieza en x, 'der' = el texto termina en x
  const LUGARES = [
    [150, 250, 'izq'], [90, 395, 'izq'], [170, 515, 'izq'], [100, 635, 'izq'], [230, 765, 'izq'],
    [1450, 250, 'der'], [1510, 395, 'der'], [1430, 515, 'der'], [1500, 635, 'der'], [1370, 765, 'der']
  ];
  const TAMANOS = [18, 21, 25];
  const VIDA = 7500;        // ms que una palabra queda visible
  const INTERVALO = 2300;   // ms entre una palabra nueva y la siguiente

  const lugaresOcupados = new Set();
  const palabrasVisibles = new Set();
  let cola = [];
  let idCamino = 0;

  function siguientePalabra() {
    if (!cola.length) cola = AJ.palabras.slice().sort(() => Math.random() - .5);
    for (let n = cola.length; n > 0; n--) {
      const p = cola.shift();
      if (!palabrasVisibles.has(p)) return p;
      cola.push(p);
    }
    return null;
  }

  function lanzarCamino() {
    if (abriendo || lugaresOcupados.size >= AJ.palabrasSimultaneas) return;
    const libres = LUGARES.map((_, i) => i).filter((i) => !lugaresOcupados.has(i));
    const texto = siguientePalabra();
    if (!libres.length || !texto) return;
    const lugar = libres[Math.floor(Math.random() * libres.length)];
    const [x, y, lado] = LUGARES[lugar];
    lugaresOcupados.add(lugar);
    palabrasVisibles.add(texto);

    const p = crear('p', 'palabra', caminos);
    p.textContent = texto;
    p.style.fontSize = TAMANOS[Math.floor(Math.random() * TAMANOS.length)] + 'px';
    p.style.top = y + 'px';
    if (lado === 'izq') p.style.left = x + 'px';
    else p.style.right = (1600 - x) + 'px';

    // El camino sale del extremo de la palabra que mira hacia las cartas
    const ancho = p.offsetWidth;
    const x0 = lado === 'izq' ? x + ancho + 14 : x - ancho - 14;
    const y0 = y;
    const nx = (x0 - CENTRO.x) / ELIPSE.rx, ny = (y0 - CENTRO.y) / ELIPSE.ry;
    let g = null;
    if (Math.hypot(nx, ny) > 1.1) {   // solo si la palabra está bien afuera de la elipse
      const ang = Math.atan2(ny, nx);
      const x3 = CENTRO.x + ELIPSE.rx * Math.cos(ang);
      const y3 = CENTRO.y + ELIPSE.ry * Math.sin(ang);
      const dx = x3 - x0, dy = y3 - y0;
      const id = 'camino-' + (++idCamino);
      g = svgEl('g', { class: 'camino' }, svg);
      const grad = svgEl('linearGradient', { id, gradientUnits: 'userSpaceOnUse', x1: x0, y1: y0, x2: x3, y2: y3 }, g);
      [[0, .34], [.6, .14], [1, 0]].forEach(([o, a]) => {
        svgEl('stop', { offset: o, 'stop-color': '#3A3A3A', 'stop-opacity': a }, grad);
      });
      svgEl('path', {
        d: `M${x0},${y0} C${x0 + dx * .15},${y0 + dy * .6} ${x3 - dx * .45},${y3 - dy * .05} ${x3},${y3}`,
        pathLength: 1,
        stroke: `url(#${id})`
      }, g);
      svgEl('circle', { cx: x0, cy: y0, r: 1.8, fill: '#3A3A3A', 'fill-opacity': .35 }, g);
    }

    requestAnimationFrame(() => requestAnimationFrame(() => {
      p.classList.add('visible');
      if (g) g.classList.add('visible');
    }));

    setTimeout(() => {
      p.classList.remove('visible');
      if (g) { g.classList.add('saliendo'); g.classList.remove('visible'); }
      setTimeout(() => {
        p.remove();
        if (g) g.remove();
        lugaresOcupados.delete(lugar);
        palabrasVisibles.delete(texto);
      }, 2600);
    }, VIDA);
  }

  if (AJ.palabras.length) {
    document.addEventListener('pagina-lista', () => {
      setTimeout(() => {
        lanzarCamino();
        setInterval(lanzarCamino, INTERVALO);
      }, 1800);
    });
  }

  // ---------- Dibujo de una carta curva ----------
  // Replica en JavaScript las mismas transformaciones 3D que aplica el navegador a las
  // franjas, para obtener la silueta exacta de la carta en pantalla.
  function dibujarCarta(ca, grados, inclinacion, rot, destacada) {
    const th = grados * RAD;
    const Rc = radio + ca.adelante;
    const e = ca.esc;
    const dPhi = 2 * Math.atan((ANCHO_TIRA * e / 2) / Rc);   // ángulo que ocupa cada franja
    const umbral = Rc / PERSPECTIVA;   // con el coseno por debajo, la franja ya se ve de espaldas

    // Franjas: posición, y qué tramo queda adelante (de frente) y cuál atrás
    let f0 = -1, f1 = -1, b0 = -1, b1 = -1;
    for (let j = 0; j < TIRAS; j++) {
      const a = th + (j - (TIRAS - 1) / 2) * dPhi;
      ca.ang[j] = a;
      ca.tiras[j].style.transform =
        `${inclinacion} translateY(${ca.sube}px) rotateY(${a / RAD}deg) translateZ(${Rc}px) scale(${e / F})`;
      if (Math.cos(a) > umbral) { if (f0 < 0) f0 = j; f1 = j; }
      else { if (b0 < 0) b0 = j; b1 = j; }
    }

    const proyectar = (u, v, j0, j1) => {
      let j = Math.floor((u + ANCHO / 2) / ANCHO_TIRA);
      j = j < j0 ? j0 : j > j1 ? j1 : j;
      const a = ca.ang[j];
      const lx = (u - ((j + .5) * ANCHO_TIRA - ANCHO / 2)) * e;
      const sa = Math.sin(a), cA = Math.cos(a);
      const x = lx * cA + Rc * sa;
      const z = -lx * sa + Rc * cA;
      const y = v * e + ca.sube;
      const y2 = y * rot.cX - z * rot.sX;
      const z2 = y * rot.sX + z * rot.cX;
      const x3 = x * rot.cY + z2 * rot.sY;
      const z3 = -x * rot.sY + z2 * rot.cY;
      const f = PERSPECTIVA / (PERSPECTIVA - z3);
      return [ORIGEN.x + (CENTRO.x + x3 - ORIGEN.x) * f, ORIGEN.y + (CENTRO.y + y2 - ORIGEN.y) * f];
    };

    const s = ca.act;
    const trazo = `rgba(${255 - 13 * s | 0},${255 - 149 * s | 0},${255 - 202 * s | 0},${(.75 + .2 * s).toFixed(2)})`;
    const grosor = (1.5 + .5 * s).toFixed(2);
    let gx0 = 1e9, gx1 = -1e9, gy0 = 1e9, gy1 = -1e9;
    const tramos = [[f0, f1, true], [b0, b1, false]];

    tramos.forEach(([j0, j1, adelante], k) => {
      const P = ca.partes[k];
      if (j0 < 0) {
        if (P.visible) { P.visible = false; P.capas.forEach((el) => { el.style.display = 'none'; }); }
        return;
      }
      if (!P.visible) { P.visible = true; P.capas.forEach((el) => { el.style.display = ''; }); }

      // Silueta del tramo: relleno cerrado y borde (sin trazo donde se corta, salvo adelante,
      // donde el corte coincide con el contorno visible de la curva)
      const { p, cierreCorte } = contorno(j0, j1);
      let d = '', db = '', poli = '';
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, X0 = 0, Y0 = 0;
      for (let n = 0; n < p.length; n++) {
        const [X, Y] = proyectar(p[n][0], p[n][1], j0, j1);
        const xy = X.toFixed(1) + ',' + Y.toFixed(1);
        if (!n) { X0 = X; Y0 = Y; }
        d += (n ? 'L' : 'M') + xy;
        db += (n && !(p[n][2] && !adelante) ? 'L' : 'M') + xy;
        poli += (n ? ',' : '') + X.toFixed(1) + 'px ' + Y.toFixed(1) + 'px';
        if (X < x0) x0 = X; if (X > x1) x1 = X;
        if (Y < y0) y0 = Y; if (Y > y1) y1 = Y;
      }
      d += 'Z';
      if (!(cierreCorte && !adelante)) db += 'L' + X0.toFixed(1) + ',' + Y0.toFixed(1);
      if (x0 < gx0) gx0 = x0; if (x1 > gx1) gx1 = x1;
      if (y0 < gy0) gy0 = y0; if (y1 > gy1) gy1 = y1;

      P.sombra.setAttribute('d', d);
      P.recorte.setAttribute('d', d);
      P.borde.setAttribute('d', db);
      P.vidrio.style.clipPath = `polygon(${poli})`;
      P.tinte.style.left = x0 + 'px';
      P.tinte.style.top = y0 + 'px';
      P.tinte.style.width = (x1 - x0) + 'px';
      P.tinte.style.height = (y1 - y0) + 'px';
      // El vidrio deja ver al operario desenfocado solo en la parte de adelante
      if (P.vidrioOperario) P.vidrioOperario.style.transform = inclinacion;

      // Profundidad: el operario está en z-index 1000. Cada parte usa 4 niveles seguidos
      // (sombra, vidrio, franjas, borde) y las de adelante quedan por encima del operario.
      const c = Math.cos(ca.ang[(j0 + j1) >> 1]);
      const z = (adelante ? 1004 + destacada : 996) + Math.round(c * 100) * 4;
      if (z !== P.z) {
        P.z = z;
        P.base.style.zIndex = z;
        P.vidrio.style.zIndex = z + 1;
        P.refl.style.zIndex = z + 3;
      }
      for (let j = j0; j <= j1; j++) {
        const zt = String(z + 2);
        if (ca.tiraZ[j] !== zt) { ca.tiraZ[j] = zt; ca.tiras[j].caja.style.zIndex = zt; }
        if (ca.tiraAdelante[j] !== adelante) {
          ca.tiraAdelante[j] = adelante;
          ca.tiras[j].style.pointerEvents = adelante ? '' : 'none';
        }
      }

      // Selección: borde naranja, halo y luz que sigue al cursor
      P.borde.setAttribute('stroke', trazo);
      P.borde.setAttribute('stroke-width', grosor);
      P.halo.style.display = s > .01 ? '' : 'none';
      if (s > .01) P.halo.setAttribute('d', db);
      P.halo.setAttribute('opacity', (s * .8).toFixed(2));
      P.luz.setAttribute('opacity', s.toFixed(2));
      P.gradLuz.setAttribute('cx', ex);
      P.gradLuz.setAttribute('cy', ey);
    });

    // Reflejo que recorre el vidrio según el ángulo (el mismo en las dos partes)
    const w = gx1 - gx0, pos = gx0 + w * (.5 - Math.sin(th) * .6), yc = (gy0 + gy1) / 2;
    ca.partes.forEach((P) => {
      if (!P.visible) return;
      P.gradBrillo.setAttribute('x1', pos - w * .3);
      P.gradBrillo.setAttribute('x2', pos + w * .3);
      P.gradBrillo.setAttribute('y1', yc - w * .08);
      P.gradBrillo.setAttribute('y2', yc + w * .08);
    });

    // Opacidad de entrada y salida, en cada capa (la carta no arma un grupo propio,
    // así sus partes pueden ir delante y detrás del operario)
    const o = ca.op === 1 ? '' : ca.op.toFixed(3);
    if (o !== ca.opTxt) {
      ca.opTxt = o;
      ca.partes.forEach((P) => P.capas.forEach((el) => { el.style.opacity = o; }));
      ca.tiras.forEach((t) => { t.caja.style.opacity = o; });
    }
  }

  // ---------- Animación ----------
  let ultimo = performance.now();
  function cuadro(t) {
    const dt = Math.min(.05, (t - ultimo) / 1000);
    ultimo = t;

    if (objetivo !== null) {
      const d = objetivo - giro;
      giro += d * Math.min(1, dt * 5);
      vel = 0;
      if (centrando && Math.abs(d) < 1.5) terminarCentrado();
      if (Math.abs(d) < .05) { giro = objetivo; objetivo = null; }
    } else {
      const quieto = activa >= 0 || t < pausaHasta;
      const meta = quieto ? 0 : base;
      vel += (meta - vel) * Math.min(1, dt * (quieto ? 7 : 1.2));
      giro += vel * dt;
    }

    // Paralaje: cada capa se mueve distinto según el mouse
    const kp = AJ.intensidadParalaje;
    px += (mx - px) * Math.min(1, dt * 3);
    py += (my - py) * Math.min(1, dt * 3);
    fondo.style.transform = `translate3d(${-px * 24 * kp}px, ${-py * 14 * kp}px, 0)`;
    textos.style.transform = `translate3d(${-px * 10 * kp}px, ${-py * 6 * kp}px, 0)`;
    caminos.style.transform = `translate3d(${-px * 16 * kp}px, ${-py * 9 * kp}px, 0)`;
    const ry = px * 7 * kp, rx = -py * 4 * kp;
    const inclinacion = `rotateY(${ry}deg) rotateX(${rx}deg)`;
    const rot = { sY: Math.sin(ry * RAD), cY: Math.cos(ry * RAD), sX: Math.sin(rx * RAD), cX: Math.cos(rx * RAD) };
    operario.style.transform = inclinacion;

    // Suavizado de los valores animados de cada carta
    const fLevantar = 1 - Math.exp(-dt * 7);
    const fOpacidad = 1 - Math.exp(-dt * 5);
    const fBrillo = 1 - Math.exp(-dt * 9);

    let mejor = -2;
    cartas.forEach((ca, i) => {
      // Valores a los que se dirige cada carta
      const entro = listaDesde && t > listaDesde + 500 + i * 70;
      let mEsc = entro ? 1 : .3, mOp = entro ? 1 : 0, mSube = 0, mAdelante = 0, mAct = 0;
      if (i === elegida) { mSube = -60; mAdelante = 260; mEsc = 1.35; mAct = 1; }
      else if (abriendo) mOp = 0;
      else if (i === activa) { mSube = -34; mAdelante = 50; mEsc = 1.1; mAct = 1; }
      ca.esc += (mEsc - ca.esc) * fLevantar;
      ca.sube += (mSube - ca.sube) * fLevantar;
      ca.adelante += (mAdelante - ca.adelante) * fLevantar;
      ca.op += (mOp - ca.op) * fOpacidad;
      if (Math.abs(mOp - ca.op) < .004) ca.op = mOp;
      ca.act += (mAct - ca.act) * fBrillo;

      const grados = giro - i * paso;   // en orden inverso al giro: al girar pasan 1, 2, 3…
      const c = Math.cos(grados * RAD);
      if (c > mejor) { mejor = c; frente = i; }

      // La carta elegida o bajo el cursor queda por encima de las demás
      const destacada = i === activa || i === elegida ? 2400 : 0;
      dibujarCarta(ca, grados, inclinacion, rot, destacada);
      if (ca.foto) ubicarFoto(ca, grados, rot, kp);
    });
    actualizarHud(activa >= 0 ? activa : frente);

    requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);
})();
