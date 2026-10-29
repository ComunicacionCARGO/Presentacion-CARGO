/* =========================================================
   SERVICIO A MEDIDA — mapa interactivo de distribución.
   Arma el mapa de Argentina (vidrio extruido, como el de "¿Quiénes somos?"),
   las rutas propias y de redespacho, las zonas con sus lead times y el panel
   de filtros, a partir de datos/distribucion.js (que se genera desde el Excel).
   ========================================================= */
(function () {
  const D = Object.assign({ textos: {}, bases: [], entreBases: [], destinos: [], regiones: [], provincias: [] }, window.DISTRIBUCION || {});
  const GEO = window.MAPA_ARGENTINA || {};
  const $ = (s, r = document) => r.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
  const RAD = Math.PI / 180;

  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const conNegritas = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const normal = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/^provincia de /, '').replace(/\s+/g, ' ').trim();
  function crear(tag, clase, padre, html) {
    const el = document.createElement(tag);
    if (clase) el.className = clase;
    if (html !== undefined) el.innerHTML = html;
    if (padre) padre.appendChild(el);
    return el;
  }
  const horas = (r) => `${r.desde}–${r.hasta} h`;

  // ---------- Textos ----------
  const T = D.textos || {};
  $('.panel-ante span').textContent = T.antetitulo || '';
  $('.panel-titulo').innerHTML = conNegritas(T.titulo || '');
  $('.panel-bajada').innerHTML = conNegritas(T.bajada || '');
  if (T.sello) $('.sello-texto').textContent = T.sello;

  // =========================================================
  // DATOS: provincias, regiones, bases, destinos y conexiones
  // =========================================================
  const COD = {};                                   // nombre normalizado -> código de provincia
  Object.entries(GEO).forEach(([k, p]) => { COD[normal(p.nombre)] = k; });
  ['ciudad de buenos aires', 'ciudad autonoma de buenos aires', 'caba', 'capital federal'].forEach((a) => { COD[a] = 'B'; });
  COD['tierra del fuego, antartida e islas del atlantico sur'] = 'V';
  const codDe = (nombre) => COD[normal(nombre)] || null;
  const nombreDe = (k) => (GEO[k] ? GEO[k].nombre : '');

  const REGION = {};
  D.regiones.forEach((r) => { REGION[normal(r.nombre)] = r; });
  const regionDe = {};                              // código -> región
  D.provincias.forEach((p) => {
    const c = codDe(p.nombre), r = REGION[normal(p.region)];
    if (c && r) regionDe[c] = r;
  });

  const bases = D.bases.map((b) => Object.assign({}, b, { cod: codDe(b.provincia), id: normal(b.nombre) })).filter((b) => b.cod);
  const baseDe = {};
  bases.forEach((b) => { baseDe[b.id] = b; });
  const destinos = D.destinos.map((d) => Object.assign({}, d, { cod: codDe(d.provincia), base: baseDe[normal(d.desde)] }))
    .filter((d) => d.base && d.cod);
  const conexiones = D.entreBases.map((e) => ({ a: baseDe[normal(e.desde)], b: baseDe[normal(e.hasta)], ambos: !!e.idaYVuelta }))
    .filter((e) => e.a && e.b && e.a !== e.b);

  // =========================================================
  // PROYECCIÓN Y CONTORNOS
  // =========================================================
  const merc = ([lon, lat]) => [lon, -Math.log(Math.tan(Math.PI / 4 + lat * RAD / 2)) / RAD];
  let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
  Object.values(GEO).forEach((p) => p.anillos.forEach((r) => r.forEach((pt) => {
    const [x, y] = merc(pt);
    if (x < mnx) mnx = x; if (x > mxx) mxx = x;
    if (y < mny) mny = y; if (y > mxy) mxy = y;
  })));
  const W = 405;                                    // ancho del mapa (px del plano)
  const ESC = W / (mxx - mnx), H = Math.round((mxy - mny) * ESC);
  const aPlano = (lon, lat) => { const [x, y] = merc([lon, lat]); return [(x - mnx) * ESC, (y - mny) * ESC]; };

  // Bordes con curvas suaves por los puntos medios (las provincias vecinas comparten vértices)
  const fmt = (p) => p[0].toFixed(1) + ',' + p[1].toFixed(1);
  const medio = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const trazo = (anillos) => anillos.map((r) => {
    const p = r.map((pt) => aPlano(pt[0], pt[1]));
    const n = p.length;
    let d = 'M' + fmt(medio(p[n - 1], p[0]));
    for (let i = 0; i < n; i++) d += 'Q' + fmt(p[i]) + ' ' + fmt(medio(p[i], p[(i + 1) % n]));
    return d + 'Z';
  }).join('');
  const PROVS = Object.keys(GEO);
  const DIBUJO = {};
  PROVS.forEach((k) => { DIBUJO[k] = trazo(GEO[k].anillos); });
  const cajaDe = (k) => {
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    GEO[k].anillos.forEach((r) => r.forEach((pt) => {
      const [x, y] = aPlano(pt[0], pt[1]);
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }));
    return { x: Math.floor(x0), y: Math.floor(y0), w: Math.ceil(x1 - x0) + 1, h: Math.ceil(y1 - y0) + 1 };
  };

  const mapa = $('.mapa-ar'), plano = $('.mapa-plano'), giro = $('.mapa-giro');
  plano.style.width = W + 'px';
  plano.style.height = H + 'px';
  plano.style.left = 460 - W / 2 + 'px';
  plano.style.top = (900 - H) / 2 - 40 + 'px';

  // =========================================================
  // CAPAS DEL MAPA (las fijas se pintan una sola vez en lienzos al doble de resolución)
  // =========================================================
  const PROFUNDIDAD = 13, PASOS = 18;
  const mezcla = (a, b, t) => {
    const ca = a.match(/\w\w/g).map((h) => parseInt(h, 16)), cb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
    return '#' + ca.map((v, k) => Math.round(v + (cb[k] - v) * t).toString(16).padStart(2, '0')).join('');
  };
  const LADOS = { base: ['#F3E6DB', '#DDBAA6'], prov: ['#DE3F22', '#A52612'] };
  const SIN_COSTURA = 'stroke-width=".9" stroke-linejoin="round"';
  const extrusion = (id, colores) => {
    let s = '';
    for (let k = PASOS; k >= 1; k--) {
      const c = mezcla(colores[0], colores[1], k / PASOS);
      s += `<use href="#${id}" transform="translate(0 ${(k * PROFUNDIDAD / PASOS).toFixed(2)})" fill="${c}" stroke="${c}" ${SIN_COSTURA}/>`;
    }
    return s;
  };
  const MARGEN = 50;
  const CAJA_MAPA = { x: 0, y: 0, w: W, h: H };
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
  // SVG en vivo (sin filtros) del tamaño del plano, dibujado al doble y reducido
  function capaSvg(clase, padre) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'capa ' + clase);
    svg.setAttribute('width', W * 2);
    svg.setAttribute('height', H * 2);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('aria-hidden', 'true');
    (padre || plano).appendChild(svg);
    return svg;
  }
  const BRILLO = (id) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="${H}">` +
    '<stop offset=".2" stop-color="#fff" stop-opacity="0"/><stop offset=".34" stop-color="#fff" stop-opacity=".75"/>' +
    '<stop offset=".48" stop-color="#fff" stop-opacity="0"/></linearGradient>';

  // 1. Base: halo rojo, sombra, espesor y cara de vidrio de cada provincia (blancos apenas distintos)
  const BLANCOS = ['#FFFFFF', '#FFF8F0', '#FCF1E7', '#FFFCF7', '#FDF5EC'];
  const todos = (attrs) => PROVS.map((k) => `<use href="#b-${k}" ${attrs}/>`).join('');
  lienzoDesdeSvg('mapa-base',
    '<defs>' + PROVS.map((k) => `<path id="b-${k}" d="${DIBUJO[k]}"/>`).join('') + BRILLO('b-brillo') +
    `<clipPath id="b-recorte">${todos('')}</clipPath>` +
    '<filter id="b-halo" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="15"/></filter>' +
    '<filter id="b-sombra" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="11"/></filter>' +
    '</defs>' +
    `<g filter="url(#b-halo)" opacity=".34" transform="translate(0 8)">${todos('fill="#EF4529"')}</g>` +
    `<g filter="url(#b-sombra)" opacity=".15" transform="translate(6 24)">${todos('fill="#8C2A14"')}</g>` +
    PROVS.map((k) => extrusion('b-' + k, LADOS.base)).join('') +
    PROVS.map((k, i) => { const c = BLANCOS[i % BLANCOS.length]; return `<use href="#b-${k}" fill="${c}" stroke="${c}" ${SIN_COSTURA}/>`; }).join('') +
    `<g fill="none" stroke="#E7D3C4" stroke-width=".75" stroke-linejoin="round">${todos('')}</g>` +
    `<rect width="${W}" height="${H}" fill="url(#b-brillo)" clip-path="url(#b-recorte)" opacity=".5"/>`
  );

  // 2. Zonas: cada provincia pintada con el color de su región (se prende con el filtro)
  const zonas = capaSvg('zonas');
  zonas.innerHTML = PROVS.map((k) => {
    const r = regionDe[k];
    if (!r) return '';
    return `<path data-cod="${k}" data-region="${esc(normal(r.nombre))}" d="${DIBUJO[k]}" fill="${r.color}" stroke="${r.color}" stroke-width=".6"/>`;
  }).join('');

  // 3. Resalte de la provincia bajo el cursor
  const resalte = capaSvg('resalte');
  const resaltePath = document.createElementNS(NS, 'path');
  resalte.appendChild(resaltePath);

  // 4. Provincias que se levantan (se crean la primera vez que se eligen)
  const ELEVACION = 24, PASOS_PROV = 26;
  const COLORES_PROV = [];
  for (let i = 0; i <= PASOS_PROV; i++) COLORES_PROV[i] = mezcla(LADOS.prov[0], LADOS.prov[1], i / PASOS_PROV);
  const provs = {};
  PROVS.forEach((k) => { provs[k] = { cod: k, altura: 0, meta: 0, el: null }; });
  function prepararProvincia(k) {
    const p = provs[k];
    if (p.el) return p;
    p.el = crear('div', 'prov', capasProv);
    p.caja = cajaDe(k);
    p.capaLados = lienzo('lados', p.el, p.caja);
    p.ctx = p.capaLados.getContext('2d');
    p.ruta = new Path2D(DIBUJO[k]);
    p.cara = lienzoDesdeSvg('cara-roja',
      '<defs><linearGradient id="pc" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#F7916B"/><stop offset=".55" stop-color="#EF4529"/><stop offset="1" stop-color="#E23A1F"/></linearGradient></defs>' +
      `<path d="${DIBUJO[k]}" fill="url(#pc)" stroke="url(#pc)" ${SIN_COSTURA}/>`, p.el, p.caja);
    p.capaLados.style.opacity = 0;
    p.cara.style.opacity = 0;
    return p;
  }
  const capasProv = crear('div', 'provincias', plano);
  function dibujarAltura(p) {
    const t = p.altura / ELEVACION;
    p.el.style.transform = p.altura > .05 ? `translateZ(.5px) translateY(${-p.altura}px)` : '';
    const ctx = p.ctx, largo = PROFUNDIDAD + p.altura;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, p.capaLados.width, p.capaLados.height);
    if (t > .002) {
      for (let i = PASOS_PROV; i >= 1; i--) {
        ctx.setTransform(2, 0, 0, 2, 2 * (MARGEN - p.caja.x), 2 * (MARGEN - p.caja.y + i * largo / PASOS_PROV));
        ctx.fillStyle = COLORES_PROV[i];
        ctx.fill(p.ruta);
      }
    }
    p.capaLados.style.opacity = Math.min(1, t * 1.6).toFixed(3);
    p.cara.style.opacity = t.toFixed(3);
  }

  // 5. Siluetas invisibles para detectar el cursor y los clics sobre cada provincia
  const toques = capaSvg('toques');
  toques.innerHTML = PROVS.map((k) => `<path class="toque" data-cod="${k}" d="${DIBUJO[k]}" fill="#000" fill-opacity="0"/>`).join('');

  // 6. Red: rutas, destinos y brillo de las bases (por encima del mapa)
  const red = capaSvg('red');
  const alturaDe = (cod) => (provs[cod] ? provs[cod].altura : 0);
  bases.forEach((b) => { [b.x, b.y] = aPlano(b.lon, b.lat); });
  destinos.forEach((d) => { [d.x, d.y] = aPlano(d.lon, d.lat); });

  // Curva suave de A a B, que se arquea hacia un costado según la distancia
  function curva(ax, ay, bx, by, arco, recorte) {
    const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1;
    const cx = (ax + bx) / 2 - dy / L * L * arco, cy = (ay + by) / 2 + dx / L * L * arco;
    // termina un poco antes del punto de llegada (para la flecha)
    const tx = bx - cx, ty = by - cy, tl = Math.hypot(tx, ty) || 1;
    const ex = bx - tx / tl * recorte, ey = by - ty / tl * recorte;
    return `M${ax.toFixed(1)},${ay.toFixed(1)}Q${cx.toFixed(1)},${cy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
  }

  const COLOR = { propio: '#EF4529', redespacho: '#F4A127' };
  let defs = '<defs>' +
    Object.entries(COLOR).map(([k, c]) =>
      `<marker id="fl-${k}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">` +
      `<path d="M1,1.2 L8.6,5 L1,8.8 L3,5Z" fill="${c}"/></marker>`).join('') +
    '<radialGradient id="brillo-base"><stop offset="0" stop-color="#EF4529" stop-opacity=".42"/><stop offset=".55" stop-color="#EF4529" stop-opacity=".12"/><stop offset="1" stop-color="#EF4529" stop-opacity="0"/></radialGradient>';
  const rutas = [];   // { tipo, origen (base), destino (base o destino), el, base, flujo, grad }
  destinos.forEach((d) => rutas.push({ tipo: d.tipo === 'propio' ? 'propio' : 'redespacho', origen: d.base, destino: d, interna: false }));
  conexiones.forEach((c) => rutas.push({ tipo: 'propio', origen: c.a, destino: c.b, interna: true, ambos: c.ambos }));
  rutas.forEach((r, i) => {
    const c = COLOR[r.tipo];
    defs += `<linearGradient id="gr-${i}" gradientUnits="userSpaceOnUse" x1="${r.origen.x}" y1="${r.origen.y}" x2="${r.destino.x}" y2="${r.destino.y}">` +
      `<stop offset="0" stop-color="${c}" stop-opacity="${r.interna ? .9 : .25}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
  });
  defs += '</defs>';
  red.innerHTML = defs +
    '<g class="brillos">' + bases.map((b) => `<circle cx="${b.x}" cy="${b.y}" r="34" fill="url(#brillo-base)"/>`).join('') + '</g>' +
    '<g class="rutas"></g><g class="puntos"></g>';
  const gRutas = $('.rutas', red), gPuntos = $('.puntos', red), gBrillos = $('.brillos', red);
  rutas.forEach((r, i) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', `ruta ${r.tipo}${r.interna ? ' interna' : ''}`);
    g.style.setProperty('--i', i);
    const base = document.createElementNS(NS, 'path');
    base.setAttribute('class', 'r-linea');
    base.setAttribute('stroke', `url(#gr-${i})`);
    base.setAttribute('marker-end', `url(#fl-${r.tipo})`);
    if (r.ambos) base.setAttribute('marker-start', `url(#fl-${r.tipo})`);
    const flujo = document.createElementNS(NS, 'path');
    flujo.setAttribute('class', 'r-flujo');
    g.append(base, flujo);
    gRutas.appendChild(g);
    Object.assign(r, { el: g, linea: base, flujo });
  });
  // Puntos de destino (con un área invisible más grande para el cursor)
  destinos.forEach((d) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', `punto ${d.tipo === 'propio' ? 'propio' : 'redespacho'}`);
    g.innerHTML = `<circle class="p-halo" r="8.5"/><circle class="p-centro" r="3.6"/><circle class="p-toque" r="10"/>`;
    gPuntos.appendChild(g);
    d.el = g;
    g.addEventListener('pointerenter', () => mostrarEtiqueta(
      `<b>${esc(d.ciudad)}</b><span>${esc(nombreDe(d.cod))}</span>` +
      `<em class="${d.tipo === 'propio' ? 'propio' : 'redespacho'}">${d.tipo === 'propio' ? 'Red propia' : 'Redespacho'} desde ${esc(d.base.nombre)}</em>`));
    g.addEventListener('pointerleave', ocultarEtiqueta);
    g.addEventListener('click', (e) => { e.stopPropagation(); seleccionar(d.cod); });
  });

  // Bases: ícono parado sobre el mapa, con su nombre
  const ICONO_BASE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2 1.5 8v14h21V8L12 2zM6 12h12v10H6z"/><path d="M6 14h12v2H6zM6 18h12v2H6z"/></svg>';
  const capaBases = crear('div', 'bases', plano);
  bases.forEach((b, i) => {
    // Solo el ícono: el nombre aparece en la etiqueta al pasar el cursor
    const el = crear('div', 'base', capaBases, `<i class="base-onda"></i><div class="base-pie">${ICONO_BASE}</div>`);
    el.style.left = b.x.toFixed(1) + 'px';
    el.style.top = b.y.toFixed(1) + 'px';
    el.style.setProperty('--i', i);
    b.el = el;
    const icono = el.querySelector('svg');
    icono.addEventListener('pointerenter', () => mostrarEtiqueta(
      `<b>${esc(b.nombre)}</b><span>${esc(nombreDe(b.cod))}</span><em class="propio">${esc(b.detalle || 'Base propia')}</em>`));
    icono.addEventListener('pointerleave', ocultarEtiqueta);
    icono.addEventListener('click', () => seleccionar(b.cod));
  });

  // Posiciones (se recalculan mientras una provincia sube o baja)
  function ubicarRed(soloCods) {
    rutas.forEach((r) => {
      if (soloCods && !soloCods.has(r.origen.cod) && !soloCods.has(r.destino.cod)) return;
      const ay = r.origen.y - alturaDe(r.origen.cod), by = r.destino.y - alturaDe(r.destino.cod);
      const d = curva(r.origen.x, ay, r.destino.x, by, r.interna ? .16 : .13, r.interna ? 9 : 6.5);
      r.linea.setAttribute('d', d);
      r.flujo.setAttribute('d', d);
      if (!r.largo) { r.largo = r.linea.getTotalLength(); r.el.style.setProperty('--largo', r.largo.toFixed(1)); }
    });
    destinos.forEach((d) => {
      if (soloCods && !soloCods.has(d.cod)) return;
      d.el.setAttribute('transform', `translate(${d.x.toFixed(1)} ${(d.y - alturaDe(d.cod)).toFixed(1)})`);
    });
    bases.forEach((b) => {
      if (soloCods && !soloCods.has(b.cod)) return;
      b.el.style.transform = `translateZ(1.5px) translateY(${-alturaDe(b.cod).toFixed(2)}px)`;
    });
    gBrillos.querySelectorAll('circle').forEach((c, i) => {
      const b = bases[i];
      if (soloCods && !soloCods.has(b.cod)) return;
      c.setAttribute('cy', (b.y - alturaDe(b.cod)).toFixed(1));
    });
  }
  ubicarRed();

  // =========================================================
  // PANEL: capas, zonas con lead time y detalle de provincia
  // =========================================================
  const estado = { propio: true, redespacho: true, zonas: false, sel: null };
  const nPropios = destinos.filter((d) => d.tipo === 'propio').length;
  const nRedes = destinos.length - nPropios;
  const ICONOS_CAPA = {
    propio: '<svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 2 1.5 8v14h21V8L12 2zM6 12h12v10H6z"/><path d="M6 14h12v2H6zM6 18h12v2H6z"/></svg>',
    redespacho: '<svg viewBox="0 0 24 24"><path d="M1 5.5h12.5V17H1zM14.5 9h4.3l3.2 4v4h-7.5z"/><circle cx="5" cy="18.3" r="2.6" stroke="#FFFBF3" stroke-width="1.5"/><circle cx="17.6" cy="18.3" r="2.6" stroke="#FFFBF3" stroke-width="1.5"/></svg>',
    zonas: '<svg viewBox="0 0 24 24">' + D.regiones.slice(0, 4).map((r, i) => `<rect x="${(i % 2) * 11.5 + 1}" y="${Math.floor(i / 2) * 11.5 + 1}" width="10" height="10" rx="2.5" fill="${r.color}"/>`).join('') + '</svg>'
  };
  const CAPAS = [
    { k: 'propio', t: 'Red propia', s: `${bases.length} bases · ${nPropios + conexiones.length} rutas` },
    { k: 'redespacho', t: 'Redespachantes', s: `${nRedes} destinos` },
    { k: 'zonas', t: 'Zonas', s: `${D.regiones.length} regiones · lead time` }
  ];
  const contCapas = $('.capas');
  CAPAS.forEach((c, i) => {
    const b = crear('button', `capa-btn capa-${c.k}`, contCapas,
      `<span class="capa-ico">${ICONOS_CAPA[c.k]}</span><span class="capa-txt"><b>${c.t}</b><small>${c.s}</small></span><span class="capa-switch"><i></i></span>`);
    b.type = 'button';
    b.style.setProperty('--i', i);
    b.addEventListener('click', () => { estado[c.k] = !estado[c.k]; aplicarCapas(); });
    c.btn = b;
  });
  function aplicarCapas() {
    CAPAS.forEach((c) => c.btn.setAttribute('aria-pressed', estado[c.k] ? 'true' : 'false'));
    mapa.classList.toggle('sin-propio', !estado.propio);
    mapa.classList.toggle('sin-redespacho', !estado.redespacho);
    mapa.classList.toggle('con-zonas', estado.zonas);
    vistaZonas.classList.toggle('apagada', !estado.zonas);
  }

  // ---------- Zonas: barras de lead time ----------
  const vistaZonas = $('.vista-zonas'), vistaProv = $('.vista-provincia');
  const maxH = Math.max(24, Math.ceil(Math.max(...D.regiones.map((r) => r.hasta), 24) / 24) * 24);
  const marcas = [];
  for (let h = 0; h <= maxH; h += 24) marcas.push(h);
  const ordenadas = D.regiones.slice().sort((a, b) => a.desde - b.desde || a.hasta - b.hasta);
  const provsDe = (r) => PROVS.filter((k) => regionDe[k] === r).map(nombreDe).sort((a, b) => a.localeCompare(b, 'es'));
  vistaZonas.innerHTML =
    '<div class="vz-cabeza"><p class="vz-titulo">Tiempos de entrega por zona</p><p class="vz-sub">Lead time en horas desde la expedición</p></div>' +
    '<div class="vz-escala">' + marcas.map((h) => `<span style="left:${(h / maxH * 100).toFixed(2)}%">${h}</span>`).join('') + '</div>' +
    '<ul class="vz-lista">' + ordenadas.map((r, i) =>
      `<li data-region="${esc(normal(r.nombre))}" style="--c:${r.color};--i:${i}">` +
      `<div class="vz-nombre"><b>${esc(r.nombre)}</b><small>${esc(provsDe(r).join(', '))}</small></div>` +
      `<div class="vz-pista">${marcas.map((h) => `<i style="left:${(h / maxH * 100).toFixed(2)}%"></i>`).join('')}` +
      `<span class="vz-barra" style="left:${(r.desde / maxH * 100).toFixed(2)}%;width:${((r.hasta - r.desde) / maxH * 100).toFixed(2)}%"></span></div>` +
      `<span class="vz-horas">${horas(r)}</span></li>`).join('') + '</ul>';
  vistaZonas.querySelectorAll('li').forEach((li) => {
    li.addEventListener('pointerenter', () => enfocarRegion(li.dataset.region));
    li.addEventListener('pointerleave', () => enfocarRegion(null));
  });
  function enfocarRegion(r) {
    mapa.classList.toggle('region-foco', !!r);
    zonas.querySelectorAll('path').forEach((p) => p.classList.toggle('foco', p.dataset.region === r));
    vistaZonas.querySelectorAll('li').forEach((li) => li.classList.toggle('foco', li.dataset.region === r));
  }

  // ---------- Detalle de una provincia ----------
  function pill(d, extra) {
    const t = d.tipo === 'propio' ? 'propio' : 'redespacho';
    return `<li class="${t}"><i></i>${esc(d.ciudad || d.nombre)}${extra ? `<small>${esc(extra)}</small>` : ''}</li>`;
  }
  function vistaDeProvincia(k) {
    const nombre = nombreDe(k), r = regionDe[k];
    const basesAqui = bases.filter((b) => b.cod === k);
    const salen = destinos.filter((d) => d.base.cod === k);
    const llegan = destinos.filter((d) => d.cod === k && d.base.cod !== k);
    const conexAqui = conexiones.filter((c) => c.a.cod === k || c.b.cod === k);
    let html = '<div class="vp-cabeza">' +
      (r ? `<p class="vp-region" style="--c:${r.color}"><i></i>${esc(r.nombre)}<span>${horas(r)}</span></p>` : '') +
      `<h2 class="vp-nombre">${esc(nombre)}</h2>` +
      '<button class="vp-cerrar" type="button">Ver todo el país <span aria-hidden="true">✕</span></button></div>';
    html += '<div class="vp-numeros">' +
      `<div><b>${basesAqui.length}</b><span>${basesAqui.length === 1 ? 'base propia' : 'bases propias'}</span></div>` +
      `<div><b>${salen.length}</b><span>${salen.length === 1 ? 'destino sale' : 'destinos salen'} de acá</span></div>` +
      `<div><b>${destinos.filter((d) => d.cod === k).length}</b><span>${destinos.filter((d) => d.cod === k).length === 1 ? 'punto de entrega' : 'puntos de entrega'}</span></div></div>`;
    if (basesAqui.length) {
      html += `<p class="vp-sub">Bases en ${esc(nombre)}</p><ul class="vp-bases">` +
        basesAqui.map((b) => `<li><b>${esc(b.nombre)}</b><span>${esc(b.detalle)}</span></li>`).join('') + '</ul>';
    }
    if (salen.length || conexAqui.length) {
      const otras = conexAqui.map((c) => {
        const otra = c.a.cod === k ? c.b : c.a;
        return pill({ nombre: otra.nombre, tipo: 'propio' }, c.ambos ? 'ida y vuelta' : (c.a.cod === k ? 'base' : 'llega'));
      }).join('');
      html += `<p class="vp-sub">Salen desde ${esc(nombre)}</p><ul class="vp-pills">${otras}${salen.map((d) => pill(d)).join('')}</ul>`;
    }
    if (llegan.length) {
      html += `<p class="vp-sub">Llegan a ${esc(nombre)}</p><ul class="vp-pills">` +
        llegan.map((d) => pill(d, 'desde ' + d.base.nombre)).join('') + '</ul>';
    }
    if (!basesAqui.length && !salen.length && !llegan.length) {
      html += '<p class="vp-vacio">Todavía no hay destinos cargados en esta provincia. Se agregan en el Excel de distribución.</p>';
    }
    return html;
  }

  // =========================================================
  // INTERACCIÓN
  // =========================================================
  const etiqueta = $('.mapa-etiqueta');
  const seccion = $('.seccion-distribucion');
  let px = 0, py = 0;
  seccion.addEventListener('pointermove', (e) => {
    const r = seccion.getBoundingClientRect(), k = r.width / 1600 || 1;
    px = (e.clientX - r.left) / k; py = (e.clientY - r.top) / k;
    etiqueta.style.transform = `translate(${px.toFixed(0)}px, ${py.toFixed(0)}px)`;
  });
  function mostrarEtiqueta(html) { etiqueta.innerHTML = html; etiqueta.classList.add('visible'); }
  function ocultarEtiqueta() { etiqueta.classList.remove('visible'); }

  // Cursor sobre una provincia
  let hover = null;
  toques.querySelectorAll('.toque').forEach((el) => {
    const k = el.dataset.cod;
    el.addEventListener('pointerenter', () => {
      hover = k;
      resaltePath.setAttribute('d', DIBUJO[k]);
      resalte.classList.add('visible');
      const r = regionDe[k];
      const n = destinos.filter((d) => d.cod === k).length + bases.filter((b) => b.cod === k).length;
      mostrarEtiqueta(`<b>${esc(nombreDe(k))}</b>` +
        (r ? `<span><i style="--c:${r.color}"></i>${esc(r.nombre)} · ${horas(r)}</span>` : '') +
        `<em>${n ? n + (n === 1 ? ' punto en la red' : ' puntos en la red') : 'Sin puntos cargados'}</em>`);
    });
    el.addEventListener('pointerleave', () => {
      if (hover === k) { hover = null; resalte.classList.remove('visible'); ocultarEtiqueta(); }
    });
    el.addEventListener('click', () => seleccionar(estado.sel === k ? null : k));
  });

  // Elegir una provincia: sube en rojo y quedan solo sus rutas
  // (auto = la eligió el recorrido automático, no la persona)
  function seleccionar(k, auto) {
    if (!auto) { detenerRecorrido(); ocultarInvitacion(); }
    estado.auto = !!(k && auto);
    const antes = estado.sel;
    estado.sel = k;
    if (antes && provs[antes]) provs[antes].meta = 0;
    if (k) { prepararProvincia(k); provs[k].meta = ELEVACION; }
    mapa.classList.toggle('con-seleccion', !!k);
    // rutas, puntos y bases relacionados (lo que sale de la provincia y lo que llega a ella)
    rutas.forEach((r) => {
      const activa = !k || r.origen.cod === k || r.destino.cod === k;
      r.el.classList.toggle('activa', !!k && activa);
      r.el.classList.toggle('apagada', !!k && !activa);
    });
    destinos.forEach((d) => {
      const activo = !k || d.base.cod === k || d.cod === k;
      d.el.classList.toggle('apagado', !!k && !activo);
    });
    bases.forEach((b) => {
      const activa = !k || b.cod === k || rutas.some((r) => r.el.classList.contains('activa') && (r.origen === b || r.destino === b));
      b.el.classList.toggle('apagada', !!k && !activa);
    });
    // panel
    if (k) {
      vistaProv.innerHTML = vistaDeProvincia(k);
      $('.vp-cerrar', vistaProv).addEventListener('click', () => seleccionar(null));
    }
    $('.detalle').classList.toggle('con-provincia', !!k);
  }
  // Esc: primero deselecciona; si no hay nada elegido, vuelve a la portada (base.js)
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && estado.sel) { e.stopImmediatePropagation(); e.preventDefault(); seleccionar(null); }
  }, true);

  // =========================================================
  // INVITAR A INTERACTUAR
  // 1) las bases laten (ondas en el mapa);
  // 2) al aparecer, una mano "toca" la provincia con más rutas, hasta que la persona interactúa;
  // 3) si nadie toca nada por un rato, el mapa recorre solo las provincias con bases.
  // =========================================================
  const SEGUNDOS_SIN_USO = 15, SEGUNDOS_POR_PROVINCIA = 5;
  const invitacion = crear('div', 'mapa-invitacion', seccion,
    '<i class="mi-onda"></i>' +
    '<svg class="mi-mano" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11.2V4.6a1.6 1.6 0 0 1 3.2 0v5.6h.4V8.7a1.6 1.6 0 0 1 3.2 0v1.6h.4V9.5a1.6 1.6 0 0 1 3.2 0v5.4c0 3.8-2.6 6.8-6.4 6.8h-1.1c-1.9 0-3.6-.9-4.6-2.5l-3-4.6a1.5 1.5 0 0 1 2.4-1.8L9 14.4z"/></svg>' +
    '<p class="mi-texto"><b>Tocá una provincia</b><span>para ver qué sale y qué llega</span></p>');
  let invitacionUsada = false;
  function mostrarInvitacion() {
    if (invitacionUsada || estado.sel) return;
    // Sobre la base con más rutas (o el centro del mapa si no hay bases)
    const cuenta = (b) => rutas.filter((r) => r.origen === b).length;
    const b = bases.slice().sort((p, q) => cuenta(q) - cuenta(p))[0];
    const s = seccion.getBoundingClientRect(), k = s.width / 1600 || 1;
    let x = 460, y = 450;
    if (b) {
      const r = b.el.querySelector('svg').getBoundingClientRect();
      // un poco al sudoeste del ícono, dentro de la provincia y lejos de los nombres vecinos
      x = (r.left + r.width / 2 - s.left) / k - 42;
      y = (r.bottom - s.top) / k + 34;
    }
    invitacion.style.transform = `translate(${x.toFixed(0)}px, ${y.toFixed(0)}px)`;
    invitacion.classList.add('visible');
  }
  function ocultarInvitacion() {
    invitacionUsada = true;
    invitacion.classList.remove('visible');
  }
  toques.addEventListener('pointerover', ocultarInvitacion);
  contCapas.addEventListener('click', ocultarInvitacion);

  // Recorrido automático por las provincias con bases (y una pausa mostrando todo el país)
  const ayuda = $('.panel-ayuda');
  const textoAyuda = ayuda.textContent;
  const paradas = [...new Set(bases.map((b) => b.cod))];
  let relojSinUso = null, relojParada = null, parada = -1, recorriendo = false;
  function avanzarRecorrido() {
    parada = (parada + 1) % (paradas.length + 1);
    const k = paradas[parada] || null;          // la última parada es "todo el país"
    seleccionar(k, true);
    relojParada = setTimeout(avanzarRecorrido, SEGUNDOS_POR_PROVINCIA * 1000);
  }
  function iniciarRecorrido() {
    if (recorriendo || estado.sel || !paradas.length || !enPantalla) return;
    recorriendo = true;
    ocultarInvitacion();
    ayuda.classList.add('recorriendo');
    ayuda.innerHTML = '<i></i>Recorrido automático · mové el mouse para explorar';
    parada = -1;
    avanzarRecorrido();
  }
  function detenerRecorrido() {
    clearTimeout(relojParada);
    if (!recorriendo) return;
    recorriendo = false;
    ayuda.classList.remove('recorriendo');
    ayuda.textContent = textoAyuda;
  }
  // Cualquier uso real detiene el recorrido (y deja el mapa completo si lo había elegido él)
  function hayUso() {
    if (recorriendo) { detenerRecorrido(); if (estado.auto) seleccionar(null); }
    clearTimeout(relojSinUso);
    relojSinUso = setTimeout(iniciarRecorrido, SEGUNDOS_SIN_USO * 1000);
  }
  ['pointermove', 'pointerdown', 'wheel', 'keydown'].forEach((t) => addEventListener(t, hayUso, { passive: true }));

  aplicarCapas();
  $('.mapa-pie').innerHTML = `<b>ARG</b> ${PROVS.length} provincias · ${D.regiones.length} regiones · ${bases.length + destinos.length} puntos`;

  // =========================================================
  // APARICIÓN Y ANIMACIÓN
  // =========================================================
  new IntersectionObserver((en, obs) => {
    if (!en[0].isIntersecting) return;
    obs.disconnect();
    seccion.classList.add('visible');
    setTimeout(mostrarInvitacion, 2800);          // cuando el mapa ya se acomodó
    relojSinUso = setTimeout(iniciarRecorrido, SEGUNDOS_SIN_USO * 1000);
  }, { threshold: .3 }).observe(seccion);

  let enPantalla = false;
  new IntersectionObserver((en) => { enPantalla = en[0].isIntersecting; }).observe(mapa);

  let mx = 0, my = 0, gx = 0, gy = 0;
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    mx = (e.clientX / innerWidth) * 2 - 1;
    my = (e.clientY / innerHeight) * 2 - 1;
  });
  (function cuadro() {
    requestAnimationFrame(cuadro);
    if (!enPantalla) return;
    if (Math.abs(mx - gx) > .0005 || Math.abs(my - gy) > .0005) {
      gx += (mx - gx) * .05;
      gy += (my - gy) * .05;
      giro.style.transform = `rotateY(${(gx * 4).toFixed(3)}deg) rotateX(${(-gy * 3).toFixed(3)}deg)`;
    }
    const cambiadas = new Set();
    PROVS.forEach((k) => {
      const p = provs[k];
      if (!p.el || Math.abs(p.meta - p.altura) < .05) return;
      p.altura += (p.meta - p.altura) * .14;
      if (Math.abs(p.meta - p.altura) < .05) p.altura = p.meta;
      dibujarAltura(p);
      cambiadas.add(k);
    });
    if (cambiadas.size) ubicarRed(cambiadas);
  })();
})();
