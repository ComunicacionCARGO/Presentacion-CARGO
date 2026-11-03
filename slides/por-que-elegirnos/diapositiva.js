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
  // ---------- Título ----------
  $('.mc-ante').textContent = E.elegirnosAntetitulo || '¿Por qué';
  $('.mc-grande').textContent = E.elegirnosTitulo || 'ELEGIRNOS?';

  // ---------- Tarjetas de "¿Por qué elegirnos?" (íconos redibujados de las diapositivas originales) ----------
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
      '<path fill-rule="evenodd" d="M6.6 13.2h10.8a4.4 4.4 0 0 1 0 8.8H6.6a4.4 4.4 0 0 1 0-8.8zM6.8 15.2a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z"/>',
    // tres personas de la mano (la de la izquierda con vestido) y una flecha en zigzag que sube
    crecimiento: (() => {
      const persona = (cx, vestido) => {
        const cabeza = `<circle cx="${cx}" cy="3.3" r="1.75"/>`;
        const cuerpo = vestido
          ? `<path d="M${cx - 1.5} 5.6h3l1.4 4.6.9 3.4h-2.2v4.8h-1.3v-4.8h-.6v4.8h-1.3v-4.8h-2.2l.9-3.4z"/>`
          : `<path d="M${cx - 1.6} 5.6h3.2c.8 0 1.4.6 1.4 1.4v4.9h-1.2v6.2h-1.4v-5.4h-.8v5.4H${cx - 1.6}v-6.2h-1.2V7c0-.8.6-1.4 1.4-1.4z"/>`;
        return cabeza + cuerpo;
      };
      return persona(5.2, true) + persona(12, false) + persona(18.8, false) +
        '<path d="M7.4 9.6h2.6v1.1H7.4zM14 9.6h2.6v1.1H14z"/>' +
        '<path class="hueco" d="M2 22l6.2-6.4 3.8 3.4 7.6-7.8"/><path class="trazo flecha" d="M2 22l6.2-6.4 3.8 3.4 7.6-7.8"/>' +
        '<path d="M22.8 8.4l-.6 6.4-2.4-2.4-1.6-1.6-2.4-2.4z"/>';
    })()
  };
  // Título al lado del ícono en dos líneas: la última palabra baja, junto con su artículo
  // ("Excelencia en / el servicio", "Innovación y / tecnología")
  const tituloEnDosLineas = (titulo) => {
    const p = String(titulo || '').trim().split(/\s+/);
    if (p.length < 2) return formato(titulo);
    let corte = p.length - 1;
    if (corte > 1 && /^(el|la|los|las|un|una|lo)$/i.test(p[corte - 1])) corte--;
    return formato(p.slice(0, corte).join(' ')) + '<br>' + formato(p.slice(corte).join(' '));
  };
  const contEl = $('.el-tarjetas');
  (E.elegirnos || []).slice(0, 4).forEach((t, i) => {
    const art = crear('article', 'el-tarjeta', contEl);
    art.style.setProperty('--i', i);
    const v = crear('div', 'el-vidrio', art);
    v.style.setProperty('--i', i);
    const datos = (t.datos || []).filter((d) => d && (d.valor || d.texto));
    const cont = crear('div', 'el-contenido', v,
      `<div class="el-cabeza"><span class="el-icono"></span><h3 class="el-titulo">${tituloEnDosLineas(t.titulo)}</h3></div><p class="el-texto">${formato(t.texto)}</p>` +
      (datos.length ? '<div class="el-datos">' + datos.map((d) => `<div><b>${esc(d.valor)}</b><span>${formato(d.texto)}</span></div>`).join('') + '</div>' : ''));
    // Ícono propio en SVG (si está); si no, el incluido
    const ic = $('.el-icono', cont);
    const incluido = () => { ic.classList.remove('propio'); ic.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS_EL[t.icono] || ICONOS_EL.excelencia}</svg>`; };
    if (t.imagen) {
      ic.classList.add('propio');
      const img = crear('img', '', ic);
      img.alt = '';
      img.onerror = incluido;
      img.src = '../../' + t.imagen;
    } else incluido();
    crear('i', 'el-brillo', v);
    // inclinación 3D y reflejo que siguen al cursor
    art.addEventListener('pointermove', (e) => {
      const r = v.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      v.style.setProperty('--ry', `${(x - .5) * 10}deg`);
      v.style.setProperty('--rx', `${(.5 - y) * 8}deg`);
      v.style.setProperty('--mx', `${x * 100}%`);
      v.style.setProperty('--my', `${y * 100}%`);
    });
    art.addEventListener('pointerenter', () => art.classList.add('activa'));
    art.addEventListener('pointerleave', () => {
      art.classList.remove('activa');
      v.style.setProperty('--rx', '0deg');
      v.style.setProperty('--ry', '0deg');
    });
  });

  // ---------- Entrada: cuando se abre la cortina, el título sube a su lugar y entran las tarjetas ----------
  const seccionEl = $('.seccion-mejora');
  const entrar = () => setTimeout(() => seccionEl.classList.add('arriba'), 350);
  if (document.body.classList.contains('lista')) entrar(); else document.addEventListener('pagina-lista', entrar, { once: true });

  // =========================================================
  // SCROLL: común, como una web. Las capas suben con `translate` directo (no con una
  // variable CSS en .escenario: eso recalculaba los estilos de toda la diapositiva en
  // cada cuadro). La rueda, el touchpad y las teclas mueven la página lo que piden,
  // con un resorte corto. Con un tema de Mejora continua abierto, la rueda y ↑ ↓
  // recorren sus secciones (mejora.js).
  // =========================================================
  const capasQueSuben = [seccionEl, $('.mc-tramo')];
  let bajada = -1;
  document.addEventListener('desplazamiento', (e) => {
    const y = Math.max(0, e.detail.y);
    if (y === bajada) return;
    bajada = y;
    const t = `0 ${(-y).toFixed(1)}px`;
    capasQueSuben.forEach((c) => { c.style.translate = t; });
    seccionEl.classList.toggle('lejos', y > 1800);   // ya quedó muy arriba: no se dibuja
  });

  const MAXIMO = 900 + 2700;                      // pantalla partida (900) + RSE: tablero, números y comunidad (3 × 900)
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