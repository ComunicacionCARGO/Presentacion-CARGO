/* =========================================================
   BOTÓN "SIGUIENTE" al final de cada diapositiva (pedido de la persona): va al lado del
   botón Volver y lleva a la diapositiva que sigue en el orden de las cartas de la portada
   (datos/cartas.js, que se carga antes que este archivo), con su número y su título.
   En la última diapositiva no aparece (no hay ninguna después).
   - Los lugares fijos se marcan en el HTML con <span data-siguiente></span>: se reemplazan solos.
   - Lo que se arma con JS usa window.SIGUIENTE.html().
   ========================================================= */
(function () {
  const cartas = window.CARTAS || [];
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // qué diapositiva es esta: la carta cuyo destino coincide con la carpeta de la página
  const ruta = decodeURIComponent(location.pathname).replace(/\\/g, '/');
  const carpeta = (d) => String(d || '').replace(/index\.html$/, '');
  const i = cartas.findIndex((c) => c.destino && ruta.indexOf(carpeta(c.destino)) >= 0);
  const sig = i >= 0 ? cartas[i + 1] : null;
  const FLECHA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function html(clase) {
    if (!sig) return '';
    return `<a class="boton-siguiente${clase ? ' ' + clase : ''}" href="../../${esc(sig.destino)}" data-transicion>` +
      `<span><small>Siguiente · ${String(i + 2).padStart(2, '0')}</small><b>${esc(sig.antetitulo)} <strong>${esc(sig.titulo)}</strong></b></span>${FLECHA}</a>`;
  }
  function llenar(raiz) {
    (raiz || document).querySelectorAll('[data-siguiente]').forEach((el) => {
      const h = html(el.getAttribute('data-siguiente'));
      if (h) el.outerHTML = h; else el.remove();
    });
  }
  window.SIGUIENTE = { carta: sig, html, llenar };
  llenar(document);
})();
