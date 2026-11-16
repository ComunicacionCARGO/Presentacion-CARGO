/* =========================================================
   CENTROS LOGÍSTICOS y UBICACIÓN ESTRATÉGICA (después del mapa de distribución)
   - Centros: 4 tarjetas (m² que cuentan, barra comparada con el más grande,
     dirección, servicios y entrega); las de Buenos Aires bajan al mapa.
   - Ubicación: zoom desde Argentina hasta la zona de General Pacheco y un mapa
     de calles estilizado, inclinado como el de distribución y con los bordes
     esfumados: el recorrido de cada centro hasta el depósito de repuestos del
     cliente (con un camión que lo recorre). Se alternan solos si nadie toca nada.
   Textos en datos/servicio.js → centros y ubicacion.
   El mapa de la zona usa calles reales (mapa-pacheco.js: OpenStreetMap) y los
   recorridos por calle de OSRM, con las coordenadas que pasó la persona.
   ========================================================= */
(function () {
  const SV = window.SV;
  if (!SV) return;
  const { S, txt, esc, crear } = SV;
  const NS = 'http://www.w3.org/2000/svg';
  const ICO = {
    deposito: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2 1.5 8v14h21V8L12 2zM6 12h12v10H6z"/><path d="M6 14h12v2H6zM6 18h12v2H6z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 1.5a7.4 7.4 0 0 0-7.4 7.4c0 5.4 7.4 13.6 7.4 13.6s7.4-8.2 7.4-13.6A7.4 7.4 0 0 0 12 1.5zm0 4.4a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg>',
    crece: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 21h20v-2H4V3H2z"/><path d="m6 16.5 5.2-5.2 3 3L19 9.5V13h2V6h-7v2h3.6l-3.4 3.4-3-3L4.6 15.1z"/></svg>',
    reloj: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 1h6v2H9z"/><path fill-rule="evenodd" d="M12 4a9 9 0 1 1 0 18 9 9 0 0 1 0-18zm0 2.4a6.6 6.6 0 1 0 0 13.2 6.6 6.6 0 0 0 0-13.2zM11 8h2v4.6l3 1.8-1 1.7-4-2.4z"/></svg>',
    flecha: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 11h11l-4-4 1.4-1.4L19.8 12l-6.4 6.4L12 17l4-4H5z"/></svg>',
    camion: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 5h13v11H1zM15 8.5h4.6L23 12.8V16h-8z"/><circle cx="5.5" cy="18" r="2.6"/><circle cx="18.5" cy="18" r="2.6"/></svg>',
    repuestos: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M10.3 1.5h3.4l.5 2.6 1.9.8 2.2-1.5 2.4 2.4-1.5 2.2.8 1.9 2.6.5v3.4l-2.6.5-.8 1.9 1.5 2.2-2.4 2.4-2.2-1.5-1.9.8-.5 2.6h-3.4l-.5-2.6-1.9-.8-2.2 1.5-2.4-2.4 1.5-2.2-.8-1.9-2.6-.5v-3.4l2.6-.5.8-1.9-1.5-2.2 2.4-2.4 2.2 1.5 1.9-.8zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>'
  };
  const fmt = (n) => Math.round(n).toLocaleString('es-AR');

  // =========================================================
  // CENTROS LOGÍSTICOS
  // =========================================================
  (function centros() {
    const sec = document.querySelector('.sv-cen');
    if (!sec) return;
    const C = S.centros || {};
    const L = (C.lista || []).slice(0, 4);
    const total = L.reduce((a, c) => a + (+c.m2 || 0), 0);
    const max = Math.max(1, ...L.map((c) => +c.m2 || 0));
    sec.insertAdjacentHTML('beforeend',
      `<div class="cn-cab ent" style="--i:0"><p class="cn-ante">${txt(C.antetitulo)}</p><h2 class="cn-titulo">${txt(C.titulo)}</h2><p class="cn-bajada">${txt(C.bajada)}</p></div>` +
      `<div class="cn-total ent" style="--i:1"><b data-n="${total}">0</b><span>m²<small>${txt(C.totalTexto)}</small></span></div>` +
      '<div class="cn-lista">' + L.map((c, i) =>
        `<article class="cn-tarjeta ent" style="--i:${i + 2}">` +
        `<p class="cn-nombre">${ICO.deposito}<span><small>Centro logístico</small><b>${txt(c.nombre)}</b></span></p>` +
        `<p class="cn-m2"><b data-n="${+c.m2 || 0}">0</b><span>m²</span></p>` +
        `<i class="cn-barra"><i style="--p:${((+c.m2 || 0) / max * 100).toFixed(1)}%"></i></i>` +
        `<ul><li>${ICO.pin}<span>${txt(c.direccion)}</span></li><li>${ICO.crece}<span>${txt(c.servicios)}</span></li><li>${ICO.reloj}<span>${txt(c.entrega)}</span></li></ul>` +
        (c.ubicacion ? `<button type="button" class="cn-ver" data-u="${esc(c.ubicacion)}">${txt(C.botonUbicacion)}${ICO.flecha}</button>` : '') +
        '</article>').join('') + '</div>');
    // los números cuentan la primera vez que se ve la sección
    function contar() {
      sec.querySelectorAll('[data-n]').forEach((el, k) => {
        const fin = +el.dataset.n, t0 = performance.now() + k * 90, dur = 1300;
        (function paso(t) {
          const p = Math.max(0, Math.min(1, (t - t0) / dur));
          el.textContent = fmt(fin * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(paso);
        })(performance.now());
      });
    }
    sec.querySelectorAll('.cn-ver').forEach((b) => b.addEventListener('click', () => {
      if (window.UBICACION) window.UBICACION.elegir(b.dataset.u);
      SV.irA(document.querySelector('.sv-ubi'));
    }));
    new IntersectionObserver((en, obs) => {
      if (!en[0].isIntersecting) return;
      obs.disconnect();
      sec.classList.add('visible');
      setTimeout(contar, 350);
    }, { threshold: .3 }).observe(sec);
  })();

  // =========================================================
  // UBICACIÓN ESTRATÉGICA
  // =========================================================
  (function ubicacion() {
    const sec = document.querySelector('.sv-ubi');
    if (!sec) return;
    const U = S.ubicacion || {};
    const CEN = (U.centros || []).slice(0, 2);

    // ---- Plano de la zona con calles reales (mapa-pacheco.js: OpenStreetMap + recorridos de OSRM) ----
    // Todo viene en metros al este (x) y al norte (y) del depósito del cliente.
    const MP = window.MAPA_PACHECO || { lugares: {}, rutas: {}, calles: {}, areas: {}, arroyos: [], nombres: [] };
    // el plano cubre toda la zona descargada (x −3275..1820 m, y −1941..1221 m) a 0,29 px por metro;
    // la "cámara" (enfocar) lo corre y lo agranda para centrar la ruta elegida
    const ESC = .29, X0 = -3275, Y1 = 1221;
    const PW = Math.round((1820 - X0) * ESC), PH = Math.round((Y1 + 1941) * ESC);
    const P = (x, y) => [(x - X0) * ESC, (Y1 - y) * ESC];
    const LUGARES = { destino: [0, 0], ...(MP.lugares || {}) };
    const linea = (plano) => { let d = ''; for (let i = 0; i < plano.length; i += 2) { const [x, y] = P(plano[i], plano[i + 1]); d += (i ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1); } return d; };
    const capa = (lista, cerrar) => (lista || []).map((l) => linea(l) + (cerrar ? 'Z' : '')).join('');
    const C = MP.calles || {}, A = MP.areas || {};
    const dibujoReal =
      `<path class="ub-verde" d="${capa(A.verde, true)}"/>` +
      `<path class="ub-industria" d="${capa(A.industria, true)}"/>` +
      `<path class="ub-agua" d="${capa(A.agua, true)}"/>` +
      `<path class="ub-arroyo" d="${capa(MP.arroyos)}"/>` +
      `<path class="ub-servicio" d="${capa(C.servicio)}"/>` +
      `<path class="ub-barrio-borde" d="${capa(C.barrio)}"/><path class="ub-barrio" d="${capa(C.barrio)}"/>` +
      `<path class="ub-secundaria-borde" d="${capa(C.secundaria)}"/><path class="ub-secundaria" d="${capa(C.secundaria)}"/>` +
      `<path class="ub-principal-borde" d="${capa(C.principal)}"/><path class="ub-principal" d="${capa(C.principal)}"/>` +
      `<path class="ub-autopista-borde" d="${capa(C.autopista)}"/><path class="ub-autopista" d="${capa(C.autopista)}"/>` +
      (MP.nombres || []).map((n) => { const [x, y] = P(n.x, n.y); return `<text class="ub-nombre" transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${-n.ang})">${esc(n.n)}</text>`; }).join('');
    const RUTAS = { benavidez: (MP.rutas || {}).benavidez, plaza: (MP.rutas || {}).plaza };
    const ALTERNATIVAS = ((MP.rutas || {}).alternativas) || {};   // rutas alternativas por centro (como en Google)

    // ---- Argentina (para el zoom de entrada y el mapita de referencia) ----
    const GEO = window.MAPA_ARGENTINA || {};
    const ZONA = [-58.6873, -34.4325];            // el depósito del cliente en General Pacheco (lon, lat)
    const COSL = Math.cos(36 * Math.PI / 180);
    const ARG = (lon, lat) => [(lon + 74) * COSL * 22, (-21 - lat) * 22];
    const argD = Object.values(GEO).map((p) => (p.anillos || []).map((a) =>
      'M' + a.map(([lo, la]) => ARG(lo, la).map((v) => v.toFixed(1)).join(',')).join('L') + 'Z').join('')).join('');
    const AW = 20.5 * COSL * 22, AH = 35 * 22;     // tamaño del dibujo del país
    const [zx, zy] = ARG(ZONA[0], ZONA[1]);
    const argSVG = (clase) => `<svg class="${clase}" viewBox="0 0 ${AW.toFixed(0)} ${AH.toFixed(0)}" aria-hidden="true"><path d="${argD}"/><circle cx="${zx.toFixed(1)}" cy="${zy.toFixed(1)}" r="9"/></svg>`;

    sec.insertAdjacentHTML('beforeend',
      `<div class="ub-cab ent" style="--i:0"><p class="ub-ante">${txt(U.antetitulo)}</p><h2 class="ub-titulo">${txt(U.titulo)}</h2><p class="ub-bajada">${txt(U.bajada)}</p></div>` +
      '<div class="ub-opciones">' + CEN.map((c, i) =>
        `<button type="button" class="ub-op ent" style="--i:${i + 1}" data-k="${esc(c.k)}">` +
        `<span class="ub-op-ico">${ICO.deposito}</span><span class="ub-op-txt"><b>${txt(c.nombre)}</b><small>hasta el ${txt(U.destino)}</small></span>` +
        `<span class="ub-op-num"><b>${esc(c.km)}</b><small>km</small></span><span class="ub-op-num"><b>${+c.minutos || 0}</b><small>min</small></span>` +
        '<i class="ub-op-tiempo"></i></button>').join('') + '</div>' +
      `<p class="ub-nota ent" style="--i:3">${txt(U.nota)}</p>` +
      // escenario del mapa
      '<div class="ub-escena">' +
      argSVG('ub-argentina') +
      '<div class="ub-plano">' +
      `<svg class="ub-dibujo" viewBox="0 0 ${PW} ${PH}" aria-hidden="true">` +
      `<rect width="${PW}" height="${PH}" class="ub-suelo"/>` +
      dibujoReal +
      Object.values(LUGARES).map(([x, y], i) => `<circle class="ub-pulso" style="--d:${i * .6}s" cx="${P(x, y)[0].toFixed(0)}" cy="${P(x, y)[1].toFixed(0)}" r="18"/>`).join('') +
      Object.entries(ALTERNATIVAS).map(([k, lista]) => lista.map((pts, j) => `<g class="ub-alt" data-k="${k}" data-j="${j}"><path class="ub-alt-borde" d="${linea(pts)}"/><path class="ub-alt-linea" d="${linea(pts)}"/></g>`).join('')).join('') +
      Object.entries(RUTAS).filter(([, pts]) => pts).map(([k, pts]) => `<g class="ub-rec" data-k="${k}"><path class="ub-rec-sombra" d="${linea(pts)}"/><path class="ub-rec-base" d="${linea(pts)}"/><path class="ub-rec-flujo" d="${linea(pts)}"/></g>`).join('') +
      '</svg>' +
      Object.entries(LUGARES).map(([k, [x, y]]) => {
        const [px, py] = P(x, y);
        const c = CEN.find((cc) => cc.k === k);
        const nombre = k === 'destino' ? txt(U.destino) : txt(c ? c.nombre : k);
        return `<div class="ub-lugar ${k === 'destino' ? 'destino' : 'centro'}" data-k="${k}" style="left:${px.toFixed(0)}px;top:${py.toFixed(0)}px">` +
          `<span class="ub-etq">${nombre}</span><span class="ub-pin">${k === 'destino' ? ICO.repuestos : ICO.deposito}</span></div>`;
      }).join('') +
      CEN.map((c) => `<span class="ub-dist" data-k="${esc(c.k)}"><b>${esc(c.km)} km</b> · ${+c.minutos || 0} min</span>` +
        (c.alternativas || []).map((a, j) => `<span class="ub-dist alt" data-k="${esc(c.k)}" data-j="${j}"><b>${esc(a.km)} km</b> · ${+a.minutos || 0} min</span>`).join('')).join('') +
      `<span class="ub-camion">${ICO.camion}</span>` +
      '</div>' +
      '</div>' +
      `<div class="ub-mini">${argSVG('ub-mini-arg')}<span>${txt(U.zona)}</span></div>` +
      '<p class="ub-osm">Mapa © colaboradores de OpenStreetMap</p>');

    const plano = sec.querySelector('.ub-plano');
    Object.assign(plano.style, { width: PW + 'px', height: PH + 'px', marginLeft: -PW / 2 + 'px', marginTop: -PH / 2 + 'px' });
    const camion = sec.querySelector('.ub-camion');
    const recs = {}, ops = {}, dists = {};
    sec.querySelectorAll('.ub-rec').forEach((g) => { const p = g.querySelector('.ub-rec-base'); recs[g.dataset.k] = { g, p, largo: p.getTotalLength() }; });
    sec.querySelectorAll('.ub-op').forEach((b) => { ops[b.dataset.k] = b; });
    // alternativas de cada centro (se ven con ese centro elegido)
    const alts = [...sec.querySelectorAll('.ub-alt')];
    // etiqueta de distancia en la mitad de cada recorrido (las alternativas, en la mitad de la suya)
    sec.querySelectorAll('.ub-dist').forEach((el) => {
      const esAlt = el.classList.contains('alt');
      const g = esAlt ? alts.find((a) => a.dataset.k === el.dataset.k && a.dataset.j === el.dataset.j) : null;
      const p = esAlt ? g && g.querySelector('path') : recs[el.dataset.k] && recs[el.dataset.k].p;
      if (!p) { el.remove(); return; }
      const m = p.getPointAtLength(p.getTotalLength() * (esAlt ? .42 : .5));
      el.style.left = m.x.toFixed(0) + 'px'; el.style.top = m.y.toFixed(0) + 'px';
      if (!esAlt) dists[el.dataset.k] = el;
    });

    // ---- Cámara: corre y agranda el plano para centrar la ruta elegida (el otro centro puede quedar afuera) ----
    function cajaDe(k) {
      const pts = [...RUTAS[k] || [], ...[].concat(...(ALTERNATIVAS[k] || []))];
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (let i = 0; i < pts.length; i += 2) { const [x, y] = P(pts[i], pts[i + 1]); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0 };
    }
    function camara(k, factor = 1) {
      const c = cajaDe(k);
      // que entre en unos 820 × 470 px de pantalla (el plano inclinado se ve más bajo)
      const S = Math.max(.8, Math.min(1.55, 820 / Math.max(c.w, 1), 470 / Math.max(c.h * .78, 1))) * factor;
      plano.style.transform = `translate(-88px, 34px) rotateX(42deg) rotateZ(-6deg) scale(${S.toFixed(3)}) translate(${(PW / 2 - c.cx).toFixed(1)}px, ${(PH / 2 - c.cy).toFixed(1)}px)`;
      plano.style.setProperty('--inv', (1 / S).toFixed(3));
    }

    let actual = null, t0 = 0, uso = -1e9, enVista = false, zoomHecho = false;
    const DUR = 2600;    // ms que tarda el camión
    function elegir(k, auto) {
      if (!recs[k]) return;
      if (!auto) uso = performance.now();
      actual = k;
      sec.dataset.sel = k;
      if (sec.classList.contains('zoom')) camara(k);
      alts.forEach((g) => g.classList.toggle('visible', g.dataset.k === k));
      sec.querySelectorAll('.ub-dist.alt').forEach((el) => el.classList.toggle('visible', el.dataset.k === k));
      Object.entries(recs).forEach(([kk, r]) => {
        r.g.classList.toggle('activo', kk === k);
        r.g.style.setProperty('--largo', r.largo.toFixed(0));
        if (kk === k) { r.g.classList.remove('dibuja'); void r.g.getBoundingClientRect(); r.g.classList.add('dibuja'); }
      });
      Object.entries(ops).forEach(([kk, b]) => {
        b.classList.toggle('activo', kk === k);
        b.classList.remove('auto');
        if (kk === k && auto) { void b.offsetWidth; b.classList.add('auto'); }
      });
      Object.entries(dists).forEach(([kk, el]) => el.classList.toggle('visible', kk === k));
      sec.querySelectorAll('.ub-lugar.centro').forEach((el) => el.classList.toggle('activo', el.dataset.k === k));
      t0 = performance.now() + 500;
    }
    // con clic (al pasar el cursor no: con el scroll las tarjetas pasan solas por debajo del mouse)
    Object.values(ops).forEach((b) => b.addEventListener('click', () => elegir(b.dataset.k)));
    sec.querySelectorAll('.ub-lugar.centro').forEach((el) => el.addEventListener('click', () => elegir(el.dataset.k)));
    window.UBICACION = { elegir };

    // camión que recorre el camino elegido (y queda en el depósito un rato)
    (function cuadro(t) {
      requestAnimationFrame(cuadro);
      if (!enVista || !actual) return;
      const r = recs[actual];
      const p = Math.max(0, Math.min(1, (t - t0) / DUR));
      const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const q = r.p.getPointAtLength(e * r.largo), q2 = r.p.getPointAtLength(Math.min(r.largo, e * r.largo + 2));
      camion.style.left = q.x.toFixed(1) + 'px';
      camion.style.top = q.y.toFixed(1) + 'px';
      camion.classList.toggle('izq', q2.x < q.x - .01);
      camion.classList.toggle('llego', p >= 1);
    })(performance.now());

    // alterna solo si nadie toca nada
    setInterval(() => {
      if (!enVista || !zoomHecho || performance.now() - uso < 9000) return;
      const ks = CEN.map((c) => c.k);
      elegir(ks[(ks.indexOf(actual) + 1) % ks.length], true);
    }, 6000);

    new IntersectionObserver((en) => {
      enVista = en[0].isIntersecting;
      sec.classList.toggle('en-vista', enVista);
      if (enVista && !zoomHecho) {
        zoomHecho = true;
        sec.classList.add('visible');
        // zoom: el país crece hacia la zona y aparece el mapa de calles, ya centrado en la primera ruta
        const primero = actual || (CEN[0] && CEN[0].k);
        camara(primero, .35);
        setTimeout(() => { sec.classList.add('zoom'); camara(primero); }, 500);
        setTimeout(() => { sec.classList.add('listo'); if (!actual) elegir(primero, true); }, 2300);
      }
    }, { threshold: .4 }).observe(sec);
    // el país se ubica con la zona en el centro de la escena, que es desde donde crece el zoom
    const arg = sec.querySelector('.ub-argentina');
    const ALTO_ARG = 640, s = ALTO_ARG / AH;
    arg.style.height = ALTO_ARG + 'px';
    arg.style.width = (AW * s).toFixed(1) + 'px';
    arg.style.left = (590 - zx * s).toFixed(1) + 'px';
    arg.style.top = (470 - zy * s).toFixed(1) + 'px';
    arg.style.transformOrigin = `${(zx * s).toFixed(1)}px ${(zy * s).toFixed(1)}px`;
  })();
})();
