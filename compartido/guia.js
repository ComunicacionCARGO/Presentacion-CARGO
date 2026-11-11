/* =========================================================
   GUÍA — ayudas para que se note qué se puede tocar (todas las páginas).
   Textos en datos/guias.js (window.GUIAS). Estilos en compartido/base.css.

   1) En las diapositivas largas, un cartel abajo ("Bajá con la rueda para
      seguir") aparece si la persona se queda quieta: enseguida al entrar y
      después de unos segundos sin bajar. Con un clic pasa a la sección siguiente.
   2) Carteles con una mano que toca, sobre cada cosa interactiva. Cada
      diapositiva los registra con:
        GUIA.pista({
          id: 'quienes-anios',            // único en todo el sitio
          texto: 'lineaDeTiempo',          // clave en datos/guias.js
          objetivo: () => elemento,        // (o un selector) adónde apunta la mano
          punto: [.5, .5],                 // en qué parte del elemento (fracción)
          corrimiento: [dx, dy],           // y corrido tantos px del escenario
          puntoEscenario: () => ({x, y}),  // en vez de objetivo: un punto del escenario
          zona: '.selector',               // qué cuenta como usarlo (si no, el objetivo)
          lado: 'abajo',                   // dónde va el texto: abajo, arriba, izq, der
          tipo: 'clic',                    // 'clic' o 'pasar' (con mouse alcanza con pasar por encima)
          activa: () => true               // condición extra para mostrarse
        });
      Aparece cuando lo señalado está en pantalla y a la vista (nada lo tapa),
      sin scroll en curso, después de un momento. Se va para siempre (en esa
      visita) cuando la persona lo usa. De a uno por vez, en el orden en que se
      registran.
   ========================================================= */
