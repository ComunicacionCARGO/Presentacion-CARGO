/* =========================================================
   VIAJES Y ENTREGA — paradas 4 y 5 del recorrido de ¿Cómo lo hacemos?
   (tms.js deja la vista en SV.tms.vistas.despachos y dice el modo):
   - Gestión de viajes (modo "viajes"): a la izquierda la planchada simplificada (un
     stage por ruta, como en la parada anterior) llena los camiones de su ruta, que salen; a la derecha, la carta de porte
     emitida al despachar, todavía sin conformar.
   - Entrega y digitalización (modo "entrega"): a la izquierda el tracking en
     tiempo real llega hasta la distribución; la carta de porte se firma (con
     el mouse o sola) y se genera el documento digital (e-POD); con eso el
     tracking registra la entrega y se cierra.
   Todo se hace solo si nadie lo toca. Datos de ejemplo en datos/servicio.js → tms.
   ========================================================= */
(function () {
  const SV = window.SV;
  if (!SV || !SV.tms) return;
  const { S, txt, crear, esc, escala } = SV;
  const T = S.tms || {};
  const TD = T.despachos || {}, TK = T.tracking || {};
  const { vistas, alElegir } = SV.tms;
  const ahora = () => performance.now();
  const activa = (m) => SV.tms.enVista && SV.tms.pestana === 'despachos' && SV.tms.modo === m;

  // Corridas que se pueden cortar: cada nueva anula a la anterior
  function corredor() {
    let n = 0;
    return {
      nueva() { return ++n; },
      vigente(id) { return id === n; },
      dormir(ms, id) { return new Promise((res, rej) => setTimeout(() => (id === n ? res() : rej('cancelado')), ms)); }
    };
  }
  const cancelado = (e) => { if (e !== 'cancelado') throw e; };

  const SVG = {
    camion: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 5h13v11H1zM15 8.5h4.6L23 12.8V16h-8z"/><circle cx="5.5" cy="18" r="2.6"/><circle cx="18.5" cy="18" r="2.6"/></svg>',
    deposito: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2 1.5 8v14h21V8L12 2zM6 12h12v10H6z"/><path d="M6 14h12v2H6zM6 18h12v2H6z"/></svg>',
    destino: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 10 4 3h16l2 7a3 3 0 0 1-5 2.2A3 3 0 0 1 12 12a3 3 0 0 1-5 .2A3 3 0 0 1 2 10z"/><path fill-rule="evenodd" d="M3.5 13.6V22h17v-8.4a4.6 4.6 0 0 1-3.5-.5 4.6 4.6 0 0 1-5 .3 4.6 4.6 0 0 1-5-.3 4.6 4.6 0 0 1-3.5.5zM9.5 15.5h5V22h-5z"/></svg>',
    celular: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M6 1h12v22H6zM8 3.5v15h8v-15z"/><path d="M10.5 20h3v1.4h-3z"/></svg>',
    tilde: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.2 16.6 4.4 11.8l1.8-1.8 3 3 8.6-8.6 1.8 1.8z"/></svg>',
    doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M5 1h10l5 5v17H5zM14 2.5V7h4.5z"/><path d="M8 11h9v1.6H8zM8 14.5h9v1.6H8zM8 18h6v1.6H8z" fill="#FFFBF3"/></svg>'
  };

  const v = vistas.despachos;
  if (!v) return;
  const D = TD.documento || {};
  const VIAJES = (TD.viajes || []).slice(0, 3);
  const COLORES = ['var(--rojo)', 'var(--ambar)', 'var(--azul)'];
  const EV = (TK.eventos || []).slice(0, 8);
  const FUENTES = (TK.fuentes || []).slice(0, 4);
  const ICONO_FUENTE = [SVG.deposito, SVG.camion, SVG.destino, SVG.celular];
  // los eventos antes de la entrega llegan solos; los de la entrega, después de la firma
  let corte = EV.findIndex((e) => /entrega|e-?pod/i.test(e.texto));
  if (corte < 0) corte = EV.length;

  v.innerHTML =
    // ---- Armado de rutas y viajes (parada "viajes") ----
    '<div class="td-col td-col-viajes">' +
    `<p class="td-tit">${txt(TD.viajesTitulo)}</p><p class="td-txt">${txt(TD.viajesTexto)}</p>` +
    // la planchada simplificada: un stage por ruta (como en la parada anterior), con sus bultos
    `<div class="td-pool"><span>${txt(TD.viajesPlanchada || 'Planchada · staging por ruta')}</span><div class="td-stages">` +
    VIAJES.map((vj, i) => `<div class="td-st" style="--c:${COLORES[i]}"><p><i></i>${esc((vj.paradas || []).slice(-1)[0] || '')}</p><div class="td-chips" data-i="${i}"></div></div>`).join('') +
    '</div></div>' +
    '<div class="td-viajes">' + VIAJES.map((vj, i) => {
      const p = vj.paradas || [];
      return `<div class="td-viaje" style="--c:${COLORES[i]}" data-i="${i}">` +
        `<div class="td-vcab">${SVG.camion}<b>${esc(vj.codigo)}</b><small>${esc(vj.unidad)}</small><em class="td-vest">Armando</em></div>` +
        '<div class="td-ruta"><i class="td-linea"><i class="td-avance"></i></i>' +
        p.map((n, j) => `<span class="td-parada" style="left:${p.length > 1 ? j / (p.length - 1) * 100 : 0}%"><i></i><small>${esc(n)}</small></span>`).join('') +
        `<span class="td-mini">${SVG.camion}</span></div>` +
        `<div class="td-ocup"><i class="td-barra"><i></i></i><b>0 / ${+vj.bultos || 0} bultos</b></div></div>`;
    }).join('') + '</div>' +
    `<button type="button" class="td-boton td-armar">${txt(TD.viajesBoton)}</button>` +
    '</div>' +
    // ---- Tracking en tiempo real (parada "entrega") ----
    '<div class="td-col td-col-track">' +
    `<p class="td-tit">${txt(TK.panel)}</p><p class="td-txt">${txt(TK.texto)}</p>` +
    `<div class="tz-estado"><div><small>N° de envío</small><b>${esc(TK.numero || '')}</b><p class="tz-txt">—</p></div>` +
    `<div class="tz-pasos"><i class="tz-pasos-linea"><i></i></i><span data-p="0">${SVG.deposito}</span><span data-p="1">${SVG.camion}</span><span data-p="2">${SVG.destino}</span></div></div>` +
    // la primera vez el seguimiento espera que la persona lo empiece
    `<button type="button" class="td-boton tz-seguir">${txt(TK.boton || 'Seguir el envío')}</button>` +
    '<div class="tz-lista"></div>' +
    `<p class="tz-fin">${SVG.tilde}<span>${txt(TK.fin)}</span></p>` +
    '</div>' +
    // ---- La carta de porte (en las dos paradas, a la derecha) ----
    '<div class="td-col td-col-doc">' +
    `<p class="td-tit">${txt(TD.docTitulo)}</p><p class="td-txt"><span class="td-txt-viajes">${txt(TD.docTexto)}</span><span class="td-txt-entrega">${txt(TD.docTextoEntrega)}</span></p>` +
    // la carta de porte es 100% digital (pedido de la persona): va en la app, en el celular en la
    // mano (el mockup de la logística inversa, mano.webp: la app va detrás y el marco la recorta)
    '<div class="td-cel"><div class="cel-foto"><div class="cel-marco">' +
    '<div class="cel-barra"><span>11:40</span><span class="cel-bat"><i></i></span></div>' +
    `<div class="cel-cab"><span class="cel-menu"></span><b>${txt(TD.docApp || 'Carta de porte')}</b><p class="cel-quien chofer">${txt(TD.docQuien || 'Chofer CARGO')}</p></div>` +
    '<div class="td-app">' +
    `<p class="td-digital">${SVG.celular}<span>${txt(TD.docDigital || '100% digital · sin papel')}</span></p>` +
    '<div class="td-papel">' +
    '<div class="td-pcab"><img src="../../img/marca/logo-cargo.svg" alt="CARGO">' +
    `<div class="td-pnum"><b>Carta de porte</b><span>N° ${esc(D.numero || '')}</span></div></div>` +
    `<div class="td-pfila"><span>Fecha</span><b>${esc(D.fecha || '')}</b><span>Envío</span><b>P&amp;A</b></div>` +
    '<div class="td-pdatos">' +
    `<div><span>Remitente</span><b>${txt(D.remitente)}</b></div>` +
    `<div><span>Destinatario</span><b>${txt(D.destinatario)}</b><small>${txt(D.localidad)}</small></div></div>` +
    '<table class="td-ptabla"><tr><th>Bultos</th><th>m³</th><th>Kg reales</th></tr>' +
    `<tr><td>${esc(D.bultos || '')}</td><td>${esc(D.m3 || '')}</td><td>${esc(D.kg || '')}</td></tr></table>` +
    `<div class="td-firma"><span>Conforme recepción</span><canvas width="420" height="150"></canvas><em class="td-em-entrega">${txt(TD.firmaAca || 'Firmá acá')}</em><em class="td-em-viajes">${txt(TD.firmaPendiente)}</em><small class="td-firma-pie"></small></div>` +
    '<div class="td-sello"><b>Conformado</b><small>e-POD</small></div>' +
    `<div class="td-pdf">${SVG.doc}PDF</div>` +
    '</div>' +
    `<div class="td-acciones"><button type="button" class="td-boton td-firmar">${txt(TD.docBoton)}</button><p class="td-estado"></p></div>` +
    '</div></div>' +
    '<img class="cel-mano" src="../../img/logistica-inversa/mano.webp" alt="" draggable="false" decoding="async"></div></div>' +
    '</div>';

  // =========================================================
  // LA CARTA DE PORTE: firma y documento digital
  // =========================================================
  const papel = v.querySelector('.td-papel');
  const lienzo = v.querySelector('.td-firma canvas');
  const ctx = lienzo.getContext('2d');
  const pie = v.querySelector('.td-firma-pie');
  const estado = v.querySelector('.td-estado');
  const bFirmar = v.querySelector('.td-firmar');
  const textoFirmar = bFirmar.innerHTML;
  const cf = corredor();
  let firmado = false, tinta = 0, trazando = false, ult = null, usoDoc = -1e9;
  // Primer intento a mano (pedido de la persona): cada demo espera que la persona la haga una
  // vez, con la manito (tms.js → SV.manito); después se hace sola al llegar.
  const mano = SV.manito(v);
  const probado = { viajes: false, tracking: false, firma: false };
  const yaProbo = (k) => { if (!probado[k]) { probado[k] = true; mano.ocultar(); } };
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#22386E'; ctx.lineWidth = 3.2;
  const enEntrega = () => SV.tms.modo === 'entrega';
  function punto(e) {
    const r = lienzo.getBoundingClientRect();
    return { x: (e.clientX - r.left) * lienzo.width / r.width, y: (e.clientY - r.top) * lienzo.height / r.height };
  }
  function trazo(a, b) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); tinta += Math.hypot(b.x - a.x, b.y - a.y); }
  function limpiarFirma() {
    cf.nueva();
    firmado = false; tinta = 0; trazando = false;
    ctx.clearRect(0, 0, lienzo.width, lienzo.height);
    papel.classList.remove('firmando', 'firmado', 'generando');
    pie.textContent = '';
    estado.className = 'td-estado pendiente';
    estado.innerHTML = '<i></i>' + txt(TD.docPendiente);
    bFirmar.innerHTML = textoFirmar;
    bFirmar.disabled = false;
  }
  lienzo.addEventListener('pointerdown', (e) => {
    if (firmado || !enEntrega()) return;
    e.preventDefault();
    usoDoc = ahora();
    cf.nueva();
    trazando = true; ult = punto(e);
    papel.classList.add('firmando');
    lienzo.setPointerCapture(e.pointerId);
  });
  lienzo.addEventListener('pointermove', (e) => { if (!trazando) return; const p = punto(e); trazo(ult, p); ult = p; });
  const soltarTrazo = () => {
    if (!trazando) return;
    trazando = false;
    usoDoc = ahora();
    if (tinta > 140) { yaProbo('firma'); const id = cf.nueva(); cf.dormir(650, id).then(() => generar(id)).catch(cancelado); }
  };
  lienzo.addEventListener('pointerup', soltarTrazo);
  lienzo.addEventListener('pointercancel', soltarTrazo);

  // firma automática: un garabato que se dibuja de a poco
  function firmaAuto(id) {
    ctx.clearRect(0, 0, lienzo.width, lienzo.height); tinta = 0;
    papel.classList.add('firmando');
    const pts = [];
    for (let i = 0; i <= 90; i++) {
      const t = i / 90;
      pts.push({ x: 40 + 300 * t + 16 * Math.sin(t * 19), y: 82 + 30 * Math.sin(t * 9.6) * (1 - .45 * t) - 12 * Math.cos(t * 19) });
    }
    for (let i = 0; i <= 20; i++) pts.push({ x: 120 + 230 * i / 20, y: 128 - 6 * Math.sin(i / 20 * 3) });
    return new Promise((res, rej) => {
      let k = 1;
      (function paso() {
        if (!cf.vigente(id)) { rej('cancelado'); return; }
        for (let n = 0; n < 4 && k < pts.length; n++, k++) { if (k !== 91) trazo(pts[k - 1], pts[k]); }
        if (k < pts.length) requestAnimationFrame(paso); else res();
      })();
    });
  }
  async function generar(id) {
    bFirmar.disabled = true;
    papel.classList.add('generando');
    estado.className = 'td-estado cargando';
    estado.innerHTML = '<i></i>Generando el documento digital…';
    await cf.dormir(950, id);
    firmado = true;
    papel.classList.remove('generando');
    papel.classList.add('firmado');
    pie.textContent = `e-POD · ${D.fecha || ''} 11:40 · firmado digitalmente`;
    estado.className = 'td-estado listo';
    estado.innerHTML = SVG.tilde + txt(TD.docListo);
    bFirmar.innerHTML = 'Volver a firmar';
    bFirmar.disabled = false;
    cerrarTracking();
  }
  function firmarSola() {
    const id = cf.nueva();
    firmaAuto(id).then(() => cf.dormir(350, id)).then(() => generar(id)).catch(cancelado);
  }
  bFirmar.addEventListener('click', () => {
    usoDoc = ahora();
    if (firmado) { limpiarFirma(); empezarTracking(); return; }
    yaProbo('firma');
    firmarSola();
  });

  // =========================================================
  // ARMADO DE VIAJES
  // =========================================================
  const poolEl = v.querySelector('.td-pool');
  const stagesEl = [...v.querySelectorAll('.td-pool .td-chips')];
  const viajesEl = [...v.querySelectorAll('.td-viaje')];
  const bArmar = v.querySelector('.td-armar');
  const textoArmar = bArmar.innerHTML;
  const cv = corredor();
  let armado = false, armando = false, usoViajes = -1e9;
  // código corto del destino: Rosario → ROS, San Luis → SLU, Sgo. del Estero → SES
  const siglas = (n) => {
    const p = String(n || '').replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 || /^[A-Z]/.test(w));
    const s = p.length > 1 ? p[0][0] + p[p.length - 1].slice(0, 2) : (p[0] || '').slice(0, 3);
    return s.toUpperCase();
  };
  const cuenta = VIAJES.map(() => 0);
  function prepararViajes() {
    cv.nueva();
    armado = false; armando = false;
    poolEl.classList.remove('vacio');
    // cada stage con los bultos de su ruta (ya ordenados en la planchada)
    let n = 0;
    stagesEl.forEach((el, i) => {
      el.innerHTML = '';
      for (let k = 0; k < (+VIAJES[i].bultos || 0); k++, n++) {
        const c = crear('span', 'td-chip td-cuad', el, String(4110 + n * 7).slice(-4));
        c.title = `${siglas((VIAJES[i].paradas || []).slice(-1)[0])}-${c.textContent}`;
        c.style.setProperty('--c', COLORES[i]);
        c.dataset.i = i;
      }
    });
    viajesEl.forEach((el, i) => {
      cuenta[i] = 0;
      el.classList.remove('listo', 'en-ruta');
      el.querySelector('.td-vest').textContent = 'Armando';
      el.querySelector('.td-barra i').style.width = '0%';
      el.querySelector('.td-ocup b').textContent = `0 / ${+VIAJES[i].bultos || 0} bultos`;
    });
    bArmar.innerHTML = textoArmar;
    bArmar.disabled = false;
  }
  function volar(chip, destino) {
    const k = escala(), base = v.getBoundingClientRect();
    const a = chip.getBoundingClientRect(), b = destino.getBoundingClientRect();
    const sx = (a.left - base.left) / k, sy = (a.top - base.top) / k;
    const ex = (b.left - base.left) / k + 4, ey = (b.top - base.top) / k - 6;
    const clon = chip.cloneNode(true);
    clon.classList.add('td-vuela');
    v.appendChild(clon);
    chip.classList.add('ido');
    const mx = (sx + ex) / 2, my = Math.min(sy, ey) - 50;
    const an = clon.animate([
      { transform: `translate(${sx}px, ${sy}px)` },
      { transform: `translate(${mx}px, ${my}px) scale(1.08)`, offset: .45 },
      { transform: `translate(${ex}px, ${ey}px) scale(.6)`, opacity: .2 }
    ], { duration: 850, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    return an.finished.then(() => clon.remove());
  }
  async function armar(id) {
    armando = true;
    bArmar.disabled = true;
    // de a uno por stage, por turno: los tres camiones se llenan a la par, cada uno desde su stage
    const porStage = stagesEl.map((el) => [...el.querySelectorAll('.td-chip:not(.ido)')]);
    const chips = [];
    for (let k = 0; porStage.some((l) => k < l.length); k++) porStage.forEach((l) => { if (l[k]) chips.push(l[k]); });
    for (const chip of chips) {
      const i = +chip.dataset.i, el = viajesEl[i];
      volar(chip, el.querySelector('.td-ocup')).then(() => {
        if (!cv.vigente(id)) return;
        cuenta[i]++;
        const total = +VIAJES[i].bultos || 1;
        el.querySelector('.td-barra i').style.width = (cuenta[i] / total * 100).toFixed(1) + '%';
        el.querySelector('.td-ocup b').textContent = `${cuenta[i]} / ${total} bultos`;
        el.classList.remove('llega'); void el.offsetWidth; el.classList.add('llega');
      });
      await cv.dormir(480, id);   // un bulto cada medio segundo: que se vea a qué viaje va cada uno
    }
    await cv.dormir(1300, id);
    poolEl.classList.add('vacio');
    for (const el of viajesEl) { el.classList.add('listo'); el.querySelector('.td-vest').textContent = 'Listo para salir'; await cv.dormir(650, id); }
    await cv.dormir(1800, id);
    for (const el of viajesEl) { el.classList.add('en-ruta'); el.querySelector('.td-vest').textContent = 'En ruta · salida 07:50'; await cv.dormir(900, id); }
    armando = false; armado = true;
    bArmar.innerHTML = 'Volver a armar';
    bArmar.disabled = false;
  }
  bArmar.addEventListener('click', () => {
    usoViajes = ahora();
    yaProbo('viajes');
    if (armando) return;
    if (armado) prepararViajes();
    const id = cv.nueva();
    armar(id).catch(cancelado);
  });
  prepararViajes();

  // =========================================================
  // TRACKING EN TIEMPO REAL (hasta la entrega)
  // =========================================================
  const lista = v.querySelector('.tz-lista');
  const estadoTxt = v.querySelector('.tz-txt');
  const pasos = [...v.querySelectorAll('.tz-pasos span')];
  const lineaPasos = v.querySelector('.tz-pasos-linea i');
  const fin = v.querySelector('.tz-fin');
  const ct = corredor();
  let mostrados = 0, esperandoFirma = false;
  const NOMBRES_ETAPA = ['En depósito', 'En tránsito', 'En distribución', 'Entregado'];
  function etapa(texto) {
    const t = String(texto || '').toLowerCase();
    if (t.includes('entrega') || t.includes('recepción')) return 3;
    if (t.includes('distribución')) return 2;
    if (t.includes('tránsito') || t.includes('ruta')) return 1;
    return 0;
  }
  let maxEtapa = 0;
  function mostrarEtapa() {
    estadoTxt.textContent = NOMBRES_ETAPA[maxEtapa] + (esperandoFirma ? ' · ' + (TK.esperando || 'esperando la firma') : '');
    estadoTxt.classList.toggle('entregado', maxEtapa === 3);
    pasos.forEach((p, k) => p.classList.toggle('hecho', k <= Math.min(2, maxEtapa)));
    lineaPasos.style.width = (maxEtapa >= 3 ? 100 : maxEtapa / 2.6 * 100).toFixed(0) + '%';
  }
  function agregarEvento(e) {
    const f = Math.max(0, Math.min(FUENTES.length - 1, (+e.fuente || 1) - 1));
    crear('div', `tz-fila f${f}`, lista,
      `<span class="tz-hora">${esc(e.hora)}</span>` +
      `<span class="tz-ev"><b>${txt(e.texto)}</b><small>${txt(e.lugar)}</small></span>` +
      `<span class="tz-fte" title="${esc(FUENTES[f] || '')}">${ICONO_FUENTE[f]}</span>`);
    maxEtapa = Math.max(maxEtapa, etapa(e.texto));
    mostrarEtapa();
  }
  function reiniciarTracking() {
    ct.nueva();
    lista.innerHTML = '';
    mostrados = 0; maxEtapa = 0; esperandoFirma = false;
    estadoTxt.textContent = '—';
    estadoTxt.classList.remove('entregado');
    pasos.forEach((p) => p.classList.remove('hecho'));
    lineaPasos.style.width = '0%';
    fin.classList.remove('visible');
  }
  async function empezarTracking() {
    reiniciarTracking();
    const id = ct.nueva();
    await ct.dormir(1200, id);
    // un evento cada 1,6 s: que se pueda leer cada uno y ver cómo avanza el estado
    while (mostrados < corte) { agregarEvento(EV[mostrados++]); await ct.dormir(1600, id); }
    if (!firmado) {
      esperandoFirma = true; mostrarEtapa(); usoDoc = ahora();
      // la primera vez, la manito invita a firmar (después se firma sola)
      if (!probado.firma && activa('entrega')) mano.mostrar(lienzo, txt(TD.invitaFirma || '**Firmá** la entrega con el mouse'), { lado: 'izq', punto: [.5, .5] });
    }
  }
  // con la firma (o si ya estaba firmada) llegan los eventos de la entrega y el tracking se cierra
  async function cerrarTracking() {
    if (!enEntrega()) return;
    const id = ct.nueva();
    esperandoFirma = false;
    while (mostrados < corte) agregarEvento(EV[mostrados++]);
    while (mostrados < EV.length) { await ct.dormir(1300, id); agregarEvento(EV[mostrados++]); }
    maxEtapa = 3; mostrarEtapa();
    await ct.dormir(1000, id);
    fin.classList.add('visible');
  }

  // =========================================================
  // AL LLEGAR A CADA PARADA, Y SOLOS SI NADIE TOCA NADA
  // =========================================================
  // el seguimiento: la primera vez espera el clic en "Seguir el envío"
  const bSeguir = v.querySelector('.tz-seguir');
  bSeguir.addEventListener('click', () => {
    yaProbo('tracking');
    v.classList.remove('tz-espera');
    empezarTracking().catch(cancelado);
  });
  alElegir.despachos = (modo) => {
    limpiarFirma();
    mano.ocultar();
    v.classList.remove('tz-espera');
    if (modo === 'viajes') {
      reiniciarTracking();
      if (armado || armando) prepararViajes();
      usoViajes = ahora() - 1500;
      if (!probado.viajes) mano.mostrar(bArmar, txt(TD.invitaViajes || '**Hacé clic** para armar los viajes'), { lado: 'der' });
    } else if (!probado.tracking) {
      reiniciarTracking();
      v.classList.add('tz-espera');
      mano.mostrar(bSeguir, txt(TK.invitacion || '**Hacé clic** para seguir el envío'), { lado: 'der' });
    } else empezarTracking().catch(cancelado);
  };
  // después del primer intento, se hacen solas si nadie toca nada
  setInterval(() => {
    const t = ahora();
    if (probado.viajes && activa('viajes') && !armado && !armando && t - usoViajes > 3500) {
      usoViajes = t;
      const id = cv.nueva();
      armar(id).catch(cancelado);
    }
    if (probado.firma && activa('entrega') && esperandoFirma && !firmado && !trazando && !papel.classList.contains('firmando') && t - usoDoc > 7000) firmarSola();
  }, 700);
})();
