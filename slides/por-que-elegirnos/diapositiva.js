/* =========================================================
   ¿POR QUÉ ELEGIRNOS? (antes "Nuestra estructura": la red de áreas pasó a
   ¿Quiénes somos?). Empieza con el título y las cuatro tarjetas de vidrio
   (datos/estructura.js: elegirnosAntetitulo, elegirnosTitulo, elegirnos) y
   sigue con un scroll común, como una web: pantalla partida Calidad /
   Capacitaciones (mejora.js) y RSE (rse.js, rse-numeros.js, rse-comunidad.js).
   ========================================================= */
(function () {
  const E = Object.assign({ elegirnos: [] }, window.ESTRUCTURA || {});
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // **negrita** y *rojo en cursiva*
  const formato = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
  function crear(tag, clase, padre, html) {
    const el = document.createElement(tag);
    if (clase) el.className = clase;
    if (html !== undefined) el.innerHTML = html;
    if (padre) padre.appendChild(el);
    return el;
  }
  const seccionEl = $('.seccion-mejora');
  const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // ---------- Título: cada letra de la palabra grande sube por separado ----------
  const anteEl = $('.mc-ante'), grandeEl = $('.mc-grande');
  anteEl.textContent = E.elegirnosAntetitulo || '¿Qué hacemos';
  grandeEl.innerHTML = Array.from(E.elegirnosTitulo || 'DIFERENTE?').map((c, l) => `<i style="--l:${l}">${c === ' ' ? '&nbsp;' : esc(c)}</i>`).join('');
  // el contorno de la palabra grande va por encima del camión (pedido de la persona): mismas letras,
  // en el mismo lugar y con el mismo paralaje que el título, solo el trazo
  const contornoEl = $('.mc-contorno');
  if (contornoEl) contornoEl.innerHTML = grandeEl.innerHTML;
  // si se cambia por un texto más largo, la letra se achica para que entre
  const ajustarTitulo = () => {
    anteEl.style.fontSize = grandeEl.style.fontSize = '';
    if (anteEl.scrollWidth > 1180) anteEl.style.fontSize = (110.4 * 1180 / anteEl.scrollWidth) + 'px';
    if (grandeEl.scrollWidth > 1180) grandeEl.style.fontSize = (212 * 1180 / grandeEl.scrollWidth) + 'px';
    if (contornoEl) contornoEl.style.fontSize = grandeEl.style.fontSize;
  };
  ajustarTitulo();
  if (document.fonts) document.fonts.ready.then(ajustarTitulo);

  // ---------- Íconos de "¿Qué hacemos diferente?" (incluidos, por si falta el SVG propio) ----------
  const sello = (() => {
    // sello dentado con un aro y un tilde calados
    const pts = [], n = 16;
    for (let k = 0; k < n * 2; k++) {
      const a = k / (n * 2) * Math.PI * 2 - Math.PI / 2, r = k % 2 ? 10.3 : 11.6;
      pts.push(`${(12 + r * Math.cos(a)).toFixed(2)},${(12 + r * Math.sin(a)).toFixed(2)}`);
    }
    return `<path fill-rule="evenodd" d="M${pts.join('L')}Z M12 4.6a7.4 7.4 0 1 0 0 14.8 7.4 7.4 0 0 0 0-14.8zM12 6.1a5.9 5.9 0 1 1 0 11.8 5.9 5.9 0 0 1 0-11.8z"/>` +
      '<path class="hueco" d="M8.9 12.2l2.2 2.2 4.1-4.6"/>';
  })();
  const ICONOS_EL = {
    excelencia: sello,
    // nube grande en el centro con caminos de circuito en ángulo recto y un punto al final de cada uno
    innovacion:
      '<path transform="translate(5.2 4.2) scale(.567)" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>' +
      '<path class="trazo" d="M10.4 7.2V3.5M13.6 6.9V5.3h2.4M5.4 12.6H3M6.4 15.5H4.6v1.9M18.8 12.3h2.1M17.6 15.6v1.4h1.8M9.2 15.6v2.6l-1.3 1.3M12 15.6v4.5M14.8 15.6v2.6l1.3 1.3"/>' +
      '<circle cx="10.4" cy="2.4" r="1.25"/><circle cx="17.2" cy="5.3" r="1.25"/><circle cx="1.9" cy="12.6" r="1.25"/><circle cx="4.6" cy="18.6" r="1.25"/>' +
      '<circle cx="22" cy="12.3" r="1.25"/><circle cx="20.6" cy="17" r="1.25"/><circle cx="7.2" cy="20.3" r="1.25"/><circle cx="12" cy="21.3" r="1.25"/><circle cx="16.8" cy="20.3" r="1.25"/>',
    flexibilidad:
      '<path fill-rule="evenodd" d="M6.6 3h10.8a4.4 4.4 0 0 1 0 8.8H6.6a4.4 4.4 0 0 1 0-8.8zM17.2 5a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z"/>' +
      '<path fill-rule="evenodd" d="M6.6 13.2h10.8a4.4 4.4 0 0 1 0 8.8H6.6a4.4 4.4 0 0 1 0-8.8zM6.8 15.2a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z"/>'
  };
  const contEl = $('.el-tarjetas');
  // Adónde lleva cada tarjeta ("ir" en los datos): la sección queda entera en pantalla
  // (el tramo arranca en y 900 de la diapositiva, así que y = 900 + su offsetTop)
  const SECCION_DE = { adaptabilidad: '.mc-adap', mejora: '.mc-elegir', rse: '.mc-rse', numeros: '.mc-num', comunidad: '.mc-com', clientes: '.mc-cli' };
  const flechaIr = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4h2v12l4.6-4.6L19 12.8 12 19.8l-7-7 1.4-1.4L11 16z"/></svg>';
  function irATarjeta(t) {
    const el = $(SECCION_DE[String(t.ir || '').trim()]);
    if (!el || !window.desplazarA) return;
    // en Adaptabilidad, además, abre el paso pedido cuando llega (adaptabilidad.js)
    if (t.ir === 'adaptabilidad' && t.paso && window.ADAPTABILIDAD) window.ADAPTABILIDAD.abrir(+t.paso - 1);
    window.desplazarA(900 + el.offsetTop);
  }

  // ---------- Las tres claves, en un zócalo abajo (opción A elegida por la persona) ----------
  // Sin líneas a la foto (los objetos no tenían relación con cada idea): las tres en fila sobre el
  // gris, en orden de lectura (flexibilidad, innovación, excelencia), numeradas y unidas por una
  // línea punteada con un punto en cada una, como el mapa de la entrada de "¿Cómo lo hacemos?".
  // Cada clave: el ícono (su dibujo mide ALTO_ICONO de alto) y a su derecha el número y el título.
  const ORDEN_LUGARES = ['flexibilidad', 'innovacion', 'excelencia'];
  const COL_X = [262, 632, 1002];         // borde izquierdo de cada clave (columnas de 370)
  // arriba de las claves (la línea punteada va 29 px más arriba). Van en la parte gris, debajo de
  // las ruedas del camión (pedido de la persona), y tienen que terminar antes de y 900: más abajo
  // sube la sección siguiente y las taparía
  const FILA_Y = 806;
  const ALTO_ICONO = 64, SEP = 20;        // alto del dibujo del ícono y aire hasta el texto
  // tamaño de cada ícono (lado de la caja del SVG) y dónde está el dibujo dentro de esa caja (0–1)
  const ICONO_TAM = {
    innovacion:   { s: 144.5, dibujo: [.03, .07, .978, .927] },
    flexibilidad: { s: 131.5, dibujo: [.133, .152, .875, .855] },
    excelencia:   { s: 136.3, dibujo: [.122, .122, .885, .887] }
  };
  const PAD = 26, ALTO_RENGLON = 34, ALTO_NUM = 22;
  // Paralaje de cada capa: [px que se corre con el mouse, cuánto se queda atrás con el scroll]
  // (mínimo, pedido de la persona: así todo sube junto y las claves quedan en la parte gris)
  // la foto y el polvo no se corren con el scroll: así nunca asoman debajo del borde de la portada
  // (se ve cuando pasa adelante, con una tarjeta abierta)
  const PROF = { deposito: [3, 0], polvo: [4, 0], titulo: [5, .03], operario: [7, .02], contorno: [5, .03], puntos: [3, 0] };
  const capas = {};
  document.querySelectorAll('.df-capa').forEach((c) => { capas[c.dataset.capa] = c; });
  // la línea punteada del zócalo, con un punto sobre cada clave
  const zocalo = crear('div', 'df-zocalo', contEl);

  const usados = new Set();
  const lista = (E.elegirnos || []).slice(0, 3);
  // en el orden de lectura, por su ícono (si no coincide, el primero libre)
  const claves = lista.map((t) => { const k = ORDEN_LUGARES.includes(t.icono) && !usados.has(t.icono) ? t.icono : ORDEN_LUGARES.find((kk) => !usados.has(kk)); usados.add(k); return k; });
  const puntos = lista.map((t, i) => {
    const clave = claves[i], col = ORDEN_LUGARES.indexOf(clave);
    const T = ICONO_TAM[t.icono] || ICONO_TAM[clave];
    const [d0, d1, d2, d3] = T.dibujo, is = ALTO_ICONO / (d3 - d1);   // el dibujo de todos mide lo mismo de alto
    const renglones = String(t.titulo || '').split(/\s+\/\s+/).filter(Boolean);
    const altoTexto = ALTO_NUM + renglones.length * ALTO_RENGLON;
    // el ícono centrado con el bloque del texto; su dibujo arranca en el borde de la columna
    const ix = COL_X[col] - d0 * is, iy = FILA_Y + (altoTexto - ALTO_ICONO) / 2 - d1 * is;
    const lx = COL_X[col] + (d2 - d0) * is + SEP, ly = FILA_Y;
    const x = COL_X[col] - PAD, y = FILA_Y - PAD;                     // esquina de la tarjeta abierta
    const cabH = altoTexto + PAD + 14;
    const punto = crear('i', '', zocalo);
    punto.style.left = (COL_X[col] + (d2 - d0) * is / 2 - 220) + 'px';   // sobre el ícono (el zócalo arranca en x 220)
    punto.dataset.c = col;
    const el = crear('div', 'df-punto', contEl);
    const datos = (t.datos || []).filter((d) => d && (d.valor || d.texto));
    const conDestino = !!SECCION_DE[String(t.ir || '').trim()];
    el.dataset.icono = clave;
    el.style.cssText = `--i:${col};--x:${x}px;--y:${y}px;--ix:${ix - x}px;--iy:${iy - y}px;--is:${is}px;--lx:${lx - x}px;--ly:${ly - y}px;--cab-h:${cabH}px;--ox:${ix - x + is / 2}px;--oy:${iy - y + is / 2}px`;
    el.innerHTML =
      '<div class="df-vidrio"><i class="df-brillo"></i></div>' +
      `<div class="df-cabeza"><span class="el-icono"></span><h3 class="df-etiqueta"><small>${String(col + 1).padStart(2, '0')}</small>${renglones.map((r) => `<span>${formato(r)}</span>`).join('')}</h3></div>` +
      `<div class="df-cuerpo"><p class="el-texto">${formato(t.texto)}</p>` +
      (datos.length ? '<div class="el-datos">' + datos.map((d) => `<div><b>${esc(d.valor)}</b><span>${formato(d.texto)}</span></div>`).join('') + '</div>' : '') +
      (t.frase ? `<p class="df-frase">${formato(t.frase)}</p>` : '') +
      (conDestino ? `<span class="el-ir">${formato(t.boton || 'Ver más')}${flechaIr}</span>` : '') + '</div>';
    el.setAttribute('aria-label', renglones.join(' '));
    // Ícono propio en SVG (si está); si no, el incluido
    const ic = $('.el-icono', el);
    const incluido = () => { ic.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS_EL[t.icono] || ICONOS_EL.excelencia}</svg>`; };
    if (t.imagen) {
      const img = crear('img', '', ic);
      img.alt = '';
      img.onerror = incluido;
      img.src = '../../' + t.imagen;
    } else incluido();
    return { t, el, x, y, conDestino, p: 0, sube: 0 };
  });
  // en el orden de lectura (así el foco con el teclado y la guía van primero a Flexibilidad)
  puntos.slice().sort((a, b) => ORDEN_LUGARES.indexOf(a.el.dataset.icono) - ORDEN_LUGARES.indexOf(b.el.dataset.icono)).forEach((q) => contEl.appendChild(q.el));

  // Si la tarjeta abierta no entra abajo, sube (con su título) lo que haga falta
  // (abajo no puede pasar de y 868: más abajo sube la sección siguiente; arriba, se ven después de
  // bajar al menos CLAVES_DESDE, así que el borde de arriba de la pantalla está 110 px más abajo)
  const medir = () => puntos.forEach((o) => { const h = o.el.offsetHeight; o.sube = Math.max(92 + 110 - o.y, Math.min(0, 868 - (o.y + h))); });
  medir();
  if (document.fonts) document.fonts.ready.then(medir);

  // ---------- Abrir y cerrar (cursor, foco o toque) ----------
  let cierre = null;
  function abrir(o) {
    clearTimeout(cierre);
    puntos.forEach((q) => q.el.classList.toggle('abierta', q === o));
    zocalo.dataset.activa = ORDEN_LUGARES.indexOf(o.el.dataset.icono);
    seccionEl.classList.add('con-tarjeta');
    despertar();
  }
  function cerrar() {
    clearTimeout(cierre);
    puntos.forEach((q) => q.el.classList.remove('abierta'));
    delete zocalo.dataset.activa;
    seccionEl.classList.remove('con-tarjeta');
  }
  // ¿el evento lo causó el scroll (el cursor no se movió) y no el mouse?
  let ultMouse = { x: -1, y: -1 }, ultScroll = -1e9;
  addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') ultMouse = { x: e.clientX, y: e.clientY }; });
  document.addEventListener('desplazamiento', () => { ultScroll = performance.now(); });
  const porScroll = (e) => performance.now() - ultScroll < 500 && Math.abs(e.clientX - ultMouse.x) < 2 && Math.abs(e.clientY - ultMouse.y) < 2;
  puntos.forEach((o) => {
    const { el } = o;
    const vidrio = $('.df-vidrio', el);
    let abiertaAlTocar = false, tipo = 'mouse';
    if (o.conDestino) { el.tabIndex = 0; el.setAttribute('role', 'link'); }
    // al scrollear, las claves pasan por debajo del cursor quieto: eso no abre la tarjeta (se abría
    // sola y la portada pasaba adelante); se abre recién cuando el mouse se mueve de verdad
    el.addEventListener('pointerenter', (e) => { if (e.pointerType !== 'touch' && !porScroll(e)) abrir(o); });
    el.addEventListener('pointerleave', (e) => { if (e.pointerType !== 'touch') { clearTimeout(cierre); cierre = setTimeout(cerrar, 220); } });
    el.addEventListener('pointerdown', (e) => { tipo = e.pointerType; abiertaAlTocar = el.classList.contains('abierta'); });
    el.addEventListener('click', () => {
      // con el dedo, el primer toque abre la tarjeta y el segundo lleva a su parte
      if (tipo === 'touch' && !abiertaAlTocar) { abrir(o); return; }
      if (o.conDestino) irATarjeta(o.t);
    });
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' && o.conDestino) { e.preventDefault(); irATarjeta(o.t); } });
    el.addEventListener('focus', () => abrir(o));
    el.addEventListener('blur', () => { if (!el.matches(':hover')) cerrar(); });
    // reflejo del vidrio que sigue al cursor
    el.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'touch' && !el.classList.contains('abierta') && !porScroll(e)) abrir(o);
      const r = vidrio.getBoundingClientRect();
      vidrio.style.setProperty('--mx', `${(e.clientX - r.left) / r.width * 100}%`);
      vidrio.style.setProperty('--my', `${(e.clientY - r.top) / r.height * 100}%`);
    });
  });
  // un toque fuera de las tarjetas las cierra
  document.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch' && !e.target.closest('.df-punto')) cerrar(); }, true);

  // ---------- Polvo que flota en el haz de luz del pasillo ----------
  const lienzo = $('.df-polvo'), ctx = lienzo.getContext('2d');
  const enHaz = (y) => 800 + (Math.random() - .5) * (90 + y * .62);
  const motas = Array.from({ length: reducido ? 0 : 58 }, (_, k) => {
    const haz = k < 42, y = 40 + Math.random() * 740;
    return { haz, x: haz ? enHaz(y) : Math.random() * 1600, y, r: .5 + Math.random() * (haz ? 1.5 : 1.1), v: 5 + Math.random() * 13, a: .25 + Math.random() * .55, f: Math.random() * 6.28, w: .6 + Math.random() * 1.4 };
  });
  function dibujarPolvo(t, dt) {
    ctx.clearRect(0, 0, 800, 450);
    for (const m of motas) {
      m.y -= m.v * dt;
      m.x += Math.sin(t * .0005 * m.w + m.f) * 4 * dt;
      if (m.y < 24) { m.y = 780; m.x = m.haz ? enHaz(m.y) : Math.random() * 1600; }
      const abajo = Math.min(1, Math.max(0, (820 - m.y) / 220));         // se apaga al llegar al gris
      const a = m.a * (.55 + .45 * Math.sin(t * .0012 * m.w + m.f)) * abajo * (m.haz ? 1 : .45);
      if (a < .02) continue;
      ctx.fillStyle = `rgba(255, 238, 214, ${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(m.x / 2, m.y / 2, m.r, 0, 6.2832);
      ctx.fill();
    }
  }

  // ---------- Paralaje (mouse y scroll) y la tarjeta que se abre: un solo bucle ----------
  let mx = 0, my = 0, objX = 0, objY = 0, scrollY = 0, ultimo = 0, bucle = null;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || reducido) return;
    objX = Math.max(-1, Math.min(1, (e.clientX / innerWidth - .5) * 2));
    objY = Math.max(-1, Math.min(1, (e.clientY / innerHeight - .5) * 2));
    despertar();
  }, { passive: true });
  document.addEventListener('desplazamiento', (e) => {
    scrollY = Math.max(0, e.detail.y);
    revisarClaves();
    if (scrollY > 560 && seccionEl.classList.contains('con-tarjeta')) cerrar();   // al bajar, la tarjeta abierta se cierra
    despertar();
  });
  // Las tres claves no aparecen al entrar (pedido de la persona): recién al bajar un poco
  // (CLAVES_DESDE px), así están más arriba en la pantalla y se ven mejor; al volver arriba del
  // todo se esconden (y la próxima vez entran de nuevo, con su animación).
  const CLAVES_DESDE = 110, CLAVES_HASTA = 40;
  let entro = false;
  function revisarClaves() {
    if (!entro) return;
    const con = seccionEl.classList.contains('lineas');
    if (!con && scrollY > CLAVES_DESDE) seccionEl.classList.add('lineas');
    else if (con && scrollY < CLAVES_HASTA) {
      if (seccionEl.classList.contains('con-tarjeta')) cerrar();
      seccionEl.classList.remove('lineas');
    }
  }
  document.addEventListener('visibilitychange', despertar);
  const visible = () => scrollY < 900 && !document.hidden;
  const suave = (p) => p * p * (3 - 2 * p);
  function cuadro(t) {
    const dt = Math.min(.05, Math.max(0, (t - ultimo) / 1000));
    ultimo = t;
    const k = 1 - Math.exp(-dt * 3.4);
    mx += (objX - mx) * k;
    my += (objY - my) * k;
    const o = {};
    for (const c in PROF) {
      const [px, s] = PROF[c];
      o[c] = [-mx * px, -my * px * .6 + scrollY * s];
      if (capas[c]) capas[c].style.transform = `translate3d(${o[c][0].toFixed(2)}px, ${o[c][1].toFixed(2)}px, 0)`;
    }
    const kp = 1 - Math.exp(-dt * 9);
    // las claves del zócalo quedan quietas (solo el paralaje de su capa); la abierta sube lo que haga falta
    for (const q of puntos) {
      q.p += ((q.el.classList.contains('abierta') ? 1 : 0) - q.p) * kp;
      q.el.style.transform = `translate3d(0, ${(q.sube * suave(q.p)).toFixed(2)}px, 0)`;
    }
    if (motas.length) dibujarPolvo(t, dt);
    bucle = visible() ? requestAnimationFrame(cuadro) : null;
  }
  function despertar() {
    if (bucle || !visible()) return;
    ultimo = performance.now();
    bucle = requestAnimationFrame(cuadro);
  }
  despertar();

  // ---------- Entrada: al abrirse la cortina aparecen las capas; el zócalo con las claves, al bajar un poco ----------
  const entrar = () => {
    setTimeout(() => seccionEl.classList.add('arriba'), 350);
    setTimeout(() => { entro = true; revisarClaves(); }, 1900);
  };
  // Guía (compartido/guia.js): la mano invita a pasar por el primer ícono (Flexibilidad), hasta que se usa uno
  if (window.GUIA) GUIA.pista({ id: 'elegirnos-tarjetas', texto: 'tarjetasIr', objetivo: () => $('.df-punto[data-icono="flexibilidad"] .el-icono') || $('.df-punto .el-icono'), punto: [.5, .55], zona: '.df-punto', tipo: 'pasar', lado: 'abajo', espera: 2.4, activa: () => seccionEl.classList.contains('lineas') && !seccionEl.classList.contains('con-tarjeta') && scrollY < 520 });
  if (document.body.classList.contains('lista')) entrar(); else document.addEventListener('pagina-lista', entrar, { once: true });

  // =========================================================
  // SCROLL: común, como una web. Las capas suben con `translate` directo (no con una
  // variable CSS en .escenario: eso recalculaba los estilos de toda la diapositiva en
  // cada cuadro). La rueda, el touchpad y las teclas mueven la página lo que piden,
  // con un resorte corto. Con un tema de Mejora continua abierto, la rueda y ↑ ↓
  // recorren sus secciones (mejora.js).
  // =========================================================
  // Al final, RSE (Comunidad) queda quieta y "Nuestros clientes" sube por encima:
  // pasado QUIETO_DESDE el tramo deja de subir y solo se mueve la sección de Clientes.
  const tramo = $('.mc-tramo'), clientesEl = $('.mc-cli');
  const QUIETO_DESDE = 900 + 900 + 2700;            // Comunidad entera en pantalla (adaptabilidad + pantalla partida + RSE)
  let bajada = -1;
  document.addEventListener('desplazamiento', (e) => {
    const y = Math.max(0, e.detail.y);
    if (y === bajada) return;
    bajada = y;
    seccionEl.style.translate = `0 ${(-y).toFixed(1)}px`;
    tramo.style.translate = `0 ${(-Math.min(y, QUIETO_DESDE)).toFixed(1)}px`;
    if (clientesEl) clientesEl.style.translate = `0 ${(-Math.max(0, y - QUIETO_DESDE)).toFixed(1)}px`;
    seccionEl.classList.toggle('lejos', y > 1800);   // ya quedó muy arriba: no se dibuja
  });

  const MAXIMO = 900 + 900 + 2700 + 1000;         // adaptabilidad (900) + pantalla partida (900) + RSE: tablero, números y comunidad (3 × 900) + Clientes (1000: al final aparece el botón Volver)
  const RIGIDEZ = 13;
  let objetivoY = 0, animacion = null, velocidad = 0, posicion = 0, ultimoCuadro = 0;
  const destino = () => (animacion ? objetivoY : (window.desplazamiento ? window.desplazamiento.y : 0));
  const capituloAbierto = () => document.body.classList.contains('capitulo-abierto');
  const pasoCapitulo = (dir) => document.dispatchEvent(new CustomEvent('capitulo-paso', { detail: dir }));
  function mover(ahora) {
    let dt = Math.min(.05, Math.max(0, (ahora - ultimoCuadro) / 1000));
    ultimoCuadro = ahora;
    // resorte críticamente amortiguado, en subpasos cortos para que sea estable
    while (dt > 0) {
      const h = Math.min(dt, 1 / 240);
      velocidad += (RIGIDEZ * RIGIDEZ * (objetivoY - posicion) - 2 * RIGIDEZ * velocidad) * h;
      posicion += velocidad * h;
      dt -= h;
    }
    posicion = Math.max(0, Math.min(MAXIMO, posicion));
    const termino = Math.abs(objetivoY - posicion) < 1.5 && Math.abs(velocidad) < 40;
    if (termino) { posicion = objetivoY; velocidad = 0; }
    window.desplazamiento.ir(posicion, true);
    animacion = termino ? null : requestAnimationFrame(mover);
  }
  // mueve hacia "y"; si ya se está moviendo, solo cambia el destino (sigue con su impulso)
  function irA(y) {
    objetivoY = Math.max(0, Math.min(MAXIMO, y));
    if (!window.desplazamiento) return;
    if (!animacion) {
      if (Math.abs(window.desplazamiento.y - objetivoY) < .5) return;
      posicion = window.desplazamiento.y;
      velocidad = 0;
      ultimoCuadro = performance.now();
      animacion = requestAnimationFrame(mover);
    }
  }
  window.desplazarA = (y) => irA(y);              // para el índice de secciones (compartido/indice.js)

  // Si nadie baja un rato después de entrar (pedido de la persona), la pantalla baja sola un
  // poquito, despacio, para que aparezcan las tres claves (Flexibilidad, Innovación, Excelencia).
  // Una sola vez por visita; cualquier rueda, tecla o toque la corta.
  const ESPERA_AUTO = 4000, BAJA_AUTO = 130, DURA_AUTO = 1500;   // (lo justo para que aparezcan: el título casi no se corta)
  let autoHecho = false, ultimoUso = 0, entroEn = 0;
  ['wheel', 'keydown', 'pointerdown'].forEach((ev) => addEventListener(ev, () => { ultimoUso = performance.now(); }, { capture: true, passive: true }));
  const relojAuto = setInterval(() => {
    if (autoHecho) { clearInterval(relojAuto); return; }
    const ahora = performance.now();
    if (!entro || document.hidden || animacion || !window.desplazamiento) return;
    if (!entroEn) entroEn = ahora;
    if (window.desplazamiento.y >= CLAVES_DESDE) { autoHecho = true; return; }   // ya bajó por su cuenta
    if (ahora - Math.max(entroEn, ultimoUso) < ESPERA_AUTO || document.body.classList.contains('capitulo-abierto')) return;
    autoHecho = true;
    const desde = window.desplazamiento.y, t0 = ahora, usoAntes = ultimoUso;
    (function paso(t) {
      if (ultimoUso !== usoAntes || animacion) return;             // la persona tomó el control
      const p = Math.min(1, (t - t0) / DURA_AUTO);
      window.desplazamiento.ir(desde + (BAJA_AUTO - desde) * suave(p), true);
      if (p < 1) requestAnimationFrame(paso);
    })(ahora);
  }, 400);
  // el arrastre táctil (compartido/desplazamiento.js) tampoco pasa del final del recorrido
  addEventListener('load', () => { if (window.desplazamiento) window.desplazamiento.limite = MAXIMO; });
  // si el dedo empieza a arrastrar mientras el resorte se mueve, manda el dedo
  addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' && animacion) { cancelAnimationFrame(animacion); animacion = null; velocidad = 0; }
  }, true);
  let ultimaRueda = 0, acumulado = 0;
  addEventListener('wheel', (e) => {
    // la rueda la maneja esta diapositiva
    e.stopImmediatePropagation();
    e.preventDefault();
    if (!e.deltaY) return;
    const d = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? 800 : 1);
    if (capituloAbierto()) {
      // dentro de un tema: una muesca (o un deslizamiento del touchpad) pasa una sección
      const ahora = performance.now();
      if (ahora - ultimaRueda > 220) acumulado = 0;
      ultimaRueda = ahora;
      if (Math.abs(d) >= 50) { acumulado = 0; pasoCapitulo(Math.sign(d)); return; }
      acumulado += d;
      if (Math.abs(acumulado) >= 120) { acumulado = 0; pasoCapitulo(Math.sign(d)); }
      return;
    }
    irA(destino() + d);
  }, { capture: true, passive: false });
  addEventListener('keydown', (e) => {
    const abajo = ['ArrowDown', 'PageDown', ' '], arriba = ['ArrowUp', 'PageUp'];
    if (![...abajo, ...arriba, 'Home', 'End'].includes(e.key)) return;
    e.stopImmediatePropagation();
    e.preventDefault();
    const dir = abajo.includes(e.key) && !(e.key === ' ' && e.shiftKey) ? 1 : -1;
    if (capituloAbierto()) { if (e.key !== 'Home' && e.key !== 'End') pasoCapitulo(dir); return; }
    if (e.key === 'Home') irA(0);
    else if (e.key === 'End') irA(MAXIMO);
    else irA(destino() + dir * (e.key.startsWith('Arrow') ? 120 : 760));   // flechas de a poco, Av/Re Pág y espacio de a una pantalla
  }, true);
})();
