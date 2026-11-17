/* =========================================================
   ¿POR QUÉ ELEGIRNOS? (antes "Nuestra estructura": la red de áreas pasó a
   ¿Quiénes somos?). Empieza con el título y las cuatro tarjetas de vidrio
   (datos/estructura.js: elegirnosAntetitulo, elegirnosTitulo, elegirnos) y
   sigue con un scroll común, como una web: pantalla partida Calidad /
   Capacitaciones (mejora.js) y RSE (rse.js, rse-numeros.js, rse-comunidad.js).
   ========================================================= */
(function () {
  const E = Object.assign({ elegirnos: [] }, window.ESTRUCTURA || {});
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // **negrita** y *rojo en cursiva*
  const formato = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
  function crear(tag, clase, padre, html) {
    const el = document.createElement(tag);
    if (clase) el.className = clase;
    if (html !== undefined) el.innerHTML = html;
    if (padre) padre.appendChild(el);
    return el;
  }
  const seccionEl = $('.seccion-mejora');
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // ---------- Título: cada letra de la palabra grande sube por separado ----------
  const anteEl = $('.mc-ante'), grandeEl = $('.mc-grande');
  anteEl.textContent = E.elegirnosAntetitulo || '¿Qué hacemos';
  grandeEl.innerHTML = Array.from(E.elegirnosTitulo || 'DIFERENTE?').map((c, l) => `<i style="--l:${l}">${c === ' ' ? '&nbsp;' : esc(c)}</i>`).join('');
  // si se cambia por un texto más largo, la letra se achica para que entre
  const ajustarTitulo = () => {
    anteEl.style.fontSize = grandeEl.style.fontSize = '';
    if (anteEl.scrollWidth > 1180) anteEl.style.fontSize = (110.4 * 1180 / anteEl.scrollWidth) + 'px';
    if (grandeEl.scrollWidth > 1180) grandeEl.style.fontSize = (212 * 1180 / grandeEl.scrollWidth) + 'px';
  };
  ajustarTitulo();
  if (document.fonts) document.fonts.ready.then(ajustarTitulo);

  // ---------- Íconos de "¿Qué hacemos diferente?" (incluidos, por si falta el SVG propio) ----------
  const sello = (() => {
    // sello dentado con un aro y un tilde calados
    const pts = [], n = 16;
    for (let k = 0; k < n * 2; k++) {
      const a = k / (n * 2) * Math.PI * 2 - Math.PI / 2, r = k % 2 ? 10.3 : 11.6;
      pts.push(`${(12 + r * Math.cos(a)).toFixed(2)},${(12 + r * Math.sin(a)).toFixed(2)}`);
    }
    return `<path fill-rule="evenodd" d="M${pts.join('L')}Z M12 4.6a7.4 7.4 0 1 0 0 14.8 7.4 7.4 0 0 0 0-14.8zM12 6.1a5.9 5.9 0 1 1 0 11.8 5.9 5.9 0 0 1 0-11.8z"/>` +
      '<path class="hueco" d="M8.9 12.2l2.2 2.2 4.1-4.6"/>';
  })();
  const ICONOS_EL = {
    excelencia: sello,
    // nube grande en el centro con caminos de circuito en ángulo recto y un punto al final de cada uno
    innovacion:
      '<path transform="translate(5.2 4.2) scale(.567)" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>' +
      '<path class="trazo" d="M10.4 7.2V3.5M13.6 6.9V5.3h2.4M5.4 12.6H3M6.4 15.5H4.6v1.9M18.8 12.3h2.1M17.6 15.6v1.4h1.8M9.2 15.6v2.6l-1.3 1.3M12 15.6v4.5M14.8 15.6v2.6l1.3 1.3"/>' +
      '<circle cx="10.4" cy="2.4" r="1.25"/><circle cx="17.2" cy="5.3" r="1.25"/><circle cx="1.9" cy="12.6" r="1.25"/><circle cx="4.6" cy="18.6" r="1.25"/>' +
      '<circle cx="22" cy="12.3" r="1.25"/><circle cx="20.6" cy="17" r="1.25"/><circle cx="7.2" cy="20.3" r="1.25"/><circle cx="12" cy="21.3" r="1.25"/><circle cx="16.8" cy="20.3" r="1.25"/>',
    flexibilidad:
      '<path fill-rule="evenodd" d="M6.6 3h10.8a4.4 4.4 0 0 1 0 8.8H6.6a4.4 4.4 0 0 1 0-8.8zM17.2 5a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z"/>' +
      '<path fill-rule="evenodd" d="M6.6 13.2h10.8a4.4 4.4 0 0 1 0 8.8H6.6a4.4 4.4 0 0 1 0-8.8zM6.8 15.2a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z"/>'
  };
  const contEl = $('.el-tarjetas');
  // Adónde lleva cada tarjeta ("ir" en los datos): la sección queda entera en pantalla
  // (el tramo arranca en y 900 de la diapositiva, así que y = 900 + su offsetTop)
  const SECCION_DE = { adaptabilidad: '.mc-adap', mejora: '.mc-elegir', rse: '.mc-rse', numeros: '.mc-num', comunidad: '.mc-com', clientes: '.mc-cli' };
  const flechaIr = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4h2v12l4.6-4.6L19 12.8 12 19.8l-7-7 1.4-1.4L11 16z"/></svg>';
  function irATarjeta(t) {
    const el = $(SECCION_DE[String(t.ir || '').trim()]);
    if (!el || !window.desplazarA) return;
    // en Adaptabilidad, además, abre el paso pedido cuando llega (adaptabilidad.js)
    if (t.ir === 'adaptabilidad' && t.paso && window.ADAPTABILIDAD) window.ADAPTABILIDAD.abrir(+t.paso - 1);
    window.desplazarA(900 + el.offsetTop);
  }

  // ---------- Dónde va cada ícono (medido del diseño de la persona, en px del escenario) ----------
  // icono: x, y y lado de la caja del SVG; dibujo: dónde está el dibujo dentro de esa caja (0–1);
  // etiqueta: arriba a la izquierda del título; de → a: la línea, del título al punto de la foto,
  // que va pegado a una capa (el escáner y la tabla, al operario; el estante, al depósito).
  const LUGARES = {
    innovacion:   { icono: [125.7, 488.9, 144.5], dibujo: [.03, .07, .978, .927], etiqueta: [294, 508.7], de: [530, 538], a: [659, 470], capa: 'operario', curva: .2 },
    flexibilidad: { icono: [571.5, 730.4, 131.5], dibujo: [.133, .152, .875, .855], etiqueta: [711, 750.3], de: [716, 714], a: [739, 613], capa: 'operario', curva: .14 },
    excelencia:   { icono: [1081, 559.4, 136.3], dibujo: [.122, .122, .885, .887], etiqueta: [1221, 579.1], de: [1158, 568], a: [1094, 450], capa: 'deposito', curva: -.18 }
  };
  const ORDEN_LUGARES = ['innovacion', 'flexibilidad', 'excelencia'];
  const PAD = 26, ALTO_RENGLON = 46;
  // Paralaje de cada capa: [px que se corre con el mouse, cuánto se queda atrás con el scroll]
  const PROF = { deposito: [9, .34], polvo: [13, .3], titulo: [17, .2], operario: [25, .1], puntos: [32, -.05] };
  const capas = {};
  document.querySelectorAll('.df-capa').forEach((c) => { capas[c.dataset.capa] = c; });

  const svgLineas = $('.df-lineas'), defs = $('defs', svgLineas);
  const NS = 'http://www.w3.org/2000/svg';
  const nuevoSvg = (tag, attrs, padre) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); padre.appendChild(e); return e; };

  const usados = new Set();
  const puntos = (E.elegirnos || []).slice(0, 3).map((t, i) => {
    // lugar por su ícono; si no coincide, el primero libre
    let clave = LUGARES[t.icono] && !usados.has(t.icono) ? t.icono : ORDEN_LUGARES.find((k) => !usados.has(k));
    usados.add(clave);
    const L = LUGARES[clave];
    const [ix, iy, is] = L.icono, [d0, d1, , d3] = L.dibujo;
    const x = ix + d0 * is - PAD, y = iy + d1 * is - PAD;          // esquina de la tarjeta abierta
    const renglones = String(t.titulo || '').split(/\s+\/\s+/).filter(Boolean);
    const cabH = Math.max(iy + d3 * is, L.etiqueta[1] + renglones.length * ALTO_RENGLON) - y + 14;
    const el = crear('div', 'df-punto', contEl);
    const datos = (t.datos || []).filter((d) => d && (d.valor || d.texto));
    const conDestino = !!SECCION_DE[String(t.ir || '').trim()];
    el.dataset.icono = clave;
    el.style.cssText = `--i:${i};--x:${x}px;--y:${y}px;--ix:${ix - x}px;--iy:${iy - y}px;--is:${is}px;--lx:${L.etiqueta[0] - x}px;--ly:${L.etiqueta[1] - y}px;--cab-h:${cabH}px;--ox:${ix - x + is / 2}px;--oy:${iy - y + is / 2}px`;
    el.innerHTML =
      '<div class="df-vidrio"><i class="df-brillo"></i></div>' +
      `<div class="df-cabeza"><span class="el-icono"></span><h3 class="df-etiqueta">${renglones.map((r) => `<span>${formato(r)}</span>`).join('')}</h3></div>` +
      `<div class="df-cuerpo"><p class="el-texto">${formato(t.texto)}</p>` +
      (datos.length ? '<div class="el-datos">' + datos.map((d) => `<div><b>${esc(d.valor)}</b><span>${formato(d.texto)}</span></div>`).join('') + '</div>' : '') +
      (t.frase ? `<p class="df-frase">${formato(t.frase)}</p>` : '') +
      (conDestino ? `<span class="el-ir">${formato(t.boton || 'Ver más')}${flechaIr}</span>` : '') + '</div>';
    el.setAttribute('aria-label', renglones.join(' '));
    // Ícono propio en SVG (si está); si no, el incluido
    const ic = $('.el-icono', el);
    const incluido = () => { ic.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS_EL[t.icono] || ICONOS_EL.excelencia}</svg>`; };
    if (t.imagen) {
      const img = crear('img', '', ic);
      img.alt = '';
      img.onerror = incluido;
      img.src = '../../' + t.imagen;
    } else incluido();
    // la línea (con un degradé que se apaga hacia el título) y el punto en la foto
    const grad = nuevoSvg('linearGradient', { id: 'df-g-' + i, gradientUnits: 'userSpaceOnUse' }, defs);
    nuevoSvg('stop', { offset: '0', 'stop-opacity': '.95' }, grad);
    nuevoSvg('stop', { offset: '1', 'stop-opacity': '.2' }, grad);
    const linea = nuevoSvg('path', { class: 'df-linea', pathLength: '1', stroke: `url(#df-g-${i})`, style: `--i:${i}` }, svgLineas);
    const punto = nuevoSvg('g', { class: 'df-punto-foto', style: `--i:${i};--d:${i * -.9}s` }, svgLineas);
    nuevoSvg('circle', { class: 'df-halo', r: '9' }, punto);
    nuevoSvg('circle', { class: 'df-onda', r: '4.5' }, punto);
    nuevoSvg('circle', { r: '4.5' }, punto);
    return { t, el, L, x, y, grad, linea, punto, conDestino, p: 0, sube: 0, fase: i * 2.1 };
  });

  // Si la tarjeta abierta no entra abajo, sube (con su título) lo que haga falta
  const medir = () => puntos.forEach((o) => { const h = o.el.offsetHeight; o.sube = Math.max(92 - o.y, Math.min(0, 868 - (o.y + h))); });
  medir();
  if (document.fonts) document.fonts.ready.then(medir);

  // ---------- Abrir y cerrar (cursor, foco o toque) ----------
  let cierre = null;
  function abrir(o) {
    clearTimeout(cierre);
    puntos.forEach((q) => {
      const si = q === o;
      q.el.classList.toggle('abierta', si);
      q.linea.classList.toggle('activa', si);
      q.grad.classList.toggle('activa', si);
      q.punto.classList.toggle('activa', si);
    });
    seccionEl.classList.add('con-tarjeta');
    despertar();
  }
  function cerrar() {
    clearTimeout(cierre);
    puntos.forEach((q) => { q.el.classList.remove('abierta'); q.linea.classList.remove('activa'); q.grad.classList.remove('activa'); q.punto.classList.remove('activa'); });
    seccionEl.classList.remove('con-tarjeta');
  }
  puntos.forEach((o) => {
    const { el } = o;
    const vidrio = $('.df-vidrio', el);
    let abiertaAlTocar = false, tipo = 'mouse';
    if (o.conDestino) { el.tabIndex = 0; el.setAttribute('role', 'link'); }
    el.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch') abrir(o); });
    el.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') { clearTimeout(cierre); cierre = setTimeout(cerrar, 220); } });
    el.addEventListener('pointerdown', (e) => { tipo = e.pointerType; abiertaAlTocar = el.classList.contains('abierta'); });
    el.addEventListener('click', () => {
      // con el dedo, el primer toque abre la tarjeta y el segundo lleva a su parte
      if (tipo === 'touch' && !abiertaAlTocar) { abrir(o); return; }
      if (o.conDestino) irATarjeta(o.t);
    });
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' && o.conDestino) { e.preventDefault(); irATarjeta(o.t); } });
    el.addEventListener('focus', () => abrir(o));
    el.addEventListener('blur', () => { if (!el.matches(':hover')) cerrar(); });
    // reflejo del vidrio que sigue al cursor
    el.addEventListener('pointermove', (e) => {
      const r = vidrio.getBoundingClientRect();
      vidrio.style.setProperty('--mx', `${(e.clientX - r.left) / r.width * 100}%`);
      vidrio.style.setProperty('--my', `${(e.clientY - r.top) / r.height * 100}%`);
    });
  });
  // un toque fuera de las tarjetas las cierra
  document.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch' && !e.target.closest('.df-punto')) cerrar(); }, true);

  // ---------- Polvo que flota en el haz de luz del pasillo ----------
  const lienzo = $('.df-polvo'), ctx = lienzo.getContext('2d');
  const enHaz = (y) => 800 + (Math.random() - .5) * (90 + y * .62);
  const motas = Array.from({ length: reducido ? 0 : 58 }, (_, k) => {
    const haz = k < 42, y = 40 + Math.random() * 740;
    return { haz, x: haz ? enHaz(y) : Math.random() * 1600, y, r: .5 + Math.random() * (haz ? 1.5 : 1.1), v: 5 + Math.random() * 13, a: .25 + Math.random() * .55, f: Math.random() * 6.28, w: .6 + Math.random() * 1.4 };
  });
  function dibujarPolvo(t, dt) {
    ctx.clearRect(0, 0, 800, 450);
    for (const m of motas) {
      m.y -= m.v * dt;
      m.x += Math.sin(t * .0005 * m.w + m.f) * 4 * dt;
      if (m.y < 24) { m.y = 780; m.x = m.haz ? enHaz(m.y) : Math.random() * 1600; }
      const abajo = Math.min(1, Math.max(0, (820 - m.y) / 220));         // se apaga al llegar al gris
      const a = m.a * (.55 + .45 * Math.sin(t * .0012 * m.w + m.f)) * abajo * (m.haz ? 1 : .45);
      if (a < .02) continue;
      ctx.fillStyle = `rgba(255, 238, 214, ${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(m.x / 2, m.y / 2, m.r, 0, 6.2832);
      ctx.fill();
    }
  }

  // ---------- Paralaje (mouse y scroll), tarjetas que flotan y líneas: un solo bucle ----------
  let mx = 0, my = 0, objX = 0, objY = 0, scrollY = 0, ultimo = 0, bucle = null;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || reducido) return;
    objX = Math.max(-1, Math.min(1, (e.clientX / innerWidth - .5) * 2));
    objY = Math.max(-1, Math.min(1, (e.clientY / innerHeight - .5) * 2));
    despertar();
  }, { passive: true });
  document.addEventListener('desplazamiento', (e) => {
    scrollY = Math.max(0, e.detail.y);
    if (scrollY > 260 && seccionEl.classList.contains('con-tarjeta')) cerrar();   // al bajar, la tarjeta abierta se cierra
    despertar();
  });
  document.addEventListener('visibilitychange', despertar);
  const visible = () => scrollY < 900 && !document.hidden;
  const suave = (p) => p * p * (3 - 2 * p);
  function cuadro(t) {
    const dt = Math.min(.05, Math.max(0, (t - ultimo) / 1000));
    ultimo = t;
    const k = 1 - Math.exp(-dt * 3.4);
    mx += (objX - mx) * k;
    my += (objY - my) * k;
    const o = {};
    for (const c in PROF) {
      const [px, s] = PROF[c];
      o[c] = [-mx * px, -my * px * .6 + scrollY * s];
      if (capas[c]) capas[c].style.transform = `translate3d(${o[c][0].toFixed(2)}px, ${o[c][1].toFixed(2)}px, 0)`;
    }
    const kp = 1 - Math.exp(-dt * 9);
    for (const q of puntos) {
      q.p += ((q.el.classList.contains('abierta') ? 1 : 0) - q.p) * kp;
      const flota = reducido ? [0, 0] : [Math.cos(t * .00041 + q.fase) * 2.2, Math.sin(t * .00057 + q.fase) * 5.5];
      const dx = flota[0], dy = flota[1] + q.sube * suave(q.p);
      q.el.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
      // línea: del título (se mueve con la tarjeta) al punto de su capa
      const ox = q.L.de[0] + o.puntos[0] + dx, oy = q.L.de[1] + o.puntos[1] + dy;
      const capa = o[q.L.capa];
      const ax = q.L.a[0] + capa[0], ay = q.L.a[1] + capa[1];
      const lx = ax - ox, ly = ay - oy;
      const cx = (ox + ax) / 2 - ly * q.L.curva, cy = (oy + ay) / 2 + lx * q.L.curva;
      q.linea.setAttribute('d', `M${ox.toFixed(1)} ${oy.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ax.toFixed(1)} ${ay.toFixed(1)}`);
      q.grad.setAttribute('x1', ax.toFixed(1)); q.grad.setAttribute('y1', ay.toFixed(1));
      q.grad.setAttribute('x2', ox.toFixed(1)); q.grad.setAttribute('y2', oy.toFixed(1));
      q.punto.setAttribute('transform', `translate(${ax.toFixed(1)} ${ay.toFixed(1)})`);
    }
    if (motas.length) dibujarPolvo(t, dt);
    bucle = visible() ? requestAnimationFrame(cuadro) : null;
  }
  function despertar() {
    if (bucle || !visible()) return;
    ultimo = performance.now();
    bucle = requestAnimationFrame(cuadro);
  }
  despertar();

  // ---------- Entrada: al abrirse la cortina aparecen las capas; después, las líneas y los íconos ----------
  const entrar = () => {
    setTimeout(() => seccionEl.classList.add('arriba'), 350);
    setTimeout(() => seccionEl.classList.add('lineas'), 2250);
  };
  // Guía (compartido/guia.js): la mano invita a pasar por un ícono (Innovación), hasta que se usa uno
  if (window.GUIA) GUIA.pista({ id: 'elegirnos-tarjetas', texto: 'tarjetasIr', objetivo: () => $('.df-punto[data-icono="innovacion"] .el-icono') || $('.df-punto .el-icono'), punto: [.5, .55], zona: '.df-punto', tipo: 'pasar', lado: 'abajo', espera: 3.4, activa: () => seccionEl.classList.contains('lineas') && !seccionEl.classList.contains('con-tarjeta') && scrollY < 60 });
  if (document.body.classList.contains('lista')) entrar(); else document.addEventListener('pagina-lista', entrar, { once: true });

  // =========================================================
  // SCROLL: común, como una web. Las capas suben con `translate` directo (no con una
  // variable CSS en .escenario: eso recalculaba los estilos de toda la diapositiva en
  // cada cuadro). La rueda, el touchpad y las teclas mueven la página lo que piden,
  // con un resorte corto. Con un tema de Mejora continua abierto, la rueda y ↑ ↓
  // recorren sus secciones (mejora.js).
  // =========================================================
  // Al final, RSE (Comunidad) queda quieta y "Nuestros clientes" sube por encima:
  // pasado QUIETO_DESDE el tramo deja de subir y solo se mueve la sección de Clientes.
  const tramo = $('.mc-tramo'), clientesEl = $('.mc-cli');
  const QUIETO_DESDE = 900 + 900 + 2700;            // Comunidad entera en pantalla (adaptabilidad + pantalla partida + RSE)
  let bajada = -1;
  document.addEventListener('desplazamiento', (e) => {
    const y = Math.max(0, e.detail.y);
    if (y === bajada) return;
    bajada = y;
    seccionEl.style.translate = `0 ${(-y).toFixed(1)}px`;
    tramo.style.translate = `0 ${(-Math.min(y, QUIETO_DESDE)).toFixed(1)}px`;
    if (clientesEl) clientesEl.style.translate = `0 ${(-Math.max(0, y - QUIETO_DESDE)).toFixed(1)}px`;
    seccionEl.classList.toggle('lejos', y > 1800);   // ya quedó muy arriba: no se dibuja
  });

  const MAXIMO = 900 + 900 + 2700 + 1000;         // adaptabilidad (900) + pantalla partida (900) + RSE: tablero, números y comunidad (3 × 900) + Clientes (1000: al final aparece el botón Volver)
  const RIGIDEZ = 13;
  let objetivoY = 0, animacion = null, velocidad = 0, posicion = 0, ultimoCuadro = 0;
  const destino = () => (animacion ? objetivoY : (window.desplazamiento ? window.desplazamiento.y : 0));
  const capituloAbierto = () => document.body.classList.contains('capitulo-abierto');
  const pasoCapitulo = (dir) => document.dispatchEvent(new CustomEvent('capitulo-paso', { detail: dir }));
  function mover(ahora) {
    let dt = Math.min(.05, Math.max(0, (ahora - ultimoCuadro) / 1000));
    ultimoCuadro = ahora;
    // resorte críticamente amortiguado, en subpasos cortos para que sea estable
    while (dt > 0) {
      const h = Math.min(dt, 1 / 240);
      velocidad += (RIGIDEZ * RIGIDEZ * (objetivoY - posicion) - 2 * RIGIDEZ * velocidad) * h;
      posicion += velocidad * h;
      dt -= h;
    }
    posicion = Math.max(0, Math.min(MAXIMO, posicion));
    const termino = Math.abs(objetivoY - posicion) < 1.5 && Math.abs(velocidad) < 40;
    if (termino) { posicion = objetivoY; velocidad = 0; }
    window.desplazamiento.ir(posicion, true);
    animacion = termino ? null : requestAnimationFrame(mover);
  }
  // mueve hacia "y"; si ya se está moviendo, solo cambia el destino (sigue con su impulso)
  function irA(y) {
    objetivoY = Math.max(0, Math.min(MAXIMO, y));
    if (!window.desplazamiento) return;
    if (!animacion) {
      if (Math.abs(window.desplazamiento.y - objetivoY) < .5) return;
      posicion = window.desplazamiento.y;
      velocidad = 0;
      ultimoCuadro = performance.now();
      animacion = requestAnimationFrame(mover);
    }
  }
  window.desplazarA = (y) => irA(y);              // para el índice de secciones (compartido/indice.js)
  // el arrastre táctil (compartido/desplazamiento.js) tampoco pasa del final del recorrido
  addEventListener('load', () => { if (window.desplazamiento) window.desplazamiento.limite = MAXIMO; });
  // si el dedo empieza a arrastrar mientras el resorte se mueve, manda el dedo
  addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' && animacion) { cancelAnimationFrame(animacion); animacion = null; velocidad = 0; }
  }, true);
  let ultimaRueda = 0, acumulado = 0;
  addEventListener('wheel', (e) => {
    // la rueda la maneja esta diapositiva
    e.stopImmediatePropagation();
    e.preventDefault();
    if (!e.deltaY) return;
    const d = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? 800 : 1);
    if (capituloAbierto()) {
      // dentro de un tema: una muesca (o un deslizamiento del touchpad) pasa una sección
      const ahora = performance.now();
      if (ahora - ultimaRueda > 220) acumulado = 0;
      ultimaRueda = ahora;
      if (Math.abs(d) >= 50) { acumulado = 0; pasoCapitulo(Math.sign(d)); return; }
      acumulado += d;
      if (Math.abs(acumulado) >= 120) { acumulado = 0; pasoCapitulo(Math.sign(d)); }
      return;
    }
    irA(destino() + d);
  }, { capture: true, passive: false });
  addEventListener('keydown', (e) => {
    const abajo = ['ArrowDown', 'PageDown', ' '], arriba = ['ArrowUp', 'PageUp'];
    if (![...abajo, ...arriba, 'Home', 'End'].includes(e.key)) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    const dir = abajo.includes(e.key) && !(e.key === ' ' && e.shiftKey) ? 1 : -1;
    if (capituloAbierto()) { if (e.key !== 'Home' && e.key !== 'End') pasoCapitulo(dir); return; }
    if (e.key === 'Home') irA(0);
    else if (e.key === 'End') irA(MAXIMO);
    else irA(destino() + dir * (e.key.startsWith('Arrow') ? 120 : 760));   // flechas de a poco, Av/Re Pág y espacio de a una pantalla
  }, true);
})();
