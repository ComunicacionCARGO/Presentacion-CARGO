/* =========================================================
   CENTROS LOGÍSTICOS y su UBICACIÓN ESTRATÉGICA (una sola pantalla, .sv-ubi,
   después del mapa de distribución)
   - Izquierda: encabezado, total de m² y los 4 centros en una lista; el elegido
     se despliega (dirección, servicios, entrega y, los de Buenos Aires, la
     distancia hasta el depósito del cliente). m² que cuentan y barra comparada
     con el más grande.
   - Derecha: mapa de calles inclinado como el de distribución y con los bordes
     esfumados: las rutas de cada centro de Buenos Aires hasta el depósito de
     repuestos del cliente (con un camión que las recorre); la cámara centra la
     ruta elegida. Se alternan solos si nadie toca nada.
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
  // UBICACIÓN ESTRATÉGICA
  // =========================================================
  (function ubicacion() {
    const sec = document.querySelector('.sv-ubi');
    if (!sec) return;
    const U = S.ubicacion || {};
    const CEN = (U.centros || []).slice(0, 2);      // los centros con ruta en el mapa
    const CL = S.centros || {};
    const LISTA = (CL.lista || []).slice(0, 5);     // todos los centros (columna de la izquierda)
    const totalM2 = LISTA.reduce((a, c) => a + (+c.m2 || 0), 0);
    const maxM2 = Math.max(1, ...LISTA.map((c) => +c.m2 || 0));

    // ---- Plano de la zona con calles reales (mapa-pacheco.js: OpenStreetMap + recorridos de OSRM) ----
    // Todo viene en metros al este (x) y al norte (y) del depósito del cliente.
    const MP = window.MAPA_PACHECO || { lugares: {}, rutas: {}, calles: {}, areas: {}, arroyos: [], nombres: [] };
    // el plano cubre toda la zona descargada (x −3900..2298 m, y −2407..2197 m) a 0,29 px por metro;
    // la "cámara" (camara) lo corre y lo agranda para centrar la ruta elegida
    const ESC = .29, X0 = -3900, Y1 = 2197;
    const PW = Math.round((2298 - X0) * ESC), PH = Math.round((Y1 + 2407) * ESC);
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

    // ---- Argentina con las Malvinas (el mapita de referencia, abajo a la derecha) ----
    const GEO = window.MAPA_ARGENTINA || {};
    const MALV = (window.MALVINAS || {}).detalle || [];
    const ZONA = [-58.6873, -34.4325];            // el depósito del cliente en General Pacheco (lon, lat)
    const COSL = Math.cos(36 * Math.PI / 180);
    const ARG = (lon, lat) => [(lon + 74) * COSL * 22, (-21 - lat) * 22];
    const argD = [...Object.values(GEO), { anillos: MALV }].map((p) => (p.anillos || []).map((a) =>
      'M' + a.map(([lo, la]) => ARG(lo, la).map((v) => v.toFixed(1)).join(',')).join('L') + 'Z').join('')).join('');
    const AW = 20.5 * COSL * 22, AH = 35 * 22;     // tamaño del dibujo del país
    const [zx, zy] = ARG(ZONA[0], ZONA[1]);
    const argSVG = (clase) => `<svg class="${clase}" viewBox="0 0 ${AW.toFixed(0)} ${AH.toFixed(0)}" aria-hidden="true"><path d="${argD}"/><circle cx="${zx.toFixed(1)}" cy="${zy.toFixed(1)}" r="9"/></svg>`;

    // ---- Vista del país para los centros del interior (Rosario y Córdoba; pedido de la persona) ----
    // Solo la zona central (de Córdoba a Buenos Aires), con los bordes esfumados: el país entero ya
    // se vio en el mapa de distribución. Una flecha sale de los centros de Buenos Aires hacia el
    // elegido y desde ahí, flechitas naranjas hacia afuera: de ese centro sale a toda su zona.
    const REG = (U.regionales || []).slice(0, 4);
    const LON0 = -66.4, LAT1 = -29.4, KP = 96, COSP = Math.cos(33 * Math.PI / 180);
    const QW = 790, QH = 730;
    const Q = (lon, lat) => [(lon - LON0) * COSP * KP, (LAT1 - lat) * KP];
    const provD = (p) => (p.anillos || []).map((a) => 'M' + a.map(([lo, la]) => Q(lo, la).map((v) => v.toFixed(1)).join(',')).join('L') + 'Z').join('');
    const ORIGEN = Q(ZONA[0], ZONA[1]);
    const rutaPais = (r) => {
      const [x0, y0] = ORIGEN, [x1, y1] = Q(r.lon, r.lat);
      const cx = (x0 + x1) / 2 + (y1 - y0) * .2, cy = (y0 + y1) / 2 - (x1 - x0) * .2;
      return { d: `M${x0.toFixed(1)},${y0.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`, x1, y1, ang: Math.atan2(y1 - cy, x1 - cx) };
    };
    // flechitas que salen del centro, abiertas en abanico hacia adelante (a donde seguiría el camino)
    const abanico = (ru) => [-1.45, -.75, 0, .75, 1.45].map((da, j) => {
      const a = ru.ang + da, p = (r) => [ru.x1 + Math.cos(a) * r, ru.y1 + Math.sin(a) * r].map((v) => v.toFixed(1)).join(',');
      return `<path style="--j:${j}" d="M${p(30)}L${p(j === 2 ? 92 : 76)}"/>`;
    }).join('');
    const paisHTML = !REG.length ? '' :
      '<div class="ub-pais">' +
      `<svg class="up-dibujo" viewBox="0 0 ${QW} ${QH}" aria-hidden="true"><defs>` +
      '<marker id="up-punta" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto"><path d="M0 0L10 5L0 10z" fill="#EF4529"/></marker>' +
      '<marker id="up-punta-n" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3.4" markerHeight="3.4" orient="auto"><path d="M0 0L10 5L0 10z" fill="#F4A127"/></marker></defs>' +
      Object.entries(GEO).map(([k, p]) => `<path class="up-prov${k === 'B' ? ' ba' : ''}" d="${provD(p)}"/>`).join('') +
      REG.map((r) => { const ru = rutaPais(r); return `<g class="up-ruta" data-k="${esc(r.k)}"><path class="up-ruta-base" d="${ru.d}"/><path class="up-ruta-flujo" d="${ru.d}"/></g><g class="up-sale" data-k="${esc(r.k)}">${abanico(ru)}</g>`; }).join('') +
      [ORIGEN, ...REG.map((r) => Q(r.lon, r.lat))].map(([x, y], i) => `<circle class="up-pulso" style="--d:${i * .7}s" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="16"/>`).join('') +
      '</svg>' +
      `<div class="ub-lugar ba" style="left:${ORIGEN[0].toFixed(0)}px;top:${ORIGEN[1].toFixed(0)}px"><span class="ub-etq">${txt(U.origen)}</span><span class="ub-pin">${ICO.deposito}</span></div>` +
      REG.map((r) => { const [x, y] = Q(r.lon, r.lat); return `<div class="ub-lugar centro reg" data-k="${esc(r.k)}" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px"><span class="ub-etq">${txt(r.nombre)}</span><span class="ub-pin">${ICO.deposito}</span></div>`; }).join('') +
      `<span class="ub-camion up-camion">${ICO.camion}</span>` +
      '</div>';

    sec.insertAdjacentHTML('beforeend',
      '<div class="ub-izq">' +
      `<div class="ub-cab ent" style="--i:0"><p class="ub-ante">${txt(CL.antetitulo)}</p><h2 class="ub-titulo">${txt(CL.titulo)}</h2>` +
      `<p class="ub-bajada">${txt(CL.bajada)} ${txt(U.bajada)}</p></div>` +
      `<p class="ub-total ent" style="--i:1"><b data-n="${totalM2}">0</b><span>m²</span><small>${txt(CL.totalTexto)}</small></p>` +
      '<div class="ub-lista">' + LISTA.map((c, i) => {
        const r = CEN.find((cc) => cc.k === c.ubicacion);
        const g = REG.find((cc) => cc.k === c.ubicacion);
        const k = (r || g || {}).k;
        return `<button type="button" class="ub-c ent" style="--i:${i + 2}" data-i="${i}"${k ? ` data-k="${esc(k)}"` : ''}>` +
          `<span class="ub-c-cab">${ICO.deposito}<span class="ub-c-nom"><small>Centro logístico</small><b>${txt(c.nombre)}</b></span>` +
          `<span class="ub-c-m2"><b data-n="${+c.m2 || 0}">0</b><small>m²</small></span></span>` +
          `<i class="ub-c-barra"><i style="--p:${((+c.m2 || 0) / maxM2 * 100).toFixed(1)}%"></i></i>` +
          '<span class="ub-c-det"><span><ul>' +
          (r ? `<li class="ub-c-dist">${ICO.camion}<span><b>${esc(r.km)} km · ${+r.minutos || 0} min</b> hasta el ${txt(U.destino)}</span></li>` : '') +
          (g ? `<li class="ub-c-dist">${ICO.camion}<span>${txt(U.regional)}</span></li>` : '') +
          `<li>${ICO.pin}<span>${txt(c.direccion)}</span></li><li>${ICO.crece}<span>${txt(c.servicios)}</span></li><li>${ICO.reloj}<span>${txt(c.entrega)}</span></li>` +
          '</ul></span></span>' +
          (k ? '<i class="ub-c-tiempo"></i>' : '') + '</button>';
      }).join('') + '</div></div>' +
      // escenario del mapa
      '<div class="ub-escena">' +
      '<div class="ub-plano">' +
      `<svg class="ub-dibujo" viewBox="0 0 ${PW} ${PH}" aria-hidden="true">` +
      `<rect width="${PW}" height="${PH}" class="ub-suelo"/>` +
      dibujoReal +
      Object.entries(LUGARES).map(([k, [x, y]], i) => `<circle class="ub-pulso${k === 'destino' ? ' destino' : ''}" style="--d:${i * .6}s" cx="${P(x, y)[0].toFixed(0)}" cy="${P(x, y)[1].toFixed(0)}" r="18"/>`).join('') +
      Object.entries(ALTERNATIVAS).map(([k, lista]) => lista.map((pts, j) => `<g class="ub-alt" data-k="${k}" data-j="${j}"><path class="ub-alt-borde" d="${linea(pts)}"/><path class="ub-alt-linea" d="${linea(pts)}"/></g>`).join('')).join('') +
      Object.entries(RUTAS).filter(([, pts]) => pts).map(([k, pts]) => `<g class="ub-rec" data-k="${k}"><path class="ub-rec-sombra" d="${linea(pts)}"/><path class="ub-rec-base" d="${linea(pts)}"/><path class="ub-rec-flujo" d="${linea(pts)}"/></g>`).join('') +
      '</svg>' +
      Object.entries(LUGARES).map(([k, [x, y]]) => {
        const [px, py] = P(x, y);
        const c = CEN.find((cc) => cc.k === k);
        const nombre = k === 'destino' ? txt(U.destino) : txt(c ? c.nombre : k);
        return `<div class="ub-lugar ${k === 'destino' ? 'destino' : 'centro'}" data-k="${k}" style="left:${px.toFixed(0)}px;top:${py.toFixed(0)}px">` +
          `<span class="ub-etq">${nombre}</span>` +
          (k === 'destino' && U.pinDestino
            ? `<img class="ub-pin-cliente" src="../../${esc(U.pinDestino)}" alt="">`
            : `<span class="ub-pin">${k === 'destino' ? ICO.repuestos : ICO.deposito}</span>`) + '</div>';
      }).join('') +
      CEN.map((c) => `<span class="ub-dist" data-k="${esc(c.k)}"><b>${esc(c.km)} km</b> · ${+c.minutos || 0} min</span>` +
        (c.alternativas || []).map((a, j) => `<span class="ub-dist alt" data-k="${esc(c.k)}" data-j="${j}"><b>${esc(a.km)} km</b> · ${+a.minutos || 0} min</span>`).join('')).join('') +
      `<span class="ub-camion">${ICO.camion}</span>` +
      '</div>' +
      paisHTML +
      '</div>' +
      `<div class="ub-mini"><span>${txt(U.zona)}</span>${argSVG('ub-mini-arg')}</div>` +
      `<p class="ub-osm">${U.nota ? txt(U.nota) + ' · ' : ''}Mapa © colaboradores de OpenStreetMap</p>`);

    // el título grande se achica si no entra en la columna (CROSSDOCKING es largo)
    function ajustarTitulo() {
      const h = sec.querySelector('.ub-titulo');
      h.style.fontSize = '';
      let t = parseFloat(getComputedStyle(h).fontSize);
      while (h.scrollWidth > h.clientWidth + 1 && t > 40) { t -= 2; h.style.fontSize = t + 'px'; }
    }
    ajustarTitulo();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustarTitulo);
    // los m² cuentan la primera vez que se ve la sección
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
    // centros de la lista: el elegido se despliega (los de Buenos Aires, además, muestran su ruta)
    const filas = [...sec.querySelectorAll('.ub-c')];
    function desplegar(i) { filas.forEach((f, k) => f.classList.toggle('abierta', k === i)); }

    const plano = sec.querySelector('.ub-plano');
    Object.assign(plano.style, { width: PW + 'px', height: PH + 'px', marginLeft: -PW / 2 + 'px', marginTop: -PH / 2 + 'px' });
    const camion = sec.querySelector('.ub-camion');
    const recs = {}, dists = {};
    sec.querySelectorAll('.ub-rec').forEach((g) => { const p = g.querySelector('.ub-rec-base'); recs[g.dataset.k] = { g, p, largo: p.getTotalLength() }; });
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
      // que entre en unos 700 × 420 px de pantalla (el plano inclinado se ve más bajo), con aire a los costados
      const S = Math.max(.8, Math.min(1.55, 700 / Math.max(c.w, 1), 420 / Math.max(c.h * .78, 1))) * factor;
      plano.style.transform = `translate(-40px, 34px) rotateX(42deg) rotateZ(-6deg) scale(${S.toFixed(3)}) translate(${(PW / 2 - c.cx).toFixed(1)}px, ${(PH / 2 - c.cy).toFixed(1)}px)`;
      plano.style.setProperty('--inv', (1 / S).toFixed(3));
    }

    // ---- La vista del país: la cámara se aleja desde Buenos Aires (y se acerca al volver) ----
    const pais = sec.querySelector('.ub-pais');
    const regs = {};
    if (pais) {
      Object.assign(pais.style, { width: QW + 'px', height: QH + 'px', marginLeft: -QW / 2 + 'px', marginTop: -QH / 2 + 'px' });
      pais.querySelectorAll('.up-ruta').forEach((g) => { const p = g.querySelector('.up-ruta-base'); regs[g.dataset.k] = { g, p, largo: p.getTotalLength(), sale: pais.querySelector(`.up-sale[data-k="${g.dataset.k}"]`) }; });
    }
    const camionPais = sec.querySelector('.up-camion');
    // encuadre: de Córdoba a Buenos Aires, con lugar para las flechitas
    const cajaPais = (() => {
      const pts = [ORIGEN, ...REG.map((r) => Q(r.lon, r.lat))];
      const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
      const x0 = Math.min(...xs) - 90, x1 = Math.max(...xs) + 40, y0 = Math.min(...ys) - 90, y1 = Math.max(...ys) + 60;
      return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, S: Math.min(1.35, 760 / (x1 - x0), 460 / ((y1 - y0) * .78)) };
    })();
    function camaraPais(enBA, sinTransicion) {
      if (!pais) return;
      // enBA: muy cerca de Buenos Aires (de ahí "sale" la cámara al pasar del plano de calles al país)
      const S = enBA ? cajaPais.S * 3 : cajaPais.S;
      const cx = enBA ? ORIGEN[0] : cajaPais.cx, cy = enBA ? ORIGEN[1] : cajaPais.cy;
      if (sinTransicion) pais.style.transition = 'none';
      pais.style.transform = `translate(-40px, 34px) rotateX(42deg) rotateZ(-6deg) scale(${S.toFixed(3)}) translate(${(QW / 2 - cx).toFixed(1)}px, ${(QH / 2 - cy).toFixed(1)}px)`;
      pais.style.setProperty('--inv', (1 / S).toFixed(3));
      if (sinTransicion) { void pais.offsetWidth; pais.style.transition = ''; }
    }
    camaraPais(true, true);

    let actual = null, actualCalle = null, vista = 'calle', t0 = 0, uso = -1e9, enVista = false, zoomHecho = false;
    const DUR = 2600;    // ms que tarda el camión
    function elegir(k, auto) {
      if (!recs[k] && !regs[k]) return;
      if (!auto) uso = performance.now();
      actual = k;
      sec.dataset.sel = k;
      const antes = vista;
      vista = regs[k] ? 'pais' : 'calle';
      sec.dataset.vista = vista;
      if (vista === 'pais') {
        // del plano de calles al país: el plano se aleja y se apaga, y el país aparece alejándose desde Buenos Aires
        if (antes !== 'pais') { if (actualCalle) camara(actualCalle, .35); camaraPais(true, true); requestAnimationFrame(() => camaraPais(false)); }
        Object.entries(regs).forEach(([kk, r]) => {
          r.g.classList.toggle('activo', kk === k);
          r.sale.classList.toggle('activo', kk === k);
          r.g.style.setProperty('--largo', r.largo.toFixed(0));
          if (kk === k) { r.g.classList.remove('dibuja'); void r.g.getBoundingClientRect(); r.g.classList.add('dibuja'); }
        });
        sec.querySelectorAll('.ub-lugar.reg').forEach((el) => el.classList.toggle('activo', el.dataset.k === k));
        filas.forEach((f, i) => {
          f.classList.remove('auto');
          if (f.dataset.k === k) { desplegar(i); if (auto) { void f.offsetWidth; f.classList.add('auto'); } }
        });
        t0 = performance.now() + (antes !== 'pais' ? 1100 : 500);
        return;
      }
      // del país al plano de calles: la cámara se acerca a Buenos Aires
      if (antes === 'pais') camaraPais(true);
      actualCalle = k;
      if (sec.classList.contains('zoom')) camara(k);
      alts.forEach((g) => g.classList.toggle('visible', g.dataset.k === k));
      sec.querySelectorAll('.ub-dist.alt').forEach((el) => el.classList.toggle('visible', el.dataset.k === k));
      Object.entries(recs).forEach(([kk, r]) => {
        r.g.classList.toggle('activo', kk === k);
        r.g.style.setProperty('--largo', r.largo.toFixed(0));
        if (kk === k) { r.g.classList.remove('dibuja'); void r.g.getBoundingClientRect(); r.g.classList.add('dibuja'); }
      });
      // en la lista se despliega ese centro (con la barrita de tiempo si fue solo)
      filas.forEach((f, i) => {
        f.classList.remove('auto');
        if (f.dataset.k === k) { desplegar(i); if (auto) { void f.offsetWidth; f.classList.add('auto'); } }
      });
      Object.entries(dists).forEach(([kk, el]) => el.classList.toggle('visible', kk === k));
      sec.querySelectorAll('.ub-lugar.centro').forEach((el) => el.classList.toggle('activo', el.dataset.k === k));
      t0 = performance.now() + 500;
    }
    // con clic (al pasar el cursor no: con el scroll las tarjetas pasan solas por debajo del mouse)
    filas.forEach((f, i) => f.addEventListener('click', () => {
      if (f.dataset.k) { elegir(f.dataset.k); return; }
      uso = performance.now();
      filas.forEach((g) => g.classList.remove('auto'));
      desplegar(i);
    }));
    sec.querySelectorAll('.ub-lugar.centro').forEach((el) => el.addEventListener('click', () => elegir(el.dataset.k)));
    // en la vista del país, los centros de Buenos Aires vuelven al plano de calles
    sec.querySelectorAll('.ub-lugar.ba').forEach((el) => el.addEventListener('click', () => elegir(actualCalle || (CEN[0] && CEN[0].k))));
    window.UBICACION = { elegir };

    // camión que recorre el camino elegido (y queda en el depósito un rato)
    (function cuadro(t) {
      requestAnimationFrame(cuadro);
      if (!enVista || !actual) return;
      const enPais = vista === 'pais';
      const r = enPais ? regs[actual] : recs[actual], cam = enPais ? camionPais : camion;
      if (!r || !cam) return;
      const p = Math.max(0, Math.min(1, (t - t0) / (enPais ? DUR * 1.15 : DUR)));
      const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const q = r.p.getPointAtLength(e * r.largo), q2 = r.p.getPointAtLength(Math.min(r.largo, e * r.largo + 2));
      cam.style.left = q.x.toFixed(1) + 'px';
      cam.style.top = q.y.toFixed(1) + 'px';
      cam.classList.toggle('izq', q2.x < q.x - .01);
      cam.classList.toggle('llego', p >= 1);
    })(performance.now());

    // alterna solo si nadie toca nada, por los cuatro centros en el orden de la lista (por cercanía)
    setInterval(() => {
      if (!enVista || !zoomHecho || performance.now() - uso < 9000) return;
      const ks = filas.map((f) => f.dataset.k).filter((k) => recs[k] || regs[k]);
      elegir(ks[(ks.indexOf(actual) + 1) % ks.length], true);
    }, 6000);

    new IntersectionObserver((en) => {
      enVista = en[0].isIntersecting;
      sec.classList.toggle('en-vista', enVista);
      if (enVista && !zoomHecho) {
        zoomHecho = true;
        sec.classList.add('visible');
        setTimeout(contar, 350);
        // el mapa aparece con un fundido, ya centrado en la primera ruta (sin zoom de entrada:
        // a la persona no le gustó cómo se veía el país agrandado, pixelado)
        // el primero de la lista que tenga ruta en el plano de calles (Plaza Logística, el más cercano)
        const primero = actualCalle || (filas.map((f) => f.dataset.k).find((k) => recs[k])) || (CEN[0] && CEN[0].k);
        camara(primero);
        setTimeout(() => sec.classList.add('zoom'), 250);
        setTimeout(() => { sec.classList.add('listo'); if (!actual) elegir(primero, true); }, 1100);
      }
    }, { threshold: .4 }).observe(sec);
  })();
})();
