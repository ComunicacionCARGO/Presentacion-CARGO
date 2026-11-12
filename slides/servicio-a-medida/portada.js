/* =========================================================
   PORTADA DE SERVICIO A MEDIDA — el camión en la ruta en tres capas
   (cielo, campo y camión) con parallax: se mueven distinto con el mouse
   y con el scroll. La sección queda quieta mientras la entrada sube por
   encima con las franjas de la marca.
   Textos e imágenes en datos/servicio.js → portada.
   ========================================================= */
(function () {
  const P = (window.SERVICIO || {}).portada || {};
  const sec = document.querySelector('.sv-portada');
  if (!sec) return;
  const $ = (s) => sec.querySelector(s);
  const RAIZ = '../../';

  // imágenes de las capas
  [['.pt-cielo', P.cielo], ['.pt-campo', P.campo], ['.pt-camion', P.camion]].forEach(([s, src]) => {
    const img = $(s + ' img');
    if (src) img.src = RAIZ + src; else $(s).remove();
  });
  if (P.cielo) sec.style.setProperty('--cielo', `url("${RAIZ + P.cielo}")`);
  $('.pt-titulo span').textContent = P.antetitulo || '';
  $('.pt-titulo b').textContent = P.titulo || '';

  // Cuánto se mueve cada capa: con el mouse (px a cada lado) y con el scroll (fracción del scroll)
  const CAPAS = [
    { el: $('.pt-cielo'), mx: 5, my: 3, sy: .03 },
    { el: $('.pt-campo'), mx: 13, my: 6, sy: .1 },
    { el: $('.pt-camion'), mx: 22, my: 8, sy: .2 },
    { el: $('.pt-titulo'), mx: 16, my: 8, sy: .45 }
  ].filter((c) => c.el);
  const quieto = $('.pt-quieto'), sale = [$('.pt-titulo'), $('.pt-logo')];

  let y = window.desplazamiento ? window.desplazamiento.y : 0;
  let mx = 0, my = 0, tx = 0, ty = 0, corriendo = false;

  function pintar() {
    CAPAS.forEach((c) => {
      c.el.style.transform = `translate3d(${(-mx * c.mx).toFixed(2)}px, ${(-my * c.my - y * c.sy).toFixed(2)}px, 0)`;
    });
    const op = Math.max(0, Math.min(1, 1 - (y - 80) / 300)).toFixed(3);   // en 0 a los 380 px
    // arriba de todo no se toca la opacidad (la maneja la entrada con .visible)
    sale.forEach((el) => { el.style.opacity = y > 80 ? op : ''; });
  }
  function cuadro() {
    mx += (tx - mx) * .07;
    my += (ty - my) * .07;
    pintar();
    if (Math.abs(tx - mx) > .001 || Math.abs(ty - my) > .001) requestAnimationFrame(cuadro);
    else corriendo = false;
  }
  function animar() { if (!corriendo && y < sec.offsetHeight) { corriendo = true; requestAnimationFrame(cuadro); } }

  addEventListener('pointermove', (e) => {
    tx = Math.max(-1, Math.min(1, (e.clientX / innerWidth - .5) * 2));
    ty = Math.max(-1, Math.min(1, (e.clientY / innerHeight - .5) * 2));
    animar();
  }, { passive: true });

  // Scroll: la portada queda quieta (se corre lo mismo que sube la pista) hasta que la tapa la entrada
  function alDesplazar(nuevo) {
    y = nuevo;
    const tope = sec.offsetHeight;   // la entrada la tapa entera cuando y llega al alto de la sección
    quieto.style.transform = `translate3d(0, ${Math.min(Math.max(y, 0), tope).toFixed(2)}px, 0)`;
    sec.classList.toggle('lejos', y >= tope);
    document.body.classList.toggle('en-portada', y < 380);   // el sello vuelve cuando ya no se ve el logo
    if (y < tope) pintar();
  }
  document.addEventListener('desplazamiento', (e) => alDesplazar(e.detail.y));
  alDesplazar(y);

  const mostrar = () => sec.classList.add('visible');
  if (document.body.classList.contains('lista')) mostrar();
  else document.addEventListener('pagina-lista', mostrar);
})();
