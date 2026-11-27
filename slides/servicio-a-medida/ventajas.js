/* =========================================================
   TABLEROS DE BUSINESS INTELLIGENCE + VENTAJAS Y OPORTUNIDADES
   Una sola pantalla roja (.sv-bi), después de la simulación de logística
   inversa. A la izquierda, el encabezado (cambia según la pestaña) y tres
   pestañas; a la derecha, lo que muestra cada una:
   • Entregas a concesionarios: ventana de tablero con indicadores que
     cuentan y OTD por mes.
     Arriba, en la barra de la ventana, tres filtros: por mes (el gráfico de
     OTD), por provincia (% de entregas en tiempo de cada una, en dos columnas
     de barras que se ordenan por % o por cantidad) y por concesionario (tabla
     de concesionarios inventados que se ordena tocando las columnas).
   • Logística inversa: cumplimiento, medidor y estados por provincia (al
     tocar una barra, todo pasa a esa provincia).
   • Ventajas y oportunidades: seis columnas como la diapositiva de la
     persona; la que tiene el cursor se abre y muestra su texto. Si nadie
     toca nada, se van abriendo solas de a una.
   Textos y números en datos/servicio.js → tableros y ventajas.
   ========================================================= */
(function () {
  const SV = window.SV;
  if (!SV) return;
  const { S, txt, esc } = SV;
  const fmt = (n, dec) => Number(n).toLocaleString('es-AR', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });

  // Íconos sólidos (24 × 24)
  const ICONOS = {
    ruta: '<path fill-rule="evenodd" d="M6 1.5a4 4 0 0 0-4 4c0 3 4 7.5 4 7.5s4-4.5 4-7.5a4 4 0 0 0-4-4zm0 2.6a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z"/><path fill-rule="evenodd" d="M18 8.5a4 4 0 0 0-4 4c0 3 4 7.5 4 7.5s4-4.5 4-7.5a4 4 0 0 0-4-4zm0 2.6a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z"/><circle cx="5.6" cy="16.2" r="1.15"/><circle cx="7.4" cy="19.4" r="1.15"/><circle cx="10.7" cy="20.9" r="1.15"/><circle cx="14.1" cy="21.2" r="1.15"/>',
    escudo: '<path fill-rule="evenodd" d="M12 1.5 3.5 4.8v6.1c0 5.2 3.6 9.6 8.5 11.6 4.9-2 8.5-6.4 8.5-11.6V4.8zm-1.3 14.6-4-4 1.6-1.6 2.4 2.4 5-5 1.6 1.6z"/>',
    barras: '<path d="M2.5 20.2h19V22h-19zM4.2 12.5h3.6v6.3H4.2zM10.2 7.5h3.6v11.3h-3.6zM16.2 2.5h3.6v16.3h-3.6z"/>',
    arbol: '<path d="M12 1.8a5.1 5.1 0 0 0-4.9 3.7A4.6 4.6 0 0 0 4.4 14a4.6 4.6 0 0 0 4.2 2.6h2.2V22h2.4v-5.4h2.2a4.6 4.6 0 0 0 4.2-2.6 4.6 4.6 0 0 0-2.7-8.5A5.1 5.1 0 0 0 12 1.8z"/>',
    ciclo: '<path d="M12 2.6a9.4 9.4 0 0 1 8.9 6.4h-2.4A7.1 7.1 0 0 0 6.3 7.8l2.1 1.2-5.8 2.5-.5-6.3 2 1.1A9.4 9.4 0 0 1 12 2.6zM3.1 15h2.4a7.1 7.1 0 0 0 12.2 1.2l-2.1-1.2 5.8-2.5.5 6.3-2-1.1A9.4 9.4 0 0 1 3.1 15z"/><path d="M12 8.4l3.6 1.8L12 12 8.4 10.2zM8 11.1l3.4 1.7v3.8L8 14.9zM16 11.1v3.8l-3.4 1.7v-3.8z"/>',
    cabeza: '<path fill-rule="evenodd" d="M10.6 1.8c-4.6 0-8 3.4-8 7.9 0 2.4 1 4.5 2.8 5.9V22h8.6v-3h2.6a1.9 1.9 0 0 0 1.9-1.9v-3l2.3-1-2.3-4.1C17.9 4.8 14.8 1.8 10.6 1.8zm-.1 3.3 1 1.5 1.8-.3.3 1.8 1.5 1-1 1.5.6 1.7-1.7.6-.3 1.8-1.8-.4-1.4 1.1-1.1-1.5-1.8.1.1-1.8-1.5-1 1.2-1.4-.6-1.7 1.7-.5.4-1.8 1.8.5zm0 3.4a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z"/>',
    estrella: '<path d="M12 1.8 14.9 8l6.8.8-5 4.6 1.4 6.7L12 16.7 5.9 20.1l1.4-6.7-5-4.6L9.1 8z"/>',
    mapa: '<path fill-rule="evenodd" d="M12 1.5a7 7 0 0 0-7 7c0 5.2 7 14 7 14s7-8.8 7-14a7 7 0 0 0-7-7zm0 4.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6z"/>',
    local: '<path d="M2 10 4 3h16l2 7a3 3 0 0 1-5 2.2A3 3 0 0 1 12 12a3 3 0 0 1-5 .2A3 3 0 0 1 2 10z"/><path fill-rule="evenodd" d="M3.5 13.6V22h17v-8.4a4.6 4.6 0 0 1-3.5-.5 4.6 4.6 0 0 1-5 .3 4.6 4.6 0 0 1-5-.3 4.6 4.6 0 0 1-3.5.5zM9.5 15.5h5V22h-5z"/>'
  };
  const icono = (n, clase) => `<svg class="${clase || ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONOS[n] || ICONOS.barras}</svg>`;

  const seccion = document.querySelector('.sv-bi');
  const T = S.tableros, V = S.ventajas || {};
  if (!seccion || !T) return;
  const E = T.entregas || {}, L = T.inversa || {};
  const TP = T.provincias || {}, TC = T.concesionarios || {};
  const PROV_E = TP.lista || [], CONC = TC.lista || [];
  const PROV = L.provincias || [];
  const MESES = E.meses || [];
  const ITEMS = V.items || [];

  const cab = (d, clase) => `<div class="bi-cab ${clase}"><p class="bi-ante">${txt(d.antetitulo)}</p><h2 class="bi-titulo">${txt(d.titulo)}</h2>` +
    `<p class="bi-bajada">${txt(d.bajada)}</p></div>`;
  seccion.insertAdjacentHTML('beforeend',
    `<div class="bi-izq"><div class="bi-cabs ent" style="--i:0">${cab(T, 'bi-cab-t actual')}${ITEMS.length ? cab(V, 'bi-cab-v') : ''}</div>` +
    `<div class="bi-tabs ent" style="--i:2" role="tablist">` +
    `<button type="button" data-t="entregas" role="tab">${icono('barras')}<span>${txt(E.pestana)}</span></button>` +
    `<button type="button" data-t="inversa" role="tab">${SV.ICONOS.inversa.replace('<svg ', '<svg aria-hidden="true" ')}<span>${txt(L.pestana)}</span></button>` +
    (ITEMS.length ? `<button type="button" data-t="ventajas" role="tab">${icono('estrella')}<span>${txt(V.pestana || 'Ventajas y oportunidades')}</span></button>` : '') +
    `</div><p class="bi-nota ent" style="--i:3">${txt(T.nota)}</p></div>` +
    `<div class="bi-area ent" style="--i:2">` +
    `<div class="bi-ventana"><div class="bi-barra"><img src="../../img/marca/logo-cargo.svg" alt="CARGO"><b class="bi-vtitulo"></b>` +
    // en Entregas a concesionarios, pestañas para filtrar (pedido de la persona): por mes, por
    // provincia o por concesionario (destino)
    `<div class="bi-sub" role="tablist"><button type="button" data-v="mes" role="tab">${icono('barras')}${txt(E.porMes || 'Por mes')}</button>` +
    (PROV_E.length ? `<button type="button" data-v="provincias" role="tab">${icono('mapa')}${txt(TP.pestana || 'Por provincia')}</button>` : '') +
    (CONC.length ? `<button type="button" data-v="concesionarios" role="tab">${icono('local')}${txt(TC.pestana || 'Por concesionario')}</button>` : '') +
    `</div><span>${txt(T.actualizado)}</span></div>` +
    `<div class="bi-cuerpo"></div><div class="bi-tip"></div></div>` +
    `<ul class="vn-cols">${ITEMS.map((it, i) => `<li class="vn-col" style="--i:${i}" data-i="${i}" tabindex="-1">
        <span class="vn-num">${String(i + 1).padStart(2, '0')}</span>
        ${icono(it.icono, 'vn-ico')}
        <p class="vn-vert"><span>${txt(it.titulo)}</span></p>
        <h3 class="vn-nombre">${txt(it.titulo)}</h3>
        <div class="vn-cuerpo"><p>${txt(it.texto)}</p>
          ${(it.lista || []).length ? `<ul class="vn-lista">${it.lista.map((l) => `<li>${txt(l)}</li>`).join('')}</ul>` : ''}
          ${it.irATableros ? `<button type="button" class="vn-ir">${txt(V.botonTableros)}<svg viewBox="0 0 24 24"><path d="M13 5.6 11.6 7l4 4H4v2h11.6l-4 4 1.4 1.4 6.4-6.4z"/></svg></button>` : ''}
        </div>
        ${icono(it.icono, 'vn-fondo-ico')}
      </li>`).join('')}</ul></div>`);

  const cuerpo = seccion.querySelector('.bi-cuerpo'), vtitulo = seccion.querySelector('.bi-vtitulo');
  const tip = seccion.querySelector('.bi-tip');
  const tabs = [...seccion.querySelectorAll('.bi-tabs button')];
  const cabT = seccion.querySelector('.bi-cab-t'), cabV = seccion.querySelector('.bi-cab-v');
  let actual = null, enVista = false, visto = false;

  // Los títulos grandes se achican si no entran en la columna (OPORTUNIDADES es largo)
  function ajustarTitulos() {
    seccion.querySelectorAll('.bi-titulo').forEach((h) => {
      h.style.fontSize = '';
      let t = parseFloat(getComputedStyle(h).fontSize);
      while (h.scrollWidth > h.clientWidth + 1 && t > 40) { t -= 2; h.style.fontSize = t + 'px'; }
    });
  }
  ajustarTitulos();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(ajustarTitulos);

  // números que cuentan hasta su valor
  function contar(el, hasta, dec, sufijo) {
    const t0 = performance.now(), dur = 1300, desde = +(el.dataset.v || 0);
    el.dataset.v = hasta;
    const paso = (ahora) => {
      const k = Math.min(1, (ahora - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(desde + (hasta - desde) * e, dec) + (sufijo || '');
      if (k < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }
  // globito con el detalle (coordenadas dentro de la ventana)
  const ventana = seccion.querySelector('.bi-ventana');
  function mostrarTip(html, el) {
    const v = ventana.getBoundingClientRect(), r = el.getBoundingClientRect(), k = v.width / ventana.offsetWidth;
    tip.innerHTML = html;
    tip.style.left = ((r.left + r.width / 2 - v.left) / k) + 'px';
    tip.style.top = ((r.top - v.top) / k) + 'px';
    tip.classList.add('visible');
  }
  const ocultarTip = () => tip.classList.remove('visible');
  // con el dedo, el globito queda a la vista hasta el próximo toque
  // (el toque dispara pointerenter antes que pointerdown: el elemento tocado ya se marcó y no se apaga)
  ventana.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    const tocado = e.target.closest('.bi-punto, .bi-col');
    ventana.querySelectorAll('.bi-punto.activo, .bi-col.activo').forEach((el) => { if (el !== tocado) el.classList.remove('activo'); });
    if (!tocado) ocultarTip();
  }, true);

  // ---------- Pestaña 1: entregas a concesionarios ----------
  // Arriba los tres indicadores (los mismos en los tres filtros) y abajo el gráfico del filtro
  // elegido en la barra de la ventana: por mes, por provincia o por concesionario.
  const subs = [...seccion.querySelectorAll('.bi-sub button')];
  let verPor = 'mes';
  function vistaEntregas() {
    vtitulo.innerHTML = txt(E.titulo);
    cuerpo.innerHTML =
      `<div class="bi-kpis">${(E.indicadores || []).map((k, i) => `<div class="bi-kpi${k.porcentaje ? ' destacado' : ''}" style="--i:${i}"><b data-k="${i}">0</b><span>${txt(k.nombre)}</span></div>`).join('')}</div>` +
      '<div class="bi-ent"></div>';
    cuerpo.querySelectorAll('.bi-kpi b').forEach((b) => {
      const k = E.indicadores[+b.dataset.k];
      contar(b, +k.valor, k.porcentaje ? 2 : 0, k.porcentaje ? ' %' : '');
    });
    pintarEnt();
  }
  function pintarEnt() {
    const cont = cuerpo.querySelector('.bi-ent');
    if (!cont) return;
    subs.forEach((b) => { const si = b.dataset.v === verPor; b.classList.toggle('activo', si); b.setAttribute('aria-selected', si); });
    ocultarTip();
    cont.classList.remove('entra'); void cont.offsetWidth; cont.classList.add('entra');
    ({ provincias: grafProvincias, concesionarios: grafConcesionarios }[verPor] || grafMes)(cont);
  }
  subs.forEach((b) => b.addEventListener('click', () => { if (verPor !== b.dataset.v) { verPor = b.dataset.v; pintarEnt(); } }));

  // OTD por mes
  function grafMes(cont) {
    const W = 900, H = 420, M = { l: 58, r: 24, t: 30, b: 40 };
    // dos líneas (pedido de la persona): la expectativa (punteada) y el resultado real; el mes
    // en que el resultado queda abajo de la expectativa se marca en ámbar
    const conObj = MESES.some((m) => m.objetivo !== undefined && m.objetivo !== '');
    const vals = MESES.map((m) => +m.otd).concat(conObj ? MESES.map((m) => +m.objetivo) : []);
    // escala ajustada a los valores (de 0,25 o 0,5 puntos), con un poco de aire arriba y abajo
    const rango = Math.max(...vals) - Math.min(...vals);
    const PASO = rango <= 1.2 ? .25 : rango <= 3 ? .5 : 1;
    const min = Math.floor((Math.min(...vals) - .1) / PASO) * PASO, max = Math.ceil((Math.max(...vals) + .1) / PASO) * PASO;
    const x = (i) => M.l + (MESES.length > 1 ? i * (W - M.l - M.r) / (MESES.length - 1) : (W - M.l - M.r) / 2);
    const y = (v) => M.t + (1 - (v - min) / (max - min)) * (H - M.t - M.b);
    const trazo = (k) => MESES.map((m, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(m[k]).toFixed(1)}`).join('');
    const linea = trazo('otd');
    const area = `${linea}L${x(MESES.length - 1).toFixed(1)} ${H - M.b}L${x(0).toFixed(1)} ${H - M.b}Z`;
    const abajo = (m) => conObj && +m.otd < +m.objetivo;
    const guias = [];
    for (let v = min; v <= max + 1e-9; v += PASO) {
      const dec = Math.abs(v * 4 - Math.round(v) * 4) < 1e-6 ? 0 : Math.abs(v * 2 - Math.round(v * 2)) < 1e-6 ? 1 : 2;
      guias.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text x="${M.l - 10}" y="${(y(v) + 4).toFixed(1)}">${fmt(v, dec)}%</text>`);
    }
    cont.innerHTML =
      `<div class="bi-graf"><p class="bi-gtit">${txt(E.graficoTitulo)}` +
      (conObj ? `<span class="bi-series"><span class="real"><i></i>${txt(E.serieReal || 'Resultado')}</span><span class="obj"><i></i>${txt(E.serieObjetivo || 'Expectativa')}</span></span>` : '') + '</p>' +
      `<svg class="bi-linea" viewBox="0 0 ${W} ${H}"><g class="bi-guias">${guias.join('')}</g>` +
      `<path class="bi-area" d="${area}"/>` +
      (conObj ? `<path class="bi-obj" d="${trazo('objetivo')}"/>` + MESES.map((m, i) => `<circle class="bi-obj-p" cx="${x(i).toFixed(1)}" cy="${y(m.objetivo).toFixed(1)}" r="3.5" style="--i:${i}"/>`).join('') : '') +
      `<path class="bi-trazo" d="${linea}" pathLength="1"/>` +
      MESES.map((m, i) => `<g class="bi-punto${abajo(m) ? ' abajo' : ''}" data-i="${i}" style="--i:${i}"><rect x="${(x(i) - 40).toFixed(1)}" y="${M.t}" width="80" height="${H - M.t - M.b}"/>` +
        `<circle cx="${x(i).toFixed(1)}" cy="${y(m.otd).toFixed(1)}" r="6"/><text class="bi-mes" x="${x(i).toFixed(1)}" y="${H - 14}">${esc(m.mes)}</text>` +
        // el valor va arriba del punto; si quedó abajo de la expectativa, debajo (así no la pisa)
        `<text class="bi-val" x="${x(i).toFixed(1)}" y="${(y(m.otd) + (abajo(m) ? 24 : -14)).toFixed(1)}">${fmt(m.otd, 2)}%</text></g>`).join('') +
      '</svg></div>';
    cont.querySelectorAll('.bi-punto').forEach((g) => {
      const m = MESES[+g.dataset.i];
      const dif = conObj ? +m.otd - +m.objetivo : 0;
      const detalle = conObj
        ? `<span>${txt(E.serieReal || 'Resultado')} <strong>${fmt(m.otd, 2)} %</strong></span><span>${txt(E.serieObjetivo || 'Expectativa')} ${fmt(m.objetivo, 2)} %</span>` +
          `<span class="${dif < 0 ? 'bi-dif-abajo' : 'bi-dif-ok'}">${dif < 0 ? '▼' : '▲'} ${dif >= 0 ? '+' : '−'}${fmt(Math.abs(dif), 2)} pts</span>`
        : `<span>OTD <strong>${fmt(m.otd, 2)} %</strong></span>`;
      g.addEventListener('pointerenter', () => { g.classList.add('activo'); mostrarTip(`<b>${esc(m.mes)}</b>${detalle}<span>${fmt(m.kg)} kg distribuidos</span>`, g.querySelector('circle')); });
      g.addEventListener('pointerleave', (e) => { if (e.pointerType === 'touch') return; g.classList.remove('activo'); ocultarTip(); });
    });
  }

  // ---------- Pestaña 2: logística inversa ----------
  let prov = -1, verTiempo = true, verDemora = true;
  function vistaInversa() {
    vtitulo.innerHTML = txt(L.titulo);
    prov = -1; verTiempo = verDemora = true;
    const W = 690, H = 380, M = { l: 34, r: 8, t: 22, b: 34 };
    const maxV = Math.max(1, ...PROV.map((p) => p.enTiempo + p.demorado));
    const tope = Math.ceil(maxV / 20) * 20;
    const paso = (W - M.l - M.r) / Math.max(PROV.length, 1), ancho = Math.min(22, paso * .7);
    const y = (v) => M.t + (1 - v / tope) * (H - M.t - M.b);
    const guias = [];
    for (let v = 0; v <= tope; v += tope / 4) guias.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text x="${M.l - 6}" y="${(y(v) + 4).toFixed(1)}">${v}</text>`);
    cuerpo.innerHTML =
      `<div class="bi-inv"><aside class="bi-lado">` +
      `<p class="bi-et">Provincia</p><button type="button" class="bi-prov">${txt(L.todas)}</button>` +
      `<p class="bi-et">Estado</p><button type="button" class="bi-ley tiempo activo"><i></i>${txt(L.enTiempo)}</button><button type="button" class="bi-ley demora activo"><i></i>${txt(L.demorado)}</button>` +
      `<p class="bi-ayuda">${txt(L.ayuda)}</p></aside>` +
      `<div class="bi-der"><div class="bi-kpis dos"><div class="bi-kpi destacado"><b class="bi-cumple">0</b><span>${txt(L.cumplimiento)}</span></div>` +
      `<div class="bi-kpi bi-medidor"><svg viewBox="0 0 200 112"><path class="bi-m-fondo" d="M20 100a80 80 0 0 1 160 0"/><path class="bi-m-valor" d="M20 100a80 80 0 0 1 160 0" pathLength="100"/></svg><b class="bi-en-tiempo">0</b><span>${txt(L.solicitudes)}</span></div></div>` +
      `<div class="bi-graf"><p class="bi-gtit">${txt(L.graficoTitulo)}</p><svg class="bi-barras" viewBox="0 0 ${W} ${H}"><g class="bi-guias">${guias.join('')}</g>` +
      PROV.map((p, i) => {
        const cx = M.l + paso * (i + .5), x0 = (cx - ancho / 2).toFixed(1);
        const yT = y(p.enTiempo), yD = y(p.enTiempo + p.demorado);
        return `<g class="bi-col" data-i="${i}" style="--i:${i}"><rect class="bi-zona" x="${(cx - paso / 2).toFixed(1)}" y="${M.t}" width="${paso.toFixed(1)}" height="${H - M.t - M.b + 22}"/>` +
          `<rect class="bi-b-tiempo" x="${x0}" y="${yT.toFixed(1)}" width="${ancho.toFixed(1)}" height="${(H - M.b - yT).toFixed(1)}" rx="2"/>` +
          (p.demorado ? `<rect class="bi-b-demora" x="${x0}" y="${yD.toFixed(1)}" width="${ancho.toFixed(1)}" height="${(yT - yD).toFixed(1)}" rx="2"/>` : '') +
          `<text class="bi-cnt" x="${cx.toFixed(1)}" y="${(yD - 6).toFixed(1)}">${p.enTiempo + p.demorado}</text>` +
          `<text class="bi-pr" x="${cx.toFixed(1)}" y="${H - 14}">${esc(p.corto)}</text></g>`;
      }).join('') + '</svg></div></div></div>';

    const btnProv = cuerpo.querySelector('.bi-prov');
    const cols = [...cuerpo.querySelectorAll('.bi-col')];
    function actualizar() {
      const lista = prov < 0 ? PROV : [PROV[prov]];
      const t = lista.reduce((s, p) => s + p.enTiempo, 0), d = lista.reduce((s, p) => s + p.demorado, 0);
      const pct = t + d ? t / (t + d) * 100 : 0;
      contar(cuerpo.querySelector('.bi-cumple'), pct, 2, ' %');
      contar(cuerpo.querySelector('.bi-en-tiempo'), t, 0);
      cuerpo.querySelector('.bi-m-valor').style.strokeDashoffset = (100 - pct).toFixed(2);
      btnProv.innerHTML = prov < 0 ? txt(L.todas) : `${esc(PROV[prov].nombre)}<i>×</i>`;
      btnProv.classList.toggle('elegida', prov >= 0);
      cols.forEach((c, k) => c.classList.toggle('apagada', prov >= 0 && k !== prov));
    }
    cols.forEach((c, i) => {
      const p = PROV[i];
      c.addEventListener('pointerenter', () => { c.classList.add('activo'); mostrarTip(`<b>${esc(p.nombre)}</b><span><i class="tiempo"></i>${txt(L.enTiempo)}: <strong>${p.enTiempo}</strong></span><span><i class="demora"></i>${txt(L.demorado)}: <strong>${p.demorado}</strong></span>`, c.querySelector('.bi-b-demora') || c.querySelector('.bi-b-tiempo')); });
      c.addEventListener('pointerleave', (e) => { if (e.pointerType === 'touch') return; c.classList.remove('activo'); ocultarTip(); });
      c.addEventListener('click', () => { prov = prov === i ? -1 : i; actualizar(); });
    });
    btnProv.addEventListener('click', () => { if (prov >= 0) { prov = -1; actualizar(); } });
    cuerpo.querySelectorAll('.bi-ley').forEach((b) => b.addEventListener('click', () => {
      if (b.classList.contains('tiempo')) verTiempo = !verTiempo; else verDemora = !verDemora;
      if (!verTiempo && !verDemora) { verTiempo = verDemora = true; }       // siempre queda algo a la vista
      cuerpo.querySelector('.bi-ley.tiempo').classList.toggle('activo', verTiempo);
      cuerpo.querySelector('.bi-ley.demora').classList.toggle('activo', verDemora);
      cuerpo.querySelector('.bi-barras').classList.toggle('sin-tiempo', !verTiempo);
      cuerpo.querySelector('.bi-barras').classList.toggle('sin-demora', !verDemora);
    }));
    actualizar();
  }

  // ---------- Entregas por provincia y por concesionario: filtros de "Entregas a concesionarios"
  // (pedido de la persona) ----------
  const META = +TP.expectativa || 98;
  const enTiempoDe = (x) => Math.round(x.entregas * x.otd / 100);
  // barra de "% en tiempo": la escala va de un poco menos que el peor valor a 100 %; la línea
  // punteada es la expectativa
  function escalaDe(l) {
    const min = Math.floor(Math.min(META, ...l.map((x) => +x.otd)) - .5);
    return { min, pos: (v) => Math.max(0, Math.min(100, (v - min) / (100 - min) * 100)).toFixed(2) };
  }
  const barra = (x, e) => `<span class="bi-pb" style="--meta:${e.pos(META)}%"><i style="--w:${e.pos(x.otd)}%"></i></span>`;
  const tipDe = (x, extra) => `<b>${esc(x.nombre)}</b>${extra || ''}<span>Entregas: <strong>${fmt(x.entregas)}</strong></span>` +
    `<span>En tiempo: <strong>${fmt(enTiempoDe(x))}</strong></span><span class="${x.otd < META ? 'bi-dif-abajo' : 'bi-dif-ok'}">${fmt(x.otd, 2)} % · expectativa ${fmt(META)} %</span>`;
  function conTip(el, x, extra) {
    el.addEventListener('pointerenter', () => { el.classList.add('activo'); mostrarTip(tipDe(x, extra), el.querySelector('.bi-pb i') || el); });
    el.addEventListener('pointerleave', (e) => { if (e.pointerType === 'touch') return; el.classList.remove('activo'); ocultarTip(); });
  }

  let ordenProv = 'otd';
  function grafProvincias(cont) {
    const e = escalaDe(PROV_E);
    cont.innerHTML =
      `<div class="bi-graf bi-pv"><p class="bi-gtit">${txt(TP.graficoTitulo)}` +
      `<span class="bi-series"><span class="obj"><i></i>${txt(E.serieObjetivo || 'Expectativa')} ${fmt(META)} %</span></span>` +
      `<span class="bi-orden"><small>${txt(TP.ordenarPor || 'Ordenar por')}</small>` +
      `<button type="button" data-o="otd">${txt(TP.porPorcentaje || '% en tiempo')}</button><button type="button" data-o="entregas">${txt(TP.porEntregas || 'Entregas')}</button></span></p>` +
      `<div class="bi-pv-lista"></div><p class="bi-escala">Escala de ${fmt(e.min)} % a 100 %</p></div>`;
    const lista = cont.querySelector('.bi-pv-lista');
    const botones = [...cont.querySelectorAll('.bi-orden button')];
    function pintar() {
      botones.forEach((b) => b.classList.toggle('activo', b.dataset.o === ordenProv));
      const orden = PROV_E.map((x, i) => i).sort((a, b) => PROV_E[b][ordenProv] - PROV_E[a][ordenProv]);
      lista.style.gridTemplateRows = `repeat(${Math.ceil(orden.length / 2)}, 1fr)`;
      lista.innerHTML = orden.map((i, k) => {
        const x = PROV_E[i];
        return `<div class="bi-pv-fila${x.otd < META ? ' abajo' : ''}" style="--i:${k}" data-i="${i}"><em>${k + 1}</em><span>${esc(x.nombre)}</span>${barra(x, e)}<b>${fmt(x.otd, 2)} %</b></div>`;
      }).join('');
      lista.querySelectorAll('.bi-pv-fila').forEach((f) => conTip(f, PROV_E[+f.dataset.i]));
    }
    botones.forEach((b) => b.addEventListener('click', () => { if (ordenProv !== b.dataset.o) { ordenProv = b.dataset.o; ocultarTip(); pintar(); } }));
    pintar();
  }

  let ordenConc = { k: 'otd', dir: -1 };
  function grafConcesionarios(cont) {
    const e = escalaDe(CONC);
    const COLS = ['nombre', 'provincia', 'entregas', 'tiempo', 'otd'];
    const nombres = TC.columnas || ['Concesionario', 'Provincia', 'Entregas', 'En tiempo', '% en tiempo'];
    cont.innerHTML =
      `<div class="bi-graf bi-cc"><p class="bi-gtit">${txt(TC.graficoTitulo)}<span class="bi-cc-ayuda">${txt(TC.ayuda)}</span></p>` +
      `<div class="bi-cc-tabla"><div class="bi-cc-fila bi-cc-enc">${COLS.map((k, i) => `<button type="button" data-k="${k}">${txt(nombres[i])}<i></i></button>`).join('')}</div>` +
      '<div class="bi-cc-filas"></div></div></div>';
    const filas = cont.querySelector('.bi-cc-filas');
    const enc = [...cont.querySelectorAll('.bi-cc-enc button')];
    const valor = (x, k) => (k === 'tiempo' ? enTiempoDe(x) : x[k]);
    function pintar() {
      enc.forEach((b) => { b.classList.toggle('activo', b.dataset.k === ordenConc.k); b.classList.toggle('sube', ordenConc.dir > 0); });
      const orden = CONC.map((x, i) => i).sort((a, b) => {
        const va = valor(CONC[a], ordenConc.k), vb = valor(CONC[b], ordenConc.k);
        const c = typeof va === 'string' ? va.localeCompare(vb, 'es', { numeric: true }) : va - vb;
        return c * ordenConc.dir;
      });
      filas.innerHTML = orden.map((i, k) => {
        const x = CONC[i];
        return `<div class="bi-cc-fila${x.otd < META ? ' abajo' : ''}" style="--i:${k}" data-i="${i}"><span><b>${esc(x.nombre)}</b></span><span>${esc(x.provincia)}</span>` +
          `<span>${fmt(x.entregas)}</span><span>${fmt(enTiempoDe(x))}</span><span class="bi-cc-otd">${barra(x, e)}<b>${fmt(x.otd, 2)} %</b></span></div>`;
      }).join('');
      filas.querySelectorAll('.bi-cc-fila').forEach((f) => conTip(f, CONC[+f.dataset.i], `<span>${esc(CONC[+f.dataset.i].provincia)}</span>`));
    }
    // un clic ordena por esa columna; otro clic, al revés (los textos de la A a la Z, los números de mayor a menor)
    enc.forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.k;
      ordenConc = ordenConc.k === k ? { k, dir: -ordenConc.dir } : { k, dir: k === 'nombre' || k === 'provincia' ? 1 : -1 };
      ocultarTip();
      pintar();
    }));
    pintar();
  }

  // ---------- Pestaña 3: ventajas y oportunidades (columnas que se abren) ----------
  const vcols = [...seccion.querySelectorAll('.vn-col')];
  let activa = -1, uso = -1e9;
  function abrir(i) {
    if (i === activa) return;
    activa = i;
    vcols.forEach((c, k) => c.classList.toggle('abierta', k === i));
  }
  vcols.forEach((c, i) => {
    const elegirCol = () => { uso = performance.now(); abrir(i); };
    c.addEventListener('pointerenter', elegirCol);
    c.addEventListener('click', elegirCol);
    c.addEventListener('focus', elegirCol);
  });
  seccion.addEventListener('pointermove', () => { uso = performance.now(); });
  const ir = seccion.querySelector('.vn-ir');
  if (ir) ir.addEventListener('click', (e) => { e.stopPropagation(); elegir('entregas'); });
  abrir(0);
  // si nadie toca nada, se abren solas de a una (solo con la pestaña a la vista)
  setInterval(() => {
    if (!enVista || actual !== 'ventajas' || performance.now() - uso < 9000 || !vcols.length) return;
    abrir((activa + 1) % vcols.length);
  }, 5200);

  function elegir(t) {
    if (t === actual) return;
    actual = t;
    seccion.dataset.t = t;
    tabs.forEach((b) => { const si = b.dataset.t === t; b.classList.toggle('activo', si); b.setAttribute('aria-selected', si); });
    // encabezado de la izquierda: el de los tableros o el de las ventajas
    if (cabV) { cabT.classList.toggle('actual', t !== 'ventajas'); cabV.classList.toggle('actual', t === 'ventajas'); }
    vcols.forEach((c) => { c.tabIndex = t === 'ventajas' ? 0 : -1; });
    ocultarTip();
    if (t === 'ventajas') { uso = performance.now(); return; }
    cuerpo.classList.remove('entra'); void cuerpo.offsetWidth; cuerpo.classList.add('entra');
    (t === 'inversa' ? vistaInversa : vistaEntregas)();
  }
  tabs.forEach((b) => b.addEventListener('click', () => elegir(b.dataset.t)));

  // Guía (compartido/guia.js): los meses del gráfico, las pestañas, las barras y las columnas
  if (window.GUIA) {
    const medio = (sel) => { const l = cuerpo.querySelectorAll(sel); return l[Math.floor(l.length / 2)]; };
    const tab = (t) => tabs.find((b) => b.dataset.t === t);
    GUIA.pista({ id: 'servicio-bi-puntos', texto: 'tablerosPuntos', objetivo: () => medio('.bi-punto circle'), zona: '.bi-punto', tipo: 'pasar', lado: 'arriba', espera: 2.4, activa: () => actual === 'entregas' && verPor === 'mes' });
    // los filtros de la barra (por provincia, por concesionario)
    const sub = (v) => subs.find((b) => b.dataset.v === v);
    if (sub('provincias')) GUIA.pista({ id: 'servicio-bi-filtros', texto: 'tablerosFiltros', objetivo: () => sub('provincias'), punto: [.5, .75], zona: '.bi-sub button', lado: 'abajo', espera: 4, activa: () => actual === 'entregas' && verPor === 'mes' });
    GUIA.pista({ id: 'servicio-bi-pestana', texto: 'tablerosPestana', objetivo: () => tab('inversa'), punto: [.88, .55], zona: '.bi-tabs button[data-t="inversa"]', lado: 'der', espera: 1.5, activa: () => actual !== 'inversa' });
    if (cabV) GUIA.pista({ id: 'servicio-bi-ventajas', texto: 'tablerosVentajas', objetivo: () => tab('ventajas'), punto: [.88, .55], zona: '.bi-tabs button[data-t="ventajas"]', lado: 'der', espera: 1.5, activa: () => actual !== 'ventajas' });
    GUIA.pista({ id: 'servicio-bi-barras', texto: 'tablerosBarras', objetivo: () => medio('.bi-col .bi-b-tiempo'), punto: [.5, .3], zona: '.bi-col', lado: 'arriba', espera: 1.5, activa: () => actual === 'inversa' });
    if (vcols.length > 1) GUIA.pista({ id: 'servicio-ventajas', texto: 'ventajas', objetivo: () => vcols[(activa + 1) % vcols.length], punto: [.5, .45], zona: '.vn-col', tipo: 'pasar', lado: 'abajo', espera: 1.8, activa: () => actual === 'ventajas' });
  }

  // Aparición (.visible la primera vez, .en-vista mientras está en pantalla); la primera vez
  // arranca la pestaña de entregas (así los números cuentan en pantalla)
  new IntersectionObserver((en) => {
    const v = en[0].isIntersecting;
    enVista = v;
    seccion.classList.toggle('en-vista', v);
    if (v) seccion.classList.add('visible');
    if (v && !visto) { visto = true; setTimeout(() => { if (!actual) elegir('entregas'); }, 450); }
  }, { threshold: .35 }).observe(seccion);
})();
