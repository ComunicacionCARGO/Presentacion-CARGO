/* =========================================================
   NUESTRO TMS — dos demos que se pueden usar:
   - Gestión de carga: la planchada (zonas de stage y zstage como en el
     diseño). El cursor es un lector: al pasarlo por un bulto que llega, se
     lee y vuela a su zona; los indicadores cambian. Cuando una zona se llena,
     se despacha. Si nadie lo usa, el lector trabaja solo.
   - Interfases: el TMS en el centro, conectado con el ERP del cliente, el
     warehouse, el transporte de terceros y la App; cada interfase enciende
     sus recorridos (se pasan solas si nadie toca nada).
   Textos en datos/servicio.js → tms.
   ========================================================= */
(function () {
  const SV = window.SV;
  const seccion = document.querySelector('.sv-tms');
  if (!SV || !seccion) return;
  const { S, txt, crear, escala } = SV;
  const T = S.tms || {};
  const TC = T.carga || {}, TI = T.interfases || {}, TV = T.inversa || {};
  const NS = 'http://www.w3.org/2000/svg';
  const ahora = () => performance.now();

  const ICONOS = {
    carga: '<path d="M3 5h2v14H3zM6.5 5h1v14h-1zM9 5h2.5v14H9zM13 5h1v14h-1zM15.5 5h2v14h-2zM19 5h1v14h-1zM21 5h1v14h-1z"/>',
    inter: '<circle cx="12" cy="12" r="3.4"/><circle cx="4" cy="5" r="2.5"/><circle cx="20" cy="5" r="2.5"/><circle cx="4" cy="19" r="2.5"/><circle cx="20" cy="19" r="2.5"/><path d="M5.3 6.2 10.2 10.4 9.1 11.6 4.2 7.4zM18.7 6.2 13.8 10.4l1.1 1.2 4.9-4.2zM5.3 17.8l4.9-4.2-1.1-1.2-4.9 4.2zM18.7 17.8l-4.9-4.2 1.1-1.2 4.9 4.2z"/>',
    inversa: '<path d="M9.5 3.5 3 9l6.5 5.5V11H16a3.5 3.5 0 0 1 0 7h-4.5v2.6H16A6.1 6.1 0 0 0 16 8.4H9.5z"/>',
    flecha: '<path d="M5 11h11l-4-4 1.4-1.4L19.8 12l-6.4 6.4L12 17l4-4H5z"/>',
    // interfases (como los del diseño)
    ingreso: '<path d="M2 13h5.5l1.5 3h6l1.5-3H22v8H2z"/><path d="M4.4 11.5 6.6 5H10v2H8L6.6 11.5z"/><path fill-rule="evenodd" d="M17 1.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm-.9 7.4 3.4-3.4-1.1-1.1-2.3 2.3-1.2-1.2-1.1 1.1z"/>',
    obtencion: '<path fill-rule="evenodd" d="M2 3h20v2h-1v11H3V5H2zM5 5v9h14V5z"/><path d="M7 7h5v1.6H7zM7 10.5h5v1.6H7zM13.8 8.3l1.1-1.1 1 1 2.1-2.1 1.1 1.1-3.2 3.2zM11 16h2v2.6l3.2 2.7-1.1 1.2-3.1-2.6-3.1 2.6-1.1-1.2L11 18.6z"/>',
    precarga: '<path d="M2.5 3H6l3.4 12H20v2.2H7.7L4.3 5.2H2.5z"/><circle cx="9.5" cy="19.6" r="2.2"/><path d="m10.6 6.3 7-2 2.3 7.6-7 2z"/>',
    devolucion: '<path fill-rule="evenodd" d="M6 1h12v22H6zM8 3.5v15h8v-15z"/><path fill-rule="evenodd" d="M12 5.5a3 3 0 0 0-3 3c0 2.2 3 5.2 3 5.2s3-3 3-5.2a3 3 0 0 0-3-3zm0 1.9a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2z"/>',
    erp: '<path fill-rule="evenodd" d="M3 3h18v6H3zM5 5v2h2V5zM3 11h18v6H3zm2 2v2h2v-2z"/><path d="M11 19h2v2h-2zM6 20.5h12V22H6z"/>',
    warehouse: '<path fill-rule="evenodd" d="M12 2 1.5 8v14h21V8L12 2zM6 12h12v10H6z"/><path d="M6 14h12v2H6zM6 18h12v2H6z"/>',
    terceros: '<path d="M1 5.5h12.5V17H1zM14.5 9h4.3l3.2 4v4h-7.5z"/><circle cx="5" cy="18.3" r="2.4"/><circle cx="17.6" cy="18.3" r="2.4"/>',
    app: '<path fill-rule="evenodd" d="M6 1h12v22H6zM8 3.5v15h8v-15z"/><path d="M10.5 20h3v1.4h-3z"/>',
    lector: '<path d="M2 3.5h13l4 4v4.5H10.4L8.6 21H3.4l1.8-9H2z"/><path d="M19.5 7.2h3v1.6h-3z"/>'
  };
  const icono = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[k]}</svg>`;

  // =========================================================
  // COLUMNA IZQUIERDA: título y pestañas
  // =========================================================
  const PESTANAS = [
    { k: 'carga', d: TC, icono: 'carga' },
    { k: 'inter', d: TI, icono: 'inter' },
    { k: 'inversa', d: TV, icono: 'inversa' }
  ];
  const izq = crear('div', 'tm-izq', seccion,
    `<p class="tm-ante ent" style="--i:0">${txt(T.antetitulo)}</p><h2 class="tm-titulo ent" style="--i:1">${txt(T.titulo)}</h2>` +
    `<p class="tm-bajada ent" style="--i:2">${txt(T.bajada)}</p>` +
    '<div class="tm-tabs" role="tablist">' + PESTANAS.map((p, i) =>
      `<button type="button" class="tm-tab ent${p.k === 'inversa' ? ' bajar' : ''}" style="--i:${i + 3}" data-k="${p.k}">` +
      `${icono(p.icono)}<span><b>${txt(p.d.titulo)}</b><small>${txt(p.d.resumen)}</small></span>` +
      `<svg class="tm-flecha" viewBox="0 0 24 24" aria-hidden="true">${ICONOS.flecha}</svg></button>`).join('') + '</div>' +
    '<p class="tm-desc ent" style="--i:6"></p>');
  const desc = izq.querySelector('.tm-desc');
  const panel = crear('div', 'tm-panel ent', seccion);
  panel.style.setProperty('--i', 3);
  const vCarga = crear('div', 'tm-vista tc', panel);
  const vInter = crear('div', 'tm-vista ti', panel);

  let pestana = null;
  function elegir(k) {
    if (k === 'inversa') { SV.irA(document.querySelector('.sv-inv')); return; }
    if (k === pestana) return;
    pestana = k;
    izq.querySelectorAll('.tm-tab').forEach((b) => b.classList.toggle('activo', b.dataset.k === k));
    vCarga.classList.toggle('activa', k === 'carga');
    vInter.classList.toggle('activa', k === 'inter');
    desc.innerHTML = txt((k === 'carga' ? TC : TI).texto);
    desc.classList.remove('cambia'); void desc.offsetWidth; desc.classList.add('cambia');
    if (k === 'inter') reiniciarAuto();
  }
  izq.querySelectorAll('.tm-tab').forEach((b) => b.addEventListener('click', () => elegir(b.dataset.k)));

  // =========================================================
  // GESTIÓN DE CARGA
  // =========================================================
  const TIPOS = (TC.indicadores || []).slice(0, 3).map((ind, i) => ({
    nombre: ind.nombre, valor: +ind.valor || 0, color: ['var(--azul)', 'var(--rojo)', 'var(--ambar)'][i]
  }));
  const PESOS = [.6, .32, .08];                          // qué tan seguido llega cada tipo
  const ZONAS = [];
  [[3, 4, 5], [6, 7, 8]].forEach((b) => b.forEach((f) => ZONAS.push(f + '01', f + '02')));
  const MAX_ZONA = 14;                                   // con tantos bultos, la zona se despacha

  vCarga.innerHTML =
    `<div class="tc-cabeza"><b>${txt(TC.panel)}</b><span class="tc-vivo"><i></i>EN VIVO</span></div>` +
    '<div class="tc-indicadores">' + TIPOS.map((t) =>
      `<div class="tc-ind" style="--c:${t.color}"><span><i></i>${txt(t.nombre)}</span><b>${t.valor}</b></div>`).join('') +
    `<div class="tc-ind total"><span>${txt(TC.total)}</span><b>0</b></div></div>` +
    '<div class="tc-plano">' + [[3, 4, 5], [6, 7, 8]].map((filas) =>
      '<div class="tc-bloque"><div class="tc-bloque-rotulo"><span>STAGE</span></div>' +
      '<div class="tc-zs"><span>Z STAGE</span><span>Z STAGE</span></div><div class="tc-filas">' +
      filas.map((f) => `<div class="tc-fila"><small>ST-${f}00</small>` +
        [1, 2].map((c) => `<div class="tc-celda" data-z="${f}0${c}"><span>ZS ${f}0${c}</span><em class="tc-sale">Despacho</em><div class="tc-bultos"></div></div>`).join('') +
        '</div>').join('') + '</div></div>').join('') + '</div>' +
    `<div class="tc-recepcion"><span>${txt(TC.recepcion)}</span><div class="tc-cola"></div></div>` +
    `<p class="tc-ayuda">${icono('lector')}<span>${txt(TC.ayuda)}</span></p>`;
  const cola = vCarga.querySelector('.tc-cola');
  const ayuda = vCarga.querySelector('.tc-ayuda');
  const ayudaTxt = ayuda.querySelector('span').innerHTML;
  const celdas = {};
  vCarga.querySelectorAll('.tc-celda').forEach((el) => { celdas[el.dataset.z] = { el, bultos: el.querySelector('.tc-bultos'), n: 0, ocupada: false }; });
  const indEls = [...vCarga.querySelectorAll('.tc-ind b')];
  const valores = TIPOS.map((t) => t.valor);

  // Números que cuentan hasta el valor nuevo
  function mostrarValores(subio) {
    const total = valores.reduce((a, b) => a + b, 0);
    [...valores, total].forEach((v, i) => {
      const el = indEls[i];
      const desde = +el.dataset.v || 0;
      el.dataset.v = v;
      if (desde === v) return;
      const t0 = ahora();
      (function paso() {
        const t = Math.min(1, (ahora() - t0) / 450);
        el.textContent = Math.round(desde + (v - desde) * t);
        if (t < 1) requestAnimationFrame(paso);
      })();
      if (subio && (i === subio.tipo || i === TIPOS.length)) {
        const c = el.parentNode;
        c.classList.add('sube');
        clearTimeout(c._t);
        c._t = setTimeout(() => c.classList.remove('sube'), 500);
      }
    });
  }
  indEls.forEach((el) => { el.dataset.v = 0; });
  mostrarValores();

  const azar = (a) => a[Math.floor(Math.random() * a.length)];
  function tipoAzar() {
    let r = Math.random();
    for (let i = 0; i < TIPOS.length; i++) { if ((r -= PESOS[i]) < 0) return i; }
    return 0;
  }
  function agregarEnZona(z, tipo, nuevo) {
    const c = celdas[z];
    const i = crear('i', nuevo ? 'nuevo' : '', c.bultos);
    i.style.setProperty('--c', TIPOS[tipo].color);
    i.dataset.t = tipo;
    c.n++;
  }
  // Planchada con algo de carga al empezar
  ZONAS.forEach((z) => { const n = 3 + Math.floor(Math.random() * 7); for (let k = 0; k < n; k++) agregarEnZona(z, tipoAzar()); });

  // Cola de recepción (los nuevos llegan por la izquierda)
  const ANCHO_COLA = 6;
  function nuevoBulto() {
    const tipo = tipoAzar();
    const libres = ZONAS.filter((z) => !celdas[z].ocupada);
    const b = { tipo, z: azar(libres.length ? libres : ZONAS), estado: null };
    b.el = crear('div', 'tc-bulto');
    b.el.style.setProperty('--c', TIPOS[tipo].color);
    b.el.innerHTML = `<b>ZS ${b.z}</b><small>${txt(TIPOS[tipo].nombre)}</small><u></u>`;
    // Hay que dejar el lector un momento sobre el bulto (se ve cómo carga); con clic, se lee enseguida
    b.el.addEventListener('pointerenter', () => { usoCarga = ahora(); apuntar(b); });
    b.el.addEventListener('pointerleave', () => soltar(b));
    b.el.addEventListener('click', () => { usoCarga = ahora(); soltar(b); leer(b); });
    b.el.addEventListener('lectura-auto', () => leer(b));   // el lector automático (no cuenta como uso)
    return b;
  }
  // Mueve los bultos que quedan a su lugar nuevo con una animación (en vez de saltar)
  function flip(cambio) {
    const antes = new Map([...cola.children].map((el) => [el, el.getBoundingClientRect().left]));
    cambio();
    const k = escala();
    [...cola.children].forEach((el) => {
      if (!antes.has(el)) return;
      const dx = (antes.get(el) - el.getBoundingClientRect().left) / k;
      if (Math.abs(dx) > .5) el.animate([{ transform: `translateX(${dx}px)` }, { transform: 'none' }], { duration: 480, easing: 'cubic-bezier(.2,.8,.2,1)' });
    });
  }
  for (let i = 0; i < ANCHO_COLA; i++) cola.appendChild(nuevoBulto().el);

  const TIEMPO_APUNTAR = 700;            // ms con el lector encima para leer un bulto
  let ocupado = false;                   // de a un bulto por vez
  function apuntar(b) {
    if (b.estado || ocupado) return;
    b.el.classList.add('apuntando');
    clearTimeout(b.reloj);
    b.reloj = setTimeout(() => { b.el.classList.remove('apuntando'); usoCarga = ahora(); leer(b); }, TIEMPO_APUNTAR);
  }
  function soltar(b) {
    clearTimeout(b.reloj);
    b.el.classList.remove('apuntando');
  }
  function leer(b) {
    if (b.estado || ocupado) return;
    ocupado = true;
    b.estado = 'leyendo';
    b.el.classList.add('leyendo');
    setTimeout(() => {
      b.el.classList.add('leido');
      b.el.querySelector('small').textContent = '✓ ' + TIPOS[b.tipo].nombre;
      setTimeout(() => volar(b), 280);
    }, 380);
  }
  function volar(b) {
    const k = escala();
    const base = vCarga.getBoundingClientRect();
    const r0 = b.el.getBoundingClientRect(), c = celdas[b.z], r1 = c.bultos.getBoundingClientRect();
    const sx = (r0.left + r0.width / 2 - base.left) / k - 6, sy = (r0.top + r0.height / 2 - base.top) / k - 6;
    const ex = (r1.left - base.left) / k + Math.min(8, c.n % 9) * 16, ey = (r1.top - base.top) / k + Math.floor(c.n / 9) * 16;
    const punto = crear('i', 'tc-vuela', vCarga);
    punto.style.setProperty('--c', TIPOS[b.tipo].color);
    const mx = (sx + ex) / 2, my = Math.min(sy, ey) - 70;
    const anim = punto.animate([
      { transform: `translate(${sx}px, ${sy}px) scale(2.4)` },
      { transform: `translate(${mx}px, ${my}px) scale(1.6)`, offset: .45 },
      { transform: `translate(${ex}px, ${ey}px) scale(1)` }
    ], { duration: 720, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    // sale de la cola y entra uno nuevo por la izquierda
    flip(() => { b.el.remove(); cola.prepend(nuevoBulto().el); });
    anim.onfinish = () => {
      punto.remove();
      ocupado = false;
      agregarEnZona(b.z, b.tipo, true);
      c.el.classList.add('llega');
      setTimeout(() => c.el.classList.remove('llega'), 450);
      valores[b.tipo]++;
      mostrarValores({ tipo: b.tipo });
      if (c.n >= MAX_ZONA && !c.ocupada) despachar(b.z);
    };
  }
  function despachar(z) {
    const c = celdas[z];
    c.ocupada = true;
    setTimeout(() => {
      [...c.bultos.children].forEach((i, k) => i.style.setProperty('--k', k));
      c.el.classList.add('despacha');
      setTimeout(() => {
        [...c.bultos.children].forEach((i) => { valores[+i.dataset.t] = Math.max(0, valores[+i.dataset.t] - 1); });
        c.bultos.innerHTML = '';
        c.n = 0;
        mostrarValores();
        c.el.classList.remove('despacha');
        c.ocupada = false;
      }, 1100);
    }, 500);
  }

  // Lector automático si nadie lo usa
  let usoCarga = -1e9, enVista = false;
  setInterval(() => {
    const auto = enVista && pestana === 'carga' && ahora() - usoCarga > 3500;
    ayuda.classList.toggle('auto', auto);
    ayuda.querySelector('span').innerHTML = auto ? 'Lector automático · pasá el mouse por un bulto para leerlo vos' : ayudaTxt;
    if (!auto || ocupado) return;
    const libres = [...cola.children].reverse();
    for (const el of libres) {
      if (!el.classList.contains('leyendo')) { el.dispatchEvent(new Event('lectura-auto')); break; }
    }
  }, 1500);

  // =========================================================
  // INTERFASES
  // =========================================================
  const NOD = TI.nodos || {};
  const NODOS = [
    { k: 'cliente', x: 36, y: 178, icono: 'erp' },
    { k: 'warehouse', x: 660, y: 40, icono: 'warehouse' },
    { k: 'terceros', x: 660, y: 178, icono: 'terceros' },
    { k: 'app', x: 660, y: 316, icono: 'app' }
  ];
  const LINEAS = {
    ingreso: 'M232,198 C300,168 330,168 392,184',
    devolucion: 'M392,228 C330,252 300,252 232,224',
    preW: 'M546,160 C600,116 610,72 660,72',
    preT: 'M558,194 C600,188 620,194 660,196',
    obtT: 'M660,226 C620,226 600,232 556,224',
    obtA: 'M660,348 C610,348 596,300 546,252'
  };
  const FLUJOS = [
    { lineas: ['ingreso'], nodos: ['cliente'], icono: 'ingreso' },
    { lineas: ['preW', 'preT'], nodos: ['warehouse', 'terceros'], icono: 'precarga' },
    { lineas: ['obtT', 'obtA'], nodos: ['terceros', 'app'], icono: 'obtencion' },
    { lineas: ['devolucion'], nodos: ['cliente'], icono: 'devolucion' }
  ];
  const LISTA = (TI.lista || []).slice(0, 4);

  vInter.innerHTML =
    `<p class="ti-texto">${txt(TI.texto)}</p>` +
    '<div class="ti-red"><svg viewBox="0 0 940 420" aria-hidden="true">' +
    Object.entries(LINEAS).map(([k, d]) => `<path class="ti-linea" data-l="${k}" d="${d}"/>`).join('') +
    '<g class="ti-paquetes"></g></svg>' +
    NODOS.map((n) => `<div class="ti-nodo" data-n="${n.k}" style="left:${n.x}px;top:${n.y}px">${icono(n.icono)}<b>${txt(NOD[n.k])}</b></div>`).join('') +
    `<div class="ti-tms"><div><b>TMS</b><small>${txt(NOD.tms)}</small></div></div></div>` +
    '<div class="ti-lista">' + LISTA.map((it, i) =>
      `<button type="button" class="ti-item" data-i="${i}">${icono(FLUJOS[i].icono)}<b>${txt(it.titulo)}</b><span>${txt(it.texto)}</span></button>`).join('') + '</div>';
  const lineas = {};
  vInter.querySelectorAll('.ti-linea').forEach((p) => { lineas[p.dataset.l] = { el: p, largo: p.getTotalLength() }; });
  const gPaq = vInter.querySelector('.ti-paquetes');
  const items = [...vInter.querySelectorAll('.ti-item')];
  const nodosEl = {};
  vInter.querySelectorAll('.ti-nodo').forEach((n) => { nodosEl[n.dataset.n] = n; });

  let flujo = -1, paquetes = [];
  function elegirFlujo(i, auto) {
    flujo = i;
    const f = FLUJOS[i];
    Object.entries(lineas).forEach(([k, l]) => l.el.classList.toggle('activa', f.lineas.includes(k)));
    Object.entries(nodosEl).forEach(([k, el]) => el.classList.toggle('activo', f.nodos.includes(k)));
    items.forEach((b, k) => {
      b.classList.toggle('activo', k === i);
      b.classList.remove('auto');
    });
    if (auto) { void items[i].offsetWidth; items[i].classList.add('auto'); }
    // paquetes que viajan por cada línea (con el nombre de lo que llevan)
    const etiqueta = (LISTA[i] && LISTA[i].paquete) || '';
    const ancho = Math.max(40, etiqueta.length * 6.8 + 22);
    gPaq.innerHTML = '';
    paquetes = [];
    f.lineas.forEach((k, j) => {
      for (let n = 0; n < 2; n++) {
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'ti-paquete');
        g.innerHTML = n === 0
          ? `<rect x="${-ancho / 2}" y="-11" width="${ancho}" height="22" rx="11"/><text y="4">${SV.esc(etiqueta)}</text>`
          : '<circle r="5"/>';
        gPaq.appendChild(g);
        paquetes.push({ g, l: lineas[k], fase: n * .5 + j * .25 });
      }
    });
  }
  const DUR = 4.5;   // segundos por interfase en el recorrido automático
  let usoInter = -1e9, relojAuto = null;
  function reiniciarAuto() {
    clearInterval(relojAuto);
    relojAuto = setInterval(() => {
      if (!enVista || pestana !== 'inter' || ahora() - usoInter < 8000) return;
      elegirFlujo((flujo + 1) % FLUJOS.length, true);
    }, DUR * 1000);
    if (flujo < 0) elegirFlujo(0, true);
  }
  vInter.style.setProperty('--dur', DUR + 's');
  items.forEach((b, i) => {
    const usar = () => { usoInter = ahora(); if (flujo !== i) elegirFlujo(i); else b.classList.remove('auto'); };
    b.addEventListener('pointerenter', usar);
    b.addEventListener('click', usar);
  });

  (function cuadro() {
    requestAnimationFrame(cuadro);
    if (!enVista || pestana !== 'inter') return;
    const t = ahora() / 1700;
    paquetes.forEach((p) => {
      const f = (t + p.fase) % 1;
      const q = p.l.el.getPointAtLength(f * p.l.largo);
      p.g.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})`);
      p.g.style.opacity = Math.min(1, Math.min(f, 1 - f) * 8).toFixed(2);
    });
  })();

  // =========================================================
  // APARICIÓN
  // =========================================================
  new IntersectionObserver((en) => {
    enVista = en[0].isIntersecting;
    seccion.classList.toggle('en-vista', enVista);
    if (enVista) seccion.classList.add('visible');
  }, { threshold: .35 }).observe(seccion);
  elegir('carga');
})();
