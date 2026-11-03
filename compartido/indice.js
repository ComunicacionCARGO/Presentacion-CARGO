/* =========================================================
   ÍNDICE DE SECCIONES — para las diapositivas largas.
   Una columna discreta de rayitas a la derecha (en una pastilla crema como la
   de "Volver"): la de la sección en pantalla se pone roja y más larga; al pasar
   el cursor aparecen los nombres y un clic lleva a esa sección.
   Las secciones se marcan en el HTML con data-indice="Nombre". Dónde empieza
   cada una se calcula solo (dentro de .pista o de .mc-tramo); con
   data-indice-y="final" se va al final del recorrido.
   Detalle sin mención: Av Pág / Re Pág saltan de sección en sección.
   ========================================================= */
(function () {
  const escenario = document.querySelector('.escenario');
  const marcadas = [...document.querySelectorAll('[data-indice]')];
  if (!escenario || marcadas.length < 2) return;
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const pista = document.querySelector('.pista');
  const maximo = () => Math.max(0, (pista ? pista.offsetHeight : 900) - 900);
  // posición del scroll en la que la sección queda arriba de la pantalla
  function yDe(el) {
    const y = el.dataset.indiceY;
    if (y === 'final') return maximo();
    if (y != null && y !== '') return +y;
    if (el.closest('.mc-tramo')) return el.offsetTop + 900;   // ¿Por qué elegirnos?: el tramo empieza en y 900
    if (el.closest('.pista')) return el.offsetTop;
    return 0;
  }
  const actual = () => (window.desplazamiento ? window.desplazamiento.y : 0);
  function ir(y) {
    y = Math.max(0, Math.min(maximo(), y));
    if (typeof window.desplazarA === 'function') window.desplazarA(y);   // la diapositiva tiene su propio scroll
    else if (window.desplazamiento) window.desplazamiento.ir(y);
  }

  const nav = document.createElement('nav');
  nav.className = 'indice';
  nav.setAttribute('aria-label', 'Secciones');
  nav.innerHTML = marcadas.map((el, i) => `<button type="button" data-i="${i}"><span>${esc(el.dataset.indice)}</span><i></i></button>`).join('');
  escenario.appendChild(nav);
  const botones = [...nav.children];
  botones.forEach((b, i) => b.addEventListener('click', () => ir(yDe(marcadas[i]))));

  // la sección en pantalla: la última que ya empezó (con un margen de un tercio de pantalla)
  let activa = -1;
  function marcar(y) {
    let k = 0;
    marcadas.forEach((el, i) => { if (yDe(el) <= y + 300) k = i; });
    if (k === activa) return;
    activa = k;
    botones.forEach((b, i) => b.classList.toggle('activa', i === k));
  }
  document.addEventListener('desplazamiento', (e) => marcar(e.detail.y));
  marcar(0);

  // Av Pág / Re Pág: a la sección siguiente o anterior (no con un tema o una tarjeta abiertos)
  addEventListener('keydown', (e) => {
    if (e.key !== 'PageDown' && e.key !== 'PageUp') return;
    if (document.body.classList.contains('capitulo-abierto') || document.querySelector('.tarjeta-capa.abierta')) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    const y = actual(), ys = marcadas.map(yDe);
    const destino = e.key === 'PageDown' ? ys.find((v) => v > y + 5) : [...ys].reverse().find((v) => v < y - 5);
    ir(destino != null ? destino : (e.key === 'PageDown' ? maximo() : 0));
  }, true);
})();
