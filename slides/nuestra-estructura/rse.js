/* =========================================================
   RSE — "Hacia un impacto CERO" (datos/rse.js)
   Tablero debajo de "Políticas y Certificaciones": cada palanca que se activa
   (clic o teclas 1–8) muestra su acción en la tarjeta y baja la aguja del
   medidor de huella de carbono. El medidor arranca al máximo (todas las luces
   prendidas) y, al bajar, las va apagando; con todas activadas llega a CERO y
   solo queda prendido el "CERO".
   La aguja es un resorte (pasa un poquito y vuelve, como un instrumento real)
   y tiembla apenas mientras no llega a cero.
   ========================================================= */
(function () {
  const R = window.RSE;
  const raiz = document.querySelector('.mc-rse');
  if (!R || !raiz) return;
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const formato = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  const P = R.palancas || [];
  const N = P.length;

  // ---------- Íconos (sólidos, 24 × 24) ----------
  const ICONOS = {
    ruta: '<path d="M18 1.5a4.5 4.5 0 0 0-4.5 4.5c0 3.4 4.5 8 4.5 8s4.5-4.6 4.5-8A4.5 4.5 0 0 0 18 1.5zm0 6.2a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4z"/><circle cx="5" cy="19" r="3.2"/><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-dasharray=".1 3.8" d="M8.6 18.2c4-1 1.6-5.6 5.4-7 1.4-.5 2.6-.3 3.6.6"/>',
    camion: '<path d="M1 4.5h13.5v11.5H1z"/><path d="M15.8 7.6h4l3.2 4.4V16h-7.2z"/><circle cx="5.6" cy="18" r="2.4"/><circle cx="18.4" cy="18" r="2.4"/>',
    grafico: '<path d="M11 2.6A9.6 9.6 0 1 0 21.4 13H11z"/><path d="M13 .6V11h10.4A10.4 10.4 0 0 0 13 .6z"/>',
    foco: '<path d="M12 1.2a7.6 7.6 0 0 0-4.4 13.8c.7.5 1.2 1.4 1.2 2.3v.9h6.4v-.9c0-.9.5-1.8 1.2-2.3A7.6 7.6 0 0 0 12 1.2z"/><path d="M8.8 19.6h6.4v1.8H8.8zM10 22.6h4v1.4h-4z"/>',
    escudo: '<path fill-rule="evenodd" d="M12 1 3 4.5v6.3c0 5.6 3.8 10.6 9 12.2 5.2-1.6 9-6.6 9-12.2V4.5zm-1.4 15.2-4.2-4.2 1.6-1.6 2.6 2.6 5.6-5.6 1.6 1.6z"/>',
    arboles: '<path d="M8 1 2.6 9.4h2.8L1.4 16.2h5.4V21h2.6v-4.8h5.4l-4-6.8h2.8z"/><path d="M17.6 6.6l-3.4 5.4h1.9l-2.4 4.2h2.7V22h2.4v-5.8h2.7l-2.4-4.2H21z"/>',
    reciclar: '<path d="M12 3a9 9 0 0 1 8.5 6h-2.3A7 7 0 0 0 5.6 8.4L8 10.8H1.5V4.3l2.6 2.6A9 9 0 0 1 12 3z"/><path d="M12 21a9 9 0 0 1-8.5-6h2.3a7 7 0 0 0 12.6.6L16 13.2h6.5v6.5l-2.6-2.6A9 9 0 0 1 12 21z"/>',
    digital: '<path fill-rule="evenodd" d="M5 1h14a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2zm0 2v16h14V3zm5.2 13.2-3.4-3.4 1.5-1.5 1.9 1.9 5-5 1.5 1.5z"/>'
  };
  const icono = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[n] || ICONOS.ruta}</svg>`;

  // ---------- Medidor (SVG en px: centro 358, 290; radio de la banda 250) ----------
  const CX = 358, CY = 290, RADIO = 250, SEGMENTOS = 48;
  const px = (r, a) => (CX + r * Math.cos(a)).toFixed(1), py = (r, a) => (CY + r * Math.sin(a)).toFixed(1);
  const pt = (r, a) => `${px(r, a)} ${py(r, a)}`;
  const angulo = (t) => Math.PI + t * Math.PI;             // t 0 = CERO (izquierda), 1 = máximo, HOY (derecha)
  // color de la banda: verde (cero) → ámbar → rojo (máximo)
  const COLORES = [[76, 149, 108], [244, 161, 39], [239, 69, 41]];
  function colorEn(t) {
    const x = t * 2, i = Math.min(1, Math.floor(x)), f = x - i;
    const a = COLORES[i], b = COLORES[i + 1];
    return `rgb(${a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(',')})`;
  }
  let medidor = '';
  for (let i = 0; i < SEGMENTOS; i++) {
    const a0 = angulo(i / SEGMENTOS) + .012, a1 = angulo((i + 1) / SEGMENTOS) - .012;
    medidor += `<path class="rse-seg" stroke="${colorEn((i + .5) / SEGMENTOS)}" d="M${pt(RADIO, a0)} A${RADIO} ${RADIO} 0 0 1 ${pt(RADIO, a1)}"/>`;
  }
  for (let i = 0; i <= 40; i++) {
    const a = angulo(i / 40), mayor = i % 5 === 0, r0 = mayor ? 208 : 218;
    medidor += `<line class="rse-marca${mayor ? ' mayor' : ''}" x1="${px(r0, a)}" y1="${py(r0, a)}" x2="${px(232, a)}" y2="${py(232, a)}"/>`;
  }
  medidor +=
    `<text class="rse-m-titulo" x="${CX}" y="${CY - RADIO - 30}">${esc(R.medidorTitulo)}</text>` +   // arriba del arco: la aguja no lo tapa
    `<text class="rse-punta cero" x="${CX - RADIO}" y="${CY + 38}">${esc(R.medidorHasta)}</text>` +
    `<text class="rse-punta hoy" x="${CX + RADIO}" y="${CY + 38}">${esc(R.medidorDesde)}</text>` +
    `<g class="rse-aguja" transform="translate(${CX} ${CY}) rotate(180)"><path d="M0 -8 L196 -1.6 L206 0 L196 1.6 L0 8 L-30 4 L-30 -4z"/></g>` +
    `<circle class="rse-eje" cx="${CX}" cy="${CY}" r="17"/><circle class="rse-eje2" cx="${CX}" cy="${CY}" r="5"/>`;

  raiz.innerHTML =
    '<div class="rse-fondo"></div><div class="rse-orbes" aria-hidden="true"><i></i><i></i><i></i></div>' +
    `<h2 class="rse-titulo ent" style="--i:1"><span>${esc(R.titulo)}</span><b>${esc(R.tituloGrande)}</b></h2>` +
    `<p class="rse-texto ent" style="--i:2">${formato(R.texto)}</p>` +
    `<div class="rse-tablero">${P.map((p, i) => `<button type="button" class="rse-palanca ent" style="--i:${i + 3}" data-i="${i}" aria-pressed="false">
        <span class="rse-tecla">${String(i + 1).padStart(2, '0')}</span><i class="rse-led"></i>
        <span class="rse-riel"><span class="rse-llenado"></span><span class="rse-mango"></span></span>
        ${icono(p.icono)}<span class="rse-nombre">${esc(p.nombre)}</span></button>`).join('')}</div>` +
    `<div class="rse-medidor ent" style="--i:2"><svg viewBox="0 0 716 330" aria-hidden="true">${medidor}</svg>
       <div class="rse-lectura"><b></b><span></span></div></div>` +
    `<div class="rse-tarjeta ent" style="--i:4"><div class="rse-contenido"></div></div>`;

  const botones = [...raiz.querySelectorAll('.rse-palanca')];
  const segs = [...raiz.querySelectorAll('.rse-seg')];
  const aguja = raiz.querySelector('.rse-aguja');
  const lecturaN = raiz.querySelector('.rse-lectura b'), lecturaT = raiz.querySelector('.rse-lectura span');
  const contenido = raiz.querySelector('.rse-contenido');
  const activas = new Set();
  let fijada = 'inicio', mostrada = null;

  // ---------- Tarjeta ----------
  function htmlDe(clave) {
    if (clave === 'inicio') return `<p class="rse-num">0 / ${N}</p><h3>${esc(R.ayuda)}</h3><p class="rse-frase">${formato(R.ayudaTexto)}</p>`;
    if (clave === 'final') return `<p class="rse-num">${N} / ${N}</p><h3 class="rse-final">${esc(R.finalTarjetaTitulo || R.finalTitulo)}</h3><p class="rse-frase">${formato(R.finalTexto)}</p><div><button type="button" class="rse-reiniciar">Reiniciar</button></div>`;
    const p = P[clave];
    return `<p class="rse-num">${String(clave + 1).padStart(2, '0')} · ${activas.has(clave) ? 'Activada' : 'Sin activar'}</p><h3>${esc(p.nombre)}</h3>` +
      `<p class="rse-frase">${formato(p.texto)}</p><ul class="rse-puntos">${(p.puntos || []).map((t) => `<li>${formato(t)}</li>`).join('')}</ul>`;
  }
  function mostrar(clave, forzar) {
    const html = htmlDe(clave);
    if (!forzar && clave === mostrada && contenido.innerHTML === html) return;
    mostrada = clave;
    contenido.classList.remove('lista');
    contenido.innerHTML = html;
    requestAnimationFrame(() => requestAnimationFrame(() => contenido.classList.add('lista')));
  }
  contenido.addEventListener('click', (e) => { if (e.target.closest('.rse-reiniciar')) reiniciar(); });

  // ---------- Palancas ----------
  let finalPendiente = 0;
  function actualizarLectura() {
    const completo = activas.size === N && N > 0;
    raiz.classList.toggle('completo', completo);
    lecturaN.textContent = completo ? R.finalTitulo : `${activas.size} / ${N}`;
    lecturaT.textContent = completo ? '' : 'palancas activas';
  }
  function alternar(i) {
    if (activas.has(i)) activas.delete(i); else activas.add(i);
    botones[i].classList.toggle('activa', activas.has(i));
    botones[i].setAttribute('aria-pressed', activas.has(i));
    actualizarLectura();
    clearTimeout(finalPendiente);
    fijada = i;
    mostrar(i, true);
    // con la última palanca, la aguja llega a cero y después aparece el cierre
    if (activas.size === N) finalPendiente = setTimeout(() => { fijada = 'final'; mostrar('final'); }, 900);
    despertar();
  }
  function reiniciar() {
    clearTimeout(finalPendiente);
    activas.clear();
    botones.forEach((b) => { b.classList.remove('activa'); b.setAttribute('aria-pressed', 'false'); });
    actualizarLectura();
    fijada = 'inicio';
    mostrar('inicio');
    despertar();
  }
  botones.forEach((b, i) => {
    b.addEventListener('click', () => alternar(i));
    b.addEventListener('pointerenter', () => mostrar(i));
  });
  raiz.querySelector('.rse-tablero').addEventListener('pointerleave', () => mostrar(fijada));
  actualizarLectura();
  mostrar('inicio');

  // ---------- Aguja: resorte con un poco de rebote y un temblor leve ----------
  // Arranca en 0 y, la primera vez que se ve, sube al máximo encendiendo las luces (como un
  // instrumento al prenderse); cada palanca activada la baja y apaga las luces de arriba.
  let t = 0, vel = 0, encendidos = -1, previo = 0, enMarcha = false, visible = false;
  const RIGIDEZ = 60, AMORTIGUACION = 2 * Math.sqrt(RIGIDEZ) * .42;
  function cuadro(ahora) {
    const dt = Math.min(.05, (ahora - (previo || ahora)) / 1000);
    previo = ahora;
    const objetivo = N ? 1 - activas.size / N : 1;
    vel += (RIGIDEZ * (objetivo - t) - AMORTIGUACION * vel) * dt;
    t += vel * dt;
    const temblor = objetivo > 0 ? (Math.sin(ahora / 83) * .6 + Math.sin(ahora / 31) * .4) * .0022 : 0;
    const v = Math.max(-.03, Math.min(1.03, t + temblor));
    aguja.setAttribute('transform', `translate(${CX} ${CY}) rotate(${(180 + v * 180).toFixed(2)})`);
    const n = Math.max(0, Math.min(SEGMENTOS, Math.round(v * SEGMENTOS)));
    if (n !== encendidos) { segs.forEach((s, k) => s.classList.toggle('encendido', k < n)); encendidos = n; }
    if (visible) requestAnimationFrame(cuadro); else { enMarcha = false; previo = 0; }
  }
  function despertar() { if (!enMarcha && visible) { enMarcha = true; requestAnimationFrame(cuadro); } }

  // ---------- Scroll: entra al llegar; teclas 1–8 solo con el tablero en pantalla ----------
  // La sección empieza en su "top" dentro del tramo (que arranca en y 900): asoma por abajo
  // cuando la bajada (y − 900) pasa ese top y queda entera en pantalla con top + 900
  const TOP = raiz.offsetTop;
  let enPantalla = false, asentar = 0;
  document.addEventListener('desplazamiento', (e) => {
    const baj = Math.max(0, e.detail.y - 900);
    const ver = baj > TOP + 150 && baj < TOP + 1500;
    if (ver !== visible) {
      visible = ver;
      raiz.classList.toggle('visible', ver);
      clearTimeout(asentar);
      if (ver) { despertar(); asentar = setTimeout(() => raiz.classList.add('asentado'), 1400); }
      else raiz.classList.remove('asentado');
    }
    enPantalla = baj > TOP + 500 && baj < TOP + 1250;
  });
  addEventListener('keydown', (e) => {
    if (!enPantalla || document.body.classList.contains('capitulo-abierto')) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= N) { e.preventDefault(); alternar(n - 1); }
  });
})();
