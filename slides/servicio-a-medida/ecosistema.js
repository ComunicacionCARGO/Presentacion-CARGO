/* =========================================================
   ECOSISTEMA TECNOLÓGICO — pestañas nuevas del TMS (tms.js deja las vistas en SV.tms):
   - Gestión de despachos: la carta de porte se firma (con el mouse o con el
     botón) y se genera el documento digital, que queda publicado para el
     cliente; al lado, los bultos del día se asignan a los viajes de su ruta.
   - Digitalización y tracking: consulta web de un envío. Los eventos llegan
     de a uno (fecha, hora, lugar y geolocalización), cada uno marca de qué
     fuente viene y al entregarse aparece el e-POD.
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
  const activa = (k) => SV.tms.pestana === k;

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
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 1.5a7.4 7.4 0 0 0-7.4 7.4c0 5.4 7.4 13.6 7.4 13.6s7.4-8.2 7.4-13.6A7.4 7.4 0 0 0 12 1.5zm0 4.4a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg>',
    tilde: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.2 16.6 4.4 11.8l1.8-1.8 3 3 8.6-8.6 1.8 1.8z"/></svg>',
    lupa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M10 2.5a7.5 7.5 0 0 1 6 12l5.3 5.3-1.8 1.8-5.3-5.3A7.5 7.5 0 1 1 10 2.5zm0 2.6a4.9 4.9 0 1 0 0 9.8 4.9 4.9 0 0 0 0-9.8z"/></svg>',
    foto: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M8.5 3h7l1.6 2.5H22V21H2V5.5h4.9zM12 8.5a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4z"/></svg>',
    doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M5 1h10l5 5v17H5zM14 2.5V7h4.5z"/><path d="M8 11h9v1.6H8zM8 14.5h9v1.6H8zM8 18h6v1.6H8z" fill="#FFFBF3"/></svg>'
  };

  // =========================================================
  // GESTIÓN DE DESPACHOS
  // =========================================================
  (function despachos() {
    const v = vistas.despachos;
    if (!v) return;
    const D = TD.documento || {};
    const VIAJES = (TD.viajes || []).slice(0, 3);
    const COLORES = ['var(--rojo)', 'var(--ambar)', 'var(--azul)'];
    v.innerHTML =
      // ---- Documentación: la carta de porte ----
      '<div class="td-col td-col-doc">' +
      `<p class="td-tit">${txt(TD.docTitulo)}</p><p class="td-txt">${txt(TD.docTexto)}</p>` +
      '<div class="td-papel">' +
      '<div class="td-pcab"><img src="../../img/marca/logo-cargo.svg" alt="CARGO">' +
      `<div class="td-pnum"><b>Carta de porte</b><small>Original · Cliente</small><span>N° ${esc(D.numero || '')}</span><i class="td-barras"></i></div></div>` +
      `<div class="td-pfila"><span>Fecha</span><b>${esc(D.fecha || '')}</b><span>Tipo de envío</span><b>P&amp;A</b></div>` +
      '<div class="td-pdatos">' +
      `<div><span>Remitente</span><b>${txt(D.remitente)}</b></div>` +
      `<div><span>Destinatario</span><b>${txt(D.destinatario)}</b><small>${txt(D.localidad)}</small></div></div>` +
      '<table class="td-ptabla"><tr><th>Bultos</th><th>m³</th><th>Kg reales</th><th>Valor decl.</th></tr>' +
      `<tr><td>${esc(D.bultos || '')}</td><td>${esc(D.m3 || '')}</td><td>${esc(D.kg || '')}</td><td>—</td></tr></table>` +
      '<p class="td-pobs"><span>Observaciones</span>Sin observaciones</p>' +
      '<div class="td-firma"><span>Conforme recepción</span><canvas width="420" height="150"></canvas><em>Firmá acá con el mouse</em><small class="td-firma-pie"></small></div>' +
      '<div class="td-sello"><b>Conformado</b><small>e-POD</small></div>' +
      `<div class="td-pdf">${SVG.doc}PDF</div>` +
      '</div>' +
      `<div class="td-acciones"><button type="button" class="td-boton td-firmar">${txt(TD.docBoton)}</button><p class="td-estado"></p></div>` +
      '</div>' +
      // ---- Armado de rutas y viajes ----
      '<div class="td-col td-col-viajes">' +
      `<p class="td-tit">${txt(TD.viajesTitulo)}</p><p class="td-txt">${txt(TD.viajesTexto)}</p>` +
      '<div class="td-pool"><span>Bultos del día</span><div class="td-chips"></div></div>' +
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
      '</div>';

    // ---------- Firma y documento digital ----------
    const papel = v.querySelector('.td-papel');
    const lienzo = v.querySelector('.td-firma canvas');
    const ctx = lienzo.getContext('2d');
    const pie = v.querySelector('.td-firma-pie');
    const estado = v.querySelector('.td-estado');
    const bFirmar = v.querySelector('.td-firmar');
    const textoFirmar = bFirmar.innerHTML;
    const cf = corredor();
    let firmado = false, tinta = 0, trazando = false, ult = null, usoDoc = -1e9;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#22386E'; ctx.lineWidth = 3.2;
    function punto(e) {
      const r = lienzo.getBoundingClientRect();
      return { x: (e.clientX - r.left) * lienzo.width / r.width, y: (e.clientY - r.top) * lienzo.height / r.height };
    }
    function trazo(a, b) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); tinta += Math.hypot(b.x - a.x, b.y - a.y); }
    function limpiarFirma() {
      cf.nueva();
      firmado = false; tinta = 0;
      ctx.clearRect(0, 0, lienzo.width, lienzo.height);
      papel.classList.remove('firmando', 'firmado', 'generando');
      pie.textContent = '';
      estado.innerHTML = '';
      estado.className = 'td-estado';
      bFirmar.innerHTML = textoFirmar;
      bFirmar.disabled = false;
    }
    lienzo.addEventListener('pointerdown', (e) => {
      if (firmado) return;
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
      if (tinta > 140) { const id = cf.nueva(); cf.dormir(650, id).then(() => generar(id)).catch(cancelado); }
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
    }
    bFirmar.addEventListener('click', () => {
      usoDoc = ahora();
      if (firmado) { limpiarFirma(); return; }
      const id = cf.nueva();
      firmaAuto(id).then(() => cf.dormir(350, id)).then(() => generar(id)).catch(cancelado);
    });

    // ---------- Armado de viajes ----------
    const chipsEl = v.querySelector('.td-chips');
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
      chipsEl.innerHTML = '';
      chipsEl.parentNode.classList.remove('vacio');
      const lista = [];
      VIAJES.forEach((vj, i) => { for (let n = 0; n < (+vj.bultos || 0); n++) lista.push(i); });
      for (let i = lista.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [lista[i], lista[j]] = [lista[j], lista[i]]; }
      lista.forEach((i, n) => {
        const fin = (VIAJES[i].paradas || []).slice(-1)[0];
        const c = crear('span', 'td-chip', chipsEl, `<i></i>${esc(siglas(fin))}-${String(4110 + n * 7).slice(-4)}`);
        c.style.setProperty('--c', COLORES[i]);
        c.dataset.i = i;
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
      ], { duration: 560, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
      return an.finished.then(() => clon.remove());
    }
    async function armar(id) {
      armando = true;
      bArmar.disabled = true;
      const chips = [...chipsEl.querySelectorAll('.td-chip:not(.ido)')];
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
        await cv.dormir(190, id);
      }
      await cv.dormir(700, id);
      chipsEl.parentNode.classList.add('vacio');
      for (const el of viajesEl) { el.classList.add('listo'); el.querySelector('.td-vest').textContent = 'Listo para salir'; await cv.dormir(220, id); }
      await cv.dormir(800, id);
      for (const el of viajesEl) { el.classList.add('en-ruta'); el.querySelector('.td-vest').textContent = 'En ruta · salida 07:50'; await cv.dormir(260, id); }
      armando = false; armado = true;
      bArmar.innerHTML = 'Volver a armar';
      bArmar.disabled = false;
    }
    bArmar.addEventListener('click', () => {
      usoViajes = ahora();
      if (armando) return;
      if (armado) prepararViajes();
      const id = cv.nueva();
      armar(id).catch(cancelado);
    });
    prepararViajes();

    // ---------- Solos, si nadie toca nada ----------
    alElegir.despachos = () => {
      if (firmado || papel.classList.contains('firmando')) limpiarFirma();
      if (armado) prepararViajes();
    };
    setInterval(() => {
      if (!SV.tms.enVista || !activa('despachos')) return;
      const t = ahora();
      if (!firmado && !trazando && !papel.classList.contains('firmando') && t - usoDoc > 4500) {
        usoDoc = t;
        const id = cf.nueva();
        firmaAuto(id).then(() => cf.dormir(350, id)).then(() => generar(id)).catch(cancelado);
      }
      if (!armado && !armando && t - usoViajes > 4000) {
        usoViajes = t;
        const id = cv.nueva();
        armar(id).catch(cancelado);
      }
    }, 700);
  })();

  // =========================================================
  // DIGITALIZACIÓN Y TRACKING
  // =========================================================
  (function tracking() {
    const v = vistas.tracking;
    if (!v) return;
    const EV = (TK.eventos || []).slice(0, 8);
    const FUENTES = (TK.fuentes || []).slice(0, 4);
    const ICONO_FUENTE = [SVG.deposito, SVG.camion, SVG.destino, SVG.celular];
    v.innerHTML =
      '<div class="tw-busca">' +
      `<b>${txt(TK.panel)}</b>` +
      '<span class="tw-campo"><small>N° de envío</small><span class="tw-numero"></span><i class="tw-cursor"></i></span>' +
      `<button type="button" class="tw-boton">${SVG.lupa}Buscar</button>` +
      '</div>' +
      '<div class="tw-estado">' +
      '<p class="tw-estado-txt">—</p>' +
      `<p class="tw-destino">${txt(TK.destino)}</p>` +
      '<div class="tw-pasos"><i class="tw-pasos-linea"><i></i></i>' +
      `<span class="tw-paso" data-p="0">${SVG.deposito}</span><span class="tw-paso" data-p="1">${SVG.camion}</span><span class="tw-paso" data-p="2">${SVG.destino}</span></div>` +
      '</div>' +
      '<div class="tw-tabla"><div class="tw-fila tw-encabezado"><span>Fecha</span><span>Evento</span><span>Fuente</span><span>Ubicación</span></div><div class="tw-filas"></div></div>' +
      `<div class="tw-fuentes"><p>${txt(TK.fuentesTitulo)}</p>` + FUENTES.map((f, i) =>
        `<div class="tw-fuente f${i}" data-f="${i}">${ICONO_FUENTE[i]}<span>${txt(f)}</span><b>0</b></div>`).join('') + '</div>' +
      '<div class="tw-epod">' +
      `<p>${SVG.celular}<span>${txt(TK.epod)}</span></p>` +
      '<div class="tw-epod-firma"><svg viewBox="0 0 200 60" aria-hidden="true"><path d="M10 40c18-30 28-30 30-8s12 18 26-6 22-22 22 2 14 20 34-10 26-12 30 6 10 16 38 4"/><path d="M40 52h120"/></svg>' +
      `<span class="tw-epod-foto">${SVG.foto}</span></div>` +
      `<button type="button" class="tw-ver">${SVG.doc}${txt(TK.epodBoton)}</button>` +
      '</div>';

    const numero = v.querySelector('.tw-numero');
    const bBuscar = v.querySelector('.tw-boton');
    const estadoTxt = v.querySelector('.tw-estado-txt');
    const pasos = [...v.querySelectorAll('.tw-paso')];
    const lineaPasos = v.querySelector('.tw-pasos-linea i');
    const filas = v.querySelector('.tw-filas');
    const fuentesEl = [...v.querySelectorAll('.tw-fuente')];
    const epod = v.querySelector('.tw-epod');
    const ct = corredor();
    let hecho = false, buscando = false;
    const cuentas = FUENTES.map(() => 0);

    function reiniciar() {
      ct.nueva();
      hecho = false; buscando = false;
      numero.textContent = '';
      estadoTxt.textContent = '—';
      estadoTxt.className = 'tw-estado-txt';
      filas.innerHTML = '';
      pasos.forEach((p) => p.classList.remove('hecho'));
      lineaPasos.style.width = '0%';
      fuentesEl.forEach((f, i) => { cuentas[i] = 0; f.classList.remove('activa'); f.querySelector('b').textContent = '0'; });
      epod.classList.remove('visible');
      bBuscar.disabled = false;
    }
    function etapa(texto) {
      const t = String(texto || '').toLowerCase();
      if (t.includes('entrega') || t.includes('recepción')) return 3;
      if (t.includes('distribución')) return 2;
      if (t.includes('tránsito') || t.includes('ruta')) return 1;
      return 0;
    }
    const NOMBRES_ETAPA = ['En depósito', 'En tránsito', 'En distribución', 'Entregado'];
    async function buscar() {
      reiniciar();
      const id = ct.nueva();
      buscando = true;
      bBuscar.disabled = true;
      const n = String(TK.numero || '');
      for (let i = 1; i <= n.length; i++) { numero.textContent = n.slice(0, i); await ct.dormir(38, id); }
      await ct.dormir(300, id);
      bBuscar.classList.add('apretado');
      await ct.dormir(180, id);
      bBuscar.classList.remove('apretado');
      estadoTxt.textContent = 'Buscando…';
      await ct.dormir(450, id);
      let maxEtapa = 0;
      for (let i = 0; i < EV.length; i++) {
        const e = EV[i];
        const f = Math.max(0, Math.min(FUENTES.length - 1, (+e.fuente || 1) - 1));
        crear('div', `tw-fila f${f}`, filas,
          `<span class="tw-hora">${esc(e.hora)}</span>` +
          `<span class="tw-ev"><b>${txt(e.texto)}</b><small>${txt(e.lugar)}</small></span>` +
          `<span class="tw-fte">${ICONO_FUENTE[f]}</span>` +
          `<span class="tw-geo">${SVG.pin}${esc(e.geo || '')}</span>`);
        cuentas[f]++;
        const fe = fuentesEl[f];
        fe.querySelector('b').textContent = cuentas[f];
        fe.classList.add('activa');
        fe.classList.remove('late'); void fe.offsetWidth; fe.classList.add('late');
        maxEtapa = Math.max(maxEtapa, etapa(e.texto));
        estadoTxt.textContent = NOMBRES_ETAPA[maxEtapa];
        estadoTxt.className = 'tw-estado-txt' + (maxEtapa === 3 ? ' entregado' : '');
        pasos.forEach((p, k) => p.classList.toggle('hecho', k <= Math.min(2, maxEtapa === 3 ? 2 : maxEtapa)));
        lineaPasos.style.width = (Math.min(1, maxEtapa / 2.6 + (maxEtapa === 3 ? 1 : 0)) * 100).toFixed(0) + '%';
        if (/e-?pod|entrega/i.test(e.texto)) epod.classList.add('visible');
        await ct.dormir(720, id);
      }
      buscando = false; hecho = true;
      bBuscar.disabled = false;
      bBuscar.lastChild.textContent = 'Buscar de nuevo';
    }
    bBuscar.addEventListener('click', () => { if (!buscando) buscar().catch(cancelado); });
    v.querySelector('.tw-ver').addEventListener('click', () => SV.tms.elegir('despachos'));
    reiniciar();

    alElegir.tracking = () => {
      reiniciar();
      bBuscar.lastChild.textContent = 'Buscar';
      const id = ct.nueva();
      ct.dormir(900, id).then(() => { if (SV.tms.enVista && activa('tracking')) buscar().catch(cancelado); }).catch(cancelado);
    };
    // si se llega a la sección con la pestaña ya abierta y sin buscar, busca solo
    setInterval(() => {
      if (SV.tms.enVista && activa('tracking') && !hecho && !buscando) buscar().catch(cancelado);
    }, 1500);
  })();
})();
