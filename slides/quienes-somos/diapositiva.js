/* =========================================================
   ¿QUIÉNES SOMOS? — arma la diapositiva a partir de datos/quienes-somos.js:
   franjas en V, línea de tiempo, números y mapa de sedes.
   ========================================================= */
(function () {
  const D = Object.assign({
    pregunta: '¿Quiénes somos?', lema: '', titulo: '', historia: '',
    lineaDeTiempo: [], segundosPorAnio: 12, numerosTitulo: '', numerosOperativosTitulo: '', numeros: [], sedes: []
  }, window.QUIENES_SOMOS || {});

  const $ = (s) => document.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
  const RAD = Math.PI / 180;

  // Convierte **texto** en negrita (y evita que se cuele HTML)
  const conNegritas = (t) => String(t || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  function crear(tag, clase, padre, html) {
    const el = document.createElement(tag);
    if (clase) el.className = clase;
    if (html !== undefined) el.innerHTML = html;
    if (padre) padre.appendChild(el);
    return el;
  }

  // ---------- Textos ----------
  $('.pregunta').textContent = D.pregunta;
  $('.lema').textContent = D.lema;
  $('.linea-titulo').textContent = D.titulo;
  $('.historia').innerHTML = conNegritas(D.historia);
  $('.numeros-titulo').textContent = D.numerosTitulo;

  // ---------- Franjas en V ----------
  // Cada franja es una zona que arranca en una línea en V y llega hasta abajo;
  // se pintan una encima de otra y así quedan las bandas del grosor justo.
  // Los números son la altura (px) de cada borde en los costados de la pantalla.
  const PENDIENTE = .413;   // inclinación de la V
  const PUNTA = 34;         // suavizado de la punta
  const BANDAS = [
    [427, '#3A3A3A'],       // franja gris oscuro
    [464, '#FFEFE3'],       // línea clara
    [476, '#EF4529'],       // franja roja
    [513, '#FFEFE3'],       // línea clara
    [525, '#EF4529']        // rojo que continúa hacia abajo
  ];
  const svgFranjas = $('.franjas');
  BANDAS.forEach(([y, color]) => {
    const borde = (x) => y + PENDIENTE * (800 - Math.abs(x - 800));
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', [
      `M-800,${borde(-800)}`,
      `L${800 - PUNTA},${borde(800 - PUNTA)}`,
      `Q800,${borde(800)} ${800 + PUNTA},${borde(800 + PUNTA)}`,
      `L2400,${borde(2400)}`,
      'L2400,901 L-800,901 Z'
    ].join(' '));
    p.setAttribute('fill', color);
    svgFranjas.appendChild(p);
  });

  // =========================================================
  // LÍNEA DE TIEMPO
  // =========================================================
  const LT = D.lineaDeTiempo;
  const n = LT.length;
  const seccionLinea = $('.seccion-linea');
  const contAnios = $('.anios'), contPuntos = $('.puntos');
  const hito = $('.hito'), hitoFoto = $('.hito-foto'), hitoTexto = $('.hito-texto');
  const btnAnt = $('.linea-botones .anterior'), btnSig = $('.linea-botones .siguiente');
  const contador = $('.linea-contador b');
  const dosDigitos = (k) => String(k).padStart(2, '0');

  // Posición horizontal de cada año: el primero en 121 px y el último en 1479 px
  const X = LT.map((_, i) => n > 1 ? 121 + i * (1358 / (n - 1)) : 800);

  const anios = LT.map((a, i) => {
    const el = crear('div', 'anio', contAnios);
    el.textContent = a.anio;
    el.style.left = X[i] + 'px';
    el.addEventListener('click', () => seleccionar(i));
    return el;
  });
  LT.forEach((a, i) => {
    const p = crear('div', 'punto', contPuntos);
    p.style.left = X[i] + 'px';
    p.title = a.anio;
    p.addEventListener('click', () => seleccionar(i));
  });
  $('.linea-contador span').textContent = '/ ' + dosDigitos(n);

  // ---------- Marcador del año ----------
  // 1) el punto rojo se apaga y el círculo blanco se achica al tamaño de los demás puntos,
  // 2) viaja hasta el año elegido, 3) el círculo se agranda y vuelve el punto rojo.
  const selector = $('.selector'), selBlanco = $('.sel-blanco'), selRojo = $('.sel-rojo'), selTallo = $('.sel-tallo');
  const CHICO = 34 / 56;
  let turnoMarcador = 0;

  const matriz = (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform);
  function cancelarMarcador() {
    [selector, selBlanco, selRojo, selTallo].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
  }
  function fijarMarcador(x, escala, opacidadRojo, tallo) {
    cancelarMarcador();
    selector.style.transform = `translateX(${x}px)`;
    selBlanco.style.transform = `scale(${escala})`;
    selRojo.style.opacity = opacidadRojo;
    selTallo.style.transform = `scaleY(${tallo})`;
  }
  const animar = (el, desde, hasta, duracion, curva, demora = 0) =>
    el.animate([desde, hasta], { duration: Math.max(1, duracion), easing: curva, delay: demora, fill: 'forwards' }).finished;

  async function moverMarcador(xDestino, inmediato) {
    const turno = ++turnoMarcador;
    // Parte desde donde esté en este momento (por si se interrumpe una animación)
    const x = matriz(selector).m41, esc = matriz(selBlanco).a;
    const op = parseFloat(getComputedStyle(selRojo).opacity), tallo = matriz(selTallo).d;
    fijarMarcador(x, esc, op, tallo);
    if (inmediato) { fijarMarcador(xDestino, 1, 1, 1); return; }
    try {
      await Promise.all([
        animar(selBlanco, { transform: `scale(${esc})` }, { transform: `scale(${CHICO})` }, 260 * (esc - CHICO) / (1 - CHICO), 'cubic-bezier(.5,0,.3,1)'),
        animar(selRojo, { opacity: op }, { opacity: 0 }, 200 * op, 'ease-out'),
        animar(selTallo, { transform: `scaleY(${tallo})` }, { transform: 'scaleY(0)' }, 180 * tallo, 'ease-in')
      ]);
      if (turno !== turnoMarcador) return;
      fijarMarcador(x, CHICO, 0, 0);
      await animar(selector, { transform: `translateX(${x}px)` }, { transform: `translateX(${xDestino}px)` },
        380 + Math.abs(xDestino - x) * .35, 'cubic-bezier(.65,0,.25,1)');
      if (turno !== turnoMarcador) return;
      fijarMarcador(xDestino, CHICO, 0, 0);
      await Promise.all([
        animar(selBlanco, { transform: `scale(${CHICO})` }, { transform: 'scale(1)' }, 420, 'cubic-bezier(.3,1.6,.5,1)'),
        animar(selRojo, { opacity: 0 }, { opacity: 1 }, 260, 'ease-out', 100),
        animar(selTallo, { transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }, 320, 'cubic-bezier(.2,.8,.2,1)', 160)
      ]);
      if (turno === turnoMarcador) fijarMarcador(xDestino, 1, 1, 1);
    } catch (e) { /* animación interrumpida por otro cambio de año */ }
  }

  // ---------- Ilustración o foto del año ----------
  function mostrarImagen(a, i) {
    hitoFoto.innerHTML = '<div class="grabado-fondo"></div>';
    const dibujo = () => {
      const nombre = (window.GRABADOS || {})[a.dibujo] ? a.dibujo : (window.GRABADOS_ORDEN || [])[i % 6];
      if (!nombre) return;
      const svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'grabado');
      svg.setAttribute('viewBox', '0 0 360 230');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = window.GRABADOS[nombre];
      hitoFoto.appendChild(svg);
    };
    if (a.foto) {
      const img = crear('img', 'foto-grabada', hitoFoto);
      img.alt = a.anio;
      img.decoding = 'async';
      img.src = '../../' + a.foto;
      img.onerror = () => { img.remove(); dibujo(); };
    } else {
      dibujo();
    }
  }

  function mostrarContenido(i) {
    const a = LT[i];
    mostrarImagen(a, i);
    hitoTexto.innerHTML = '';
    (a.hitos || []).forEach((h) => {
      // Año "*": comentario sobre la década, en cursiva
      const li = crear('li', h.anio === '*' ? 'comentario' : h.anio ? '' : 'sin-anio', hitoTexto);
      if (h.anio) crear('b', '', li).textContent = h.anio;
      crear('span', '', li, conNegritas(h.texto));
    });
    ajustarTexto();
  }

  // Si los hitos de un año no entran debajo de la línea, achica la letra de a poco
  const ALTO_TEXTO = 225;
  function ajustarTexto() {
    let t = 1;
    hitoTexto.style.setProperty('--t', t);
    while (hitoTexto.offsetHeight > ALTO_TEXTO && t > .5) {
      t -= .03;
      hitoTexto.style.setProperty('--t', t.toFixed(2));
    }
  }
  document.fonts.ready.then(ajustarTexto);

  let actual = -1;
  let turno = 0;   // evita que se mezclen animaciones si se cambia de año muy rápido

  function seleccionar(i, inmediato) {
    if (i < 0 || i >= n || i === actual) return;
    programarAuto();
    const sentido = i > actual ? 1 : -1;
    if (actual >= 0) anios[actual].classList.remove('activo');
    anios[i].classList.add('activo');
    moverMarcador(X[i], inmediato);
    contador.textContent = dosDigitos(i + 1);
    btnAnt.disabled = i === 0;
    btnSig.disabled = i === n - 1;
    actual = i;

    const mio = ++turno;
    if (inmediato) { mostrarContenido(i); return; }
    hito.getAnimations({ subtree: true }).forEach((an) => an.cancel());
    hito.animate(
      [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-36 * sentido}px)` }],
      { duration: 240, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' }
    ).finished.then(() => {
      if (mio !== turno) return;
      mostrarContenido(i);
      hito.animate(
        [{ opacity: 0, transform: `translateX(${36 * sentido}px)` }, { opacity: 1, transform: 'none' }],
        { duration: 600, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }
      );
      hitoFoto.animate(
        [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
        { duration: 750, easing: 'cubic-bezier(.65,0,.25,1)' }
      );
      [...hitoTexto.children].forEach((li, k) => li.animate(
        [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }],
        { duration: 500, delay: 120 + k * 90, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' }
      ));
    }).catch(() => {});
  }

  btnAnt.addEventListener('click', () => seleccionar(actual - 1));
  btnSig.addEventListener('click', () => seleccionar(actual + 1));

  // Flechas ← → cuando la línea de tiempo está en pantalla
  addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const r = seccionLinea.getBoundingClientRect();
    if (r.top > innerHeight * .75 || r.bottom < innerHeight * .25) return;
    seleccionar(actual + (e.key === 'ArrowRight' ? 1 : -1));
  });

  // ---------- Avance automático ----------
  // Si nadie toca la línea de tiempo mientras está en pantalla, pasa sola al
  // año siguiente (y del último vuelve al primero). Mover el mouse sobre ella,
  // hacer clic o usar las flechas reinicia la cuenta.
  const SEGUNDOS_AUTO = Number(D.segundosPorAnio) || 0;
  let reloj = null, lineaEnPantalla = false;
  function programarAuto() {
    clearTimeout(reloj);
    if (!SEGUNDOS_AUTO || !lineaEnPantalla || n < 2) return;
    reloj = setTimeout(() => seleccionar((actual + 1) % n), SEGUNDOS_AUTO * 1000);
  }
  seccionLinea.addEventListener('pointermove', programarAuto);
  seccionLinea.addEventListener('pointerdown', programarAuto);
  new IntersectionObserver((en) => {
    lineaEnPantalla = en[0].isIntersecting;
    programarAuto();
  }, { threshold: .6 }).observe(seccionLinea);

  if (n) seleccionar(0, true);

  // =========================================================
  // NÚMEROS con conteo animado (íconos sólidos rojos)
  // =========================================================
  const ICONOS = {
    ubicacion: '<path fill-rule="evenodd" d="M12 1.5a7.5 7.5 0 0 0-7.5 7.5c0 5.6 7.5 13.5 7.5 13.5s7.5-7.9 7.5-13.5A7.5 7.5 0 0 0 12 1.5zm0 10.3a2.8 2.8 0 1 1 0-5.6 2.8 2.8 0 0 1 0 5.6z"/>',
    deposito: '<path fill-rule="evenodd" d="M12 2 1.5 8v14h21V8L12 2zM6 12h12v10H6z"/><path d="M6 14h12v2H6zM6 18h12v2H6z"/>',
    racks: '<path d="M2.5 1.5h2.2v21H2.5zM19.3 1.5h2.2v21h-2.2zM4.7 8h14.6v2H4.7zM4.7 14.5h14.6v2H4.7zM4.7 20.5h14.6v2H4.7z"/><path d="M6.5 3.5h5.5V8H6.5zM12.5 10h5.5v4.5h-5.5zM7 16.5h5v4H7z"/>',
    personas: '<circle cx="9" cy="7" r="3.8"/><path d="M1.5 21c0-4.4 3.3-7.6 7.5-7.6s7.5 3.2 7.5 7.6z"/><circle cx="17.5" cy="8.3" r="3"/><path d="M16.6 13.4c3.4.2 5.9 3 5.9 7V21h-4.6c0-2.9-.9-5.5-2.7-7.2.5-.2.9-.4 1.4-.4z"/>',
    camion: '<path d="M1 4.5h13.5V17H1zM15.5 8.5h4.3l3.2 4v4.5h-7.5z"/><circle cx="5.5" cy="18.3" r="2.8" stroke="#FFFBF3" stroke-width="1.6"/><circle cx="18" cy="18.3" r="2.8" stroke="#FFFBF3" stroke-width="1.6"/>',
    ruta: '<path class="trazo" d="M5.5 18.5H14a3.2 3.2 0 0 0 0-6.4h-4a3.2 3.2 0 0 1 0-6.4h8.5"/><circle cx="5" cy="18.5" r="3.2"/><circle cx="19" cy="5.5" r="3.2"/>',
    contenedor: '<path fill-rule="evenodd" d="M1 5.5h22v13H1zM4.5 8v8h1.8V8zM8.8 8v8h1.8V8zM13.2 8v8H15V8zM17.6 8v8h1.8V8z"/>'
  };
  // Los destacados van grandes arriba; el resto, más chico debajo del subtítulo
  const formato = (v) => Math.round(v).toLocaleString('es-AR');
  const destacados = D.numeros.filter((d) => d.destacado);
  const operativos = D.numeros.filter((d) => !d.destacado);
  $('.numeros-subtitulo').textContent = D.numerosOperativosTitulo;
  $('.numeros-subtitulo').hidden = !D.numerosOperativosTitulo || !destacados.length || !operativos.length;
  $('.numeros-lista.destacados').hidden = !destacados.length;
  $('.numeros-lista.operativos').hidden = !operativos.length;

  destacados.concat(operativos).forEach((d, i) => {
    const li = crear('li', 'numero', $(d.destacado ? '.numeros-lista.destacados' : '.numeros-lista.operativos'));
    li.style.setProperty('--i', i);
    crear('span', 'numero-icono', li, `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[d.icono] || ICONOS.ubicacion}</svg>`);
    const valor = crear('span', 'numero-valor', li);
    if (d.prefijo) crear('span', 'pre', valor).textContent = d.prefijo;
    const cifra = crear('span', 'cifra', valor);
    cifra.textContent = '0';
    if (d.sufijo) crear('span', 'suf', valor).textContent = String(d.sufijo).trim();
    crear('span', 'numero-texto', li).textContent = d.texto;

    new IntersectionObserver((en, obs) => {
      if (!en[0].isIntersecting) return;
      obs.disconnect();
      li.classList.add('visible');
      const total = Number(d.valor) || 0, dur = 1800, inicio = performance.now() + 250 + i * 120;
      (function contar(t) {
        const p = Math.max(0, Math.min(1, (t - inicio) / dur));
        cifra.textContent = formato(total * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(contar);
      })(performance.now());
    }, { threshold: .5 }).observe(li);
  });

  // =========================================================
  // MAPA DE SEDES (contornos reales de Natural Earth)
  // =========================================================
  const GEO = {};
  // Se omiten islas muy alejadas de la costa (Juan Fernández) para que el mapa se lea limpio
  Object.entries(window.MAPA_SUDAMERICA || {}).forEach(([k, anillos]) => {
    GEO[k] = anillos.filter((r) => !r.every(([lon, lat]) => lon < -77.5 && lat < -30));
  });
  const PAISES = ['BR', 'AR'];                       // los que se levantan (AR queda arriba en el borde común)
  const NOMBRES = { AR: 'Argentina', BR: 'Brasil' };

  // Proyección Mercator → píxeles del plano del mapa
  const merc = ([lon, lat]) => [lon, -Math.log(Math.tan(Math.PI / 4 + lat * RAD / 2)) / RAD];
  let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
  Object.values(GEO).forEach((anillos) => anillos.forEach((r) => r.forEach((p) => {
    const [x, y] = merc(p);
    if (x < mnx) mnx = x; if (x > mxx) mxx = x;
    if (y < mny) mny = y; if (y > mxy) mxy = y;
  })));
  const W = 540;                                     // ancho del mapa en pantalla
  const ESC = W / (mxx - mnx), H = Math.round((mxy - mny) * ESC);
  const aPlano = (p) => { const [x, y] = merc(p); return [(x - mnx) * ESC, (y - mny) * ESC]; };
  // Bordes con curvas suaves: cada vértice es punto de control de una curva que pasa
  // por los puntos medios. Así el contorno simplificado se ve estilizado y no "low poly".
  // (Los países vecinos comparten los mismos vértices de frontera, así que siguen encajando.)
  const fmt = (p) => p[0].toFixed(1) + ',' + p[1].toFixed(1);
  const medio = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const trazo = (anillos) => anillos.map((r) => {
    const p = r.map(aPlano);
    const u = p[p.length - 1];
    if (p.length > 1 && u[0] === p[0][0] && u[1] === p[0][1]) p.pop();   // anillo cerrado: sin el punto repetido
    const n = p.length;
    let d = 'M' + fmt(medio(p[n - 1], p[0]));
    for (let i = 0; i < n; i++) d += 'Q' + fmt(p[i]) + ' ' + fmt(medio(p[i], p[(i + 1) % n]));
    return d + 'Z';
  }).join('');
  // Recuadro de un país en el plano (para que sus capas ocupen solo ese espacio)
  const cajaDe = (k) => {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    GEO[k].forEach((r) => r.forEach((pt) => {
      const [x, y] = aPlano(pt);
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }));
    return { x: Math.floor(x0), y: Math.floor(y0), w: Math.ceil(x1 - x0) + 1, h: Math.ceil(y1 - y0) + 1 };
  };
  const DIBUJO = {};
  Object.keys(GEO).forEach((k) => { DIBUJO[k] = trazo(GEO[k]); });

  const mapa = $('.mapa'), plano = $('.mapa-plano'), giro = $('.mapa-giro');
  plano.style.width = W + 'px';
  plano.style.height = H + 'px';
  plano.style.left = (800 - W) / 2 + 30 + 'px';
  plano.style.top = (900 - H) / 2 - 100 + 'px';

  const PROFUNDIDAD = 15, PASOS = 20;                // espesor del mapa y suavidad de sus lados
  const mezcla = (a, b, t) => {
    const ca = a.match(/\w\w/g).map((h) => parseInt(h, 16)), cb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
    return '#' + ca.map((v, k) => Math.round(v + (cb[k] - v) * t).toString(16).padStart(2, '0')).join('');
  };
  // Laterales: color fondo que se oscurece hacia abajo (sombra); rojo suave en Argentina y Brasil
  // y rojo intenso cuando el país está levantado
  const LADOS = { base: ['#F3E6DB', '#DDBAA6'], suave: ['#F2A68E', '#CF6A51'], pais: ['#DE3F22', '#A52612'] };
  // Cara superior color fondo con un leve degradé de vidrio
  // (un único degradé para todo el mapa, así no se notan los límites entre países)
  const CARA = `<linearGradient id="{id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="${H}"><stop offset="0" stop-color="#FFFEFB"/><stop offset="1" stop-color="#F8ECE2"/></linearGradient>`;
  const SIN_COSTURA = 'stroke-width=".9" stroke-linejoin="round"';   // tapa las rendijas entre piezas vecinas
  const extrusion = (id, colores) => {
    let s = '';
    for (let k = PASOS; k >= 1; k--) {
      const c = mezcla(colores[0], colores[1], k / PASOS);
      s += `<use href="#${id}" transform="translate(0 ${(k * PROFUNDIDAD / PASOS).toFixed(2)})" fill="${c}" stroke="${c}" ${SIN_COSTURA}/>`;
    }
    return s;
  };
  // ---------- Capas del mapa ----------
  // Rendimiento: las capas que no cambian (base, caras) se dibujan UNA sola vez al cargar,
  // en un lienzo al doble de resolución. Al aparecer el mapa, el navegador solo las mueve.
  const MARGEN = 50;   // espacio alrededor del lienzo para el brillo, la sombra y los lados
  const CAJA_MAPA = { x: 0, y: 0, w: W, h: H };
  // Cada lienzo cubre solo su recuadro (todo el mapa, o un país) más el margen
  function lienzo(clase, padre, caja = CAJA_MAPA) {
    const c = document.createElement('canvas');
    c.className = 'capa ' + clase;
    c.width = (caja.w + MARGEN * 2) * 2;
    c.height = (caja.h + MARGEN * 2) * 2;
    c.style.left = caja.x - MARGEN + 'px';
    c.style.top = caja.y - MARGEN + 'px';
    (padre || plano).appendChild(c);
    return c;
  }
  function lienzoDesdeSvg(clase, contenido, padre, caja = CAJA_MAPA) {
    const c = lienzo(clase, padre, caja);
    const img = new Image();
    img.onload = () => { c.getContext('2d').drawImage(img, 0, 0); URL.revokeObjectURL(img.src); };
    img.src = URL.createObjectURL(new Blob([
      `<svg xmlns="http://www.w3.org/2000/svg" width="${c.width}" height="${c.height}" ` +
      `viewBox="${caja.x - MARGEN} ${caja.y - MARGEN} ${caja.w + MARGEN * 2} ${caja.h + MARGEN * 2}">${contenido}</svg>`
    ], { type: 'image/svg+xml' }));
    return c;
  }
  // Siluetas invisibles y livianas para detectar el cursor sobre Argentina y Brasil
  function siluetas(clase, paises, padre) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'capa ' + clase);
    svg.setAttribute('width', W * 2);
    svg.setAttribute('height', H * 2);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = paises.map((k) => `<path class="toque" data-pais="${k}" d="${DIBUJO[k]}" fill="#000" fill-opacity="0"/>`).join('');
    (padre || plano).appendChild(svg);
  }
  const BRILLO = (id) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="${H}">` +
    '<stop offset=".28" stop-color="#fff" stop-opacity="0"/><stop offset=".4" stop-color="#fff" stop-opacity=".7"/>' +
    '<stop offset=".52" stop-color="#fff" stop-opacity="0"/></linearGradient>';

  // 1. Base: brillo rojo alrededor, sombra, espesor y cara superior de todo el continente
  //    (sin bordes entre países: todo es una sola pieza de vidrio)
  const TODOS = Object.keys(GEO);
  const todosUse = (attrs) => TODOS.map((k) => `<use href="#mb-${k}" ${attrs}/>`).join('');
  lienzoDesdeSvg('mapa-base',
    '<defs>' +
    TODOS.map((k) => `<path id="mb-${k}" d="${DIBUJO[k]}"/>`).join('') +
    CARA.replace('{id}', 'mb-cara') + BRILLO('mb-brillo') +
    `<clipPath id="mb-recorte">${TODOS.map((k) => `<use href="#mb-${k}"/>`).join('')}</clipPath>` +
    '<filter id="mb-halo" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>' +
    '<filter id="mb-sombra" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="12"/></filter>' +
    '</defs>' +
    `<g filter="url(#mb-halo)" opacity=".32" transform="translate(0 8)">${todosUse('fill="#EF4529"')}</g>` +
    `<g filter="url(#mb-sombra)" opacity=".16" transform="translate(6 26)">${todosUse('fill="#8C2A14"')}</g>` +
    TODOS.filter((k) => !PAISES.includes(k)).map((k) => extrusion('mb-' + k, LADOS.base)).join('') +
    PAISES.map((k) => extrusion('mb-' + k, LADOS.suave)).join('') +
    TODOS.map((k) => `<use href="#mb-${k}" fill="url(#mb-cara)" stroke="url(#mb-cara)" ${SIN_COSTURA}/>`).join('') +
    `<rect width="${W}" height="${H}" fill="url(#mb-brillo)" clip-path="url(#mb-recorte)" opacity=".55"/>`
  );
  siluetas('toques-base', PAISES);   // mantiene el país levantado si el cursor pasa por su base

  // 2. Por país: lados, cara superior y sedes.
  //    Al levantarse, el país sube y sus lados se estiran hasta la base:
  //    se ve como un solo bloque que sale del mapa, sin hueco debajo.
  const ELEVACION = 30;     // cuánto sube el país (px del plano)
  const PASOS_PAIS = 30;    // copias que forman sus lados (más = lados más suaves)
  const COLORES_PAIS = [];
  for (let i = 0; i <= PASOS_PAIS; i++) COLORES_PAIS[i] = mezcla(LADOS.pais[0], LADOS.pais[1], i / PASOS_PAIS);
  const paises = {};
  PAISES.forEach((k) => {
    const el = crear('div', 'pais', plano);
    const caja = cajaDe(k);
    // Los lados se pintan en un lienzo solo mientras el país sube o baja
    const capaLados = lienzo('lados', el, caja);
    // Cara en rojo suave (indica que se puede seleccionar) con el mismo reflejo de vidrio
    // que la base; encima, la roja intensa que aparece al levantarse
    lienzoDesdeSvg('cara',
      `<defs><linearGradient id="pcc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FAD0C1"/><stop offset="1" stop-color="#F3A38B"/></linearGradient>` +
      BRILLO('pcb') + `<clipPath id="pcr"><path d="${DIBUJO[k]}"/></clipPath></defs>` +
      `<path d="${DIBUJO[k]}" fill="url(#pcc)" stroke="url(#pcc)" ${SIN_COSTURA}/>` +
      `<rect width="${W}" height="${H}" fill="url(#pcb)" clip-path="url(#pcr)" opacity=".55"/>`, el, caja);
    const caraRoja = lienzoDesdeSvg('cara-roja',
      '<defs><linearGradient id="pc" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#F7916B"/><stop offset=".55" stop-color="#EF4529"/><stop offset="1" stop-color="#E23A1F"/></linearGradient></defs>' +
      `<path d="${DIBUJO[k]}" fill="url(#pc)"/>`, el, caja);
    siluetas('toque-pais', [k], el);

    // Sedes de este país
    const sedes = D.sedes.filter((s) => s.pais === k);
    let principal = null;
    sedes.forEach((s, i) => {
      const [x, y] = aPlano([s.lon, s.lat]);
      const sede = crear('div', 'sede', el, '<span class="sede-onda"></span><span class="sede-alfiler"></span>');
      sede.style.left = x.toFixed(1) + 'px';
      sede.style.top = y.toFixed(1) + 'px';
      sede.style.setProperty('--i', i);
      if (s.principal || !principal) principal = sede.querySelector('.sede-alfiler');
    });
    capaLados.style.opacity = 0;
    caraRoja.style.opacity = 0;
    paises[k] = {
      el, capaLados, caraRoja, caja, sedes, principal, sobre: 0, espera: 0,
      ctxLados: capaLados.getContext('2d'), ruta: new Path2D(DIBUJO[k]), altura: 0, meta: 0
    };
  });

  // Sube el país (en el plano) y estira sus lados para que lleguen hasta la base
  function dibujarAltura(p) {
    const t = p.altura / ELEVACION;
    p.el.style.transform = p.altura > .05 ? `translateZ(.5px) translateY(${-p.altura}px)` : '';
    const ctx = p.ctxLados, largo = PROFUNDIDAD + p.altura;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, p.capaLados.width, p.capaLados.height);
    if (t > .002) {
      for (let i = PASOS_PAIS; i >= 1; i--) {
        ctx.setTransform(2, 0, 0, 2, 2 * (MARGEN - p.caja.x), 2 * (MARGEN - p.caja.y + i * largo / PASOS_PAIS));
        ctx.fillStyle = COLORES_PAIS[i];
        ctx.fill(p.ruta);
      }
    }
    p.capaLados.style.opacity = t.toFixed(3);
    p.caraRoja.style.opacity = t.toFixed(3);
  }

  // 3. Tarjetas de vidrio con la lista de sedes y su línea punteada
  const info = $('.mapa-info'), lineas = $('.mapa-lineas');
  // Posición de cada tarjeta y de qué esquina sale su línea (x: izq/der, y: arriba/abajo)
  const POS_TARJETA = {
    BR: { left: 1312, top: 470, x: 'izq', y: 'arriba' },
    AR: { left: 800, top: 520, x: 'der', y: 'arriba' }
  };
  const ICONO_SEDE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2 1.5 8v14h21V8L12 2zM6 12h12v10H6z"/><path d="M6 14h12v2H6zM6 18h12v2H6z"/></svg>';
  PAISES.forEach((k) => {
    const p = paises[k];
    const t = crear('div', 'tarjeta-pais', info);
    t.style.left = POS_TARJETA[k].left + 'px';
    t.style.top = POS_TARJETA[k].top + 'px';
    t.innerHTML =
      `<div class="tp-cabeza">${ICONO_SEDE}<div><p class="tp-titulo">${NOMBRES[k]}</p><p class="tp-sub">Principales ubicaciones</p></div></div>` +
      '<ul class="tp-lista">' + p.sedes.map((s) => `<li><div><b>${conNegritas(s.ciudad)}</b><span>${conNegritas(s.detalle)}</span></div></li>`).join('') + '</ul>';
    p.tarjeta = t;
    p.linea = document.createElementNS(NS, 'path');
    p.punto = document.createElementNS(NS, 'circle');
    p.punto.setAttribute('r', 4);
    lineas.append(p.linea, p.punto);
  });

  // ---------- Levantar un país al pasar el cursor ----------
  function levantar(k, si) {
    const p = paises[k];
    if (si) PAISES.forEach((o) => { if (o !== k) levantar(o, false); });
    p.el.classList.toggle('levantado', si);
    p.meta = si ? ELEVACION : 0;
    p.tarjeta.classList.toggle('visible', si);
    p.linea.classList.toggle('visible', si);
    p.punto.classList.toggle('visible', si);
    p.activo = si;
  }
  // El país se mantiene levantado mientras el cursor esté sobre él o sobre su hueco
  plano.querySelectorAll('.toque').forEach((el) => {
    const k = el.dataset.pais, p = paises[k];
    el.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'touch') return;
      p.sobre++;
      clearTimeout(p.espera);
      if (!p.activo) levantar(k, true);
    });
    el.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'touch') return;
      p.sobre = Math.max(0, p.sobre - 1);
      clearTimeout(p.espera);
      p.espera = setTimeout(() => { if (!p.sobre) levantar(k, false); }, 160);
    });
    el.addEventListener('click', () => levantar(k, !p.activo));   // pantallas táctiles
  });

  // Aparece al entrar en pantalla
  new IntersectionObserver((en, obs) => {
    if (en[0].isIntersecting) { mapa.classList.add('visible'); obs.disconnect(); }
  }, { threshold: .3 }).observe(mapa);
  // Mientras el mapa no está en pantalla no se calcula nada por cuadro
  let mapaEnPantalla = false;
  new IntersectionObserver((en) => { mapaEnPantalla = en[0].isIntersecting; }).observe(mapa);

  // ---------- Inclinación con el mouse y líneas hacia las tarjetas ----------
  let mx = 0, my = 0, gx = 0, gy = 0;
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    mx = (e.clientX / innerWidth) * 2 - 1;
    my = (e.clientY / innerHeight) * 2 - 1;
  });
  (function cuadro() {
    requestAnimationFrame(cuadro);
    if (!mapaEnPantalla) return;

    // La inclinación solo se actualiza si el mouse se movió
    if (Math.abs(mx - gx) > .0005 || Math.abs(my - gy) > .0005) {
      gx += (mx - gx) * .06;
      gy += (my - gy) * .06;
      giro.style.transform = `rotateY(${(gx * 6).toFixed(3)}deg) rotateX(${(-gy * 4).toFixed(3)}deg)`;
    }

    PAISES.forEach((c) => {
      const p = paises[c];
      if (Math.abs(p.meta - p.altura) < .05) return;
      p.altura += (p.meta - p.altura) * .14;
      if (Math.abs(p.meta - p.altura) < .05) p.altura = p.meta;
      dibujarAltura(p);
    });

    // Línea punteada hacia la sede principal (solo si hay una tarjeta abierta)
    const abiertos = PAISES.filter((c) => paises[c].principal && paises[c].tarjeta.classList.contains('visible'));
    if (!abiertos.length) return;
    const caja = info.getBoundingClientRect();
    const k = caja.width / 1600;
    if (k > 0) abiertos.forEach((c) => {
      const p = paises[c];
      const r = p.principal.getBoundingClientRect();
      const px = (r.left + r.width / 2 - caja.left) / k, py = (r.top - caja.top) / k;
      const t = p.tarjeta, pos = POS_TARJETA[c];
      const ax = t.offsetLeft + (pos.x === 'izq' ? 46 : t.offsetWidth - 46);
      const ay = pos.y === 'abajo' ? t.offsetTop + t.offsetHeight : t.offsetTop;
      const dy = py - ay;
      p.linea.setAttribute('d', `M${ax},${ay} C${ax},${ay + dy * .55} ${px},${py - dy * .45} ${px},${py - 4}`);
      p.punto.setAttribute('cx', ax);
      p.punto.setAttribute('cy', ay);
    });
  })();

  // =========================================================
  // LOGROS: video de fondo en loop y tarjetas de vidrio flotantes
  // =========================================================
  (function () {
    const seccion = $('.seccion-logros');
    if (!seccion) return;
    $('.logros-titulo span').textContent = D.logrosAntetitulo || '';
    $('.logros-titulo b').textContent = D.logrosTitulo || '';
    $('.logros-nota').innerHTML = conNegritas(D.logrosNota);

    // Engranaje: 9 dientes y agujero central (se arma con trigonometría)
    const engranaje = (() => {
      const pts = [], dientes = 9, ext = 11.4, int = 8.6;
      for (let k = 0; k < dientes * 4; k++) {
        const a = (k / (dientes * 4)) * Math.PI * 2 - Math.PI / 2 + Math.PI / (dientes * 4);
        const r = (k % 4 < 2) ? ext : int;
        pts.push(`${(12 + r * Math.cos(a)).toFixed(2)},${(12 + r * Math.sin(a)).toFixed(2)}`);
      }
      return `<path fill-rule="evenodd" d="M${pts.join('L')}Z M12 8.3a3.7 3.7 0 1 0 0 7.4a3.7 3.7 0 1 0 0-7.4Z"/>`;
    })();
    const ICONOS_LOGRO = {
      insignia: '<path fill-rule="evenodd" d="M12 .8l2.7 2.1 3.4-.4 1.2 3.2 3 1.7-.9 3.3 1.3 3.2-2.8 2-.8 3.3-3.4.1L12 21.6l-2.7-2.1-3.4.1-.8-3.3-2.8-2 1.3-3.2-.9-3.3 3-1.7 1.2-3.2 3.4.4zM10.7 15.3l6-6-1.6-1.6-4.4 4.4-2.2-2.2-1.6 1.6z"/><path d="M7.3 19.6 5.6 23.4l2.9-.6 1.6 1.2 1.2-3.3zM16.7 19.6l1.7 3.8-2.9-.6-1.6 1.2-1.2-3.3z"/>',
      engranaje,
      trofeo: '<path d="M6 1.5h12V8a6 6 0 0 1-12 0z"/><path d="M6 3H2.6v2.6a4.6 4.6 0 0 0 4.1 4.6l-.3-2.1a2.5 2.5 0 0 1-1.7-2.4V5.1H6zM18 3h3.4v2.6a4.6 4.6 0 0 1-4.1 4.6l.3-2.1a2.5 2.5 0 0 0 1.7-2.4V5.1H18z"/><path d="M10.7 13.6h2.6v4h-2.6zM7.5 17.4h9v2.6h-9zM5.5 21h13v2h-13z"/>',
      medalla: '<path d="M4.4 .8h4.5l4 7.2a8.7 8.7 0 0 0-3.6 1.1zM19.6 .8h-4.5l-2.3 4.2 2.1 3.7a8.6 8.6 0 0 1 2.9 1.5z"/><path fill-rule="evenodd" d="M12 8.8a7.4 7.4 0 1 0 0 14.8a7.4 7.4 0 1 0 0-14.8zm0 2a5.4 5.4 0 1 1 0 10.8a5.4 5.4 0 1 1 0-10.8zm0 1.2a4.2 4.2 0 1 0 0 8.4a4.2 4.2 0 1 0 0-8.4z"/>'
    };

    const cont = $('.logros-tarjetas');
    const lista = D.logros || [];
    cont.style.setProperty('--n', lista.length || 1);
    const tarjetas = lista.map((d, i) => {
      const art = crear('article', 'logro', cont);
      art.style.setProperty('--i', i);
      const v = crear('div', 'logro-vidrio', art);
      crear('span', 'logro-num', v).textContent = String(i + 1).padStart(2, '0');
      const c = crear('div', 'logro-contenido', v);
      const cab = crear('div', 'logro-cabeza', c);
      const icono = crear('span', 'logro-icono', cab);
      const dibujarIcono = () => {
        icono.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS_LOGRO[d.icono] || ICONOS_LOGRO.trofeo}</svg>`;
      };
      // Ícono propio (archivo SVG); si no está, se usa el ícono incluido
      if (d.imagen) {
        const img = crear('img', '', icono);
        img.alt = '';
        img.decoding = 'async';
        img.onerror = dibujarIcono;
        img.src = '../../' + d.imagen;
      } else {
        dibujarIcono();
      }
      if (d.sigla) crear('span', 'logro-sigla', cab).textContent = d.sigla;
      crear('h3', 'logro-titulo', c).innerHTML = conNegritas(d.titulo);
      const ul = crear('ul', 'logro-premios', c);
      (d.premios || []).forEach((p) => {
        const li = crear('li', '', ul);
        crear('b', '', li).innerHTML = conNegritas(p.texto);
        if (p.fuente) crear('em', '', li).textContent = p.fuente;
      });
      if (d.texto) crear('p', 'logro-texto', c).innerHTML = conNegritas(d.texto);
      crear('i', 'logro-brillo', v);

      // Inclinación 3D y reflejo que siguen al cursor
      art.addEventListener('pointermove', (e) => {
        const r = v.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        v.style.setProperty('--ry', `${(x - .5) * 10}deg`);
        v.style.setProperty('--rx', `${(.5 - y) * 8}deg`);
        v.style.setProperty('--mx', `${x * 100}%`);
        v.style.setProperty('--my', `${y * 100}%`);
      });
      art.addEventListener('pointerenter', () => art.classList.add('activa'));
      art.addEventListener('pointerleave', () => {
        art.classList.remove('activa');
        v.style.setProperty('--rx', '0deg');
        v.style.setProperty('--ry', '0deg');
      });
      return c;
    });

    // Si una tarjeta tiene mucho texto, achica la letra hasta que entre
    function ajustarTarjetas() {
      tarjetas.forEach((c) => {
        const alto = c.parentElement.clientHeight - 58;
        let t = 1;
        c.style.setProperty('--t', t);
        while (c.offsetHeight > alto && t > .6) {
          t -= .03;
          c.style.setProperty('--t', t.toFixed(2));
        }
      });
    }
    ajustarTarjetas();
    document.fonts.ready.then(ajustarTarjetas);

    // Aparición al llegar a la sección
    new IntersectionObserver((en, obs) => {
      if (!en[0].isIntersecting) return;
      obs.disconnect();
      seccion.classList.add('visible');
    }, { threshold: .35 }).observe(seccion);

    // El video (ya preparado para repetirse) solo se reproduce cerca de la pantalla
    const video = seccion.querySelector('.logros-video video');
    new IntersectionObserver((en) => {
      if (en[0].isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { rootMargin: '50% 0px' }).observe(seccion);
  })();
})();
