/* =========================================================
   MOTOR COMPARTIDO — lo usan todas las páginas.
   - Escala el escenario de 1600×900 a la pantalla.
   - Maneja la cortina de franjas al entrar y salir de cada página.
   - En las diapositivas, la tecla Esc vuelve a la portada.
   ========================================================= */
(function () {
  const ANCHO = 1600, ALTO = 900;

  function escalar() {
    const k = Math.min(innerWidth / ANCHO, innerHeight / ALTO);
    document.documentElement.style.setProperty('--escala', k);
  }
  escalar();
  addEventListener('resize', escalar);

  const cortina = document.querySelector('.cortina');
  let revelado = false;

  function revelar() {
    if (revelado) return;
    revelado = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      cortina.classList.add('saliendo');
      cortina.classList.remove('cubre');
      document.body.classList.add('lista');
      document.dispatchEvent(new Event('pagina-lista'));
    }));
  }

  // Antes de abrir la cortina se descargan y "descomprimen" todas las imágenes y fuentes.
  // Así las animaciones de entrada y la primera aparición de cada sección no dan tirones
  // (sobre todo en la versión publicada, donde todo llega por internet).
  function prepararImagenes() {
    const tareas = [];
    document.querySelectorAll('img').forEach((img) => {
      if (img.decode) tareas.push(img.decode().catch(() => {}));
    });
    document.querySelectorAll('.fondo').forEach((el) => {
      const m = getComputedStyle(el).backgroundImage.match(/url\(["']?(.+?)["']?\)/);
      if (!m) return;
      const img = new Image();
      img.src = m[1];
      tareas.push(img.decode().catch(() => {}));
    });
    if (document.fonts) tareas.push(document.fonts.ready);
    return Promise.all(tareas);
  }

  addEventListener('load', () => {
    Promise.race([prepararImagenes(), new Promise((r) => setTimeout(r, 4000))]).then(revelar);
  });
  setTimeout(revelar, 7000); // por si algo falla del todo, la página se muestra igual

  // Al volver con el botón "atrás" del navegador la página puede quedar tapada
  addEventListener('pageshow', (e) => {
    if (e.persisted) { revelado = false; revelar(); }
  });

  // Navegar a otra página con la cortina de franjas
  window.irA = function (url, retraso = 0) {
    setTimeout(() => {
      cortina.classList.remove('saliendo');
      cortina.classList.add('cubre');
      setTimeout(() => { location.href = url; }, 800);
    }, retraso);
  };

  // Cualquier enlace con data-transicion usa la cortina
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-transicion]');
    if (!a) return;
    e.preventDefault();
    irA(a.getAttribute('href'));
  });

  // Esc vuelve a la portada (solo en páginas que lo indiquen)
  const volver = document.body.dataset.volver;
  if (volver) {
    addEventListener('keydown', (e) => { if (e.key === 'Escape') irA(volver); });
  }
})();
