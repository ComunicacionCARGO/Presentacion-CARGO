/* =========================================================
   POLÍTICAS Y CERTIFICACIONES (¿Quiénes somos?, después de Nuestra estructura)
   y TRANSICIÓN DE ANILLOS hacia "Nuestros logros".
   Datos: datos/mejora-continua.js (calidad.politicas, calidad.certificaciones).

   • Selector de políticas (pestañas con el color de cada una, cita y directrices)
     y sellos de las certificaciones con el texto que gira.
   • Cuando el final de la sección llega al borde de abajo, la sección queda
     quieta y tres anillos (gris afuera, rojo, hueco, rojo) se cierran desde los
     bordes hacia el sello del medio a medida que se baja (900 px de scroll).
     Queda todo gris y "Nuestros logros" (fondo gris) sube desde abajo.
   ========================================================= */
(function () {
  const M = window.MEJORA, poli = document.querySelector('.seccion-politicas');
  if (!M || !poli) return;
  const C = M.calidad || {};
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // **negrita** y *rojo en cursiva*
  const formato = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');

  // ---------- Íconos de las políticas (sólidos, 24 × 24) ----------
  const ICONOS = {
    sello: '<path fill-rule="evenodd" d="M12 .8l2.7 2.1 3.4-.4 1.2 3.2 3 1.7-.9 3.3 1.3 3.2-2.8 2-.8 3.3-3.4.1L12 21.6l-2.7-2.1-3.4.1-.8-3.3-2.8-2 1.3-3.2-.9-3.3 3-1.7 1.2-3.2 3.4.4zM10.7 15.3l6-6-1.6-1.6-4.4 4.4-2.2-2.2-1.6 1.6z"/>',
    cono: '<path d="M10.1 1.5h3.8l1.1 4.3H9z"/><path d="M8.5 7.8h7l1.1 4.4H7.4z"/><path d="M6.9 14.2h10.2l1.3 5H5.6z"/><path d="M1.5 20.2h21v2.3h-21z"/>',
    hoja: '<path d="M21.6 2.4C11 2.2 4.2 6.8 3.6 14.2c-.1 1.6.2 3.1.8 4.4L2 21l1.4 1.4 2.4-2.4c1.3.7 2.8 1 4.4.9C17.6 20.3 22 13.5 21.6 2.4zM7.2 18.7c1.9-4.6 5.4-8.4 10.4-10.9-3.8 3.2-6.6 7.1-8.4 11.8z"/>'
  };
  const icono = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[n] || ICONOS.sello}</svg>`;

  // ---------- Sello de una certificación ----------
  const sello = (c, i) => {
    const dientes = 48, p = [];
    for (let k = 0; k < dientes * 2; k++) {
      const r = k % 2 ? 136 : 146, a = (k / (dientes * 2)) * Math.PI * 2;
      p.push(`${(150 + r * Math.cos(a)).toFixed(1)},${(150 + r * Math.sin(a)).toFixed(1)}`);
    }
    const anillo = `${c.norma} ${c.numero} · ${String(c.nombre || '').toUpperCase()} · ${C.certificadoras || ''} · `;
    return `<svg class="ce-svg" viewBox="0 0 300 300" aria-hidden="true">
      <defs><path id="ce-p${i}" d="M150 150 m-98 0 a98 98 0 1 1 196 0 a98 98 0 1 1 -196 0"/></defs>
      <polygon class="ce-dientes" points="${p.join(' ')}"/>
      <circle class="ce-disco" cx="150" cy="150" r="124"/>
      <circle class="ce-linea" cx="150" cy="150" r="80"/>
      <g class="ce-giro"><text class="ce-anillo"><textPath href="#ce-p${i}" textLength="612">${esc(anillo)}</textPath></text></g>
      <text class="ce-iso" x="150" y="128">${esc(c.norma)}</text>
      <text class="ce-num" x="150" y="182">${esc(c.numero)}</text>
    </svg>`;
  };

  // ---------- Contenido ----------
  // cada política tiene su color (--c); el sello toma el de su política (por el código)
  const politicas = C.politicas || [];
  const colorDe = (p) => (p && p.color ? `--c:${esc(p.color)};` : '');
  const politicaDe = (c, i) => politicas.find((p) => p.codigo === c.politica) || politicas[i];
  poli.innerHTML =
    '<div class="mp-fondo"></div>' +
    `<h2 class="mp-titulo ent"><span>${esc(C.politicasCertificacionesAntetitulo || 'Políticas y')}</span><b>${esc(C.politicasCertificacionesTitulo || 'CERTIFICACIONES')}</b></h2>` +
    `<div class="s-pol">
      <ul class="po-tabs">${politicas.map((p, i) => `<li class="ent" style="--i:${i + 1}"><button type="button" data-i="${i}" style="${colorDe(p)}"><span class="po-ico">${icono(p.icono)}</span><span class="po-txt"><b>${esc(p.nombre)}</b><small>${esc(p.norma)} · ${esc(p.codigo)}</small></span></button></li>`).join('')}</ul>
      <div class="po-detalle ent" style="--i:2"></div>
    </div>` +
    // logos de las certificadoras, en el espacio libre debajo de las pestañas
    ((C.certificadorasLogos || []).length ? `<div class="ce-entes ent" style="--i:4">
      <p>${esc(C.certificadorasTexto || 'Certificadas por')}</p>
      <div>${C.certificadorasLogos.map((l) => `<img src="../../${esc(l.imagen)}" alt="${esc(l.nombre)}" title="${esc(l.nombre)}" decoding="async">`).join('<i></i>')}</div>
    </div>` : '') +
    `<div class="s-cert">
      ${C.certificacionesTexto ? `<p class="ce-texto ent" style="--i:1">${formato(C.certificacionesTexto)}</p>` : ''}
      <div class="ce-sellos">${(C.certificaciones || []).map((c, i) => `<figure class="ce-sello ent" style="--i:${i + 2};${colorDe(politicaDe(c, i))}">${sello(c, i)}<figcaption><b>${esc(c.nombre)}</b><small>Política ${esc(c.politica)}</small></figcaption></figure>`).join('')}</div>
    </div>` +
    '<canvas class="anillos" aria-hidden="true"></canvas>';

  // al elegir una política aparecen su cita y sus directrices
  const det = poli.querySelector('.po-detalle'), botones = [...poli.querySelectorAll('.po-tabs button')];
  function mostrar(i) {
    const p = politicas[i];
    if (!p) return;
    botones.forEach((b, j) => b.classList.toggle('activo', j === i));
    if (p.color) det.style.setProperty('--c', p.color); else det.style.removeProperty('--c');
    det.classList.remove('lista');
    det.innerHTML = `<p class="po-norma">${esc(p.norma)} <span>${esc(p.codigo)}</span></p>
      <blockquote>${esc(p.cita)}</blockquote>
      <p class="po-etq">Directrices</p>
      <ul class="po-dir">${(p.directrices || []).map((d, k) => `<li style="--i:${k}">${formato(d)}</li>`).join('')}</ul>`;
    requestAnimationFrame(() => requestAnimationFrame(() => det.classList.add('lista')));
  }
  botones.forEach((b) => b.addEventListener('click', () => mostrar(+b.dataset.i)));
  mostrar(0);
  // Guía (compartido/guia.js): la mano señala la segunda política, hasta que se elige una
  if (window.GUIA && botones[1]) GUIA.pista({ id: 'quienes-politicas', texto: 'politicas', objetivo: botones[1], zona: '.po-tabs button', lado: 'abajo', espera: 1.6 });

  // =========================================================
  // TRANSICIÓN DE ANILLOS (la que antes abría "¿Por qué elegirnos?")
  // Gris afuera + hueco + anillo rojo + hueco + anillo rojo, con el grosor de la
  // referencia (banda 66, hueco 20); se cierran hacia el sello del medio.
  // =========================================================
  const ALTO = poli.offsetHeight || 1000;           // alto de la sección (1000)
  const RECORRIDO = 900;                            // scroll que dura la transición
  const BANDA = 66, HUECO = 20;
  const ROJO = '#EF4529', GRIS = '#3A3A3A';
  const lienzo = poli.querySelector('.anillos'), ctx = lienzo.getContext('2d');
  const sellos = poli.querySelectorAll('.ce-sello .ce-svg');
  const centroSello = () => sellos[Math.floor(sellos.length / 2)] || null;
  let avance = -1;

  function dibujarAnillos() {
    const cajaL = lienzo.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = cajaL.width, h = cajaL.height;
    if (!w || !h) return;
    if (lienzo.width !== Math.round(w * dpr) || lienzo.height !== Math.round(h * dpr)) {
      lienzo.width = Math.round(w * dpr);
      lienzo.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    lienzo.style.visibility = avance > 0 ? 'visible' : 'hidden';
    if (avance <= 0) return;
    const k = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--escala')) || 1;   // px del escenario → px de pantalla
    const b = BANDA * k, g = HUECO * k;
    const ancho = 2 * b + 2 * g;                    // rojo, hueco, rojo, hueco (después, gris hasta el borde)
    // centro: el sello del medio (la sección está quieta mientras dura la transición)
    const s = centroSello();
    let cx = w / 2, cy = h / 2;
    if (s) { const r = s.getBoundingClientRect(); cx = r.left + r.width / 2 - cajaL.left; cy = r.top + r.height / 2 - cajaL.top; }
    const lejos = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + 4;   // hasta la esquina más lejana
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
    const rGris = R + ancho;
    ctx.fillStyle = GRIS;
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    if (rGris > 0) ctx.arc(cx, cy, rGris, 0, Math.PI * 2, true);
    ctx.fill('evenodd');
    aro(R + b + g, R + 2 * b + g, ROJO);            // anillo rojo de afuera
    aro(R, R + b, ROJO);                            // anillo rojo de adelante
  }

  // =========================================================
  // "NUESTROS LOGROS" (como era "¿Por qué elegirnos?" en la carta 3): la sección queda quieta
  // en pantalla desde que empiezan los anillos (invisible); justo al cerrar el círculo
  // aparecen con un fundido el video de fondo y el título, en el centro; al seguir bajando
  // (LOGROS_EXTRA de scroll) el título sube a su lugar y entran las tarjetas.
  // =========================================================
  const logros = document.querySelector('.seccion-logros');
  const logrosFondo = logros && logros.querySelector('.logros-fondo');
  const logrosTitulo = logros && logros.querySelector('.logros-titulo');
  const suave = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  let fijadoLogros = null, opFondo = '', opTitulo = '', conTarjetas = false;

  // Con el scroll: entrada, sección quieta durante la transición, anillos y Logros
  let fijado = -1;
  document.addEventListener('desplazamiento', (e) => {
    const y = e.detail.y, top = poli.offsetTop;
    const A = top + ALTO - 900;                     // el final de la sección llega al borde de abajo
    const fijar = Math.max(0, Math.min(RECORRIDO, y - A));
    if (fijar !== fijado) { fijado = fijar; poli.style.translate = `0 ${fijar.toFixed(1)}px`; }
    const arriba = top + fijar - y;                 // borde de arriba de la sección en pantalla
    poli.classList.toggle('visible', arriba < 800 && arriba + ALTO > 0);
    const nuevo = Math.max(0, Math.min(1, (y - A) / RECORRIDO));
    if (logros) {
      // quieta con su borde de arriba en el borde de la pantalla desde que empiezan los anillos
      const fl = y >= A ? y - logros.offsetTop : 0;
      if (fl !== fijadoLogros) { fijadoLogros = fl; logros.style.translate = `0 ${fl.toFixed(1)}px`; }
      const of = suave(.8, 1, nuevo).toFixed(3), ot = suave(.7, .95, nuevo).toFixed(3);
      if (of !== opFondo) { opFondo = of; logrosFondo.style.opacity = of; }
      if (ot !== opTitulo) { opTitulo = ot; logrosTitulo.style.opacity = ot; }
      logros.style.pointerEvents = nuevo >= 1 ? '' : 'none';   // invisible: no tapa los botones de Políticas
      // las tarjetas entran al seguir bajando después de cerrar el círculo; al volver, se van
      const fin = A + RECORRIDO;
      const tarjetas = conTarjetas ? y > fin + 40 : y > fin + 100;
      if (tarjetas !== conTarjetas) { conTarjetas = tarjetas; logros.classList.toggle('arriba', tarjetas); }
    }
    if (nuevo === avance) return;
    avance = nuevo;
    dibujarAnillos();
  });
  addEventListener('resize', dibujarAnillos);
})();
