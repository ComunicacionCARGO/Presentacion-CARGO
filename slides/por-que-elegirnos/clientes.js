/* =========================================================
   NUESTROS CLIENTES (datos/clientes.js) — cierre de "¿Por qué elegirnos?".
   Grilla de logos en blanco sobre el rojo de la marca, con botones por rubro:
   al elegir uno, sus logos se destacan, el resto se apaga y el contador muestra
   cuántos son. Los logos entran de a uno al llegar con el scroll.
   ========================================================= */
(function () {
  const D = window.CLIENTES, raiz = document.querySelector('.mc-cli');
  if (!D || !raiz) return;
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const clientes = (D.clientes || []).filter((c) => c && c.imagen);
  const rubros = (D.rubros || []).filter((r) => clientes.some((c) => c.rubro === r));
  const cuantos = (r) => (r ? clientes.filter((c) => c.rubro === r).length : clientes.length);

  raiz.innerHTML =
    '<div class="cli-fondo"></div>' +
    `<h2 class="cli-titulo ent"><span>${esc(D.titulo)}</span><b>${esc(D.tituloGrande)}</b></h2>` +
    `<p class="cli-contador ent" style="--i:1"><b>${clientes.length}</b><span>${esc(D.contadorTexto)}</span></p>` +
    `<div class="cli-rubros ent" style="--i:2">` +
      `<button type="button" class="activo" data-r="">${esc(D.todos || 'Todos')} <i>${clientes.length}</i></button>` +
      rubros.map((r) => `<button type="button" data-r="${esc(r)}">${esc(r)} <i>${cuantos(r)}</i></button>`).join('') +
    '</div>' +
    `<ul class="cli-grilla">${clientes.map((c, k) => `<li class="cli-logo" style="--k:${k}" data-r="${esc(c.rubro)}"><img src="../../img/clientes/${esc(c.imagen)}" alt="${esc(c.nombre)}" decoding="async"><span>${esc(c.nombre)}</span></li>`).join('')}</ul>` +
    `<a class="cli-volver" href="../../index.html" data-transicion><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>${esc(D.volver || 'Volver al inicio')}</a>`;

  // ---------- Tamaño parejo: todos los logos con más o menos la misma superficie ----------
  // (si no, los anchos y bajos se ven enormes y los cuadrados chiquitos)
  const AREA = 7600, ANCHO_MAX = 196, ALTO_MAX = 58;
  raiz.querySelectorAll('.cli-logo img').forEach((img) => {
    const ajustar = () => {
      const r = img.naturalWidth / img.naturalHeight || 2;
      let h = Math.sqrt(AREA / r), w = h * r;
      if (w > ANCHO_MAX) { w = ANCHO_MAX; h = w / r; }
      if (h > ALTO_MAX) { h = ALTO_MAX; w = h * r; }
      img.style.setProperty('--w', w.toFixed(0) + 'px');
      img.style.setProperty('--h', h.toFixed(0) + 'px');
    };
    if (img.complete && img.naturalWidth) ajustar(); else img.addEventListener('load', ajustar, { once: true });
  });

  // ---------- Filtro por rubro ----------
  const grilla = raiz.querySelector('.cli-grilla'), logos = [...grilla.children];
  const numero = raiz.querySelector('.cli-contador b'), texto = raiz.querySelector('.cli-contador span');
  const botones = [...raiz.querySelectorAll('.cli-rubros button')];
  let animando = 0;
  function contar(hasta) {
    cancelAnimationFrame(animando);
    const desde = parseInt(numero.textContent, 10) || 0, t0 = performance.now();
    const paso = (ahora) => {
      const t = Math.min(1, (ahora - t0) / 500), e = 1 - Math.pow(1 - t, 3);
      numero.textContent = Math.round(desde + (hasta - desde) * e);
      if (t < 1) animando = requestAnimationFrame(paso);
    };
    animando = requestAnimationFrame(paso);
  }
  function elegir(rubro) {
    botones.forEach((b) => b.classList.toggle('activo', b.dataset.r === rubro));
    grilla.classList.toggle('filtrada', !!rubro);
    logos.forEach((l) => l.classList.toggle('elegido', !!rubro && l.dataset.r === rubro));
    contar(cuantos(rubro));
    texto.textContent = rubro ? `${D.contadorRubro || 'en'} ${rubro}` : D.contadorTexto;
  }
  botones.forEach((b) => b.addEventListener('click', () => elegir(b.dataset.r)));
  // Guía (compartido/guia.js): la mano señala el segundo rubro hasta que se elige uno
  if (window.GUIA && botones[1]) GUIA.pista({ id: 'elegirnos-rubros', texto: 'clientesRubros', objetivo: botones[1], zona: '.cli-rubros button', lado: 'abajo', espera: 2 });

  // ---------- Entrada con el scroll (la sección empieza en su "top" dentro del tramo) ----------
  const TOP = raiz.offsetTop;
  let visible = false, asentar = 0;
  document.addEventListener('desplazamiento', (e) => {
    // el botón Volver aparece al bajar un poco más (la sección ya entera en pantalla)
    raiz.classList.toggle('con-volver', e.detail.y > TOP + 940);
    const ver = e.detail.y > TOP + 150;
    if (ver === visible) return;
    visible = ver;
    raiz.classList.toggle('visible', ver);
    clearTimeout(asentar);
    if (ver) asentar = setTimeout(() => raiz.classList.add('asentado'), 2200);
    else raiz.classList.remove('asentado');
  });
})();
