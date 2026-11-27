/* =========================================================
   RESUMEN DE SERVICIO A MEDIDA — "Todo esto, PENSADO PARA FORD".
   Era el cierre de la diapositiva; gustó tanto que la persona lo pasó al principio, como una
   capa encima de la portada: al bajar, la portada queda quieta, el fondo se oscurece y se
   desenfoca un poco y aparecen el título y LA RUTA (las tres franjas de la marca cruzan la
   pantalla y cada parte de la diapositiva es una parada: círculo con su ícono, número, título y
   frase; un camioncito la recorre). Al tocar una parada se va a esa parte. Si se sigue bajando,
   "¿Cómo lo hacemos?" sube por encima (como antes sobre la portada).
   Los botones "Volver al inicio" y "Siguiente" quedaron al final de la diapositiva (.sv-fin).
   Textos en datos/servicio.js → cierre.
   ========================================================= */
(function () {
  const SV = window.SV, capa = document.querySelector('.sv-cierre'), portada = document.querySelector('.sv-portada');
  if (!SV || !capa || !portada) return;
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

  // ---------- Cuándo se ve (px de scroll desde arriba de todo) ----------
  // De DESDE a HASTA el fondo se oscurece y se desenfoca; pasado MOSTRAR entra el contenido
  // (y se va al volver a subir, así se repite). La portada mide 1036 + EXTRA (portada.css):
  // con el resumen entero hay unos 360 px de scroll antes de que suba "¿Cómo lo hacemos?".
  // (el contenido entra cuando el título de la portada ya casi se fue: si no, se encimaban)
  const DESDE = 60, HASTA = 360, MOSTRAR = 320, OCULTAR = 250;
  // en el índice de la derecha, "Resumen" lleva a este punto (con todo a la vista)
  const Y_RESUMEN = +capa.dataset.indiceY || 480;

  capa.innerHTML =
    '<i class="ci-velo" aria-hidden="true"></i>' +
    `<h2 class="ci-cab"><span>${txt(C.antetitulo)}</span><b>${txt(C.titulo)}</b></h2>` +
    `<p class="ci-bajada">${txt(C.bajada)}</p>` +
    // la ruta: tres franjas, las paradas y el camioncito
    '<div class="ci-ruta"><i class="ci-franjas"></i><span class="ci-camion">' + CAMION + '</span>' +
    partes.map((p, i) =>
      `<button type="button" class="ci-parada" data-s="${esc(p.seccion)}" style="--i:${i};left:${(100 * (i + .5) / partes.length).toFixed(3)}%">` +
      `<span class="ci-circulo"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONO[p.seccion]}</svg></span>` +
      `<span class="ci-txt"><b><em>${String(i + 1).padStart(2, '0')}</em>${txt(p.titulo)}</b><small>${txt(p.texto)}</small>` +
      `<u>${txt(C.verDeNuevo || 'Ver esta parte')} →</u></span></button>`).join('') + '</div>';

  // cada parada lleva a su parte de la diapositiva
  capa.querySelectorAll('.ci-parada').forEach((b) => b.addEventListener('click', () => {
    const el = document.querySelector(DESTINO[b.dataset.s]);
    if (el && window.desplazamiento) window.desplazamiento.ir(el.offsetTop);
  }));

  let visible = false;
  function alDesplazar(y) {
    const p = Math.max(0, Math.min(1, (y - DESDE) / (HASTA - DESDE)));
    capa.style.setProperty('--p', p.toFixed(3));
    capa.classList.toggle('activa', p > 0);
    if (!visible && y > MOSTRAR) visible = true;
    else if (visible && y < OCULTAR) visible = false;
    capa.classList.toggle('visible', visible);
  }
  document.addEventListener('desplazamiento', (e) => alDesplazar(e.detail.y));
  alDesplazar(window.desplazamiento ? window.desplazamiento.y : 0);
  window.SV.yResumen = Y_RESUMEN;

  // ---------- Al final de la diapositiva: Volver al inicio y Siguiente ----------
  const fin = document.querySelector('.sv-fin');
  if (fin) {
    fin.innerHTML = '<div class="ci-fin fin-botones">' +
      `<a class="boton-fin-volver oscuro" href="../../index.html" data-transicion><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>${txt(C.volver || 'Volver al inicio')}</a>` +
      (window.SIGUIENTE ? SIGUIENTE.html() : '') + '</div>';
  }
})();