(function () {
  const T = window.GUIAS || {};
  const escenario = document.querySelector('.escenario');
  if (!escenario) return;

  let tactil = matchMedia('(hover: none)').matches;
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const formato = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const textoDe = (clave) => {
    const t = T[clave];
    if (!t) return '';
    if (typeof t === 'string') return t;
    return (tactil && t.tactil) || t.texto || '';
  };

  const MANO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11.2V4.6a1.6 1.6 0 0 1 3.2 0v5.6h.4V8.7a1.6 1.6 0 0 1 3.2 0v1.6h.4V9.5a1.6 1.6 0 0 1 3.2 0v5.4c0 3.8-2.6 6.8-6.4 6.8h-1.1c-1.9 0-3.6-.9-4.6-2.5l-3-4.6a1.5 1.5 0 0 1 2.4-1.8L9 14.4z"/></svg>';

  // las pistas van dentro del escenario (se escalan con él); medidas en px del escenario
  const capa = document.createElement('div');
  capa.className = 'guia-capa';
  capa.setAttribute('aria-hidden', 'true');
  escenario.appendChild(capa);
  const caja = () => escenario.getBoundingClientRect();
  const aEscenario = (x, y) => { const r = caja(), k = r.width / 1600 || 1; return { x: (x - r.left) / k, y: (y - r.top) / k }; };
  const aPantalla = (x, y) => { const r = caja(), k = r.width / 1600 || 1; return { x: r.left + x * k, y: r.top + y * k }; };

  // lo que ya se usó no se vuelve a indicar en esta visita
  let usados = {};
  try { usados = JSON.parse(sessionStorage.getItem('guia-usadas') || '{}') || {}; } catch (e) { usados = {}; }
  const guardar = () => { try { sessionStorage.setItem('guia-usadas', JSON.stringify(usados)); } catch (e) { /* sin almacenamiento: no pasa nada */ } };

  const lista = () => document.body.classList.contains('lista');
  const d = () => window.desplazamiento;
  const moviendo = () => { const s = d(); return !!s && Math.abs(s.y - s.destino) > 1.5; };
  const bloqueado = () => !!document.querySelector('.tarjeta-capa.abierta, .flujo-capa.abierta');

  // =========================================================
  // PISTAS (la mano que toca)
  // =========================================================
  const pistas = [];
  let actual = null, bucle = 0;

  function pista(op) {
    if (!op || !op.id || usados[op.id]) return;
    // si ya estaba (algo que se vuelve a armar, como un tema abierto otra vez), se actualiza
    const previa = pistas.find((o) => o.id === op.id);
    if (previa) { Object.assign(previa, op); return; }
    const p = Object.assign({ punto: [.5, .5], lado: 'abajo', espera: 1.2, tipo: 'clic' }, op);
    p.el = document.createElement('div');
    p.el.className = 'guia-pista lado-' + p.lado;
    p.el.innerHTML = `<span class="gp-toque"><i></i><i></i>${MANO}</span><span class="gp-texto"></span>`;
    p.txt = p.el.querySelector('.gp-texto');
    p.txt.innerHTML = formato(textoDe(p.texto));
    capa.appendChild(p.el);
    p.desde = 0;
    pistas.push(p);
  }
  const objetivoDe = (p) => {
    const o = p.objetivo;
    if (typeof o === 'function') return o();
    if (typeof o === 'string') return document.querySelector(o);
    return o || null;                                 // un elemento
  };
  // punto señalado, en px de la pantalla
  function puntoDe(p) {
    if (p.puntoEscenario) {
      const q = p.puntoEscenario();
      return q ? Object.assign(aPantalla(q.x, q.y), { el: null }) : null;
    }
    const el = objetivoDe(p);
    if (!el || !el.isConnected) return null;
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return null;
    const c = p.corrimiento || [0, 0], k = caja().width / 1600 || 1;
    const q = { x: r.left + r.width * p.punto[0] + c[0] * k, y: r.top + r.height * p.punto[1] + c[1] * k, el };
    if (c[0] || c[1]) q.el = null;                     // corrido: ya no apunta al elemento (cuenta la zona)
    return q;
  }
  function enZona(p, t) {
    if (!t || !t.closest) return false;
    if (p.zona) return !!t.closest(p.zona);
    const el = objetivoDe(p);
    return !!el && (el === t || el.contains(t));
  }
  // en pantalla, a la vista (lo que está en ese punto es lo señalado) y con su condición
  function disponible(p, q) {
    if (!q) return false;
    const r = caja(), m = 30 * (r.width / 1600);
    if (q.x < Math.max(0, r.left) + m || q.y < Math.max(0, r.top) + m ||
        q.x > Math.min(innerWidth, r.right) - m || q.y > Math.min(innerHeight, r.bottom) - m) return false;
    if (p.activa && !p.activa()) return false;
    const h = document.elementFromPoint(q.x, q.y);
    if (!h) return false;
    if (p.zona) return !!h.closest(p.zona);
    return q.el ? (q.el === h || q.el.contains(h)) : true;
  }
  function ubicar(p) {
    const q = puntoDe(p);
    if (!q) return;
    const e = aEscenario(q.x, q.y);
    p.el.style.transform = `translate(${e.x.toFixed(1)}px, ${e.y.toFixed(1)}px)`;
  }
  function seguir() {
    if (!actual) { bucle = 0; return; }
    ubicar(actual);
    bucle = requestAnimationFrame(seguir);
  }
  function mostrar(p) {
    actual = p;
    ubicar(p);
    // el texto nunca se sale del escenario (se corre hacia adentro)
    p.txt.style.marginLeft = '0px';
    const r = p.txt.getBoundingClientRect(), a = aEscenario(r.left, r.top), b = aEscenario(r.right, r.bottom);
    const corrida = a.x < 24 ? 24 - a.x : (b.x > 1576 ? 1576 - b.x : 0);
    p.txt.style.marginLeft = corrida.toFixed(0) + 'px';
    p.el.classList.add('visible');
    if (!bucle) bucle = requestAnimationFrame(seguir);
  }
  function ocultar(p) {
    p.el.classList.remove('visible');
    p.desde = 0;
    if (actual === p) actual = null;
  }
  function usar(id) {
    if (usados[id]) return;
    usados[id] = true;
    guardar();
    const p = pistas.find((o) => o.id === id);
    if (p) ocultar(p);
  }
  // usarla: tocarla (o, si es de pasar el mouse, pasar por encima)
  addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' && !tactil) ponerTactil(true);
    pistas.forEach((p) => { if (!usados[p.id] && enZona(p, e.target)) usar(p.id); });
  }, true);
  // (con pointermove y no pointerover: si el contenido pasa solo bajo el mouse quieto, no cuenta)
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    pistas.forEach((p) => { if (p.tipo === 'pasar' && !usados[p.id] && enZona(p, e.target)) usar(p.id); });
  }, true);

  function revisarPistas(ahora) {
    if (actual && (usados[actual.id] || !lista() || moviendo() || !disponible(actual, puntoDe(actual)))) ocultar(actual);
    if (actual || !lista() || moviendo()) { if (!actual) pistas.forEach((p) => { p.desde = 0; }); return; }
    // la primera disponible tiene prioridad (las demás esperan su turno)
    const p = pistas.find((o) => !usados[o.id] && disponible(o, puntoDe(o)));
    pistas.forEach((o) => { if (o !== p) o.desde = 0; });
    if (!p) return;
    if (!p.desde) p.desde = ahora;
    if (ahora - p.desde >= p.espera * 1000) mostrar(p);
  }

  // =========================================================
  // CARTEL DE SCROLL (diapositivas largas)
  // =========================================================
  const larga = !!document.querySelector('.pista');
  let guia = null, ultimoMov = performance.now(), ultimaY = 0, yaBajo = false, listaDesde = 0;
  const POSICIONES = [800, 1290, 310];                 // al centro; si ahí hay texto, a un costado
  const ALTO_GUIA = 860;
  if (larga) {
    guia = document.createElement('button');
    guia.type = 'button';
    guia.className = 'guia-scroll';
    guia.innerHTML = '<i class="gs-raton"></i><span></span><i class="gs-flecha"></i>';
    escenario.appendChild(guia);
    guia.style.left = POSICIONES[0] + 'px';
    guia.style.top = ALTO_GUIA + 'px';
    // un clic pasa a la sección siguiente (como Av Pág, que maneja compartido/indice.js)
    guia.addEventListener('click', () => {
      guia.classList.remove('visible');
      const ev = new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true, cancelable: true });
      dispatchEvent(ev);
      if (!ev.defaultPrevented && d()) d().ir(d().destino + 900);
    });
    document.addEventListener('desplazamiento', (e) => {
      if (Math.abs(e.detail.y - ultimaY) > 2) {
        ultimaY = e.detail.y;
        ultimoMov = performance.now();
        if (e.detail.y > 60) yaBajo = true;
        guia.classList.remove('visible');
      }
    });
  }
  document.addEventListener('pagina-lista', () => { listaDesde = performance.now(); ultimoMov = listaDesde; });
  if (lista()) listaDesde = performance.now();

  // ¿hay algo en el lugar del cartel? (texto, botones, tarjetas, gráficos: cualquier cosa
  // más angosta que la pantalla; los fondos ocupan todo el ancho y no cuentan)
  function ocupado(x) {
    const k = caja().width / 1600 || 1;
    for (const dx of [-150, 0, 150]) {
      for (const dy of [-18, 0, 18]) {
        const q = aPantalla(x + dx, ALTO_GUIA + dy);
        const h = document.elementFromPoint(q.x, q.y);
        if (!h || h.closest('.guia-scroll')) continue;
        if (h.closest('p, li, h1, h2, h3, h4, blockquote, button, a, img, figure, text')) return true;
        if (h.getBoundingClientRect().width / k < 1200) return true;
      }
    }
    return false;
  }
  function revisarGuia(ahora) {
    if (!guia) return;
    const s = d();
    const segundos = yaBajo ? (+T.segundosSinBajar || 6) : 1.6;
    const alFinal = !s || s.y >= s.max - 30;
    const puede = lista() && listaDesde && ahora - listaDesde > 1200 && !alFinal && !moviendo() &&
      !bloqueado() && !document.body.classList.contains('capitulo-abierto') && ahora - ultimoMov > segundos * 1000;
    const visible = guia.classList.contains('visible');
    if (puede && !visible) {
      const x = POSICIONES.find((v) => !ocupado(v));
      guia.style.left = (x == null ? POSICIONES[0] : x) + 'px';
      guia.classList.add('visible');
    } else if (!puede && visible) guia.classList.remove('visible');
  }

  function ponerTactil(si) {
    tactil = si;
    document.documentElement.classList.toggle('guia-tactil', si);
    pistas.forEach((p) => { p.txt.innerHTML = formato(textoDe(p.texto)); });
    if (guia) guia.querySelector('span').innerHTML = formato(textoDe('scroll'));
  }
  ponerTactil(tactil);

  setInterval(() => {
    if (document.hidden) return;
    const ahora = performance.now();
    revisarPistas(ahora);
    revisarGuia(ahora);
  }, 200);

  window.GUIA = { pista, usar, get tactil() { return tactil; } };
})();
