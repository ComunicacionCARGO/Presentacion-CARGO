/* =========================================================
   PORTADA DE SERVICIO A MEDIDA — el camión en la ruta en tres capas
   (cielo, campo y camión). El camión es una secuencia de cuadros (render de
   After Effects) que se reproduce en un lienzo; las capas se mueven distinto
   (solo en vertical) con el mouse y con el scroll. La sección queda quieta
   mientras la entrada sube por encima con las franjas de la marca.
   Textos e imágenes en datos/servicio.js → portada.
   ========================================================= */
(function () {
  const P = (window.SERVICIO || {}).portada || {};
  const sec = document.querySelector('.sv-portada');
  if (!sec) return;
  const $ = (s) => sec.querySelector(s);
  const RAIZ = '../../';

  // ---------- Cielo y campo (imágenes fijas) ----------
  [['.pt-cielo', P.cielo], ['.pt-campo', P.campo]].forEach(([s, src]) => {
    const img = $(s + ' img');
    if (src) img.src = RAIZ + src; else $(s).remove();
  });
  if (P.cielo) sec.style.setProperty('--cielo', `url("${RAIZ + P.cielo}")`);
  $('.pt-titulo span').textContent = P.antetitulo || '';
  $('.pt-titulo b').textContent = P.titulo || '';

  // ---------- Camión: secuencia de cuadros ----------
  // Cada cuadro del render (1920 × 1080) se guardó en dos partes, achicadas a 0,85:
  // el camión con la ruta de abajo (c000.webp…: x 0–740, y 28–1080) y el resto de la
  // ruta (r000.webp…: x 740–1920, y 960–1080). El resto del cuadro es transparente.
  const SEQ = P.camion || {};
  const ESC = .85, ANCHO = 1920 * ESC, ALTO = 1080 * ESC;
  const PARTE_C = [0, 28 * ESC, 740 * ESC, 1052 * ESC], PARTE_R = [740 * ESC, 960 * ESC, 1180 * ESC, 120 * ESC];
  const N = SEQ.cuadros || 0, FPS = SEQ.porSegundo || 24;
  const capaCamion = $('.pt-camion');
  let secuenciaLista = false, controlar = () => {};
  if (N && SEQ.carpeta) {
    const nombre = (t, k) => RAIZ + SEQ.carpeta + t + String(k).padStart(3, '0') + '.webp';
    const comp = document.createElement('div');
    comp.className = 'pt-comp';
    // el primer cuadro queda quieto (y la cortina espera a que cargue) hasta que llegan todos
    const r0 = new Image(), c0 = new Image();
    r0.className = 'pt-r'; c0.className = 'pt-c'; r0.alt = c0.alt = '';
    r0.src = nombre('r', 0); c0.src = nombre('c', 0);
    const lienzo = document.createElement('canvas');
    lienzo.className = 'pt-lienzo';
    lienzo.width = ANCHO; lienzo.height = ALTO;
    comp.append(r0, c0, lienzo);
    capaCamion.innerHTML = '';
    capaCamion.appendChild(comp);
    const ctx = lienzo.getContext('2d');
    const cam = [c0], ruta = [r0];

    // carga del resto, de a 4 cuadros a la vez, recién con la página abierta
    let cargados = 1, proximo = 1;
    function cargarUno() {
      if (proximo >= N) return;
      const k = proximo++;
      let falta = 2;
      const listo = () => { if (--falta) return; cargados++; if (cargados === N) { secuenciaLista = true; controlar(); } cargarUno(); };
      const a = new Image(), b = new Image();
      a.onload = a.onerror = listo; b.onload = b.onerror = listo;
      a.src = nombre('c', k); b.src = nombre('r', k);
      cam[k] = a; ruta[k] = b;
    }
    const empezarCarga = () => { for (let j = 0; j < 4; j++) cargarUno(); };
    if (document.body.classList.contains('lista')) empezarCarga();
    else document.addEventListener('pagina-lista', empezarCarga);

    // reproducción en loop, solo con la portada en pantalla
    let reproduciendo = false, t0 = null, ultimo = 0;
    function cuadroSeq(t) {
      if (!reproduciendo) return;
      if (t0 === null) t0 = t - ultimo * 1000 / FPS;   // sigue desde donde quedó
      const k = Math.floor((t - t0) * FPS / 1000) % N;
      if (k !== ultimo || !comp.classList.contains('en-marcha')) {
        ultimo = k;
        ctx.clearRect(0, 0, ANCHO, ALTO);
        if (ruta[k].naturalWidth) ctx.drawImage(ruta[k], ...PARTE_R);
        if (cam[k].naturalWidth) ctx.drawImage(cam[k], ...PARTE_C);
        comp.classList.add('en-marcha');
      }
      requestAnimationFrame(cuadroSeq);
    }
    controlar = () => {
      const debe = secuenciaLista && y < sec.offsetHeight && !document.hidden;
      if (debe && !reproduciendo) { reproduciendo = true; t0 = null; requestAnimationFrame(cuadroSeq); }
      else if (!debe) reproduciendo = false;
    };
    document.addEventListener('visibilitychange', () => controlar());
  }

  // ---------- Parallax (solo vertical) ----------
  // Cuánto se mueve cada capa: con el mouse (px arriba y abajo) y con el scroll (fracción del scroll)
  const CAPAS = [
    { el: $('.pt-cielo'), my: 3, sy: .03 },
    { el: $('.pt-titulo'), my: 6, sy: .45 },
    { el: $('.pt-campo'), my: 8, sy: .1 },
    { el: capaCamion, my: 12, sy: .2 }
  ].filter((c) => c.el);
  const quieto = $('.pt-quieto'), sale = [$('.pt-titulo'), $('.pt-logo')];

  let y = window.desplazamiento ? window.desplazamiento.y : 0;
  let my = 0, ty = 0, corriendo = false;

  function pintar() {
    CAPAS.forEach((c) => { c.el.style.transform = `translate3d(0, ${(-my * c.my - y * c.sy).toFixed(2)}px, 0)`; });
    const op = Math.max(0, Math.min(1, 1 - (y - 80) / 300)).toFixed(3);   // en 0 a los 380 px
    // arriba de todo no se toca la opacidad (la maneja la entrada con .visible)
    sale.forEach((el) => { el.style.opacity = y > 80 ? op : ''; });
  }
  function cuadro() {
    my += (ty - my) * .07;
    pintar();
    if (Math.abs(ty - my) > .001) requestAnimationFrame(cuadro);
    else corriendo = false;
  }
  function animar() { if (!corriendo && y < sec.offsetHeight) { corriendo = true; requestAnimationFrame(cuadro); } }

  addEventListener('pointermove', (e) => {
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
    controlar();
  }
  document.addEventListener('desplazamiento', (e) => alDesplazar(e.detail.y));
  alDesplazar(y);

  const mostrar = () => sec.classList.add('visible');
  if (document.body.classList.contains('lista')) mostrar();
  else document.addEventListener('pagina-lista', mostrar);
})();
