/* =========================================================
   DESPLAZAMIENTO SUAVE — para diapositivas largas que se recorren con scroll.
   Mueve el contenido de .pista hacia arriba (rueda, flechas, Av Pág,
   espacio, Inicio/Fin o arrastrando en pantallas táctiles).

   Opciones en el HTML, dentro de .pista:
     data-paralaje="-0.12"    se mueve más rápido (negativo) o más lento (positivo) que el resto
     data-paralaje-x="-0.1"   además se desplaza de costado
     data-ancla="900"         posición del scroll en la que está en su lugar exacto
                              (si no se indica: el inicio de su sección)
     class="aparece"          aparece suavemente al entrar en pantalla
     class="indicador-scroll" se desvanece apenas se empieza a bajar
   ========================================================= */
(function () {
  const pista = document.querySelector('.pista');
  if (!pista) return;
  const ALTO = 900;

  let objetivo = 0, actual = 0, max = 0, limite = Infinity;
  const limitar = (y) => Math.max(0, Math.min(max, limite, y));

  function medir() {
    max = Math.max(0, pista.offsetHeight - ALTO);
    objetivo = limitar(objetivo);
  }
  medir();
  addEventListener('load', medir);
  addEventListener('resize', medir);

  // Rueda del mouse / touchpad
  addEventListener('wheel', (e) => {
    e.preventDefault();
    objetivo = limitar(objetivo + e.deltaY * (e.deltaMode === 1 ? 33 : 1));
  }, { passive: false });

  // Teclado
  addEventListener('keydown', (e) => {
    const pasos = { ArrowDown: 140, ArrowUp: -140, PageDown: 700, PageUp: -700, ' ': 700 };
    if (e.key in pasos) objetivo = limitar(objetivo + (e.shiftKey && e.key === ' ' ? -700 : pasos[e.key]));
    else if (e.key === 'Home') objetivo = 0;
    else if (e.key === 'End') objetivo = max;
    else return;
    e.preventDefault();
  });

  // Arrastre en pantallas táctiles (con impulso al soltar, como el scroll de un celular).
  // Recién se mueve pasados 8 px (así un toque sigue siendo un toque) y, si hubo arrastre, el clic
  // que el navegador dispara al soltar no aprieta lo que quedó debajo del dedo.
  // No arrastra sobre un lienzo (la firma) ni sobre [data-sin-arrastre], ni con una tarjeta abierta.
  // Con un tema abierto (body.capitulo-abierto) un deslizamiento pasa de sección (evento capitulo-paso).
  let toque = null;
  const escalaActual = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--escala')) || 1;
  addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch' || !e.isPrimary) return;
    if (e.target.closest && e.target.closest('canvas, [data-sin-arrastre], .tarjeta-capa.abierta')) return;
    toque = { x: e.clientX, y: e.clientY, desde: objetivo, movido: false, v: 0, ty: e.clientY, tt: performance.now() };
  });
  addEventListener('pointermove', (e) => {
    if (!toque || e.pointerType !== 'touch') return;
    const dy = e.clientY - toque.y, dx = e.clientX - toque.x;
    if (!toque.movido && Math.hypot(dx, dy) < 8) return;
    toque.movido = true;
    if (document.body.classList.contains('capitulo-abierto')) return;   // se resuelve al soltar
    const k = escalaActual(), ahora = performance.now(), dt = Math.max(1, ahora - toque.tt);
    toque.v = toque.v * .6 + (-(e.clientY - toque.ty) / k / dt) * .4;     // px del escenario por ms
    toque.ty = e.clientY; toque.tt = ahora;
    objetivo = limitar(toque.desde - dy / k);
  });
  function soltar(e) {
    if (!toque || e.pointerType !== 'touch') return;
    const t = toque; toque = null;
    if (!t.movido) return;
    // el clic que viene después de arrastrar no cuenta
    const anular = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
    addEventListener('click', anular, { capture: true, once: true });
    setTimeout(() => removeEventListener('click', anular, { capture: true }), 400);
    if (document.body.classList.contains('capitulo-abierto')) {
      const dx = e.clientX - t.x, dy = e.clientY - t.y, d = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      if (Math.abs(d) > 40) document.dispatchEvent(new CustomEvent('capitulo-paso', { detail: d < 0 ? 1 : -1 }));
      return;
    }
    // impulso según la velocidad del dedo (como mucho, una pantalla)
    if (performance.now() - t.tt < 90) objetivo = limitar(objetivo + Math.max(-ALTO, Math.min(ALTO, t.v * 320)));
  }
  addEventListener('pointerup', soltar);
  addEventListener('pointercancel', soltar);

  // Elementos con paralaje
  const conParalaje = [...pista.querySelectorAll('[data-paralaje], [data-paralaje-x]')].map((el) => {
    const seccion = el.closest('section');
    return {
      el,
      py: parseFloat(el.dataset.paralaje) || 0,
      px: parseFloat(el.dataset.paralajeX) || 0,
      ancla: el.dataset.ancla !== undefined ? parseFloat(el.dataset.ancla) : (seccion ? seccion.offsetTop : 0)
    };
  });

  // Elementos que aparecen al entrar en pantalla
  const apareceObs = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => { if (en.isIntersecting) en.target.classList.add('visible'); });
  }, { threshold: .25 });
  pista.querySelectorAll('.aparece').forEach((el) => apareceObs.observe(el));

  const indicadores = pista.querySelectorAll('.indicador-scroll');

  // Para ir a una posición desde otro script: desplazamiento.ir(1800)
  // (con inmediato = true salta sin animación)
  window.desplazamiento = {
    ir(y, inmediato) { objetivo = limitar(y); if (inmediato) actual = objetivo; },
    get y() { return actual; },
    get destino() { return objetivo; },   // adonde va (y es donde está ahora)
    get max() { return Math.min(max, limite); },   // hasta dónde se puede bajar
    // tope del recorrido si la diapositiva usa menos que el alto de la pista (¿Por qué elegirnos?)
    set limite(v) { limite = v; objetivo = limitar(objetivo); }
  };

  let ultimo = performance.now();
  let dibujado = null;   // última posición aplicada (si no cambió, no se reescribe nada)
  function cuadro(t) {
    const dt = Math.min(.05, (t - ultimo) / 1000);
    ultimo = t;
    actual += (objetivo - actual) * Math.min(1, dt * 7);
    if (Math.abs(objetivo - actual) < .1) actual = objetivo;
    if (actual === dibujado) { requestAnimationFrame(cuadro); return; }
    dibujado = actual;

    pista.style.transform = `translate3d(0, ${-actual}px, 0)`;
    conParalaje.forEach((p) => {
      const d = actual - p.ancla;
      p.el.style.transform = `translate3d(${d * p.px}px, ${d * p.py}px, 0)`;
    });
    indicadores.forEach((el) => el.classList.toggle('oculto', actual > 40));

    document.dispatchEvent(new CustomEvent('desplazamiento', { detail: { y: actual, max } }));
    requestAnimationFrame(cuadro);
  }
  requestAnimationFrame(cuadro);
})();
