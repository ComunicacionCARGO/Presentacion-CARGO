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
  const N = CARTAS.length;
  const ANCHO = 260, ALTO = 174, ESQUINA = 18;   // tamaño de cada carta
  const TIRAS = 10;                              // franjas por carta: más = curva más suave
  const ANCHO_TIRA = ANCHO / TIRAS;
  const SOLAPE = .6;                             // las franjas se pisan apenas para no dejar rendijas
  const CENTRO = { x: 800, y: 668 };             // centro del carrusel
  const PERSPECTIVA = 1600, ORIGEN = { x: 800, y: 450 };
  const paso = N ? 360 / N : 0;
  const radio = N > 2 ? Math.max(310, (ANCHO / 2) / Math.tan(Math.PI / N) + 30) : 310;
  const dosDigitos = (n) => String(n).padStart(2, '0');

  // Resolución interna del contenido de las cartas (2× como mínimo, más en pantallas grandes)
  const escalaPantalla = Math.min(innerWidth / 1600, innerHeight / 900) * (devicePixelRatio || 1);
  const F = Math.min(4, Math.max(2, Math.ceil(escalaPantalla * 1.5)));
  mundo.style.setProperty('--f', F);

  // Silueta de la carta (rectángulo con esquinas redondeadas), con centro en 0,0
  const SILUETA = (() => {
    const p = [], w = ANCHO / 2, h = ALTO / 2, r = ESQUINA;
    const lado = (u0, v0, u1, v1, n) => {
      for (let k = 0; k < n; k++) p.push([u0 + (u1 - u0) * k / n, v0 + (v1 - v0) * k / n]);
    };
    const curva = (cu, cv, desde) => {
      for (let k = 0; k < 6; k++) {
        const a = (desde + k * 15) * RAD;
        p.push([cu + r * Math.cos(a), cv + r * Math.sin(a)]);
      }
    };
    lado(-w + r, -h, w - r, -h, 24); curva(w - r, -h + r, -90);
    lado(w, -h + r, w, h - r, 4);    curva(w - r, h - r, 0);
    lado(w - r, h, -w + r, h, 24);   curva(-w + r, h - r, 90);
    lado(-w, h - r, -w, -h + r, 4);  curva(-w + r, -h + r, 180);
    return p;
  })();

  // Desenfoques compartidos por todas las cartas
  const filtros = svgEl('svg', { width: 0, height: 0, style: 'position:absolute' }, document.body);
  filtros.innerHTML =
    '<defs>' +
    '<filter id="desenfoque-sombra" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>' +
    '<filter id="desenfoque-halo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>' +
    '</defs>';

  // ---------- Construcción de las cartas ----------
  const cartas = CARTAS.map((datos, i) => {
    const a = crear('a', 'carta', mundo);
    a.href = datos.destino || '#';
    a.setAttribute('aria-label', datos.titulo);
    const id = 'carta' + i;

    // 1. Sombra y halo
    const base = svgEl('svg', { class: 'carta-base', viewBox: '0 0 1600 900' }, a);
    const sombra = svgEl('path', { fill: 'rgba(150,40,20,.3)', filter: 'url(#desenfoque-sombra)', transform: 'translate(0 22)' }, base);
    const halo = svgEl('path', { fill: 'none', stroke: '#EF4529', 'stroke-width': 10, filter: 'url(#desenfoque-halo)' }, base);

    // 2. Vidrio esmerilado
    const vidrio = crear('div', 'carta-vidrio', a);
    const vidrioOperario = crear('canvas', 'vidrio-operario', vidrio);
    const tinte = crear('div', 'vidrio-tinte', vidrio);

    // 3. Franjas con el contenido (imagen, número y nombre)
    const modelo = document.createElement('div');
    modelo.className = 'contenido';
    if (datos.portada) {
      const img = crear('img', 'portada', modelo);
      img.src = datos.portada;
      img.alt = '';
      img.draggable = false;
    } else {
      crear('span', 'marca-agua', modelo).textContent = dosDigitos(i + 1);
    }
    if (AJ.mostrarNombres) {
      const et = crear('div', 'etiqueta', modelo);
      crear('b', '', et).textContent = dosDigitos(i + 1);
      crear('span', '', et).textContent = datos.titulo;
    }
    const anchoTira = (ANCHO_TIRA + SOLAPE) * F;
    const tiras = [];
    for (let j = 0; j < TIRAS; j++) {
      const t = crear('div', 'tira', a);
      t.style.width = anchoTira + 'px';
      t.style.height = ALTO * F + 'px';
      t.style.left = (CENTRO.x - anchoTira / 2) + 'px';
      t.style.top = (CENTRO.y - ALTO * F / 2) + 'px';
      const c = modelo.cloneNode(true);
      c.style.left = -(j * ANCHO_TIRA - SOLAPE / 2) * F + 'px';
      t.appendChild(c);
      tiras.push(t);
    }
    // Si la imagen no existe, la carta queda de vidrio con su número
    if (datos.portada) {
      const prueba = new Image();
      prueba.onerror = () => a.querySelectorAll('.portada').forEach((im) => {
        const s = document.createElement('span');
        s.className = 'marca-agua';
        s.textContent = dosDigitos(i + 1);
        im.replaceWith(s);
      });
      prueba.src = datos.portada;
    }

    // 4. Borde, reflejo y luz del cursor
    const refl = svgEl('svg', { class: 'carta-reflejo', viewBox: '0 0 1600 900' }, a);
    const defs = svgEl('defs', {}, refl);
    const recorte = svgEl('path', {}, svgEl('clipPath', { id: id + '-recorte' }, defs));
    const gradBrillo = svgEl('linearGradient', { id: id + '-brillo', gradientUnits: 'userSpaceOnUse' }, defs);
    [[0, 0], [.5, .45], [1, 0]].forEach(([o, op]) => {
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
      a, sombra, halo, vidrio, vidrioOperario, tinte, tiras, recorte, gradBrillo, gradLuz, luz, borde,
      esc: .3, sube: 0, adelante: 0, op: 0, act: 0   // valores animados
    };
  });

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
      ca.vidrioOperario.width = lienzo.width;
      ca.vidrioOperario.height = lienzo.height;
      ca.vidrioOperario.getContext('2d').drawImage(lienzo, 0, 0);
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
    objetivo = giro + normalizar(-i * paso - giro);
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
  let finRueda = 0;
  addEventListener('wheel', (e) => {
    e.preventDefault();
    if (abriendo || !N) return;
    const d = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * (e.deltaMode === 1 ? 33 : 1);
    activar(-1);
    centrando = false;
    ignorar = bajoCursor;
    objetivo = (objetivo === null ? giro : objetivo) - d * .18;
    pausaHasta = performance.now() + 5000;
    clearTimeout(finRueda);
    // Al terminar de girar, se acomoda en la carta más cercana
    finRueda = setTimeout(() => {
      const actual = objetivo === null ? giro : objetivo;
      objetivo = Math.round(actual / paso) * paso;
    }, 160);
  }, { passive: false });

  cartas.forEach((ca, i) => {
    ca.a.addEventListener('click', (e) => {
      e.preventDefault();
      // En pantallas táctiles: primer toque levanta la carta, segundo toque la abre
      if (e.pointerType === 'touch' && activa !== i) { activar(i); centrar(i); return; }
      abrir(i);
    });
  });

  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' && !e.target.closest('.carta')) activar(-1);
  });

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
    hudNom.textContent = CARTAS[i].titulo;
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
  function dibujarCarta(ca, grados, inclinacion, rot) {
    const th = grados * RAD;
    const Rc = radio + ca.adelante;
    const e = ca.esc;
    const dPhi = 2 * Math.atan((ANCHO_TIRA * e / 2) / Rc);   // ángulo que ocupa cada franja

    for (let j = 0; j < TIRAS; j++) {
      const a = grados + (j - (TIRAS - 1) / 2) * dPhi / RAD;
      ca.tiras[j].style.transform =
        `${inclinacion} translateY(${ca.sube}px) rotateY(${a}deg) translateZ(${Rc}px) scale(${e / F})`;
    }

    let d = '', poli = '';
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (let n = 0; n < SILUETA.length; n++) {
      const u = SILUETA[n][0], v = SILUETA[n][1];
      let j = Math.floor((u + ANCHO / 2) / ANCHO_TIRA);
      j = j < 0 ? 0 : j >= TIRAS ? TIRAS - 1 : j;
      const a = th + (j - (TIRAS - 1) / 2) * dPhi;
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
      const X = ORIGEN.x + (CENTRO.x + x3 - ORIGEN.x) * f;
      const Y = ORIGEN.y + (CENTRO.y + y2 - ORIGEN.y) * f;
      d += (n ? 'L' : 'M') + X.toFixed(1) + ',' + Y.toFixed(1);
      poli += (n ? ',' : '') + X.toFixed(1) + 'px ' + Y.toFixed(1) + 'px';
      if (X < x0) x0 = X; if (X > x1) x1 = X;
      if (Y < y0) y0 = Y; if (Y > y1) y1 = Y;
    }
    d += 'Z';

    ca.sombra.setAttribute('d', d);
    ca.recorte.setAttribute('d', d);
    ca.borde.setAttribute('d', d);
    ca.vidrio.style.clipPath = `polygon(${poli})`;
    ca.tinte.style.left = x0 + 'px';
    ca.tinte.style.top = y0 + 'px';
    ca.tinte.style.width = (x1 - x0) + 'px';
    ca.tinte.style.height = (y1 - y0) + 'px';

    // El vidrio solo deja ver al operario si la carta está delante de él
    ca.vidrioOperario.style.transform = inclinacion;
    ca.vidrioOperario.style.visibility = Math.cos(th) > 0 ? 'visible' : 'hidden';

    // Reflejo que recorre el vidrio según el ángulo
    const w = x1 - x0, pos = x0 + w * (.5 - Math.sin(th) * .6), yc = (y0 + y1) / 2;
    ca.gradBrillo.setAttribute('x1', pos - w * .3);
    ca.gradBrillo.setAttribute('x2', pos + w * .3);
    ca.gradBrillo.setAttribute('y1', yc - w * .08);
    ca.gradBrillo.setAttribute('y2', yc + w * .08);

    // Selección: borde naranja, halo y luz que sigue al cursor
    const s = ca.act;
    ca.borde.setAttribute('stroke', `rgba(${255 - 13 * s | 0},${255 - 149 * s | 0},${255 - 202 * s | 0},${(.75 + .2 * s).toFixed(2)})`);
    ca.borde.setAttribute('stroke-width', (1.5 + .5 * s).toFixed(2));
    ca.halo.style.display = s > .01 ? '' : 'none';
    if (s > .01) ca.halo.setAttribute('d', d);
    ca.halo.setAttribute('opacity', (s * .8).toFixed(2));
    ca.luz.setAttribute('opacity', s.toFixed(2));
    ca.gradLuz.setAttribute('cx', ex);
    ca.gradLuz.setAttribute('cy', ey);
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

      const grados = i * paso + giro;
      const c = Math.cos(grados * RAD);
      if (c > mejor) { mejor = c; frente = i; }

      // Orden de profundidad: el operario está en z-index 1000,
      // las cartas de adelante quedan por encima y las de atrás por debajo.
      const destacada = (i === activa || i === elegida) && c > 0 ? 600 : 0;
      ca.a.style.zIndex = 1000 + Math.round(c * 500) + (c >= 0 ? 1 : -1) + destacada;
      ca.a.style.opacity = ca.op === 1 ? '' : ca.op.toFixed(3);
      ca.a.classList.toggle('atras', c < -.15);

      dibujarCarta(ca, grados, inclinacion, rot);
    });
    actualizarHud(activa >= 0 ? activa : frente);

    requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);
})();
