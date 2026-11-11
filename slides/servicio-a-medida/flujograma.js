/* =========================================================
   FLUJOGRAMAS del mapa de distribución (Servicio a medida).
   Al elegir una provincia en el mapa, el panel ofrece "Ver flujograma" (o se vuelve a
   hacer clic en la provincia) y se abre una tarjeta con el esquema de servicio donde
   aparece esa provincia: el mismo dibujo de los flujogramas de la persona (sale de una
   base → pasa por otra base o por un redespachante → llega), con las flechas de esa
   provincia resaltadas y las demás apagadas.
   Datos: hoja "Flujos" del Excel de distribución → datos/distribucion.js → flujos.
   Lo usa diapositiva.js con window.FLUJOGRAMA (hay, abrir, cerrar, abierto).
   ========================================================= */
(function () {
  const D = window.DISTRIBUCION || {};
  const GEO = window.MAPA_ARGENTINA || {};
  const T = D.textos || {};
  const seccion = document.querySelector('.seccion-distribucion');
  if (!seccion) return;

  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const normal = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/^provincia de /, '').replace(/\s+/g, ' ').trim();

  // ---------- Provincias (mismos códigos que el mapa) ----------
  const COD = {};
  Object.entries(GEO).forEach(([k, p]) => { COD[normal(p.nombre)] = k; });
  ['ciudad de buenos aires', 'ciudad autonoma de buenos aires', 'caba', 'capital federal', 'amba', 'gba', 'bs. as.', 'bs as', 'bsas'].forEach((a) => { COD[a] = 'B'; });
  COD['tierra del fuego, antartida e islas del atlantico sur'] = 'V';
  COD['sgo. del estero'] = COD['sgo del estero'] = COD[normal('Santiago del Estero')];
  const codDe = (nombre) => COD[normal(nombre)] || null;
  const nombreDe = (k) => (GEO[k] ? GEO[k].nombre : '');
  // si una flecha no dice a qué provincias atiende, se buscan en su texto ("Int. Santa Fe" → Santa Fe)
  const detectar = (texto) => [...new Set(String(texto || '').split(/[,;/]| y /).map((s) => {
    const n = normal(s).replace(/^(int\.?|interior)( de)? /, '');
    return COD[n] || null;
  }).filter(Boolean))];

  // ---------- Datos ----------
  const bases = (D.bases || []).map((b) => Object.assign({}, b, { id: normal(b.nombre), cod: codDe(b.provincia) }));
  const baseDe = {};
  bases.forEach((b) => { baseDe[b.id] = b; });
  const esRedesp = (s) => normal(s).startsWith('redesp');
  const filas = (D.flujos || []).map((f) => {
    const desde = baseDe[normal(f.desde)];
    if (!desde) return null;
    const pasa = !f.pasaPor ? null : esRedesp(f.pasaPor) ? { tipo: 'redesp' }
      : baseDe[normal(f.pasaPor)] ? { tipo: 'base', base: baseDe[normal(f.pasaPor)] } : { tipo: 'texto', texto: f.pasaPor };
    // "Llega a" con el nombre de una base es esa base (Córdoba → Buenos Aires), salvo que sea la misma
    // por la que pasa (Bs. As. → Córdoba → "Córdoba": ahí es el destino, la provincia)
    const llegaBase = baseDe[normal(f.llegaA)];
    const llega = esRedesp(f.llegaA) ? { tipo: 'redesp' }
      : llegaBase && llegaBase !== desde && !(pasa && pasa.base === llegaBase) ? { tipo: 'base', base: llegaBase } : { tipo: 'destino', texto: f.llegaA };
    let provs = (f.provincias || []).map(codDe).filter(Boolean);
    if (!provs.length) provs = llega.tipo === 'base' ? [llega.base.cod] : detectar(f.llegaA);
    return { esquema: f.esquema || 'Flujo de partes y accesorios', desde, pasa, llega, provs };
  }).filter(Boolean);
  const esquemas = [];
  filas.forEach((f) => {
    let e = esquemas.find((x) => x.nombre === f.esquema);
    if (!e) esquemas.push(e = { nombre: f.esquema, filas: [] });
    e.filas.push(f);
  });
  // una flecha "toca" la provincia si la atiende, sale de ella o pasa por una base que está ahí
  const toca = (f, k) => f.provs.includes(k) || f.desde.cod === k ||
    (f.pasa && f.pasa.base && f.pasa.base.cod === k) || (f.llega.base && f.llega.base.cod === k);
  const esquemasDe = (k) => esquemas.filter((e) => e.filas.some((f) => toca(f, k)))
    // primero los que salen de esta provincia
    .sort((a, b) => (b.filas[0].desde.cod === k) - (a.filas[0].desde.cod === k));

  // ---------- Íconos (sólidos, como los de la marca) ----------
  const ICONO = {
    base: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2 1.5 8v14h21V8L12 2zM6 12h12v10H6z"/><path d="M6 14h12v2H6zM6 18h12v2H6z"/></svg>',
    camion: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 5.5h12.5V17H1zM14.5 9h4.3l3.2 4v4h-7.5z"/><circle cx="5" cy="18.3" r="2.6" stroke="#FFFBF3" stroke-width="1.5"/><circle cx="17.6" cy="18.3" r="2.6" stroke="#FFFBF3" stroke-width="1.5"/></svg>',
    destino: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M1.5 9.4 12 2.6l10.5 6.8V21.5h-21zM4.4 11v8.6h15.2V11z"/><path d="M6.6 15.2l1.3-3h8.2l1.3 3h.9v3.4h-1.6v1h-1.5v-1H8.8v1H7.3v-1H5.7v-3.4zM9 13.3l-.7 1.9h7.4l-.7-1.9z"/></svg>',
    cerrar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.6 4.2 12 10.6l6.4-6.4 1.4 1.4-6.4 6.4 6.4 6.4-1.4 1.4-6.4-6.4-6.4 6.4-1.4-1.4 6.4-6.4-6.4-6.4z"/></svg>'
  };

  // ---------- Tarjeta ----------
  const capa = document.createElement('div');
  capa.className = 'flujo-capa';
  capa.setAttribute('data-sin-arrastre', '');
  capa.setAttribute('aria-hidden', 'true');
  capa.innerHTML =
    '<div class="fl-velo"></div>' +
    '<div class="fl-tarjeta" role="dialog" aria-modal="true" aria-label="Flujograma">' +
    `<button type="button" class="fl-cerrar">Volver al mapa <span>Esc</span>${ICONO.cerrar}</button>` +
    `<div class="fl-cabeza"><p class="fl-ante"><i class="franjitas"></i><span>${esc(T.flujoTitulo || 'Esquema de servicio')}</span></p>` +
    '<h2 class="fl-titulo"></h2>' +
    `<p class="fl-bajada">${esc(T.flujoBajada || '')}</p></div>` +
    '<div class="fl-tabs" role="tablist"></div>' +
    '<div class="fl-esquema"></div>' +
    '<div class="fl-pie">' +
    '<p class="fl-ley"><span><i class="propio"></i>Red propia</span><span><i class="redesp"></i>Redespachante</span><span class="fl-ley-prov"><i class="resalte"></i></span></p>' +
    `<p class="fl-nota">${esc(T.flujoNota || '')}</p></div>` +
    '</div>';
  seccion.appendChild(capa);
  const tabs = capa.querySelector('.fl-tabs'), lienzo = capa.querySelector('.fl-esquema');
  const titulo = capa.querySelector('.fl-titulo'), leyProv = capa.querySelector('.fl-ley-prov');

  let abierto = false, prov = null, lista = [];

  // ---------- Dibujo de un esquema ----------
  // Columnas (px dentro del área del esquema, de 1184 de ancho): base de origen, tronco,
  // camión, base intermedia o redespachante (con su nombre), camión y llegada (con su texto).
  const ANCHO = 1184, ALTO = 440;
  const X = { origen: 74, tronco: 208, cam1: 300, nodo: 440, cam2: 740, fin: 860 };
  function dibujar(e) {
    const n = e.filas.length;
    const fila = Math.min(92, ALTO / n);
    const s = Math.max(28, Math.min(50, fila * .58));          // tamaño de los íconos
    const y0 = (ALTO - n * fila) / 2, yc = ALTO / 2;
    const y = (i) => y0 + (i + .5) * fila;
    const r = Math.min(18, fila / 2);                           // curva del tronco
    const g = 9;                                                // aire entre flecha e ícono
    const letra = Math.max(12.5, Math.min(16, fila * .3));
    const origen = e.filas[0].desde;
    let svg = '', html = '';
    const flecha = (x0, x1, yy) => `<path class="fl-flecha" d="M${x0.toFixed(1)} ${yy.toFixed(1)}H${(x1).toFixed(1)}" pathLength="1"/>`;
    const nodo = (x, yy, tipo, icono, etiqueta, clase) =>
      `<div class="fl-nodo ${tipo} ${clase || ''}" style="left:${x}px;top:${yy.toFixed(1)}px;--s:${s.toFixed(1)}px">${icono}${etiqueta || ''}</div>`;
    const etqBase = (b) => `<p class="fl-etq"><b>${esc(b.provincia)}</b><small>${esc(b.centro || b.nombre)}</small></p>`;
    const etqRedesp = (provs) => `<p class="fl-etq"><b>CD</b><small>Redespachante</small>${provs ? `<em>${esc(provs)}</em>` : ''}</p>`;

    // origen, a la izquierda y centrado
    html += nodo(X.origen, yc, 'propio origen', ICONO.base, `<p class="fl-etq abajo"><b>${esc(origen.provincia)}</b><small>${esc(origen.centro || origen.nombre)}</small></p>`);
    svg += `<path class="fl-tronco" d="M${X.origen + s / 2 + g} ${yc}H${X.tronco}" pathLength="1"/>`;

    e.filas.forEach((f, i) => {
      const yy = y(i), clase = toca(f, prov) ? 'activa' : 'apagada';
      let p = '', h = '';
      // del tronco a la rama (con curva hacia arriba o hacia abajo)
      const d = yy - yc;
      const rama = Math.abs(d) < 1 ? `M${X.tronco} ${yc}` :
        `M${X.tronco} ${yc}V${(yy - Math.sign(d) * r).toFixed(1)}Q${X.tronco} ${yy.toFixed(1)} ${X.tronco + r} ${yy.toFixed(1)}`;
      const directo = !f.pasa;
      const xCam = directo ? X.nodo : X.cam1;
      p += `<path class="fl-flecha" d="${rama}H${(xCam - s / 2 - g).toFixed(1)}" pathLength="1"/>`;
      h += nodo(xCam, yy, 'propio camion', ICONO.camion);
      // paso intermedio
      let rojo2 = true;
      if (!directo) {
        p += flecha(X.cam1 + s / 2 + g, X.nodo - s / 2 - g, yy);
        if (f.pasa.tipo === 'base') h += nodo(X.nodo, yy, 'propio', ICONO.base, etqBase(f.pasa.base));
        else if (f.pasa.tipo === 'redesp') { h += nodo(X.nodo, yy, 'redesp', ICONO.base, etqRedesp()); rojo2 = false; }
        else h += nodo(X.nodo, yy, 'propio', ICONO.base, `<p class="fl-etq"><b>${esc(f.pasa.texto)}</b></p>`);
        p += flecha(X.nodo + 190, X.cam2 - s / 2 - g, yy);
        h += nodo(X.cam2, yy, (rojo2 ? 'propio' : 'redesp') + ' camion', ICONO.camion);
        p += flecha(X.cam2 + s / 2 + g, X.fin - s / 2 - g, yy);
      } else {
        p += flecha(X.nodo + s / 2 + g, X.fin - s / 2 - g, yy);
      }
      // llegada
      if (f.llega.tipo === 'base') h += nodo(X.fin, yy, 'propio fin', ICONO.base, etqBase(f.llega.base));
      else if (f.llega.tipo === 'redesp') h += nodo(X.fin, yy, 'redesp fin', ICONO.base, etqRedesp(f.provs.map(nombreDe).join(', ')));
      else h += nodo(X.fin, yy, 'propio destino fin', ICONO.destino, `<p class="fl-etq"><b>${esc(f.llega.texto)}</b></p>`);
      svg += `<g class="fl-fila ${clase}" style="--i:${i}">${p}</g>`;
      html += `<div class="fl-fila ${clase}" style="--i:${i}">${h}</div>`;
    });
    // las flechas resaltadas van encima (el tronco compartido queda oscuro)
    lienzo.innerHTML = `<svg class="fl-lineas" viewBox="0 0 ${ANCHO} ${ALTO}" aria-hidden="true">` +
      '<defs><marker id="fl-punta" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z"/></marker></defs>' +
      svg.replace(/(<g class="fl-fila activa"[\s\S]*?<\/g>)/g, '').concat((svg.match(/<g class="fl-fila activa"[\s\S]*?<\/g>/g) || []).join('')) +
      '</svg>' + html;
    lienzo.style.setProperty('--letra', letra.toFixed(1) + 'px');
    lienzo.classList.remove('entra'); void lienzo.offsetWidth; lienzo.classList.add('entra');
  }

  function elegir(i) {
    const e = lista[i];
    if (!e) return;
    tabs.querySelectorAll('button').forEach((b, j) => { b.classList.toggle('activo', j === i); b.setAttribute('aria-selected', j === i); });
    dibujar(e);
  }

  function abrir(k) {
    lista = esquemasDe(k);
    if (!lista.length) return false;
    prov = k;
    titulo.innerHTML = `Flujo de partes y accesorios <b>· ${esc(nombreDe(k))}</b>`;
    leyProv.innerHTML = `<i class="resalte"></i>Recorridos de ${esc(nombreDe(k))}`;
    tabs.innerHTML = lista.map((e, i) => `<button type="button" role="tab" data-i="${i}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(e.nombre)}</button>`).join('');
    tabs.classList.toggle('una', lista.length < 2);
    tabs.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => elegir(+b.dataset.i)));
    elegir(0);
    if (window.GUIA) GUIA.usar('servicio-flujograma');   // ya sabe cómo abrirlo
    abierto = true;
    capa.classList.add('abierta');
    capa.setAttribute('aria-hidden', 'false');
    document.body.classList.add('flujo-abierto');
    return true;
  }
  function cerrar() {
    if (!abierto) return;
    abierto = false;
    capa.classList.remove('abierta');
    capa.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('flujo-abierto');
  }
  capa.querySelector('.fl-cerrar').addEventListener('click', cerrar);
  capa.querySelector('.fl-velo').addEventListener('click', cerrar);
  // Esc cierra la tarjeta antes que nada (se registra antes que diapositiva.js); ← → cambian de esquema;
  // con la tarjeta abierta la rueda no mueve la página
  addEventListener('keydown', (e) => {
    if (!abierto) return;
    if (e.key === 'Escape') { e.stopImmediatePropagation(); e.preventDefault(); cerrar(); return; }
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const actual = [...tabs.querySelectorAll('button')].findIndex((b) => b.classList.contains('activo'));
      const sig = actual + (e.key === 'ArrowRight' ? 1 : -1);
      if (sig >= 0 && sig < lista.length) elegir(sig);
    }
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End', 'ArrowRight', 'ArrowLeft'].includes(e.key)) { e.stopImmediatePropagation(); e.preventDefault(); }
  }, true);
  addEventListener('wheel', (e) => { if (abierto) { e.stopImmediatePropagation(); e.preventDefault(); } }, { capture: true, passive: false });

  window.FLUJOGRAMA = {
    hay: (k) => esquemasDe(k).length > 0,
    abrir, cerrar,
    get abierto() { return abierto; }
  };
})();
