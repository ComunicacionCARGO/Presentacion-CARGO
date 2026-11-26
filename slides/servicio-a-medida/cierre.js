/* =========================================================
   CIERRE DE SERVICIO A MEDIDA (pedido de la persona: la diapositiva terminaba de golpe en
   Centros logísticos, y el primer resumen de tarjetas no la convenció: "más gráfico y estético,
   como el resto de los cierres"). Las franjas de la marca arriba y, de fondo, el paisaje de la
   portada (cielo, árboles y alambrado, atenuados; se mueven apenas con el mouse). Título
   centrado y LA RUTA: las tres franjas cruzan la pantalla y cada parte de la diapositiva es una
   parada (círculo de vidrio con su ícono, número, título y frase); un camioncito la recorre.
   Al tocar una parada se vuelve a esa parte. Abajo, Volver al inicio y Siguiente.
   Textos en datos/servicio.js → cierre.
   ========================================================= */
(function () {
  const SV = window.SV, sec = document.querySelector('.sv-cierre');
  if (!SV || !sec) return;
  const { S, txt, esc } = SV;
  const C = S.cierre || {};
  const DESTINO = { como: '.sv-tms', devoluciones: '.sv-inv', tableros: '.sv-bi', mapa: '.seccion-distribucion', centros: '.sv-ubi' };
  const ICONO = {
    como: '<path d="M12 2 21 6.5v11L12 22l-9-4.5v-11z" opacity=".35"/><path d="M12 2 21 6.5 12 11 3 6.5zM3 8.2l8 4v8.6l-8-4zM13 12.2l8-4v8.6l-8 4z"/>',
    devoluciones: '<path d="M9.5 3.5 3 10l6.5 6.5V12H15a3.5 3.5 0 0 1 0 7h-3v3h3a6.5 6.5 0 0 0 0-13H9.5z"/>',
    tableros: '<path d="M2.5 20h19v2h-19zM4.5 11h3.6v7.2H4.5zM10.2 5h3.6v13.2h-3.6zM15.9 13h3.6v5.2h-3.6z"/>',
    mapa: '<path fill-rule="evenodd" d="M12 1.5a7 7 0 0 0-7 7c0 5.2 7 14 7 14s7-8.8 7-14a7 7 0 0 0-7-7zm0 4.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z"/>',
    centros: '<path fill-rule="evenodd" d="M12 2 1.5 8v14h21V8L12 2zM6 12h12v10H6z"/><path d="M6 14h12v2H6zM6 18h12v2H6z"/>'
  };
  const CAMION = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 5h13v11H1zM15 8.5h4.6L23 12.8V16h-8z"/><circle cx="5.5" cy="18" r="2.6"/><circle cx="18.5" cy="18" r="2.6"/></svg>';
  const partes = (C.partes || []).filter((p) => DESTINO[p.seccion]);
  const IMG = '../../img/portada-servicio/';

  sec.innerHTML =
    // fondo: franjas arriba y el paisaje de la portada, atenuado
    '<div class="ci-fondo" aria-hidden="true"><div class="ci-escena">' +
    `<img class="ci-cielo" src="${IMG}cielo.webp" alt="" decoding="async" loading="lazy">` +
    `<img class="ci-arboles" src="${IMG}fondo.webp" alt="" decoding="async" loading="lazy">` +
    `<img class="ci-alambrado" src="${IMG}medio.webp" alt="" decoding="async" loading="lazy">` +
    '</div><i class="ci-velo"></i></div>' +
    `<h2 class="ci-cab"><span>${txt(C.antetitulo)}</span><b>${txt(C.titulo)}</b></h2>` +
    `<p class="ci-bajada">${txt(C.bajada)}</p>` +
    // la ruta: tres franjas, las paradas y el camioncito
    '<div class="ci-ruta"><i class="ci-franjas"></i><span class="ci-camion">' + CAMION + '</span>' +
    partes.map((p, i) =>
      `<button type="button" class="ci-parada" data-s="${esc(p.seccion)}" style="--i:${i};left:${(100 * (i + .5) / partes.length).toFixed(3)}%">` +
      `<span class="ci-circulo"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONO[p.seccion]}</svg></span>` +
      `<span class="ci-txt"><b><em>${String(i + 1).padStart(2, '0')}</em>${txt(p.titulo)}</b><small>${txt(p.texto)}</small>` +
      `<u>${txt(C.verDeNuevo || 'Ver de nuevo')} →</u></span></button>`).join('') + '</div>' +
    '<div class="ci-fin fin-botones">' +
    `<a class="boton-fin-volver" href="../../index.html" data-transicion><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>${txt(C.volver || 'Volver al inicio')}</a>` +
    (window.SIGUIENTE ? SIGUIENTE.html() : '') + '</div>';

  // cada parada vuelve a su parte de la diapositiva
  sec.querySelectorAll('.ci-parada').forEach((b) => b.addEventListener('click', () => {
    const el = document.querySelector(DESTINO[b.dataset.s]);
    if (el && window.desplazamiento) window.desplazamiento.ir(el.offsetTop);
  }));

  // entra al llegar (y se va al volver a subir, así se repite)
  const escena = sec.querySelector('.ci-escena');
  let visible = false;
  document.addEventListener('desplazamiento', (e) => {
    visible = e.detail.y > sec.offsetTop - 420;
    sec.classList.toggle('visible', visible);
  });
  // el paisaje se mueve apenas con el mouse (solo vertical y poquito, como en la portada)
  let objetivo = 0, actual = 0, andando = false;
  addEventListener('pointermove', (e) => {
    if (!visible || e.pointerType === 'touch') return;
    objetivo = (e.clientY / innerHeight - .5) * 2;
    if (!andando) { andando = true; requestAnimationFrame(paso); }
  });
  function paso() {
    actual += (objetivo - actual) * .08;
    escena.style.setProperty('--m', actual.toFixed(3));
    if (Math.abs(objetivo - actual) > .002 && visible) requestAnimationFrame(paso); else andando = false;
  }
})();
