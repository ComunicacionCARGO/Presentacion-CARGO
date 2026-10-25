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

  let objetivo = 0, actual = 0, max = 0;
  const limitar = (y) => Math.max(0, Math.min(max, y));

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

  // Arrastre en pantallas táctiles
  let toque = null;
  addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') toque = { y: e.clientY, desde: objetivo };
  });
  addEventListener('pointermove', (e) => {
    if (!toque) return;
    const escala = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--escala')) || 1;
    objetivo = limitar(toque.desde - (e.clientY - toque.y) / escala);
  });
  addEventListener('pointerup', () => { toque = null; });
  addEventListener('pointercancel', () => { toque = null; });

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
    get y() { return actual; }
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
