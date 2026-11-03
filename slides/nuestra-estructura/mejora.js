/* =========================================================
   MEJORA CONTINUA — después de "¿Por qué elegirnos?" (datos/mejora-continua.js)
   1. Pantalla partida (diseño de la persona): una banda de franjas rojas que
      viene de la izquierda arriba, dobla en curva, baja en diagonal y vuelve a
      doblar hacia la derecha abajo. Del lado crema, CALIDAD; del lado gris
      (que sigue al gris de "¿Por qué elegirnos?"), CAPACITACIONES. Al pasar el
      cursor la diagonal se corre y agranda ese lado; al hacer clic barre la
      pantalla y se abre el tema.
   2. Cada tema ("capítulo") tiene secciones que se recorren con la rueda,
      las flechas o las pestañas. Esc vuelve a la pantalla partida.
   ========================================================= */
(function () {
  const M = window.MEJORA;
  if (!M) return;
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
  const ruta = (r) => '../../' + r;

  // ---------- Íconos (sólidos, 24 × 24) ----------
  const ICONOS = {
    sello: '<path fill-rule="evenodd" d="M12 .8l2.7 2.1 3.4-.4 1.2 3.2 3 1.7-.9 3.3 1.3 3.2-2.8 2-.8 3.3-3.4.1L12 21.6l-2.7-2.1-3.4.1-.8-3.3-2.8-2 1.3-3.2-.9-3.3 3-1.7 1.2-3.2 3.4.4zM10.7 15.3l6-6-1.6-1.6-4.4 4.4-2.2-2.2-1.6 1.6z"/>',
    birrete: '<path d="M12 3 .8 8.6 12 14.2l8.6-4.3V16h2.2V8.6z"/><path d="M5 12.2v4.6c1.8 1.9 4.3 3 7 3s5.2-1.1 7-3v-4.6l-7 3.5z"/>',
    personas: '<circle cx="12" cy="5.6" r="3.2"/><path d="M6.8 21v-6.2c0-2.9 2.3-5 5.2-5s5.2 2.1 5.2 5V21z"/><circle cx="4.6" cy="8.2" r="2.4"/><path d="M.6 19v-4c0-2.1 1.7-3.6 3.9-3.6 1 0 1.8.3 2.5.8-.7.9-1.1 2.1-1.1 3.4V19z"/><circle cx="19.4" cy="8.2" r="2.4"/><path d="M23.4 19v-4c0-2.1-1.7-3.6-3.9-3.6-1 0-1.8.3-2.5.8.7.9 1.1 2.1 1.1 3.4V19z"/>',
    cono: '<path d="M10.1 1.5h3.8l1.1 4.3H9z"/><path d="M8.5 7.8h7l1.1 4.4H7.4z"/><path d="M6.9 14.2h10.2l1.3 5H5.6z"/><path d="M1.5 20.2h21v2.3h-21z"/>',
    hoja: '<path d="M21.6 2.4C11 2.2 4.2 6.8 3.6 14.2c-.1 1.6.2 3.1.8 4.4L2 21l1.4 1.4 2.4-2.4c1.3.7 2.8 1 4.4.9C17.6 20.3 22 13.5 21.6 2.4zM7.2 18.7c1.9-4.6 5.4-8.4 10.4-10.9-3.8 3.2-6.6 7.1-8.4 11.8z"/>',
    carretilla: '<path d="M1.5 2h4.2l3.6 13.4-2 .5L4.1 4.2H1.5z"/><circle cx="9.4" cy="18.6" r="3.1"/><path d="M9.4 6.9 18.2 4.6l2.3 8.6-8.8 2.3z"/><path d="M13.6 16.6l8.4-2.2.5 2-8.4 2.2z"/>',
    caja: '<path d="M12 2 21 6.6 12 11.2 3 6.6z"/><path d="M2.6 8.2 11.2 12.6V22l-8.6-4.6z"/><path d="M21.4 8.2 12.8 12.6V22l8.6-4.6z"/>',
    camion: '<path d="M1 4.5h13.5v11.5H1z"/><path d="M15.8 7.6h4l3.2 4.4V16h-7.2z"/><circle cx="5.6" cy="18" r="2.4"/><circle cx="18.4" cy="18" r="2.4"/>',
    casco: '<path d="M12 1.8c-3.6 0-6.5 2.8-6.8 6.4H4.4v2.3h15.2V8.2h-.8C18.5 4.6 15.6 1.8 12 1.8z"/><path d="M7.4 11.8h9.2a4.6 4.6 0 0 1-9.2 0z"/><path d="M3.2 22.5c0-4.2 3.6-6.8 8.8-6.8s8.8 2.6 8.8 6.8z"/>',
    monedas: '<ellipse cx="9" cy="5.5" rx="7" ry="3"/><path d="M2 7.6v2.6c0 1.7 3.1 3 7 3s7-1.3 7-3V7.6c-1.4 1.3-4 2.1-7 2.1S3.4 8.9 2 7.6z"/><path d="M2 12.4V15c0 1.7 3.1 3 7 3 .7 0 1.4 0 2-.1a6 6 0 0 1 1.2-4.1c-1 .1-2.1.2-3.2.2-3 0-5.6-.8-7-2.1z"/><circle cx="17.5" cy="16.8" r="5.2"/>',
    puzzle: '<path d="M3 3h6.2a2.6 2.6 0 1 1 5.2 0H20v5.6a2.6 2.6 0 1 0 0 5.2V20h-5.6a2.6 2.6 0 1 0-5.2 0H3v-6.2a2.6 2.6 0 1 1 0-5.2z"/>'
  };
  const icono = (n, clase) => `<svg class="${clase || ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONOS[n] || ICONOS.sello}</svg>`;
  const franjitas = '<i class="mc-franjitas" aria-hidden="true"><b></b><b></b><b></b></i>';

  const tramo = $('.mc-tramo'), elegir = $('.mc-elegir');
  const capitulo = $('.capitulo');

  // =========================================================
  // 1. PANTALLA PARTIDA
  // Geometría medida de la referencia de la persona (1921 px = 1600, ×0,8329):
  // la banda va arriba a la izquierda en y 35–125, dobla con una curva, baja en
  // diagonal (pendiente 0,4133, la misma de "¿Quiénes somos?") y vuelve a doblar
  // abajo a la derecha en y 810–900. "d" es la x de la diagonal en la mitad de la
  // altura (y 450). Todo se calcula en px del escenario.
  // =========================================================
  const OP = M.opciones || [];
  const G = {
    arriba: 80.2,        // eje de la banda en el tramo de arriba
    abajo: 854.8,        // eje de la banda en el tramo de abajo
    pend: 0.4133,        // corrimiento horizontal de la diagonal por cada px que baja
    r1: 98.1,            // radio (eje) de la curva de arriba a la derecha
    r2: 130.7,           // radio (eje) de la curva de abajo a la izquierda
    reposo: 781.6,       // x de la diagonal en y 450, sin cursor
    // capas, de afuera hacia adentro: [corrimiento hacia el lado gris, grosor, clase]
    capas: [[0, 90.4, 'mc-plata'], [17.5, 34.6, 'mc-rojo'], [-27.9, 34.6, 'mc-rojo']]
  };
  const L = -1200, R = 2800;                         // la banda llega a los bordes de cualquier ventana
  const NORMA = Math.hypot(1, G.pend);
  const NX = 1 / NORMA, NY = G.pend / NORMA;         // normal de la diagonal, hacia el lado gris
  const VX = -G.pend / NORMA, VY = 1 / NORMA;        // dirección de la diagonal, hacia abajo
  const TAN = Math.tan(Math.acos(VX) / 2);           // para el largo de las curvas (giro de 112°)
  const diagX = (d, y) => d - G.pend * (y - 450);
  // Camino de la banda corrido "o" px hacia el lado gris (mismos centros, otros radios)
  function camino(d, o) {
    const c1x = diagX(d, G.arriba) - G.r1 * TAN, c1y = G.arriba + G.r1;
    const c2x = diagX(d, G.abajo) + G.r2 * TAN, c2y = G.abajo - G.r2;
    const ra = G.r1 + o, rb = G.r2 - o, n = (v) => v.toFixed(1);
    return `M${L},${n(G.arriba - o)}H${n(c1x)}` +
      `A${n(ra)},${n(ra)} 0 0 1 ${n(c1x + ra * NX)},${n(c1y + ra * NY)}` +
      `L${n(c2x - rb * NX)},${n(c2y - rb * NY)}` +
      `A${n(rb)},${n(rb)} 0 0 0 ${n(c2x)},${n(G.abajo - o)}H${R}`;
  }
  // la zona gris sube 6 px por encima de la sección y se pisa con el gris de "¿Por qué elegirnos?":
  // así no queda una rendija de 1 px entre los dos grises
  const SOLAPE = 6;
  const zonaGris = (d) => camino(d, 0) + `V${-SOLAPE}H${L}Z`;

  elegir.innerHTML =
    `<svg class="mc-svg" viewBox="${L} ${-SOLAPE} ${R - L} ${1500 + SOLAPE}" preserveAspectRatio="none" aria-hidden="true">` +
      '<defs>' +
        '<clipPath id="mc-recorte-gris"><path/></clipPath>' +
        // líneas claras con brillo metálico (entre las rojas y del lado gris)
        '<linearGradient id="mc-brillo" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1600" y2="900">' +
          '<stop offset="0" stop-color="#B9B8B2"/><stop offset=".3" stop-color="#F3EEE4"/><stop offset=".5" stop-color="#C6C4BD"/>' +
          '<stop offset=".72" stop-color="#F6F1E7"/><stop offset="1" stop-color="#C2C0B9"/></linearGradient>' +
      '</defs>' +
      `<rect x="${L}" y="0" width="${R - L}" height="1500" fill="#FFFBF3"/>` +
      // fondos ya preparados (foto difuminada y mezclada como en la referencia): cubren x -200..1800
      `<image class="mc-foto-calidad" href="${ruta('img/slides/nuestra-estructura/fondo-calidad.jpg')}" x="-200" y="0" width="2000" height="1000" preserveAspectRatio="none"/>` +
      '<path class="mc-gris"/>' +
      `<image class="mc-foto-capacitaciones" href="${ruta('img/slides/nuestra-estructura/fondo-capacitaciones.jpg')}" x="-200" y="0" width="2000" height="1000" preserveAspectRatio="none" clip-path="url(#mc-recorte-gris)"/>` +
      G.capas.map(([o, g, c]) => `<path class="mc-banda ${c}" data-o="${o}" stroke-width="${g}"/>`).join('') +
    '</svg>' +
    OP.slice(0, 2).map((o, k) =>
      `<div class="mc-bloque mc-bloque-${k}">` +
        `<span class="mc-m-icono">${icono(o.icono)}</span>` +
        `<p class="mc-m-num">${franjitas}<span>${esc(o.numero)}</span></p>` +
        `<h3 class="mc-m-titulo">${esc(o.titulo)}</h3>` +
        `<p class="mc-m-bajada">${esc(o.bajada)}</p>` +
        `<span class="mc-m-boton">${esc(o.boton || 'Explorar')} <b>→</b></span>` +
      `</div>`).join('');
  const bloques = [...elegir.querySelectorAll('.mc-bloque')];
  const gris = $('.mc-gris', elegir), recorte = $('#mc-recorte-gris path', elegir);
  const bandas = [...elegir.querySelectorAll('.mc-banda')];
  // si un título no entra en su lado se achican los dos por igual (así quedan parejos)
  function ajustarTitulos() {
    const titulos = bloques.map((b) => $('.mc-m-titulo', b));
    titulos.forEach((t) => { t.style.fontSize = ''; });
    const max = 520, ancho = Math.max(...titulos.map((t) => t.scrollWidth));
    if (ancho > max) {
      const tam = (parseFloat(getComputedStyle(titulos[0]).fontSize) * max / ancho).toFixed(1) + 'px';
      titulos.forEach((t) => { t.style.fontSize = tam; });
    }
  }
  if (document.fonts) document.fonts.ready.then(ajustarTitulos); else ajustarTitulos();

  let d = G.reposo, dObjetivo = G.reposo, hover = -1, eligiendo = -1, bucle = null, ultimo = 0;
  function dibujarDivision() {
    const z = zonaGris(d);
    gris.setAttribute('d', z);
    recorte.setAttribute('d', z);
    bandas.forEach((b) => b.setAttribute('d', camino(d, +b.dataset.o)));
    // cada bloque queda centrado en su lado, a la altura del texto (sin contar la banda)
    bloques[0].style.transform = `translateX(${((diagX(d, 450) - 60) / 2 - 400).toFixed(1)}px)`;
    bloques[1].style.transform = `translateX(${((diagX(d, 450) + 60 + 1600) / 2 - 1200).toFixed(1)}px)`;
  }
  function animarDivision(t) {
    const dt = Math.min(.05, (t - ultimo) / 1000);
    ultimo = t;
    const rapidez = eligiendo >= 0 ? 5.5 : 8;
    d += (dObjetivo - d) * (1 - Math.exp(-dt * rapidez));
    if (Math.abs(dObjetivo - d) < .3) d = dObjetivo;
    dibujarDivision();
    bucle = d === dObjetivo ? null : requestAnimationFrame(animarDivision);
  }
  function moverDivision(nuevo) {
    dObjetivo = nuevo;
    if (!bucle) { ultimo = performance.now(); bucle = requestAnimationFrame(animarDivision); }
  }
  function resaltar(k) {
    if (eligiendo >= 0 || k === hover) return;
    hover = k;
    elegir.classList.toggle('con-foco', k >= 0);
    bloques.forEach((b, i) => b.classList.toggle('foco', i === k));
    moverDivision(k === 0 ? G.reposo + 220 : k === 1 ? G.reposo - 220 : G.reposo);
  }
  // de qué lado está el cursor: gris arriba de la banda y a la derecha de la diagonal
  function ladoEn(e) {
    const r = elegir.getBoundingClientRect(), k = r.width / 1600;
    const x = (e.clientX - r.left) / k, y = (e.clientY - r.top) / k;
    return (y < G.arriba || (y < G.abajo && x > diagX(d, y))) ? 1 : 0;
  }
  elegir.addEventListener('pointermove', (e) => resaltar(ladoEn(e)));
  elegir.addEventListener('pointerleave', () => resaltar(-1));
  elegir.addEventListener('click', (e) => elegirTema(ladoEn(e)));
  dibujarDivision();

  function elegirTema(k) {
    if (eligiendo >= 0 || !OP[k]) return;
    resaltar(k);
    eligiendo = k;
    elegir.classList.add('eligiendo');
    moverDivision(k === 0 ? 3200 : -1800);           // el lado elegido barre la pantalla
    setTimeout(() => abrirCapitulo(k), 420);
  }

  // =========================================================
  // Visibilidad con el scroll (la pantalla partida sube detrás de "¿Por qué elegirnos?")
  // =========================================================
  let bajada = 0;
  document.addEventListener('desplazamiento', (e) => {
    bajada = Math.max(0, e.detail.y - 900);
    elegir.classList.toggle('visible', bajada > 450);
    tramo.setAttribute('aria-hidden', bajada > 300 ? 'false' : 'true');
    if (bajada < 600 && hover >= 0 && eligiendo < 0) resaltar(-1);
  });
  // en la pantalla partida: ← → eligen un lado y Enter lo abre
  addEventListener('keydown', (e) => {
    if (capitulo.classList.contains('abierto') || bajada < 800) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); resaltar(0); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); resaltar(1); }
    else if (e.key === 'Enter' && hover >= 0) { e.preventDefault(); elegirTema(hover); }
  });

  // =========================================================
  // 2. CAPÍTULOS (temas): secciones que se recorren
  // =========================================================
  const C = M.calidad || {}, K = M.capacitaciones || {};

  // ----- Logo de S.C.O.P.E. (lupa con la C de la marca) -----
  const logoScope = () => {
    const ang = (g) => [200 + 160 * Math.cos(g * Math.PI / 180), 175 + 160 * Math.sin(g * Math.PI / 180)];
    const [ax, ay] = ang(150), [bx, by] = ang(30), [vx, vy] = ang(-32);
    return `<svg class="logo-scope" viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        <filter id="ls-crema"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 .984  0 0 0 0 .953  0 0 0 1 0"/></filter>
        <clipPath id="ls-c"><rect x="134" y="107" width="132" height="136"/></clipPath>
        <path id="ls-arco" d="M${ax.toFixed(1)} ${ay.toFixed(1)} A160 160 0 0 0 ${bx.toFixed(1)} ${by.toFixed(1)}"/>
      </defs>
      <line class="ls-mango" x1="112" y1="262" x2="46" y2="328"/>
      <circle class="ls-aro" cx="200" cy="175" r="118"/>
      <circle class="ls-rojo" cx="200" cy="175" r="118" pathLength="100"/>
      <image href="${ruta('img/marca/isologo.png')}" x="134" y="107" width="132" height="210" clip-path="url(#ls-c)" class="ls-c"/>
      <text class="ls-texto"><textPath href="#ls-arco" startOffset="50%" text-anchor="middle">s·c·o·p·e</textPath></text>
      <g class="ls-version" transform="translate(${vx.toFixed(1)} ${vy.toFixed(1)})"><circle r="36"/><text y="11">${esc((C.scope || {}).version || '1.0')}</text></g>
    </svg>`;
  };

  // ----- Sello de una certificación -----
  const sello = (c, i) => {
    const dientes = 48, p = [];
    for (let k = 0; k < dientes * 2; k++) {
      const r = k % 2 ? 136 : 146, a = (k / (dientes * 2)) * Math.PI * 2;
      p.push(`${(150 + r * Math.cos(a)).toFixed(1)},${(150 + r * Math.sin(a)).toFixed(1)}`);
    }
    const anillo = `${c.norma} ${c.numero} · ${c.nombre.toUpperCase()} · ${M.calidad.certificadoras || ''} · `;
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

  // ----- Secciones de cada tema (Calidad va en claro, como su lado crema; Capacitaciones en oscuro) -----
  const S = C.scope || {};
  const TEMAS = [
    {
      clase: 'tema-claro', numero: (OP[0] || {}).numero || '01', titulo: C.titulo || 'CALIDAD',
      secciones: [
        {
          pestana: 'S.C.O.P.E.',
          html: () => `<div class="s-scope">
            <div class="sc-izq">
              <p class="sc-ante ent">${esc(S.antetitulo)}</p>
              <h3 class="sc-titulo ent">${esc(S.titulo)}</h3>
              <p class="sc-texto ent">${formato(S.texto)}</p>
              <div class="sc-version ent"><b>“${esc(S.version)}”</b><p>${formato(S.versionTexto)}</p></div>
            </div>
            <div class="sc-der ent">
              <p class="sc-etq">¿Qué significa?</p>
              <ul class="sc-letras">${(S.significado || []).map((l, i) => `<li style="--i:${i}"><b>${esc(l.letra)}</b><span>${esc(l.resto)}</span></li>`).join('')}</ul>
              <p class="sc-sig">${formato(S.significadoTexto)}</p>
            </div>
          </div>`
        },
        {
          pestana: 'Objetivos',
          html: () => `<div class="s-obj">
            <h3 class="cap-h ent">${esc(C.objetivosTitulo)}</h3>
            <svg class="ob-diana" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="92"/><circle cx="100" cy="100" r="62"/><circle cx="100" cy="100" r="32"/><path d="M100 100 172 28M160 22l14 -2 -2 14"/></svg>
            <ol class="ob-lista">${(C.objetivos || []).map((o, i) => `<li class="ent" style="--i:${i}"><b>${String(i + 1).padStart(2, '0')}</b><p>${formato(o)}</p></li>`).join('')}</ol>
          </div>`
        },
        {
          pestana: 'Pilares',
          html: () => `<div class="s-pil">
            <h3 class="cap-h ent">${esc(C.pilaresTitulo)}</h3>
            <ul class="pi-lista">${(C.pilares || []).map((p, i) => `<li class="ent" style="--i:${i}" data-i="${i}"><span class="pi-ico">${icono(p.icono)}</span><span class="pi-nom">${esc(p.nombre)}</span></li>`).join('')}</ul>
            <div class="pi-logo ent">${logoScope()}</div>
            <p class="pi-nota ent">${formato(C.pilaresNota)}</p>
          </div>`,
          alMostrar: (el) => {
            // al pasar por un pilar, el arco rojo de la lupa gira hacia él
            const rojo = $('.ls-rojo', el), n = (C.pilares || []).length || 1;
            el.querySelectorAll('.pi-lista li').forEach((li) => li.addEventListener('pointerenter', () => {
              rojo.style.transform = `rotate(${(+li.dataset.i / n) * 360 - 90}deg)`;
            }));
          }
        },
        {
          pestana: 'Políticas',
          html: () => `<div class="s-pol">
            <h3 class="cap-h ent">${esc(C.politicasTitulo)}</h3>
            <ul class="po-tabs">${(C.politicas || []).map((p, i) => `<li class="ent" style="--i:${i}"><button type="button" data-i="${i}"><span class="po-ico">${icono(p.icono)}</span><span class="po-txt"><b>${esc(p.nombre)}</b><small>${esc(p.norma)} · ${esc(p.codigo)}</small></span></button></li>`).join('')}</ul>
            <div class="po-detalle ent"></div>
            <p class="po-cert ent">${esc(C.certificadoPor)}</p>
          </div>`,
          alMostrar: (el) => {
            const det = $('.po-detalle', el), botones = [...el.querySelectorAll('.po-tabs button')];
            const mostrar = (i) => {
              const p = (C.politicas || [])[i];
              if (!p) return;
              botones.forEach((b, j) => b.classList.toggle('activo', j === i));
              det.classList.remove('lista');
              det.innerHTML = `<p class="po-norma">${esc(p.norma)} <span>${esc(p.codigo)}</span></p>
                <blockquote>${esc(p.cita)}</blockquote>
                <p class="po-etq">Directrices</p>
                <ul class="po-dir">${(p.directrices || []).map((d, k) => `<li style="--i:${k}">${formato(d)}</li>`).join('')}</ul>`;
              requestAnimationFrame(() => requestAnimationFrame(() => det.classList.add('lista')));
            };
            botones.forEach((b) => b.addEventListener('click', () => mostrar(+b.dataset.i)));
            mostrar(0);
          }
        },
        {
          pestana: 'Certificaciones',
          html: () => `<div class="s-cert">
            <h3 class="cap-h ent">${esc(C.certificacionesTitulo)}</h3>
            <p class="ce-texto ent">${formato(C.certificacionesTexto)}</p>
            <div class="ce-sellos">${(C.certificaciones || []).map((c, i) => `<figure class="ce-sello ent" style="--i:${i + 2}">${sello(c, i)}<figcaption><b>${esc(c.nombre)}</b><small>Política ${esc(c.politica)}</small></figcaption></figure>`).join('')}</div>
          </div>`
        }
      ]
    },
    {
      clase: 'tema-oscuro', numero: (OP[1] || {}).numero || '02', titulo: K.titulo || 'CAPACITACIONES',
      secciones: [
        {
          pestana: (K.aprende || {}).pestana || '#Exp Aprende',
          html: () => {
            const A = K.aprende || {};
            return `<div class="s-apr">
              <div class="ap-izq">
                <h3 class="ap-titulo ent">${esc(A.titulo)}</h3>
                <p class="ap-texto ent">${formato(A.texto)}</p>
                <p class="ap-plat ent">${formato(A.plataforma)}</p>
              </div>
              <figure class="ap-nav ent">
                <div class="ap-vidrio">
                  <div class="ap-barra"><i></i><i></i><i></i><span>${esc(A.titulo)}</span></div>
                  ${A.imagen ? `<img src="${ruta(A.imagen)}" alt="Plataforma ${esc(A.titulo)}" draggable="false">` : ''}
                </div>
                <span class="ap-insignia">${icono('birrete')}</span>
              </figure>
            </div>`;
          },
          alMostrar: (el) => {
            // la ventana de la plataforma se inclina con el mouse
            const fig = $('.ap-nav', el), v = $('.ap-vidrio', el);
            fig.addEventListener('pointermove', (e) => {
              const r = fig.getBoundingClientRect();
              const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
              v.style.transform = `perspective(1400px) rotateY(${(x * 8).toFixed(2)}deg) rotateX(${(-y * 6).toFixed(2)}deg)`;
            });
            fig.addEventListener('pointerleave', () => { v.style.transform = ''; });
          }
        },
        {
          pestana: (K.equipo || {}).pestana || 'Trabajo en equipo',
          html: () => {
            const Q = K.equipo || {};
            return `<div class="s-eq">
              <h3 class="cap-h ent">${esc(Q.titulo)}</h3>
              <p class="eq-texto ent">${formato(Q.texto)}</p>
              <div class="eq-cols">
                <div class="eq-col ent" style="--i:0">
                  <h4>${icono('personas')}${esc(Q.induccionTitulo)}</h4>
                  ${(Q.induccion || []).map((it) => `<div class="eq-item"><b>${esc(it.titulo)}</b><p>${formato(it.texto)}</p></div>`).join('')}
                </div>
                <i class="eq-franjas" aria-hidden="true"><b></b><b></b><b></b></i>
                <div class="eq-col ent" style="--i:1">
                  <h4>${icono('puzzle')}${esc(Q.liderazgoTitulo)}</h4>
                  <p class="eq-lid">${formato(Q.liderazgo)}</p>
                  <span class="eq-puzzle" aria-hidden="true">${icono('puzzle')}${icono('puzzle')}${icono('puzzle')}</span>
                </div>
              </div>
            </div>`;
          }
        }
      ]
    }
  ];

  // ----- Estructura del capítulo -----
  capitulo.innerHTML =
    '<div class="cap-fondo"></div>' +
    '<button type="button" class="cap-cerrar">← Mejora continua <span>Esc</span></button>' +
    '<div class="cap-cabeza">' + franjitas + '<p class="cap-num"></p><h2 class="cap-titulo"></h2></div>' +
    '<nav class="cap-tabs" aria-label="Secciones"></nav>' +
    '<i class="cap-regla"></i>' +
    '<div class="cap-paginas"></div>' +
    '<div class="cap-pie"><p class="cap-ayuda">Rueda o ← → para recorrer · Esc para volver</p>' +
    '<p class="cap-cuenta"></p><button type="button" class="cap-flecha" data-dir="-1" aria-label="Anterior">‹</button><button type="button" class="cap-flecha" data-dir="1" aria-label="Siguiente">›</button></div>';
  const tabs = $('.cap-tabs', capitulo), paginas = $('.cap-paginas', capitulo), cuenta = $('.cap-cuenta', capitulo);
  let tema = null, actual = 0, secs = [];

  function abrirCapitulo(k) {
    tema = TEMAS[k];
    if (!tema) return;
    capitulo.className = 'capitulo ' + tema.clase;
    $('.cap-num', capitulo).textContent = tema.numero;
    $('.cap-titulo', capitulo).textContent = tema.titulo;
    tabs.innerHTML = tema.secciones.map((s, i) => `<button type="button" data-i="${i}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(s.pestana)}</button>`).join('') + '<i class="cap-marca"></i>';
    tabs.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => irSeccion(+b.dataset.i)));
    paginas.innerHTML = '';
    secs = tema.secciones.map((s) => {
      const el = crear('section', 'cap-sec', paginas, s.html());
      if (s.alMostrar) s.alMostrar(el);
      return el;
    });
    actual = -1;
    document.body.classList.add('capitulo-abierto');
    capitulo.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      capitulo.classList.add('abierto');
      irSeccion(0);
    });
  }
  function cerrarCapitulo() {
    if (!tema) return;
    capitulo.classList.remove('abierto');
    capitulo.classList.add('cerrando');
    setTimeout(() => {
      capitulo.classList.remove('cerrando');
      capitulo.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('capitulo-abierto');
      tema = null;
      // las franjas vuelven a su lugar
      elegir.classList.remove('eligiendo');
      eligiendo = -1;
      resaltar(-1);
    }, 380);
  }
  function irSeccion(i) {
    if (!tema) return;
    i = Math.max(0, Math.min(secs.length - 1, i));
    if (i === actual) return;
    const desde = actual;
    actual = i;
    secs.forEach((s, j) => {
      s.classList.toggle('actual', j === i);
      s.classList.toggle('antes', j < i);
      s.classList.toggle('despues', j > i);
      s.setAttribute('aria-hidden', j === i ? 'false' : 'true');
    });
    // las entradas escalonadas se vuelven a ver cada vez que se entra
    const s = secs[i];
    s.classList.remove('visible');
    requestAnimationFrame(() => requestAnimationFrame(() => s.classList.add('visible')));
    if (desde >= 0) setTimeout(() => { if (actual !== desde) secs[desde].classList.remove('visible'); }, 500);
    const botones = [...tabs.querySelectorAll('button')];
    botones.forEach((b, j) => b.classList.toggle('activo', j === i));
    const b = botones[i], marca = $('.cap-marca', tabs);
    if (b && marca) {
      marca.style.width = b.offsetWidth + 'px';
      marca.style.transform = `translateX(${b.offsetLeft}px)`;
    }
    cuenta.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b> / ${String(secs.length).padStart(2, '0')}`;
    capitulo.querySelectorAll('.cap-flecha').forEach((f) => { f.disabled = (f.dataset.dir === '-1' ? i === 0 : i === secs.length - 1); });
  }
  capitulo.querySelectorAll('.cap-flecha').forEach((f) => f.addEventListener('click', () => irSeccion(actual + +f.dataset.dir)));
  $('.cap-cerrar', capitulo).addEventListener('click', cerrarCapitulo);
  // rueda, ↑ ↓, Av Pág… (las manda diapositiva.js)
  document.addEventListener('capitulo-paso', (e) => irSeccion(actual + e.detail));
  // Esc cierra el tema antes de volver a la portada; ← → recorren
  addEventListener('keydown', (e) => {
    if (!tema) return;
    if (e.key === 'Escape') { e.stopImmediatePropagation(); e.preventDefault(); cerrarCapitulo(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); irSeccion(actual + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); irSeccion(actual - 1); }
  }, true);
  addEventListener('resize', () => { ajustarTitulos(); if (tema && actual >= 0) { const a = actual; actual = -1; irSeccion(a); } });
})();
