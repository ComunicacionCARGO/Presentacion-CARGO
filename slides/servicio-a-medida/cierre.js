/* =========================================================
   CIERRE DE SERVICIO A MEDIDA (pedido de la persona: la diapositiva terminaba de golpe en
   Centros logísticos). Una pantalla gris con las franjas de la marca arriba: "Todo esto,
   PENSADO PARA FORD", una tarjeta por cada parte de la diapositiva (al tocarla se vuelve a
   esa parte) y abajo los botones Volver al inicio y Siguiente (compartido/siguiente.js).
   Textos en datos/servicio.js → cierre.
   ========================================================= */
(function () {
  const SV = window.SV, sec = document.querySelector('.sv-cierre');
  if (!SV || !sec) return;
  const { S, txt, esc } = SV;
  const C = S.cierre || {};
  const DESTINO = { como: '.sv-tms', devoluciones: '.sv-inv', tableros: '.sv-bi', mapa: '.seccion-distribucion', centros: '.sv-ubi' };
  const FLECHA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  const partes = (C.partes || []).filter((p) => DESTINO[p.seccion]);

  sec.innerHTML =
    '<div class="ci-fondo" aria-hidden="true"></div>' +
    `<h2 class="ci-cab"><span>${txt(C.antetitulo)}</span><b>${txt(C.titulo)}</b></h2>` +
    `<p class="ci-bajada">${txt(C.bajada)}</p>` +
    '<div class="ci-partes">' + partes.map((p, i) =>
      `<button type="button" class="ci-parte" data-s="${esc(p.seccion)}" style="--i:${i}">` +
      `<b class="ci-num">${String(i + 1).padStart(2, '0')}</b><h3>${txt(p.titulo)}</h3><p>${txt(p.texto)}</p>` +
      `<span class="ci-ver">${txt(C.verDeNuevo || 'Ver de nuevo')}${FLECHA}</span></button>`).join('') + '</div>' +
    '<div class="ci-fin fin-botones">' +
    `<a class="boton-fin-volver" href="../../index.html" data-transicion><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>${txt(C.volver || 'Volver al inicio')}</a>` +
    (window.SIGUIENTE ? SIGUIENTE.html() : '') + '</div>';

  // cada tarjeta vuelve a su parte de la diapositiva
  sec.querySelectorAll('.ci-parte').forEach((b) => b.addEventListener('click', () => {
    const el = document.querySelector(DESTINO[b.dataset.s]);
    if (el && window.desplazamiento) window.desplazamiento.ir(el.offsetTop);
  }));

  // entra al llegar (y se va al volver a subir, así se repite)
  document.addEventListener('desplazamiento', (e) => {
    sec.classList.toggle('visible', e.detail.y > sec.offsetTop - 420);
  });
})();
