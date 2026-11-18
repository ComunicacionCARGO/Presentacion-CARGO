/* =========================================================
   ADAPTABILIDAD — la pantalla que sigue a las tarjetas de "¿Qué hacemos diferente?"
   (datos/estructura.js → adaptabilidad). Profundiza Flexibilidad e Innovación:
   no hacemos lo que hacen todos, hacemos lo que Ford necesita, y para eso
   desarrollamos la tecnología a su medida.

   Cuatro pasos (a la izquierda) que cambian el dibujo de la derecha:
   1. Escuchamos: aparece la forma de "la necesidad de Ford", con sus etiquetas.
   2. Lo que hace el resto: una solución estándar (un cuadrado gris) prueba y no
      encaja; la pieza roja de CARGO toma la forma exacta.
   3. Diseñamos a medida: alrededor aparecen los sistemas "a medida" y
      el sello "Desarrollado para Ford".
   4. Evolucionamos juntos: la necesidad cambia de forma y la pieza la sigue.
   Los pasos pasan solos si nadie toca nada (con la sección en pantalla); al final
   aparece "Seguí bajando". Mientras la sección está en pantalla, el cartel común
   de scroll (compartido/guia.js) no aparece: la invitación la da esta pantalla.
   ========================================================= */
(function () {
  const A = (window.ESTRUCTURA || {}).adaptabilidad;
  const sec = document.querySelector('.mc-adap');
  if (!sec || !A) return;
  const $ = (s, r = sec) => r.querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // **negrita** y *rojo*
  const formato = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
  const PASOS = (A.pasos || []).slice(0, 4);
  while (PASOS.length < 4) PASOS.push({ titulo: '', texto: '' });
  const ETIQ = (PASOS[0].etiquetas || []).slice(0, 8);
  const SIST = (PASOS[2].sistemas || []).slice(0, 8);
  const DUR = [7.5, 8.5, 9, 8.5];          // segundos de cada paso cuando pasan solos
  const W = 900, H = 780, CX = 450, CY = 392;   // escena (px del escenario = unidades del SVG)
  const flecha = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 5.6 11.6 7l4 4H4v2h11.6l-4 4 1.4 1.4 6.4-6.4z"/></svg>';
  const abajo = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4h2v12l4.6-4.6L19 12.8 12 19.8l-7-7 1.4-1.4L11 16z"/></svg>';

  // ---------- Armado ----------
  sec.innerHTML =
    '<div class="ad-fondo" aria-hidden="true"></div>' +
    '<div class="ad-izq">' +
      `<p class="ad-ante ent">${formato(A.antetitulo)}</p>` +
      `<h2 class="ad-titulo ent">${formato(A.titulo)}</h2>` +
      `<p class="ad-bajada ent">${formato(A.bajada)}</p>` +
      '<ol class="ad-pasos">' +
        PASOS.map((p, k) =>
          `<li class="ent" style="--i:${k}"><button type="button" class="ad-paso" data-k="${k}">` +
            `<span class="ad-paso-cab"><b>${String(k + 1).padStart(2, '0')}</b><span>${formato(p.titulo)}</span><i class="ad-tilde" aria-hidden="true"></i></span>` +
            `<span class="ad-paso-cuerpo"><span><span class="ad-paso-txt">${formato(p.texto)}</span></span></span>` +
            '<i class="ad-paso-barra" aria-hidden="true"><i></i></i>' +
          '</button></li>').join('') +
      '</ol>' +
    '</div>' +
    '<div class="ad-escena">' +
      '<div class="ad-giro">' +
        `<svg class="ad-svg" viewBox="0 0 ${W} ${H}" aria-hidden="true">` +
          '<defs>' +
            '<linearGradient id="ad-rojo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6643D"/><stop offset=".55" stop-color="#EF4529"/><stop offset="1" stop-color="#B92F17"/></linearGradient>' +
            '<linearGradient id="ad-luz" x1="0" y1="0" x2=".7" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
            '<pattern id="ad-rayado" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><path d="M0 0V9" stroke="#FFFBF3" stroke-opacity=".1" stroke-width="1.4"/></pattern>' +
            '<radialGradient id="ad-halo"><stop offset="0" stop-color="#EF4529" stop-opacity=".42"/><stop offset="1" stop-color="#EF4529" stop-opacity="0"/></radialGradient>' +
            '<filter id="ad-desenfoque" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="16"/></filter>' +
            '<marker id="ad-punta" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 1 9 5 0 9z" fill="#FFFBF3" fill-opacity=".55"/></marker>' +
          '</defs>' +
          // guías de fondo: aros punteados y marcas de registro
          `<g class="ad-guias"><circle cx="${CX}" cy="${CY}" r="262"/><circle cx="${CX}" cy="${CY}" r="338"/>` +
            `<path d="M${CX - 14} ${CY}h28M${CX} ${CY - 14}v28"/></g>` +
          `<circle class="ad-halo" cx="${CX}" cy="${CY}" r="330" fill="url(#ad-halo)"/>` +
          '<g class="ad-lineas-etiq"></g><g class="ad-lineas-sist"></g>' +
          // la necesidad: relleno rayado, trazo que se dibuja y borde punteado
          '<path class="ad-nec-relleno" fill="url(#ad-rayado)"/>' +
          '<path class="ad-nec-trazo" pathLength="1"/>' +
          '<path class="ad-nec-borde"/>' +
          // la solución estándar (cuadrado gris que no encaja)
          '<g class="ad-estandar"><rect x="-172" y="-172" width="344" height="344" rx="6"/>' +
            `<text class="ad-est-t" y="-8">${esc(String(A.estandar || '').toUpperCase())}</text><text class="ad-est-n" y="22">${esc(A.estandarNota)}</text>` +
            '<g class="ad-cruz"><circle r="30"/><path d="M-11-11 11 11M11-11-11 11"/></g></g>' +
          // la pieza de CARGO
          '<path class="ad-pieza-sombra" filter="url(#ad-desenfoque)"/>' +
          '<path class="ad-pieza" fill="url(#ad-rojo)"/>' +
          '<path class="ad-pieza-luz" fill="url(#ad-luz)"/>' +
          '<path class="ad-pieza-pulso"/>' +
          // ciclo del paso 4: dos flechas que giran alrededor
          `<g class="ad-ciclo"><g class="ad-ciclo-giro">` +
            `<path d="M${CX - 300} ${CY - 40}A302 302 0 0 1 ${CX + 250} ${CY - 170}" marker-end="url(#ad-punta)"/>` +
            `<path d="M${CX + 300} ${CY + 40}A302 302 0 0 1 ${CX - 250} ${CY + 170}" marker-end="url(#ad-punta)"/>` +
          '</g></g>' +
        '</svg>' +
        // etiquetas de la necesidad (paso 1) y sistemas a medida (paso 3)
        ETIQ.map((t, k) => `<span class="ad-etiq" style="--i:${k}"><i></i>${formato(t)}</span>`).join('') +
        SIST.map((t, k) => `<span class="ad-sist" style="--i:${k}"><span>${formato(t)}</span><b>${esc(A.aMedida || 'a medida')}</b></span>`).join('') +
        // textos del centro
        `<div class="ad-centro ad-c-nec"><span>${formato(A.necesidad)}</span></div>` +
        `<div class="ad-centro ad-c-med"><b>${formato(A.medida)}</b><span>${formato(A.medidaNota)}</span></div>` +
        `<div class="ad-centro ad-c-sello"><span class="ad-sello">${formato(A.sello)}</span></div>` +
      '</div>' +
      '<p class="ad-rotulo"><b>01</b><span>/ 04</span><i></i><em></em></p>' +
      `<button type="button" class="ad-sig"><span class="ad-sig-txt"></span>${flecha}</button>` +
      `<button type="button" class="ad-seguir">${formato(A.botonSeguir || 'Seguí bajando')}${abajo}</button>` +
    '</div>';

  const botones = [...sec.querySelectorAll('.ad-paso')];
  const escena = $('.ad-escena'), giro = $('.ad-giro');
  const el = {
    nRelleno: $('.ad-nec-relleno'), nTrazo: $('.ad-nec-trazo'), nBorde: $('.ad-nec-borde'),
    est: $('.ad-estandar'), cruz: $('.ad-cruz'),
    sombra: $('.ad-pieza-sombra'), pieza: $('.ad-pieza'), luz: $('.ad-pieza-luz'), pulso: $('.ad-pieza-pulso'),
    halo: $('.ad-halo'), lEtiq: $('.ad-lineas-etiq'), lSist: $('.ad-lineas-sist')
  };
  const etiquetas = [...sec.querySelectorAll('.ad-etiq')], sistemas = [...sec.querySelectorAll('.ad-sist')];
  const bSig = $('.ad-sig'), bSeguir = $('.ad-seguir'), rotulo = $('.ad-rotulo');
  bSig.dataset.antes = A.pasoSiguiente || 'Paso siguiente:';

  // el título se achica si no entra en dos renglones
  function ajustarTitulo() {
    const t = $('.ad-titulo');
    t.style.fontSize = '';
    let tam = parseFloat(getComputedStyle(t).fontSize);
    const lh = () => parseFloat(getComputedStyle(t).lineHeight) || tam;
    while (t.scrollHeight > lh() * 2.2 && tam > 40) { tam -= 2; t.style.fontSize = tam + 'px'; }
  }
  if (document.fonts) document.fonts.ready.then(ajustarTitulo); else ajustarTitulo();

  // ---------- Formas ----------
  // Todo se describe por el radio en cada ángulo (los mismos N ángulos para todas las formas),
  // así se puede pasar de una a otra mezclando radios.
  const N = 120;
  const ANG = Array.from({ length: N }, (_, i) => i / N * Math.PI * 2 - Math.PI / 2);
  // la necesidad: una forma propia, con lóbulos (ph la hace cambiar en el paso 4)
  const radioNec = (a, ph) => 206 + 27 * Math.sin(3 * a + .6 + ph * .9) + 17 * Math.sin(5 * a + 1.7 - ph * 1.25) + 11 * Math.sin(2 * a + 2.4 + ph * .7);
  // el cuadrado de la solución estándar, en radios
  const radioCuad = (a) => 172 / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)));
  // contorno suave: curvas cuadráticas por los puntos medios (como los mapas)
  function trazo(radios) {
    const p = radios.map((r, i) => [CX + r * Math.cos(ANG[i]), CY + r * Math.sin(ANG[i])]);
    const m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let s = m(p[N - 1], p[0]);
    let d = `M${s[0].toFixed(1)} ${s[1].toFixed(1)}`;
    for (let i = 0; i < N; i++) {
      const q = m(p[i], p[(i + 1) % N]);
      d += `Q${p[i][0].toFixed(1)} ${p[i][1].toFixed(1)} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
    }
    return d + 'Z';
  }
  // ángulo (en grados) → punto del borde de la necesidad
  const bordeEn = (gr, ph, extra = 0) => {
    const a = gr * Math.PI / 180, r = radioNec(a, ph) + extra;
    return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
  };

  // ubicación de etiquetas y sistemas alrededor
  const ANG_ETIQ = [-150, -96, -38, 18, 82, 146, 200, 250].slice(0, ETIQ.length);
  // corridos medio lugar y 12° más: así ninguno queda arriba de todo (donde está el rótulo
  // del paso) ni abajo a la derecha (donde está "Paso siguiente")
  const ANG_SIST = SIST.map((_, k) => -78 + (k + .5) * 360 / SIST.length);
  const enElipse = (gr, rx, ry) => [CX + rx * Math.cos(gr * Math.PI / 180), CY + ry * Math.sin(gr * Math.PI / 180)];
  etiquetas.forEach((e, k) => { const [x, y] = enElipse(ANG_ETIQ[k], 340, 318); e.style.left = x + 'px'; e.style.top = y + 'px'; });
  sistemas.forEach((e, k) => { const [x, y] = enElipse(ANG_SIST[k], 356, 306); e.style.left = x + 'px'; e.style.top = y + 'px'; });
  el.lEtiq.innerHTML = ETIQ.map(() => '<line/>').join('');
  el.lSist.innerHTML = SIST.map(() => '<line/>').join('');
  const lineasEtiq = [...el.lEtiq.children], lineasSist = [...el.lSist.children];

  // ---------- Estado de cada paso ----------
  const ease = (x) => { x = Math.min(1, Math.max(0, x)); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const tramo = (t, a, b) => ease((t - a) / (b - a));
  // lo que se ve en el paso k, t segundos después de empezar
  function estado(k, t) {
    const s = { nec: 1, est: 0, estX: -330, estY: 0, sacudir: 0, cruz: 0, pieza: 0, forma: 0, halo: 0 };
    if (k === 0) { s.nec = tramo(t, .1, 1.5); }
    else if (k === 1) {
      s.estX = -330 + 330 * tramo(t, 0, .9);
      s.est = Math.min(1, t / .35) * (1 - tramo(t, 2.1, 2.5));
      s.estY = 60 * tramo(t, 2.1, 2.5);
      s.sacudir = t > 1.15 && t < 1.85 ? Math.sin((t - 1.15) * 38) * 9 * (1 - (t - 1.15) / .7) : 0;
      s.cruz = tramo(t, 1.3, 1.55) * (1 - tramo(t, 2.1, 2.4));
      s.pieza = tramo(t, 2.3, 2.6);
      s.forma = tramo(t, 2.55, 3.7);
      s.halo = s.pieza;
    } else { s.pieza = 1; s.forma = 1; s.halo = 1; }
    return s;
  }

  // ---------- Pasos ----------
  let paso = -1, inicio = 0, manual = false, ultimoUso = 0, visto = new Set(), terminado = false;
  let enVista = false, activo = false, empezo = false;
  const cur = estado(0, 0);              // valores en pantalla (siguen al estado con suavidad)
  cur.nec = 0;
  let phNec = 0, phPieza = 0, tCiclo = 0;
  function ir(k, porUsuario) {
    k = Math.max(0, Math.min(3, k));
    paso = k; inicio = performance.now();
    visto.add(k);
    if (porUsuario) { manual = true; ultimoUso = performance.now(); }
    sec.dataset.paso = k;
    botones.forEach((b, j) => {
      b.classList.toggle('activo', j === k);
      b.classList.toggle('visto', visto.has(j) && j !== k);
      b.classList.toggle('siguiente', j === k + 1 && !visto.has(j));
      b.setAttribute('aria-pressed', j === k ? 'true' : 'false');
    });
    rotulo.querySelector('b').textContent = String(k + 1).padStart(2, '0');
    rotulo.querySelector('em').innerHTML = formato(PASOS[k].titulo);
    const sig = PASOS[k + 1];
    $('.ad-sig-txt').innerHTML = sig ? formato(sig.titulo) : '';
    sec.classList.toggle('ultimo', k === 3);
    if (k === 3) visto.add(3);
    if (visto.size === 4 && k === 3) setTimeout(() => terminar(), 1800);
    animar();
  }
  function terminar() { if (!terminado) { terminado = true; sec.classList.add('terminado'); } }
  botones.forEach((b) => b.addEventListener('click', () => ir(+b.dataset.k, true)));
  bSig.addEventListener('click', () => ir(paso + 1, true));
  bSeguir.addEventListener('click', () => {
    const y = 900 + sec.offsetTop + 900;     // la sección siguiente (la pantalla partida) entera en pantalla
    if (window.desplazarA) window.desplazarA(y); else if (window.desplazamiento) window.desplazamiento.ir(y);
  });
  // ← → cambian de paso con la sección en pantalla
  addEventListener('keydown', (e) => {
    if (!activo || document.body.classList.contains('capitulo-abierto')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); ir(paso + 1, true); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); ir(paso - 1, true); }
  });
  // Guía (compartido/guia.js): la mano señala "paso siguiente" hasta que se usa
  if (window.GUIA) GUIA.pista({ id: 'elegirnos-adapta', texto: 'adaptaSiguiente', objetivo: () => bSig, punto: [.5, .5], zona: '.ad-sig, .ad-paso', lado: 'arriba', espera: 3.2, activa: () => activo && paso >= 0 && paso < 3 });

  // ---------- Dibujo ----------
  let bucle = null, ultimoT = 0;
  function animar() { if (!bucle && enVista && !document.hidden) { ultimoT = performance.now(); bucle = requestAnimationFrame(cuadro); } }
  function cuadro(ahora) {
    bucle = null;
    const dt = Math.min(.05, (ahora - ultimoT) / 1000);
    ultimoT = ahora;
    const t = (ahora - inicio) / 1000;
    const obj = estado(Math.max(0, paso), paso < 0 ? 0 : t);
    // suavizado (rápido) hacia el estado del paso: así volver atrás no salta
    const k = 1 - Math.exp(-dt * 14);
    let quieto = true;
    for (const c in obj) {
      const dif = obj[c] - cur[c];
      cur[c] = c === 'sacudir' ? obj[c] : cur[c] + dif * k;
      if (Math.abs(dif) > .002) quieto = false;
    }
    // paso 4: la necesidad cambia de forma (oscila sin irse lejos) y la pieza la sigue con demora
    if (paso === 3) tCiclo += dt;
    const phObj = paso === 3 ? Math.sin(tCiclo * .55) * 1.7 + Math.sin(tCiclo * .31 + 1) * 1.1 : 0;
    phNec += (phObj - phNec) * (1 - Math.exp(-dt * 3));
    phPieza += (phNec - phPieza) * (1 - Math.exp(-dt * 1.6));
    if (Math.abs(phObj - phNec) > .001 || Math.abs(phNec - phPieza) > .001 || paso === 3) quieto = false;

    const rNec = ANG.map((a) => radioNec(a, phNec));
    const dNec = trazo(rNec);
    el.nRelleno.setAttribute('d', dNec);
    el.nTrazo.setAttribute('d', dNec);
    el.nBorde.setAttribute('d', dNec);
    el.nTrazo.style.strokeDashoffset = (1 - cur.nec).toFixed(3);
    el.nBorde.style.opacity = Math.max(0, (cur.nec - .6) / .4).toFixed(3);
    el.nRelleno.style.opacity = (cur.nec * (1 - cur.pieza * .6)).toFixed(3);

    // la solución estándar entra desde la izquierda, se sacude y cae
    el.est.setAttribute('transform', `translate(${(CX + cur.estX + cur.sacudir).toFixed(1)} ${(CY + cur.estY).toFixed(1)})`);
    el.est.style.opacity = cur.est.toFixed(3);
    el.cruz.style.opacity = cur.cruz.toFixed(3);
    el.cruz.setAttribute('transform', `translate(150 -150) scale(${(.6 + .4 * cur.cruz).toFixed(3)})`);

    // la pieza: del cuadrado a la forma de la necesidad
    const f = cur.forma;
    const dPieza = trazo(ANG.map((a) => radioCuad(a) * (1 - f) + radioNec(a, phPieza) * f));
    [el.pieza, el.luz, el.pulso].forEach((p) => p.setAttribute('d', dPieza));
    el.sombra.setAttribute('d', dPieza);
    [el.pieza, el.luz].forEach((p) => { p.style.opacity = cur.pieza.toFixed(3); });
    el.sombra.style.opacity = (cur.pieza * .55).toFixed(3);
    el.halo.style.opacity = (cur.halo * .9).toFixed(3);
    sec.classList.toggle('encajo', paso === 1 && t > 3.7 || paso > 1);

    // líneas desde las etiquetas (paso 1) y los sistemas (paso 3) hasta el borde
    lineasEtiq.forEach((l, i) => {
      const [x1, y1] = enElipse(ANG_ETIQ[i], 300, 280), [x2, y2] = bordeEn(ANG_ETIQ[i], phNec, 6);
      l.setAttribute('x1', x1.toFixed(1)); l.setAttribute('y1', y1.toFixed(1)); l.setAttribute('x2', x2.toFixed(1)); l.setAttribute('y2', y2.toFixed(1));
    });
    lineasSist.forEach((l, i) => {
      const [x1, y1] = enElipse(ANG_SIST[i], 322, 276), [x2, y2] = bordeEn(ANG_SIST[i], phPieza, 4);
      l.setAttribute('x1', x1.toFixed(1)); l.setAttribute('y1', y1.toFixed(1)); l.setAttribute('x2', x2.toFixed(1)); l.setAttribute('y2', y2.toFixed(1));
    });

    if (!quieto && enVista && !document.hidden) bucle = requestAnimationFrame(cuadro);
  }

  // ---------- Reloj: los pasos pasan solos si nadie toca nada ----------
  setInterval(() => {
    if (!activo || document.hidden || paso < 0) return;
    const ahora = performance.now();
    const t = (ahora - inicio) / 1000;
    // barrita del paso actual (solo mientras pasa solo)
    botones.forEach((b, j) => {
      const barra = b.querySelector('.ad-paso-barra i');
      barra.style.width = (!manual && j === paso && paso < 3 ? Math.min(100, t / DUR[paso] * 100) : 0).toFixed(1) + '%';
    });
    if (!manual && paso < 3 && t > DUR[paso]) ir(paso + 1);
    // si la persona maneja los pasos y deja de tocar, igual aparece "Seguí bajando"
    if (manual && !terminado && ahora - ultimoUso > 12000) terminar();
  }, 100);

  // ---------- Con el scroll ----------
  // la sección empieza en y 900 + offsetTop de la diapositiva: entera en pantalla con bajada = 900 + top
  const TOP = 900 + sec.offsetTop;
  // las tarjetas de arriba (diapositiva.js) piden abrir un paso: se abre al llegar
  let pendiente = null;
  window.ADAPTABILIDAD = { abrir(k) { if (activo) ir(k, true); else pendiente = Math.max(0, Math.min(3, k)); } };
  document.addEventListener('desplazamiento', (e) => {
    const y = Math.max(0, e.detail.y);
    const rel = y - TOP;                 // 0 = entera en pantalla
    enVista = rel > -900 && rel < 900;
    activo = rel > -260 && rel < 300;
    sec.classList.toggle('visible', rel > -470);
    document.body.classList.toggle('sin-guia-scroll', rel > -400 && rel < 400);
    // al llegar: el paso pedido por una tarjeta (ADAPTABILIDAD.abrir) o, la primera vez, el 1
    if (activo && pendiente != null) { const k = pendiente; pendiente = null; empezo = true; ir(k, true); }
    else if (activo && !empezo) { empezo = true; ir(0); }
    if (enVista) animar();
  });
  document.addEventListener('visibilitychange', animar);

  // inclinación suave del dibujo hacia el cursor
  sec.addEventListener('pointermove', (e) => {
    const r = escena.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    giro.style.transform = `rotateY(${(x * 7).toFixed(2)}deg) rotateX(${(-y * 5).toFixed(2)}deg)`;
  });
  sec.addEventListener('pointerleave', () => { giro.style.transform = ''; });
})();
