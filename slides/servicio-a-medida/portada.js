/* =========================================================
   PORTADA DE SERVICIO A MEDIDA — el camión en la ruta en capas: cielo quieto,
   campo con árboles y alambrado que pasan sin parar (el fondo más lento) y el
   camión, una secuencia de cuadros (render de After Effects) que se reproduce en
   un lienzo. Además las capas se mueven distinto
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

  // ---------- Cielo (quieto, espejado en portada.css) ----------
  if (P.cielo) {
    $('.pt-cielo img').src = RAIZ + P.cielo;
    sec.style.setProperty('--cielo', `url("${RAIZ + P.cielo}")`);
  } else $('.pt-cielo').remove();

  // ---------- Fondo (árboles) y medio (alambrado): tiras que pasan sin parar ----------
  // Las dos imágenes empalman en los costados: la tira repite la imagen las veces que
  // haga falta para cubrir la escena y se corre una imagen entera (en CSS, en loop).
  // Alto de cada imagen en fracción del alto de la escena (ubicadas sobre la foto vieja:
  // el horizonte queda en y ~615 y el pasto del alambrado termina debajo de la ruta).
  const TIRAS = [
    { s: '.pt-fondo', src: P.fondo, alto: .93, seg: parseFloat(P.segundosFondo) || 45 },
    { s: '.pt-medio', src: P.medio, alto: .809, seg: parseFloat(P.segundosMedio) || 9, borroso: parseFloat(P.desenfoqueMedio) || 0 }
  ].filter((t) => { if (!t.src) $(t.s).remove(); return !!t.src; });

  // Desenfoque de movimiento solo horizontal: la imagen se dibuja en un lienzo varias veces
  // corrida de a 1 px (pesos en triángulo, sumadas con 'lighter'), dando la vuelta por los
  // bordes para que siga empalmando. Se hace una vez; la tira usa copias del lienzo
  // (con file:// no se puede pasar el lienzo a imagen).
  function desenfocar(img, r) {
    const w = img.naturalWidth, h = img.naturalHeight;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    x.globalCompositeOperation = 'lighter';
    const total = (r + 1) * (r + 1);
    for (let d = -r; d <= r; d++) {
      x.globalAlpha = (r + 1 - Math.abs(d)) / total;
      x.drawImage(img, d, 0);
      if (d) x.drawImage(img, d - Math.sign(d) * w, 0);
    }
    return c;
  }
  function copiaDe(t) {
    if (!t.lienzo) return t.img.cloneNode();
    const c = document.createElement('canvas');
    c.width = t.lienzo.width; c.height = t.lienzo.height;
    c.getContext('2d').drawImage(t.lienzo, 0, 0);
    return c;
  }
  const escena = $('.pt-escena');
  // intensidad de la bruma sobre el fondo (portada.css → .pt-fondo::after)
  if (P.atmosfera != null && P.atmosfera !== '') sec.style.setProperty('--atmosfera', parseFloat(P.atmosfera) || 0);
  TIRAS.forEach((t) => {
    t.tira = $(t.s + ' .pt-tira');
    t.tira.style.animationDuration = t.seg + 's';
    t.img = new Image();
    t.img.alt = ''; t.img.decoding = 'async'; t.img.src = RAIZ + t.src;
    t.tira.appendChild(t.img);
  });
  function armarTiras() {
    const ancho = escena.offsetWidth, alto = escena.offsetHeight;
    TIRAS.forEach((t) => {
      const w = t.img.naturalWidth, h = t.img.naturalHeight;
      if (!w || !ancho) return;
      // la primera vez, el alambrado pasa a la versión desenfocada
      if (t.borroso > 0 && !t.lienzo) {
        t.lienzo = desenfocar(t.img, Math.round(t.borroso));
        t.tira.innerHTML = '';
      }
      const paso = alto * t.alto * w / h;   // ancho de una imagen en la escena
      const n = Math.ceil(ancho / paso) + 1;
      while (t.tira.children.length < n) t.tira.appendChild(copiaDe(t));
      while (t.tira.children.length > n) t.tira.lastChild.remove();
      t.tira.style.setProperty('--paso', paso.toFixed(2) + 'px');
    });
  }
  TIRAS.forEach((t) => { if (t.img.complete) armarTiras(); else t.img.addEventListener('load', armarTiras); });
  addEventListener('resize', armarTiras);
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
    { el: $('.pt-fondo'), my: 7, sy: .06 },
    { el: $('.pt-medio'), my: 9, sy: .12 },
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
    // ícono grande de fondo de cada paso (intro.iconos, en el mismo orden que los párrafos)
    const ICONOS_INTRO = {
      // caja con dos flechas que la rodean (gestión y coordinación)
      gestion: '<svg viewBox="0 0 100 100"><path transform="translate(50 51) scale(1.22) translate(-50 -51)" d="M50 30 68 39 50 48 32 39z M32 43 48 51 48 72 32 63z M52 51 68 43 68 63 52 72z"/><path d="M90.87 37.79 91.93 25.63 79.81 32.63z M9.13 64.21 20.19 69.37 8.07 76.37z"/><path d="M10.5 36.6A42 42 0 0 1 86.37 30 M89.47 65.36A42 42 0 0 1 13.63 72" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round"/></svg>',
      // diana con flecha (la de Objetivos de S.C.O.P.E., Objetivo.svg de la persona)
      objetivo: '<svg viewBox="0 0 180.17 180.16"><path d="M78.7,180.16C35.3,180.16,0,144.86,0,101.47S35.3,22.79,78.7,22.79c20.95,0,40.65,8.14,55.5,22.92.78.71,1.27,1.73,1.27,2.87,0,2.14-1.72,3.88-3.86,3.88h-1.63l-1.14-1.14c-13.4-13.4-31.21-20.78-50.14-20.78C39.58,30.55,7.75,62.36,7.75,101.47s31.83,70.95,70.95,70.95,70.95-31.83,70.95-70.95c0-14-4.07-27.52-11.76-39.09-1.19-1.78-.7-4.19,1.08-5.37,1.78-1.19,4.18-.7,5.37,1.08,8.54,12.85,13.05,27.85,13.05,43.38,0,43.39-35.31,78.7-78.7,78.7Z"/><path d="M78.7,135.03c-18.51,0-33.56-15.06-33.56-33.56s15.06-33.56,33.56-33.56c8.93,0,17.36,3.48,23.73,9.8,1.52,1.51,1.53,3.96.03,5.48-1.51,1.52-3.96,1.53-5.48.03-4.92-4.87-11.41-7.56-18.28-7.56-14.23,0-25.81,11.58-25.81,25.81s11.58,25.81,25.81,25.81,25.81-11.58,25.81-25.81c0-3.04-.51-5.98-1.52-8.75-.73-2.01.3-4.24,2.31-4.97,2.01-.73,4.24.3,4.97,2.31,1.32,3.62,1.99,7.46,1.99,11.4,0,18.51-15.06,33.56-33.56,33.56Z"/><path d="M78.7,156.8c-30.5,0-55.31-24.82-55.31-55.33s24.81-55.31,55.31-55.31c14.79,0,28.68,5.76,39.11,16.21,1.51,1.52,1.51,3.97,0,5.48-1.52,1.51-3.97,1.51-5.48,0-8.96-8.98-20.9-13.93-33.62-13.93-26.22,0-47.56,21.33-47.56,47.56s21.33,47.58,47.56,47.58,47.56-21.34,47.56-47.58c0-7.66-1.78-14.99-5.3-21.76-.99-1.9-.25-4.24,1.65-5.23,1.9-.99,4.24-.24,5.23,1.65,4.04,7.78,6.17,16.54,6.17,25.33,0,30.51-24.81,55.33-55.31,55.33Z"/><path d="M78.7,105.35c-.99,0-1.98-.38-2.74-1.14-1.51-1.51-1.51-3.97,0-5.48L157.39,17.3c1.51-1.51,3.97-1.51,5.48,0,1.51,1.51,1.51,3.97,0,5.48l-81.44,81.43c-.76.76-1.75,1.14-2.74,1.14Z"/><path d="M176.29,24.96h-21.08V3.88c0-2.14,1.74-3.88,3.88-3.88s3.88,1.74,3.88,3.88v13.33h13.32c2.14,0,3.88,1.74,3.88,3.88s-1.74,3.88-3.88,3.88Z"/><path d="M164.91,36.35h-21.08V15.27c0-2.14,1.74-3.88,3.88-3.88s3.88,1.74,3.88,3.88v13.33h13.32c2.14,0,3.88,1.74,3.88,3.88s-1.74,3.88-3.88,3.88Z"/></svg>'
    };
    const iconos = (I.iconos || []).map((n, k) => {
      const svg = ICONOS_INTRO[String(n || '').trim()];
      return svg ? svg.replace('<svg ', `<svg class="pt-i-ico" data-k="${k}" aria-hidden="true" `) : '';
    }).join('');
    caja.innerHTML = iconos +
      `<div class="pt-i-cab"><p class="pt-i-rotulo"><i class="franjitas"></i>${txt(I.rotulo)}</p>` +
      '<div class="pt-i-nav">' +
      '<button type="button" class="pt-i-ant" aria-label="Anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.4 5.4 14 4l-8 8 8 8 1.4-1.4L8.8 12z"/></svg></button>' +
      `<div class="pt-i-rayas">${Array.from({ length: pasos }, (_, k) => `<button type="button" data-k="${k}" aria-label="Paso ${k + 1}"><i></i></button>`).join('')}</div>` +
      `<button type="button" class="pt-i-sig">${txt(I.botonSiguiente || 'Siguiente')}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 5.6 11.6 7l4 4H4v2h11.6l-4 4 1.4 1.4 6.4-6.4z"/></svg></button>` +
      '</div></div>' +
      '<div class="pt-i-pasos">' +
      PARRAFOS.map((p, k) => `<p class="pt-i-paso" data-k="${k}">${txt(p)}</p>`).join('') +
      `<div class="pt-i-paso pt-i-final" data-k="${PARRAFOS.length}"><h2>${txt(I.pregunta)}</h2>` +
      `<div class="pt-i-pie"><p>${txt(I.invitacion)}</p>` +
      `<button type="button" class="pt-i-boton">${txt(I.boton)}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4h2v12l4.6-4.6L19 12.8 12 19.8l-7-7 1.4-1.4L11 16z"/></svg></button></div></div>` +
      '</div>';
    const elPasos = [...caja.querySelectorAll('.pt-i-paso')];
    const rayas = [...caja.querySelectorAll('.pt-i-rayas button')];
    const icos = [...caja.querySelectorAll('.pt-i-ico')];
    // segundos de cada paso: según el largo del texto (unas 22 letras por segundo, entre 6 y 11 s)
    const dur = PARRAFOS.map((p) => Math.max(6, Math.min(11, String(p).length / 22)));
    let paso = -1, transcurrido = 0, ultimo = 0, manual = false;
    const bAnt = caja.querySelector('.pt-i-ant'), bSig = caja.querySelector('.pt-i-sig');
    function ir(k) {
      k = Math.max(0, Math.min(pasos - 1, k));
      paso = k; transcurrido = 0;
      elPasos.forEach((el, j) => el.classList.toggle('activo', j === k));
      icos.forEach((el) => el.classList.toggle('activo', +el.dataset.k === k));
      rayas.forEach((b, j) => {
        b.classList.toggle('hecha', j < k);
        b.classList.toggle('actual', j === k);
        // si la persona maneja los pasos, la rayita actual queda llena (ya no corre el tiempo)
        b.firstChild.style.width = j < k || (manual && j === k) ? '100%' : '0%';
      });
      bAnt.disabled = k === 0;
      caja.classList.toggle('final', k === pasos - 1);
    }
    // con las flechas, el botón o las rayitas manda la persona: deja de pasar solo
    const irManual = (k) => { manual = true; ir(k); };
    rayas.forEach((b, j) => b.addEventListener('click', (e) => { if (e.isTrusted) irManual(j); else ir(j); }));
    bAnt.addEventListener('click', () => irManual(paso - 1));
    bSig.addEventListener('click', () => irManual(paso + 1));
    // Guía (compartido/guia.js): la mano señala "Siguiente" hasta que se usa la navegación
    if (window.GUIA) GUIA.pista({ id: 'servicio-intro', texto: 'introSiguiente', objetivo: () => bSig, punto: [.5, .6], zona: '.pt-i-nav button', lado: 'arriba', espera: 2.5, activa: () => introActiva && paso >= 0 && paso < pasos - 1 && y < 80 });
    // "Empezar el recorrido" baja al resumen (cierre.js); si no está, a ¿Cómo lo hacemos?
    caja.querySelector('.pt-i-boton').addEventListener('click', () => {
      const sig = document.querySelector('.sv-tms');
      const y = window.SV && SV.yResumen ? SV.yResumen : sig && sig.offsetTop;
      if (window.desplazamiento && y != null) window.desplazamiento.ir(y);
    });
    // reloj: avanza solo con la portada a la vista y la pestaña visible
    function reloj(t) {
      requestAnimationFrame(reloj);
      const dt = ultimo ? Math.min(.1, (t - ultimo) / 1000) : 0;
      ultimo = t;
      if (!introActiva || manual || paso < 0 || paso >= PARRAFOS.length || y > 300 || document.hidden) return;
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
    if (caja && caja.children.length && !introActiva) setTimeout(() => { introActiva = true; caja.classList.add('lista'); if (caja.querySelector('.pt-i-paso.activo') === null) caja.querySelector('.pt-i-rayas button').dispatchEvent(new MouseEvent('click')); }, 1300);
  };
  if (document.body.classList.contains('lista')) mostrar();
  else document.addEventListener('pagina-lista', mostrar);
})();
