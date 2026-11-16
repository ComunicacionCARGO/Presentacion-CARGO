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

  // ---------- Intro: tarjeta que pasa sola por los párrafos ----------
  // Cada párrafo se queda según su largo (tiempo de lectura); las rayitas de arriba se
  // llenan y con un clic se va a ese paso. El último paso es la pregunta con el botón
  // que baja a "¿Cómo lo hacemos?". El tiempo solo corre con la portada a la vista.
  const I = P.intro || {};
  const caja = $('.pt-intro');
  const PARRAFOS = (I.parrafos || []).filter(Boolean);
  let introActiva = false;
  if (caja && (PARRAFOS.length || I.pregunta)) {
    const cliente = (window.SERVICIO || {}).cliente || '';
    const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const txt = (t) => esc(String(t || '').replace(/\{cliente\}/g, cliente)).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    const pasos = PARRAFOS.length + 1;
    caja.innerHTML =
      `<div class="pt-i-cab"><p class="pt-i-rotulo"><i class="franjitas"></i>${txt(I.rotulo)}</p>` +
      `<div class="pt-i-rayas">${Array.from({ length: pasos }, (_, k) => `<button type="button" data-k="${k}" aria-label="Paso ${k + 1}"><i></i></button>`).join('')}</div></div>` +
      '<div class="pt-i-pasos">' +
      PARRAFOS.map((p, k) => `<p class="pt-i-paso" data-k="${k}">${txt(p)}</p>`).join('') +
      `<div class="pt-i-paso pt-i-final" data-k="${PARRAFOS.length}"><h2>${txt(I.pregunta)}</h2>` +
      `<div class="pt-i-pie"><p>${txt(I.invitacion)}</p>` +
      `<button type="button" class="pt-i-boton">${txt(I.boton)}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4h2v12l4.6-4.6L19 12.8 12 19.8l-7-7 1.4-1.4L11 16z"/></svg></button></div></div>` +
      '</div>';
    const elPasos = [...caja.querySelectorAll('.pt-i-paso')];
    const rayas = [...caja.querySelectorAll('.pt-i-rayas button')];
    // segundos de cada paso: según el largo del texto (unas 22 letras por segundo, entre 6 y 11 s)
    const dur = PARRAFOS.map((p) => Math.max(6, Math.min(11, String(p).length / 22)));
    let paso = -1, transcurrido = 0, ultimo = 0;
    function ir(k) {
      paso = k; transcurrido = 0;
      elPasos.forEach((el, j) => el.classList.toggle('activo', j === k));
      rayas.forEach((b, j) => {
        b.classList.toggle('hecha', j < k);
        b.classList.toggle('actual', j === k);
        b.firstChild.style.width = j < k ? '100%' : '0%';
      });
    }
    rayas.forEach((b, j) => b.addEventListener('click', () => ir(j)));
    caja.querySelector('.pt-i-boton').addEventListener('click', () => {
      const sig = document.querySelector('.sv-tms');
      if (window.desplazamiento && sig) window.desplazamiento.ir(sig.offsetTop);
    });
    // reloj: avanza solo con la portada a la vista y la pestaña visible
    function reloj(t) {
      requestAnimationFrame(reloj);
      const dt = ultimo ? Math.min(.1, (t - ultimo) / 1000) : 0;
      ultimo = t;
      if (!introActiva || paso < 0 || paso >= PARRAFOS.length || y > 300 || document.hidden) return;
      transcurrido += dt;
      const p = Math.min(1, transcurrido / dur[paso]);
      rayas[paso].firstChild.style.width = (p * 100).toFixed(1) + '%';
      if (p >= 1) ir(paso + 1);
    }
    requestAnimationFrame(reloj);
    // la tarjeta se va con el título al bajar
    sale.push(caja);
  }

  const mostrar = () => {
    sec.classList.add('visible');
    // la intro aparece después del título
    if (caja && caja.children.length && !introActiva) setTimeout(() => { introActiva = true; caja.classList.add('lista'); if (caja.querySelector('.pt-i-paso.activo') === null) caja.querySelector('.pt-i-rayas button').click(); }, 1300);
  };
  if (document.body.classList.contains('lista')) mostrar();
  else document.addEventListener('pagina-lista', mostrar);
})();
