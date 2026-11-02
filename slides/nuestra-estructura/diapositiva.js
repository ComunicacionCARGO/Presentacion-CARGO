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

  // Avance de la transición a "Mejora continua" (0 = red a la vista, 1 = todo gris)
  let avance = 0;

  // Cada tanto una burbuja late para invitar a tocarla
  let ultimoLatido = 0;
  let ultimoMensaje = 0;
  (function cuadro(ahora) {
    requestAnimationFrame(cuadro);
    if (avance >= 1) return;                     // la red está tapada por completo: no se calcula nada
    const t = ahora / 1000;
    gx += (mx - gx) * .05;
    gy += (my - gy) * .05;
    fondo.style.transform = `translate3d(${(-gx * 26).toFixed(2)}px, ${(-gy * 16).toFixed(2)}px, 0) scale(1.06)`;

    nodos.forEach((n) => {
      n.px = n.x + Math.sin(t * .9 + n.fase) * n.amp - gx * 18 * n.prof;
      n.py = n.y + Math.cos(t * .7 + n.fase * 1.3) * n.amp - gy * 12 * n.prof;
      n.el.style.transform = `translate3d(${n.px.toFixed(2)}px, ${n.py.toFixed(2)}px, 0)`;
    });
    // durante la transición, los anillos siguen a la Dirección mientras flota
    if (avance > 0) dibujarAnillos();
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

  // =========================================================
  // TRANSICIÓN A "MEJORA CONTINUA"
  // Al bajar, tres anillos (rojo, rojo y gris, con huecos entre ellos y el
  // grosor fijo de la referencia) llegan desde los bordes y se cierran hacia
  // el centro; detrás queda todo gris y aparece el título. Sigue al scroll
  // (se puede volver) y, al soltar la rueda, se completa solo.
  // =========================================================
  $('.mc-ante').textContent = E.elegirnosAntetitulo || '¿Por qué';
  $('.mc-grande').textContent = E.elegirnosTitulo || 'ELEGIRNOS?';

  // ---------- Tarjetas de "¿Por qué elegirnos?" (íconos redibujados de las diapositivas originales) ----------
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
      '<path fill-rule="evenodd" d="M6.6 13.2h10.8a4.4 4.4 0 0 1 0 8.8H6.6a4.4 4.4 0 0 1 0-8.8zM6.8 15.2a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z"/>',
    // tres personas de la mano (la de la izquierda con vestido) y una flecha en zigzag que sube
    crecimiento: (() => {
      const persona = (cx, vestido) => {
        const cabeza = `<circle cx="${cx}" cy="3.3" r="1.75"/>`;
        const cuerpo = vestido
          ? `<path d="M${cx - 1.5} 5.6h3l1.4 4.6.9 3.4h-2.2v4.8h-1.3v-4.8h-.6v4.8h-1.3v-4.8h-2.2l.9-3.4z"/>`
          : `<path d="M${cx - 1.6} 5.6h3.2c.8 0 1.4.6 1.4 1.4v4.9h-1.2v6.2h-1.4v-5.4h-.8v5.4H${cx - 1.6}v-6.2h-1.2V7c0-.8.6-1.4 1.4-1.4z"/>`;
        return cabeza + cuerpo;
      };
      return persona(5.2, true) + persona(12, false) + persona(18.8, false) +
        '<path d="M7.4 9.6h2.6v1.1H7.4zM14 9.6h2.6v1.1H14z"/>' +
        '<path class="hueco" d="M2 22l6.2-6.4 3.8 3.4 7.6-7.8"/><path class="trazo flecha" d="M2 22l6.2-6.4 3.8 3.4 7.6-7.8"/>' +
        '<path d="M22.8 8.4l-.6 6.4-2.4-2.4-1.6-1.6-2.4-2.4z"/>';
    })()
  };
  // Título al lado del ícono en dos líneas: la última palabra baja, junto con su artículo
  // ("Excelencia en / el servicio", "Innovación y / tecnología")
  const tituloEnDosLineas = (titulo) => {
    const p = String(titulo || '').trim().split(/\s+/);
    if (p.length < 2) return formato(titulo);
    let corte = p.length - 1;
    if (corte > 1 && /^(el|la|los|las|un|una|lo)$/i.test(p[corte - 1])) corte--;
    return formato(p.slice(0, corte).join(' ')) + '<br>' + formato(p.slice(corte).join(' '));
  };
  const contEl = $('.el-tarjetas');
  (E.elegirnos || []).slice(0, 4).forEach((t, i) => {
    const art = crear('article', 'el-tarjeta', contEl);
    art.style.setProperty('--i', i);
    const v = crear('div', 'el-vidrio', art);
    v.style.setProperty('--i', i);
    const datos = (t.datos || []).filter((d) => d && (d.valor || d.texto));
    const cont = crear('div', 'el-contenido', v,
      `<div class="el-cabeza"><span class="el-icono"></span><h3 class="el-titulo">${tituloEnDosLineas(t.titulo)}</h3></div><p class="el-texto">${formato(t.texto)}</p>` +
      (datos.length ? '<div class="el-datos">' + datos.map((d) => `<div><b>${esc(d.valor)}</b><span>${formato(d.texto)}</span></div>`).join('') + '</div>' : ''));
    // Ícono propio en SVG (si está); si no, el incluido
    const ic = $('.el-icono', cont);
    const incluido = () => { ic.classList.remove('propio'); ic.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS_EL[t.icono] || ICONOS_EL.excelencia}</svg>`; };
    if (t.imagen) {
      ic.classList.add('propio');
      const img = crear('img', '', ic);
      img.alt = '';
      img.onerror = incluido;
      img.src = '../../' + t.imagen;
    } else incluido();
    crear('i', 'el-brillo', v);
    // inclinación 3D y reflejo que siguen al cursor
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
  });
  const lienzo = $('.anillos'), ctx = lienzo.getContext('2d');
  const tituloAnte = $('.mc-ante'), tituloGrande = $('.mc-grande');
  const RECORRIDO = 900;                          // scroll (px del escenario) que dura la transición
  const BANDA = 66, HUECO = 20;                   // grosor de cada anillo y de cada hueco (como la referencia: 54 / 16,5)
  const ROJO = '#EF4529', GRIS = '#3A3A3A';
  const suave = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  function dibujarAnillos() {
    const k = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--escala')) || 1;
    const dpr = window.devicePixelRatio || 1;
    const w = innerWidth, h = innerHeight;
    if (lienzo.width !== Math.round(w * dpr) || lienzo.height !== Math.round(h * dpr)) {
      lienzo.width = Math.round(w * dpr);
      lienzo.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    lienzo.style.visibility = avance > 0 ? 'visible' : 'hidden';
    if (avance <= 0) return;
    const b = BANDA * k, g = HUECO * k;
    const ancho = 2 * b + 2 * g;                  // rojo, hueco, rojo, hueco (después, gris hasta el borde)
    // Centro: la burbuja de la Dirección, donde esté en este momento (flota y se mueve con el paralaje)
    const dir = nodos.find((n) => n.nivel === 0);
    const sx = dir && dir.px != null ? dir.px : 800, sy = dir && dir.py != null ? dir.py : 450;
    const cx = w / 2 + (sx - 800) * k, cy = h / 2 + (sy - 450) * k;
    const lejos = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 4;   // hasta la esquina más lejana
    // R = borde interior del anillo rojo de adelante: arranca fuera de la pantalla y termina pasado el centro
    // (lineal: cada uno de los 3 pasos cierra lo mismo; la suavidad la da la animación de cada paso)
    const R = lejos + (-ancho - 2 - lejos) * avance;
    const aro = (r0, r1, color) => {
      r0 = Math.max(0, r0);
      if (r1 <= r0) return;
      ctx.beginPath();
      ctx.arc(cx, cy, r1, 0, Math.PI * 2);
      if (r0 > 0) ctx.arc(cx, cy, r0, 0, Math.PI * 2, true);
      ctx.fillStyle = color;
      ctx.fill();
    };
    // gris: todo lo que queda afuera del último hueco
    const rGris = R + ancho;
    ctx.fillStyle = GRIS;
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    if (rGris > 0) ctx.arc(cx, cy, rGris, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
    aro(R + b + g, R + 2 * b + g, ROJO);          // anillo rojo de afuera
    aro(R, R + b, ROJO);                          // anillo rojo de adelante
  }

  function aplicarAvance() {
    dibujarAnillos();
    seccion.classList.toggle('tapada', avance > .15);
    // el título aparece en el último paso, cuando los anillos ya cerraron casi todo
    const a1 = suave(.7, .95, avance), a2 = suave(.76, 1, avance);
    tituloAnte.style.opacity = a1.toFixed(3);
    tituloAnte.style.transform = `translateY(${((1 - a1) * 26).toFixed(1)}px)`;
    tituloGrande.style.opacity = a2.toFixed(3);
    tituloGrande.style.transform = `translateY(${((1 - a2) * 40).toFixed(1)}px) scale(${(.94 + a2 * .06).toFixed(3)})`;
    $('.seccion-mejora').setAttribute('aria-hidden', avance < .9 ? 'true' : 'false');
    // el fondo de camiones aparece sobre el gris al final de los anillos
    fondoEl.style.opacity = suave(.8, 1, avance).toFixed(3);
    // cuando los anillos están por cerrar, el título sube y entran las tarjetas sin pausa
    // (se encadena con el final del movimiento, así nunca parece que el scroll se frenó);
    // al volver, bajan enseguida
    seccionEl.classList.toggle('arriba', avance >= .97);
  }
  const seccionEl = $('.seccion-mejora'), fondoEl = $('.el-fondo'), escenarioEl = $('.escenario');
  // Después de los anillos el scroll sigue como un scroll común: "¿Por qué elegirnos?"
  // sube y aparecen "Mejora continua" y la pantalla partida (--bajada, en mejora.css)
  let bajada = 0;
  document.addEventListener('desplazamiento', (e) => {
    const nuevaBajada = Math.max(0, e.detail.y - RECORRIDO);
    if (nuevaBajada !== bajada) { bajada = nuevaBajada; escenarioEl.style.setProperty('--bajada', bajada.toFixed(1)); }
    const nuevo = Math.max(0, Math.min(1, e.detail.y / RECORRIDO));
    if (Math.abs(nuevo - avance) < .0005 && nuevo !== 0 && nuevo !== 1) return;
    if (nuevo === avance && (nuevo === 0 || nuevo === 1)) return;
    avance = nuevo;
    aplicarAvance();
  });
  addEventListener('resize', aplicarAvance);
  aplicarAvance();

  // La transición avanza en PASOS. Nunca hay que esperar a que termine una animación:
  // cada muesca de la rueda (o tecla) suma un paso al destino en el momento, y el
  // movimiento sigue con su impulso hacia el nuevo destino (resorte amortiguado, sin
  // frenar ni volver a arrancar). Dos muescas seguidas pasan los dos pasos de una vez.
  // Paradas del scroll: 2 pasos de anillos (0 → 450 → 900: "¿Por qué elegirnos?"),
  // después "Mejora continua" (1800) y la pantalla partida Calidad / Capacitaciones (2700)
  const PARADAS = [0, RECORRIDO / 2, RECORRIDO, RECORRIDO + 900, RECORRIDO + 1800];
  const ULTIMA = PARADAS.length - 1, MAXIMO = PARADAS[ULTIMA];
  const RIGIDEZ = 7.5;                            // más alto = más rápido (7,5 ≈ 1 s por paso)
  const UMBRAL_TOUCHPAD = 120;                    // desplazamiento del touchpad que equivale a un paso
  let paso = 0, animacion = null, velocidad = 0, posicion = 0, ultimoCuadro = 0;
  let acumulado = 0, ultimaRueda = 0;
  const paradaCercana = (y) => PARADAS.reduce((m, p, i) => (Math.abs(p - y) < Math.abs(PARADAS[m] - y) ? i : m), 0);
  // paso actual: el de destino si hay una animación en curso; si no, el de la posición real
  const pasoActual = () => (animacion || !window.desplazamiento ? paso : paradaCercana(window.desplazamiento.y));
  // Con un tema de Mejora continua abierto, la rueda y las teclas recorren sus secciones (mejora.js)
  const capituloAbierto = () => document.body.classList.contains('capitulo-abierto');
  const pasoCapitulo = (dir) => document.dispatchEvent(new CustomEvent('capitulo-paso', { detail: dir }));
  window.irAParada = (n) => irAPaso(n);           // para mejora.js (por ejemplo, volver a la pantalla partida)
  function mover(ahora) {
    let dt = Math.min(.05, Math.max(0, (ahora - ultimoCuadro) / 1000));
    ultimoCuadro = ahora;
    const objetivo = PARADAS[paso];
    // resorte críticamente amortiguado, en subpasos cortos para que sea estable
    while (dt > 0) {
      const h = Math.min(dt, 1 / 240);
      velocidad += (RIGIDEZ * RIGIDEZ * (objetivo - posicion) - 2 * RIGIDEZ * velocidad) * h;
      posicion += velocidad * h;
      dt -= h;
    }
    posicion = Math.max(0, Math.min(MAXIMO, posicion));
    const termino = Math.abs(objetivo - posicion) < 2.5 && Math.abs(velocidad) < 60;  // los últimos píxeles no se notan
    if (termino) { posicion = objetivo; velocidad = 0; }
    window.desplazamiento.ir(posicion, true);
    animacion = termino ? null : requestAnimationFrame(mover);
  }
  function irAPaso(n) {
    n = Math.max(0, Math.min(ULTIMA, n));
    if (!window.desplazamiento) { paso = n; return; }
    if (n === paso && !animacion && Math.abs(window.desplazamiento.y - PARADAS[n]) < .5) return;
    paso = n;
    if (!animacion) {                             // arranca desde donde está, quieto
      posicion = window.desplazamiento.y;
      velocidad = 0;
      ultimoCuadro = performance.now();
      animacion = requestAnimationFrame(mover);
    }                                             // si ya se está moviendo, solo cambia el destino
  }
  addEventListener('wheel', (e) => {
    // la rueda la maneja esta diapositiva (no el scroll libre)
    e.stopImmediatePropagation();
    e.preventDefault();
    if (abierta >= 0 || !e.deltaY) return;          // con una tarjeta abierta, la rueda no hace nada
    const d = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? 800 : 1);
    const ahora = performance.now();
    if (ahora - ultimaRueda > 220 || Math.sign(d) !== Math.sign(acumulado)) acumulado = 0;
    ultimaRueda = ahora;
    const dar = (dir) => (capituloAbierto() ? pasoCapitulo(dir) : irAPaso(pasoActual() + dir));
    if (Math.abs(d) >= 50) {                        // muesca de rueda de mouse: un paso cada una
      acumulado = 0;
      dar(Math.sign(d));
      return;
    }
    acumulado += d;                                 // touchpad: se suma hasta completar un paso
    if (Math.abs(acumulado) >= UMBRAL_TOUCHPAD) {
      acumulado -= Math.sign(acumulado) * UMBRAL_TOUCHPAD;
      dar(Math.sign(d));
    }
  }, { capture: true, passive: false });
  addEventListener('keydown', (e) => {
    const abajo = ['ArrowDown', 'PageDown', ' '], arriba = ['ArrowUp', 'PageUp'];
    if (![...abajo, ...arriba, 'Home', 'End'].includes(e.key)) return;
    e.stopImmediatePropagation();
    if (abierta >= 0) return;
    e.preventDefault();
    const dir = abajo.includes(e.key) && !(e.key === ' ' && e.shiftKey) ? 1 : -1;
    if (capituloAbierto()) { if (e.key !== 'Home' && e.key !== 'End') pasoCapitulo(dir); return; }
    if (e.key === 'Home') irAPaso(0);
    else if (e.key === 'End') irAPaso(ULTIMA);
    else irAPaso(pasoActual() + dir);
  }, true);
})();
