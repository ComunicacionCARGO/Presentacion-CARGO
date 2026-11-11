/* =========================================================
   VENTAJAS Y OPORTUNIDADES + TABLEROS DE BUSINESS INTELLIGENCE
   (después de la simulación de logística inversa; complementan esa parte).
   • Ventajas (.sv-ven): seis columnas como la diapositiva de la persona; la
     que tiene el cursor se abre y muestra su texto. Si nadie toca nada, se
     van abriendo solas de a una.
   • Tableros (.sv-bi): una ventana de tablero con dos pestañas:
     Entregas a concesionarios (indicadores que cuentan y OTD por mes) y
     Logística inversa (cumplimiento, medidor y estados por provincia; al
     tocar una barra, todo pasa a esa provincia).
   Textos y números en datos/servicio.js → ventajas y tableros.
   ========================================================= */
(function () {
  const SV = window.SV;
  if (!SV) return;
  const { S, txt, esc, crear, irA } = SV;
  const NS = 'http://www.w3.org/2000/svg';
  const fmt = (n, dec) => Number(n).toLocaleString('es-AR', { minimumFractionDigits: dec || 0, maximumFractionDigits: dec || 0 });

  // Íconos sólidos (24 × 24)
  const ICONOS = {
    ruta: '<path fill-rule="evenodd" d="M6 1.5a4 4 0 0 0-4 4c0 3 4 7.5 4 7.5s4-4.5 4-7.5a4 4 0 0 0-4-4zm0 2.6a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z"/><path fill-rule="evenodd" d="M18 8.5a4 4 0 0 0-4 4c0 3 4 7.5 4 7.5s4-4.5 4-7.5a4 4 0 0 0-4-4zm0 2.6a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z"/><circle cx="5.6" cy="16.2" r="1.15"/><circle cx="7.4" cy="19.4" r="1.15"/><circle cx="10.7" cy="20.9" r="1.15"/><circle cx="14.1" cy="21.2" r="1.15"/>',
    escudo: '<path fill-rule="evenodd" d="M12 1.5 3.5 4.8v6.1c0 5.2 3.6 9.6 8.5 11.6 4.9-2 8.5-6.4 8.5-11.6V4.8zm-1.3 14.6-4-4 1.6-1.6 2.4 2.4 5-5 1.6 1.6z"/>',
    barras: '<path d="M2.5 20.2h19V22h-19zM4.2 12.5h3.6v6.3H4.2zM10.2 7.5h3.6v11.3h-3.6zM16.2 2.5h3.6v16.3h-3.6z"/>',
    arbol: '<path d="M12 1.8a5.1 5.1 0 0 0-4.9 3.7A4.6 4.6 0 0 0 4.4 14a4.6 4.6 0 0 0 4.2 2.6h2.2V22h2.4v-5.4h2.2a4.6 4.6 0 0 0 4.2-2.6 4.6 4.6 0 0 0-2.7-8.5A5.1 5.1 0 0 0 12 1.8z"/>',
    ciclo: '<path d="M12 2.6a9.4 9.4 0 0 1 8.9 6.4h-2.4A7.1 7.1 0 0 0 6.3 7.8l2.1 1.2-5.8 2.5-.5-6.3 2 1.1A9.4 9.4 0 0 1 12 2.6zM3.1 15h2.4a7.1 7.1 0 0 0 12.2 1.2l-2.1-1.2 5.8-2.5.5 6.3-2-1.1A9.4 9.4 0 0 1 3.1 15z"/><path d="M12 8.4l3.6 1.8L12 12 8.4 10.2zM8 11.1l3.4 1.7v3.8L8 14.9zM16 11.1v3.8l-3.4 1.7v-3.8z"/>',
    cabeza: '<path fill-rule="evenodd" d="M10.6 1.8c-4.6 0-8 3.4-8 7.9 0 2.4 1 4.5 2.8 5.9V22h8.6v-3h2.6a1.9 1.9 0 0 0 1.9-1.9v-3l2.3-1-2.3-4.1C17.9 4.8 14.8 1.8 10.6 1.8zm-.1 3.3 1 1.5 1.8-.3.3 1.8 1.5 1-1 1.5.6 1.7-1.7.6-.3 1.8-1.8-.4-1.4 1.1-1.1-1.5-1.8.1.1-1.8-1.5-1 1.2-1.4-.6-1.7 1.7-.5.4-1.8 1.8.5zm0 3.4a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6z"/>'
  };
  const icono = (n, clase) => `<svg class="${clase || ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONOS[n] || ICONOS.barras}</svg>`;

  // Aparición de una sección (como las demás: .visible la primera vez, .en-vista mientras está en pantalla)
  function observar(seccion, alCambiar) {
    new IntersectionObserver((en) => {
      const v = en[0].isIntersecting;
      seccion.classList.toggle('en-vista', v);
      if (v) seccion.classList.add('visible');
      if (alCambiar) alCambiar(v);
    }, { threshold: .35 }).observe(seccion);
  }

  // =========================================================
  // 1. VENTAJAS Y OPORTUNIDADES
  // =========================================================
  (function () {
    const seccion = document.querySelector('.sv-ven');
    const V = S.ventajas;
    if (!seccion || !V) return;
    const items = V.items || [];
    seccion.insertAdjacentHTML('beforeend',
      `<div class="vn-cab"><p class="vn-ante ent" style="--i:0">${txt(V.antetitulo)}</p><h2 class="vn-titulo ent" style="--i:1">${txt(V.titulo)}</h2>` +
      `<p class="vn-bajada ent" style="--i:2">${txt(V.bajada)}</p></div>` +
      `<ul class="vn-cols">${items.map((it, i) => `<li class="vn-col ent" style="--i:${i + 3}" data-i="${i}" tabindex="0">
        <span class="vn-num">${String(i + 1).padStart(2, '0')}</span>
        ${icono(it.icono, 'vn-ico')}
        <h3 class="vn-nombre">${txt(it.titulo)}</h3>
        <div class="vn-cuerpo"><p>${txt(it.texto)}</p>
          ${(it.lista || []).length ? `<ul class="vn-lista">${it.lista.map((l) => `<li>${txt(l)}</li>`).join('')}</ul>` : ''}
          ${it.irATableros ? `<button type="button" class="vn-ir">${txt(V.botonTableros)}<svg viewBox="0 0 24 24"><path d="M11 19h2V8l4 4 1.4-1.4L12 4.2l-6.4 6.4L7 12l4-4z"/></svg></button>` : ''}
        </div>
        ${icono(it.icono, 'vn-fondo-ico')}
      </li>`).join('')}</ul>`);

    const cols = [...seccion.querySelectorAll('.vn-col')];
    let activa = -1, uso = -1e9, enVista = false;
    function abrir(i) {
      if (i === activa) return;
      activa = i;
      cols.forEach((c, k) => c.classList.toggle('abierta', k === i));
    }
    cols.forEach((c, i) => {
      const elegir = () => { uso = performance.now(); abrir(i); };
      c.addEventListener('pointerenter', elegir);
      c.addEventListener('click', elegir);
      c.addEventListener('focus', elegir);
    });
    seccion.addEventListener('pointermove', () => { uso = performance.now(); });
    const ir = seccion.querySelector('.vn-ir');
    if (ir) ir.addEventListener('click', (e) => { e.stopPropagation(); irA(document.querySelector('.sv-bi')); });
    abrir(0);
    // Guía (compartido/guia.js): la mano señala la columna siguiente, hasta que se pasa por una
    if (window.GUIA && cols.length > 1) GUIA.pista({ id: 'servicio-ventajas', texto: 'ventajas', objetivo: () => cols[(activa + 1) % cols.length], punto: [.5, .45], zona: '.vn-col', tipo: 'pasar', lado: 'abajo', espera: 1.8 });
    // si nadie toca nada, se abren solas de a una
    setInterval(() => {
      if (!enVista || performance.now() - uso < 9000 || !cols.length) return;
      abrir((activa + 1) % cols.length);
    }, 5200);
    observar(seccion, (v) => { enVista = v; });
  })();

  // =========================================================
  // 2. TABLEROS DE BUSINESS INTELLIGENCE
  // =========================================================
  (function () {
    const seccion = document.querySelector('.sv-bi');
    const T = S.tableros;
    if (!seccion || !T) return;
    const E = T.entregas || {}, L = T.inversa || {};
    const PROV = L.provincias || [];
    const MESES = E.meses || [];

    seccion.insertAdjacentHTML('beforeend',
      `<div class="bi-izq"><p class="bi-ante ent" style="--i:0">${txt(T.antetitulo)}</p><h2 class="bi-titulo ent" style="--i:1">${txt(T.titulo)}</h2>` +
      `<p class="bi-bajada ent" style="--i:2">${txt(T.bajada)}</p>` +
      `<div class="bi-tabs ent" style="--i:3" role="tablist">` +
      `<button type="button" data-t="entregas" role="tab">${icono('barras')}<span>${txt(E.pestana)}</span></button>` +
      `<button type="button" data-t="inversa" role="tab">${SV.ICONOS.inversa.replace('<svg ', '<svg aria-hidden="true" ')}<span>${txt(L.pestana)}</span></button></div>` +
      `<p class="bi-nota ent" style="--i:4">${txt(T.nota)}</p></div>` +
      `<div class="bi-ventana ent" style="--i:3">` +
      `<div class="bi-barra"><img src="../../img/marca/logo-cargo.svg" alt="CARGO"><b class="bi-vtitulo"></b><span>${txt(T.actualizado)}</span></div>` +
      `<div class="bi-cuerpo"></div><div class="bi-tip"></div></div>`);

    const cuerpo = seccion.querySelector('.bi-cuerpo'), vtitulo = seccion.querySelector('.bi-vtitulo');
    const tip = seccion.querySelector('.bi-tip');
    const tabs = [...seccion.querySelectorAll('.bi-tabs button')];
    let actual = null, enVista = false, visto = false;

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
    function vistaEntregas() {
      vtitulo.innerHTML = txt(E.titulo);
      const W = 900, H = 420, M = { l: 54, r: 24, t: 30, b: 40 };
      const vals = MESES.map((m) => +m.otd);
      const min = Math.floor(Math.min(...vals) - 1), max = Math.ceil(Math.max(...vals) + 1);
      const x = (i) => M.l + (MESES.length > 1 ? i * (W - M.l - M.r) / (MESES.length - 1) : (W - M.l - M.r) / 2);
      const y = (v) => M.t + (1 - (v - min) / (max - min)) * (H - M.t - M.b);
      const linea = MESES.map((m, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(m.otd).toFixed(1)}`).join('');
      const area = `${linea}L${x(MESES.length - 1).toFixed(1)} ${H - M.b}L${x(0).toFixed(1)} ${H - M.b}Z`;
      const guias = [];
      for (let v = min; v <= max; v += 1) guias.push(`<line x1="${M.l}" x2="${W - M.r}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"/><text x="${M.l - 10}" y="${(y(v) + 4).toFixed(1)}">${v}%</text>`);
      cuerpo.innerHTML =
        `<div class="bi-kpis">${(E.indicadores || []).map((k, i) => `<div class="bi-kpi${k.porcentaje ? ' destacado' : ''}" style="--i:${i}"><b data-k="${i}">0</b><span>${txt(k.nombre)}</span></div>`).join('')}</div>` +
        `<div class="bi-graf"><p class="bi-gtit">${txt(E.graficoTitulo)}</p>` +
        `<svg class="bi-linea" viewBox="0 0 ${W} ${H}"><g class="bi-guias">${guias.join('')}</g>` +
        `<path class="bi-area" d="${area}"/><path class="bi-trazo" d="${linea}" pathLength="1"/>` +
        MESES.map((m, i) => `<g class="bi-punto" data-i="${i}" style="--i:${i}"><rect x="${(x(i) - 40).toFixed(1)}" y="${M.t}" width="80" height="${H - M.t - M.b}"/>` +
          `<circle cx="${x(i).toFixed(1)}" cy="${y(m.otd).toFixed(1)}" r="6"/><text class="bi-mes" x="${x(i).toFixed(1)}" y="${H - 14}">${esc(m.mes)}</text>` +
          `<text class="bi-val" x="${x(i).toFixed(1)}" y="${(y(m.otd) - 14).toFixed(1)}">${fmt(m.otd, 2)}%</text></g>`).join('') +
        '</svg></div>';
      cuerpo.querySelectorAll('.bi-kpi b').forEach((b) => {
        const k = E.indicadores[+b.dataset.k];
        contar(b, +k.valor, k.porcentaje ? 2 : 0, k.porcentaje ? ' %' : '');
      });
      cuerpo.querySelectorAll('.bi-punto').forEach((g) => {
        const m = MESES[+g.dataset.i];
        g.addEventListener('pointerenter', () => { g.classList.add('activo'); mostrarTip(`<b>${esc(m.mes)}</b><span>OTD <strong>${fmt(m.otd, 2)} %</strong></span><span>${fmt(m.kg)} kg distribuidos</span>`, g.querySelector('circle')); });
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

    function elegir(t) {
      if (t === actual) return;
      actual = t;
      tabs.forEach((b) => { const si = b.dataset.t === t; b.classList.toggle('activo', si); b.setAttribute('aria-selected', si); });
      ocultarTip();
      cuerpo.classList.remove('entra'); void cuerpo.offsetWidth; cuerpo.classList.add('entra');
      (t === 'inversa' ? vistaInversa : vistaEntregas)();
    }
    tabs.forEach((b) => b.addEventListener('click', () => elegir(b.dataset.t)));
    // Guía (compartido/guia.js): los meses del gráfico, la pestaña de logística inversa y sus barras
    if (window.GUIA) {
      const medio = (sel) => { const l = cuerpo.querySelectorAll(sel); return l[Math.floor(l.length / 2)]; };
      GUIA.pista({ id: 'servicio-bi-puntos', texto: 'tablerosPuntos', objetivo: () => medio('.bi-punto circle'), zona: '.bi-punto', tipo: 'pasar', lado: 'arriba', espera: 2.4, activa: () => actual === 'entregas' });
      GUIA.pista({ id: 'servicio-bi-pestana', texto: 'tablerosPestana', objetivo: () => tabs[1], punto: [.5, .7], zona: '.bi-tabs button', lado: 'abajo', espera: 1.5 });
      GUIA.pista({ id: 'servicio-bi-barras', texto: 'tablerosBarras', objetivo: () => medio('.bi-col .bi-b-tiempo'), punto: [.5, .3], zona: '.bi-col', lado: 'arriba', espera: 1.5, activa: () => actual === 'inversa' });
    }
    // la primera vez que se ve, arranca la pestaña de entregas (así los números cuentan en pantalla)
    observar(seccion, (v) => {
      enVista = v;
      if (v && !visto) { visto = true; setTimeout(() => elegir('entregas'), 450); }
    });
  })();
})();
