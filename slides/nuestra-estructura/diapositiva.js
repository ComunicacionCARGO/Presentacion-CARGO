/* =========================================================
   NUESTRA ESTRUCTURA — red de áreas a partir de datos/estructura.js:
   burbujas flotantes con el ícono de cada área (la dirección en el centro,
   las áreas de servicio hacia los bordes), caminos curvos que las unen con
   mensajes que viajan sin parar, paralaje con el mouse y una tarjeta con la
   información de cada área.
   ========================================================= */
(function () {
  const E = Object.assign({ antetitulo: '', titulo: '', bajada: '', ayuda: '', areas: [] }, window.ESTRUCTURA || {});
  const $ = (s, r = document) => r.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
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
  const dos = (n) => String(n).padStart(2, '0');

  // ---------- Textos ----------
  $('.te-ante').textContent = E.antetitulo;
  $('.te-titulo').textContent = E.titulo;
  $('.te-bajada').innerHTML = formato(E.bajada);
  $('.te-ayuda span').textContent = E.ayuda;

  // ---------- Íconos incluidos (sólidos, se pintan en rojo) ----------
  const ICONOS = {
    direccion: '<path d="M12 1.8 2 7v2h20V7z"/><path d="M3.5 10.5h3v8h-3zM8.25 10.5h3v8h-3zM12.75 10.5h3v8h-3zM17.5 10.5h3v8h-3zM2 19.8h20V22H2z"/>',
    logistica: '<path d="M12 2 21 6.6 12 11.2 3 6.6z"/><path d="M2.6 8.2 11.2 12.6V22l-8.6-4.6z"/><path d="M21.4 8.2 12.8 12.6V22l8.6-4.6z"/>',
    sistemas: '<path fill-rule="evenodd" d="M3 3.5h18V16H3zM5 5.5v8.5h14V5.5z"/><path d="M1 17.5h22l-1.5 2.5h-19z"/><path d="M9.6 7.4 6.6 9.8l3 2.4v-1.6L8.6 9.8l1-.8zM14.4 7.4l3 2.4-3 2.4v-1.6l1-.8-1-.8zM12.9 6.8h1.4l-3.2 6H9.7z"/>',
    calidad: '<path fill-rule="evenodd" d="M12 .8l2.7 2.1 3.4-.4 1.2 3.2 3 1.7-.9 3.3 1.3 3.2-2.8 2-.8 3.3-3.4.1L12 21.6l-2.7-2.1-3.4.1-.8-3.3-2.8-2 1.3-3.2-.9-3.3 3-1.7 1.2-3.2 3.4.4zM10.7 15.3l6-6-1.6-1.6-4.4 4.4-2.2-2.2-1.6 1.6z"/>',
    seguridad: '<path d="M2.5 16.6c.1-5.2 3.7-9.2 8.3-10V12h2.4V6.6c4.6.8 8.2 4.8 8.3 10z"/><path d="M9.6 4h4.8v7H9.6z"/><path d="M1 17.6h22v2.8H1z"/>',
    salud: '<path d="M8.6 2.5h6.8v6.1h6.1v6.8h-6.1v6.1H8.6v-6.1H2.5V8.6h6.1z"/>',
    personas: '<circle cx="12" cy="5.6" r="3.2"/><path d="M6.8 21v-6.2c0-2.9 2.3-5 5.2-5s5.2 2.1 5.2 5V21z"/><circle cx="4.6" cy="8.2" r="2.4"/><path d="M.6 19v-4c0-2.1 1.7-3.6 3.9-3.6 1 0 1.8.3 2.5.8-.7.9-1.1 2.1-1.1 3.4V19z"/><circle cx="19.4" cy="8.2" r="2.4"/><path d="M23.4 19v-4c0-2.1-1.7-3.6-3.9-3.6-1 0-1.8.3-2.5.8.7.9 1.1 2.1 1.1 3.4V19z"/>',
    facturacion: '<path fill-rule="evenodd" d="M4.5 2h15v20l-2.5-1.7-2.5 1.7-2.5-1.7L9.5 22 7 20.3 4.5 22zM8 6.2V8h8V6.2zM8 10v1.8h8V10zM8 13.8v1.8h5v-1.8z"/>',
    finanzas: '<path d="M2 20.5h20V22H2zM4 13.4h3.4v5.8H4zM9.6 10.2H13v9H9.6zM15.2 12.4h3.4v6.8h-3.4z"/><path d="M3.4 10.8 9.2 5.8l3.6 2.9 5.6-4.6h-2.6V2.4H22V8h-1.7V5.4l-7.5 6.1-3.6-2.9-4.7 4.1z"/>',
    compras: '<path d="M1 2.6h3.8l.8 3H22l-2.8 9.8H7.6L5 4.4H1z"/><circle cx="9" cy="19.2" r="2"/><circle cx="17.4" cy="19.2" r="2"/>',
    legajo: '<path fill-rule="evenodd" d="M2 4.5h20v15H2zM8 8.4a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4zM4.4 17h7.2c-.3-2-1.8-3.2-3.6-3.2S4.7 15 4.4 17zM13.5 8.6h6.2v1.7h-6.2zM13.5 11.8h6.2v1.7h-6.2zM13.5 15h4.2v1.7h-4.2z"/>',
    relaciones: '<circle cx="12" cy="12.6" r="3.2"/><circle cx="12" cy="3.6" r="2.4"/><circle cx="4" cy="18.6" r="2.4"/><circle cx="20" cy="18.6" r="2.4"/><path d="M11.2 5.6h1.6v4h-1.6zM5.2 17.1l3.7-2.5.9 1.3-3.7 2.5zM18.8 17.1l-3.7-2.5-.9 1.3 3.7 2.5z"/>',
    impuestos: '<path d="M9 2.5h6l-1.6 3.4h-2.8z"/><path fill-rule="evenodd" d="M8.6 7h6.8c3.5 2.5 5.6 6 5.6 9.5 0 3-2 5.5-5.6 5.5H8.6C5 22 3 19.5 3 16.5 3 13 5.1 9.5 8.6 7zM9.4 11.4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM14.6 16.4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM15.1 11.2l1.2 1.1-7.3 7.3-1.2-1.1z"/>',
    tesoreria: '<path fill-rule="evenodd" d="M2.5 3h19v16h-19zM11 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM11 9.6a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8zM17.4 8H19v6h-1.6z"/><path d="M4.5 19.5h3v2h-3zM16.5 19.5h3v2h-3z"/>',
    contabilidad: '<path fill-rule="evenodd" d="M4.5 1.5h15v21h-15zM7 4v4.5h10V4zM7 11v2.4h2.4V11zM10.8 11v2.4h2.4V11zM14.6 11v2.4H17V11zM7 14.8v2.4h2.4v-2.4zM10.8 14.8v2.4h2.4v-2.4zM14.6 14.8V20H17v-5.2zM7 18.6V21h6.2v-2.4z"/>',
    comercial: '<path fill-rule="evenodd" d="M8 5.5V3.6C8 2.7 8.7 2 9.6 2h4.8c.9 0 1.6.7 1.6 1.6v1.9h5.5c.8 0 1.5.7 1.5 1.5V12H1V7c0-.8.7-1.5 1.5-1.5zM9.8 3.8v1.7h4.4V3.8z"/><path d="M1 13.5h9v1.8h4v-1.8h9V19c0 .8-.7 1.5-1.5 1.5h-19C1.7 20.5 1 19.8 1 19z"/>',
    legal: '<path d="M11.1 3.5h1.8V20h-1.8zM6.5 20h11v2h-11zM3 5.6h18v1.8H3z"/><circle cx="12" cy="3" r="1.8"/><path d="M5 7.4 1.6 14h1.6L5 10.4 6.8 14h1.6zM19 7.4 15.6 14h1.6l1.8-3.6 1.8 3.6h1.6z"/><path d="M1.2 14.6h7.6a3.8 3.8 0 0 1-7.6 0zM15.2 14.6h7.6a3.8 3.8 0 0 1-7.6 0z"/>',
    comunicacion: '<path d="M2 9h4.6L15 4.2v15.6L6.6 15H2z"/><path d="M5.2 16h3.4l1.4 5.4H6.8z"/><path class="trazo" d="M18 8.8c.9.9 1.4 2 1.4 3.2s-.5 2.3-1.4 3.2M20.4 6.4c1.5 1.5 2.4 3.4 2.4 5.6s-.9 4.1-2.4 5.6"/>'
  };
  function icono(a, padre) {
    const dibujar = () => { padre.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[a.icono] || ICONOS.direccion}</svg>`; };
    if (a.imagen) {
      const img = crear('img', '', padre);
      img.alt = '';
      img.onerror = dibujar;
      img.src = '../../' + a.imagen;
    } else dibujar();
  }

  // =========================================================
  // UBICACIÓN DE LAS BURBUJAS
  // Anillos elípticos por nivel; después se separan las que se pisan
  // y se alejan del título (así funciona aunque se agreguen áreas).
  // =========================================================
  const areas = E.areas.filter((a) => a && a.nombre);
  const CENTRO = { x: 820, y: 488 };
  const TAM = { 0: 164, 1: 122, 2: 98, 3: 80 };          // diámetro de cada burbuja
  const ANILLO = { 1: { rx: 275, ry: 150, desde: -135 }, 2: { rx: 470, ry: 245, desde: -90 }, 3: { rx: 660, ry: 318, desde: -112.5 } };
  const TITULO = { x0: 50, y0: 60, x1: 500, y1: 330 };    // zona que ocupan el título y la ayuda
  const nodos = areas.map((a, i) => {
    const nivel = Math.max(0, Math.min(3, Number(a.nivel) || 0));
    return { a, i, nivel, d: TAM[nivel] };
  });
  [1, 2, 3].forEach((nv) => {
    const anillo = nodos.filter((n) => n.nivel === nv), cfg = ANILLO[nv];
    anillo.forEach((n, k) => {
      const ang = (cfg.desde + k * 360 / anillo.length) * Math.PI / 180;
      n.tx = CENTRO.x + cfg.rx * Math.cos(ang);
      n.ty = CENTRO.y + cfg.ry * Math.sin(ang);
    });
  });
  nodos.filter((n) => n.nivel === 0).forEach((n, k) => { n.tx = CENTRO.x + k * 40; n.ty = CENTRO.y; });
  nodos.forEach((n) => { n.x = n.tx; n.y = n.ty; });
  // Separación: cada burbuja ocupa su círculo más el nombre de abajo
  const radio = (n) => n.d / 2 + 26;
  for (let it = 0; it < 500; it++) {
    for (let p = 0; p < nodos.length; p++) {
      for (let q = p + 1; q < nodos.length; q++) {
        const A = nodos[p], B = nodos[q];
        const dx = B.x - A.x, dy = B.y - A.y, dist = Math.hypot(dx, dy) || .01, min = radio(A) + radio(B);
        if (dist >= min) continue;
        const emp = (min - dist) / 2, ux = dx / dist, uy = dy / dist;
        const fa = A.nivel === 0 ? 0 : 1, fb = B.nivel === 0 ? 0 : 1;
        A.x -= ux * emp * fa * (fb ? 1 : 2); A.y -= uy * emp * fa * (fb ? 1 : 2);
        B.x += ux * emp * fb * (fa ? 1 : 2); B.y += uy * emp * fb * (fa ? 1 : 2);
      }
    }
    nodos.forEach((n) => {
      if (n.nivel === 0) return;
      n.x += (n.tx - n.x) * .02; n.y += (n.ty - n.y) * .02;
      const r = radio(n);
      // fuera del título
      if (n.x + r > TITULO.x0 && n.x - r < TITULO.x1 && n.y + r > TITULO.y0 && n.y - r < TITULO.y1) {
        const der = TITULO.x1 - (n.x - r), abajo = TITULO.y1 - (n.y - r);
        if (der < abajo) n.x += der * .5; else n.y += abajo * .5;
      }
      n.x = Math.max(60 + n.d / 2, Math.min(1540 - n.d / 2, n.x));
      n.y = Math.max(110 + n.d / 2, Math.min(842 - n.d / 2 - 30, n.y));
    });
  }

  // =========================================================
  // CAMINOS: cada área se une con la dirección, sus vecinas de anillo
  // y las más cercanas del anillo de adentro y de afuera
  // =========================================================
  const aristas = [], ya = new Set();
  const unir = (p, q) => {
    if (p === q) return;
    const k = Math.min(p.i, q.i) + '-' + Math.max(p.i, q.i);
    if (ya.has(k)) return;
    ya.add(k);
    aristas.push({ a: p, b: q });
  };
  const cercanos = (n, lista, cant) => lista.slice().sort((p, q) => Math.hypot(p.x - n.x, p.y - n.y) - Math.hypot(q.x - n.x, q.y - n.y)).slice(0, cant);
  const porNivel = (nv) => nodos.filter((n) => n.nivel === nv);
  const angulo = (n) => Math.atan2((n.y - CENTRO.y) / 1, (n.x - CENTRO.x) / 1.9);
  porNivel(0).forEach((c) => { porNivel(1).forEach((n) => unir(c, n)); cercanos(c, porNivel(2), 2).forEach((n) => unir(c, n)); });
  [1, 2, 3].forEach((nv) => {
    const anillo = porNivel(nv).slice().sort((p, q) => angulo(p) - angulo(q));
    anillo.forEach((n, k) => {
      if (anillo.length > 1) unir(n, anillo[(k + 1) % anillo.length]);
      const adentro = porNivel(nv - 1);
      cercanos(n, adentro, nv === 1 ? 1 : 2).forEach((m) => unir(n, m));
    });
  });

  // =========================================================
  // DIBUJO
  // =========================================================
  const contBurbujas = $('.burbujas'), gCaminos = $('.caminos'), gMensajes = $('.mensajes');
  nodos.forEach((n, k) => {
    const b = crear('button', `burbuja nivel-${n.nivel}`, contBurbujas);
    b.type = 'button';
    b.style.setProperty('--d', n.d + 'px');
    b.style.setProperty('--i', k);
    b.setAttribute('aria-label', n.a.nombre);
    const disco = crear('span', 'b-disco', b);
    crear('span', 'b-pulso', disco);
    const ic = crear('span', 'b-icono', disco);
    icono(n.a, ic);
    crear('span', 'b-nombre', b).textContent = n.a.nombre;
    n.el = b;
    // flotación propia de cada burbuja
    n.fase = k * 1.7;
    n.amp = 4 + n.nivel * 1.6;
    n.prof = { 0: .55, 1: 1, 2: .8, 3: .62 }[n.nivel];
    b.addEventListener('pointerenter', () => resaltar(n, true));
    b.addEventListener('pointerleave', () => resaltar(n, false));
    b.addEventListener('click', () => abrir(k));
  });
  // Cada camino con su degradé: transparente en las puntas y con su opacidad en el medio
  const defs = document.createElementNS(NS, 'defs');
  gCaminos.parentNode.insertBefore(defs, gCaminos);
  aristas.forEach((e, k) => {
    e.grad = document.createElementNS(NS, 'linearGradient');
    e.grad.setAttribute('id', 'camino-' + k);
    e.grad.setAttribute('class', 'degrade');
    e.grad.setAttribute('gradientUnits', 'userSpaceOnUse');
    e.grad.innerHTML = '<stop/><stop class="lleno"/><stop class="lleno"/><stop/>';
    e.paradas = e.grad.querySelectorAll('stop');
    defs.appendChild(e.grad);
    e.el = document.createElementNS(NS, 'path');
    e.el.setAttribute('pathLength', '1');
    e.el.setAttribute('stroke', `url(#camino-${k})`);
    e.el.style.setProperty('--i', k);
    gCaminos.appendChild(e.el);
  });
  // El degradé va de una burbuja a la otra: arranca en su borde y en 34 px llega a la opacidad normal
  const FUNDIDO = 34;
  function ubicarDegrade(e) {
    const A = e.a, B = e.b, L = Math.hypot(B.px - A.px, B.py - A.py) || 1;
    const g = e.grad;
    g.setAttribute('x1', A.px.toFixed(1)); g.setAttribute('y1', A.py.toFixed(1));
    g.setAttribute('x2', B.px.toFixed(1)); g.setAttribute('y2', B.py.toFixed(1));
    const ra = A.d / 2 * 1.05, rb = B.d / 2 * 1.05;
    const o = [ra / L, (ra + FUNDIDO) / L, 1 - (rb + FUNDIDO) / L, 1 - rb / L].map((v) => Math.max(0, Math.min(1, v)));
    if (o[2] < o[1]) o[1] = o[2] = (o[1] + o[2]) / 2;         // caminos cortos: sin tramo pleno
    e.paradas.forEach((s, j) => s.setAttribute('offset', o[j].toFixed(4)));
  }

  // Curva del mismo estilo que los caminos de la portada
  function controles(e) {
    const A = e.a, B = e.b, dx = B.px - A.px, dy = B.py - A.py;
    return [A.px, A.py, A.px + dx * .15, A.py + dy * .6, B.px - dx * .45, B.py - dy * .05, B.px, B.py];
  }
  function bezier(c, t) {
    const u = 1 - t;
    return [
      u * u * u * c[0] + 3 * u * u * t * c[2] + 3 * u * t * t * c[4] + t * t * t * c[6],
      u * u * u * c[1] + 3 * u * u * t * c[3] + 3 * u * t * t * c[5] + t * t * t * c[7]
    ];
  }

  // ---------- Mensajes que viajan por la red ----------
  const mensajes = [];
  const MAX_MENSAJES = 16;
  function nuevoMensaje(desde) {
    const posibles = desde ? aristas.filter((e) => e.a === desde || e.b === desde) : aristas;
    if (!posibles.length) return;
    const e = posibles[Math.floor(Math.random() * posibles.length)];
    const ida = desde ? e.a === desde : Math.random() < .5;
    const largo = Math.hypot(e.b.x - e.a.x, e.b.y - e.a.y);
    const g = document.createElementNS(NS, 'g');
    g.innerHTML = '<circle class="m-halo" r="6"/><circle class="m-punto" r="2.4"/>';
    gMensajes.appendChild(g);
    mensajes.push({ e, ida, g, inicio: performance.now(), dur: 900 + largo * 5.5 });
  }

  // ---------- Resaltar las conexiones de una burbuja ----------
  let foco = null;
  function resaltar(n, si) {
    foco = si ? n : (foco === n ? null : foco);
    aristas.forEach((e) => {
      const si = !!foco && (e.a === foco || e.b === foco);
      e.el.classList.toggle('activo', si);
      e.grad.classList.toggle('activo', si);
    });
    if (si) for (let k = 0; k < 3; k++) setTimeout(() => nuevoMensaje(n), k * 140);
  }

  // =========================================================
  // TARJETA DE CADA ÁREA
  // =========================================================
  const capa = $('.tarjeta-capa'), tarjeta = $('.tarjeta-area');
  let abierta = -1;
  function contenido(a, k) {
    let h = '<div class="ta-cabeza"><span class="ta-icono"></span><div class="ta-titulos">' +
      `<p class="ta-ante"><i class="franjitas"></i>Nuestra estructura</p><h2 class="ta-titulo" id="ta-titulo">${esc(a.titulo || a.nombre)}</h2></div>` +
      '<div class="ta-nav"><button class="ta-ant" type="button" aria-label="Área anterior"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      `<span class="ta-cont"><b>${dos(k + 1)}</b> / ${dos(nodos.length)}</span>` +
      '<button class="ta-sig" type="button" aria-label="Área siguiente"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>' +
      '<button class="ta-cerrar" type="button" aria-label="Cerrar">Cerrar <span>✕</span></button></div></div><div class="ta-cuerpo">';
    if (a.intro) h += `<p class="ta-intro">${formato(a.intro)}</p>`;
    if (a.subtitulo) h += `<p class="ta-sub">${formato(a.subtitulo)}</p>`;
    const dest = (a.destacados || []).filter((d) => d && (d.titulo || d.texto));
    if (dest.length) {
      h += `<div class="ta-destacados" style="--n:${dest.length}">` + dest.map((d, j) =>
        `<div class="ta-dest"><b>${dos(j + 1)}</b><p class="td-titulo">${formato(d.titulo)}</p>${d.texto ? `<p class="td-texto">${formato(d.texto)}</p>` : ''}</div>`).join('') + '</div>';
    }
    const lista = (a.lista || []).filter(Boolean);
    if (lista.length) h += `<ul class="ta-lista${lista.length >= 5 ? ' dos-columnas' : ''}">` + lista.map((t) => `<li>${formato(t)}</li>`).join('') + '</ul>';
    (a.parrafos || []).filter(Boolean).forEach((p) => { h += `<p class="ta-parrafo">${formato(p)}</p>`; });
    const personas = (a.personas || []).filter((p) => p && (p.cargo || p.nombre));
    if (personas.length) h += '<ul class="ta-personas">' + personas.map((p) => `<li><span>${esc(p.cargo)}</span><i></i><b>${esc(p.nombre)}</b></li>`).join('') + '</ul>';
    if (a.nota) h += `<p class="ta-nota"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><span>${formato(a.nota)}</span></p>`;
    return h + '</div>';
  }
  // Achica la letra de la tarjeta si el contenido no entra
  function ajustar() {
    const cuerpo = $('.ta-cuerpo', tarjeta);
    if (!cuerpo) return;
    let t = 1;
    tarjeta.style.setProperty('--t', t);
    while (cuerpo.scrollHeight > cuerpo.clientHeight + 1 && t > .62) { t -= .03; tarjeta.style.setProperty('--t', t.toFixed(2)); }
  }
  // Punto de la tarjeta que coincide con la burbuja (para que nazca y vuelva ahí)
  function origen(n) {
    tarjeta.style.setProperty('--ox', (n.px - tarjeta.offsetLeft).toFixed(0) + 'px');
    tarjeta.style.setProperty('--oy', (n.py - tarjeta.offsetTop).toFixed(0) + 'px');
  }
  function abrir(k) {
    const n = nodos[k];
    if (!n) return;
    ocultarAyuda();
    const yaAbierta = abierta >= 0;
    abierta = k;
    tarjeta.innerHTML = contenido(n.a, k);
    icono(n.a, $('.ta-icono', tarjeta));
    $('.ta-cerrar', tarjeta).addEventListener('click', cerrar);
    $('.ta-ant', tarjeta).addEventListener('click', () => abrir((k - 1 + nodos.length) % nodos.length));
    $('.ta-sig', tarjeta).addEventListener('click', () => abrir((k + 1) % nodos.length));
    ajustar();
    document.fonts.ready.then(ajustar);
    nodos.forEach((m) => m.el.classList.toggle('elegida', m === n));
    if (!yaAbierta) {
      // la tarjeta nace desde la burbuja
      origen(n);
      capa.classList.add('abierta');
      capa.setAttribute('aria-hidden', 'false');
      $('.seccion-red').classList.add('con-tarjeta');
    } else {
      tarjeta.animate([{ opacity: .4, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    $('.ta-cerrar', tarjeta).focus({ preventScroll: true });
  }
  function cerrar() {
    if (abierta < 0) return;
    const n = nodos[abierta];
    abierta = -1;
    origen(n);
    capa.classList.remove('abierta');
    capa.setAttribute('aria-hidden', 'true');
    $('.seccion-red').classList.remove('con-tarjeta');
    nodos.forEach((m) => m.el.classList.remove('elegida'));
    n.el.focus({ preventScroll: true });
  }
  capa.addEventListener('click', (e) => { if (e.target === capa) cerrar(); });
  // Esc cierra la tarjeta antes de volver a la portada; flechas recorren las áreas
  addEventListener('keydown', (e) => {
    if (abierta < 0) return;
    if (e.key === 'Escape') { e.stopImmediatePropagation(); e.preventDefault(); cerrar(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); abrir((abierta + 1) % nodos.length); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); abrir((abierta - 1 + nodos.length) % nodos.length); }
  }, true);

  // ---------- Ayuda: desaparece apenas se abre un área ----------
  const ayuda = $('.te-ayuda');
  function ocultarAyuda() { ayuda.classList.add('usada'); }

  // =========================================================
  // ANIMACIÓN: flotación, paralaje, caminos y mensajes en cada cuadro
  // =========================================================
  const seccion = $('.seccion-red'), fondo = $('.fondo-imagen');
  let visible = false;
  new IntersectionObserver((en, obs) => {
    if (!en[0].isIntersecting) return;
    obs.disconnect();
    seccion.classList.add('visible');
    visible = true;
  }, { threshold: .3 }).observe(seccion);

  let mx = 0, my = 0, gx = 0, gy = 0;
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    mx = (e.clientX / innerWidth) * 2 - 1;
    my = (e.clientY / innerHeight) * 2 - 1;
  });

  // Cada tanto una burbuja late para invitar a tocarla
  let ultimoLatido = 0;
  let ultimoMensaje = 0;
  (function cuadro(ahora) {
    requestAnimationFrame(cuadro);
    const t = ahora / 1000;
    gx += (mx - gx) * .05;
    gy += (my - gy) * .05;
    fondo.style.transform = `translate3d(${(-gx * 26).toFixed(2)}px, ${(-gy * 16).toFixed(2)}px, 0) scale(1.06)`;

    nodos.forEach((n) => {
      n.px = n.x + Math.sin(t * .9 + n.fase) * n.amp - gx * 18 * n.prof;
      n.py = n.y + Math.cos(t * .7 + n.fase * 1.3) * n.amp - gy * 12 * n.prof;
      n.el.style.transform = `translate3d(${n.px.toFixed(2)}px, ${n.py.toFixed(2)}px, 0)`;
    });
    aristas.forEach((e) => {
      const c = controles(e);
      e.c = c;
      e.el.setAttribute('d', `M${c[0].toFixed(1)},${c[1].toFixed(1)}C${c[2].toFixed(1)},${c[3].toFixed(1)} ${c[4].toFixed(1)},${c[5].toFixed(1)} ${c[6].toFixed(1)},${c[7].toFixed(1)}`);
      ubicarDegrade(e);
    });

    if (!visible) return;
    // mensajes: aparecen sin parar y recorren un camino de punta a punta
    if (mensajes.length < MAX_MENSAJES && ahora - ultimoMensaje > 220) { ultimoMensaje = ahora; nuevoMensaje(); }
    for (let k = mensajes.length - 1; k >= 0; k--) {
      const m = mensajes[k];
      let p = (ahora - m.inicio) / m.dur;
      if (p >= 1) { m.g.remove(); mensajes.splice(k, 1); continue; }
      p = p * p * (3 - 2 * p);                                  // arranca y llega suave
      const [x, y] = bezier(m.e.c, m.ida ? p : 1 - p);
      m.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      m.g.style.opacity = Math.min(1, Math.min(p, 1 - p) * 6).toFixed(2);
    }
    if (abierta < 0 && ahora - ultimoLatido > 2600) {
      ultimoLatido = ahora;
      const n = nodos[1 + Math.floor(Math.random() * (nodos.length - 1))] || nodos[0];
      n.el.classList.remove('late');
      void n.el.offsetWidth;
      n.el.classList.add('late');
    }
  })(performance.now());
})();
