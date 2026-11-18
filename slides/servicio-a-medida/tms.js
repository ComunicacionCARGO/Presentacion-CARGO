/* =========================================================
   ¿CÓMO LO HACEMOS? — el recorrido de un pedido de Ford, parada por parada
   (pedido de la persona, con el esquema de su equipo: más guiado y lineal).
   La sección es larga: mientras se baja, la pantalla queda quieta (.rc-quieto)
   y la mercadería avanza por la ruta de la izquierda; cada parada abre su
   explicación (y su interfaz, si tiene) y cambia el panel de la derecha:
     1. Ingreso del pedido (interfaz Ingreso de pedidos): demo de este archivo.
     2. Geoposicionamiento indoor: la planchada con stages y z-stages (este archivo).
     3. Staging por ruta (interfaz Obtención de eventos; empieza el tracking): este archivo.
     4. Gestión de viajes (interfaz Precarga) y
     5. Entrega y digitalización (interfaz Devolución de eventos): ecosistema.js
        (los viajes, el tracking y la carta de porte que se completa al entregar).
     6. Experiencia de usuario: experiencia.js (No calidad y TICO).
   Arriba de la sección van las tres franjas de la marca (sube por encima de
   la portada) y abajo dos (la tercera es el rojo de la logística inversa).
   Textos en datos/servicio.js → como, recorrido, tms y experiencia.
   ========================================================= */
(function () {
  const SV = window.SV;
  const seccion = document.querySelector('.sv-tms');
  if (!SV || !seccion) return;
  const { S, txt, crear, esc, escala } = SV;
  const T = S.tms || {};
  const TC = T.carga || {}, TP = T.pedido || {}, TS = T.staging || {}, TD = T.despachos || {};
  const CO = S.como || {}, R = S.recorrido || {};
  const ahora = () => performance.now();

  const ICONOS = {
    flecha: '<path d="M5 11h11l-4-4 1.4-1.4L19.8 12l-6.4 6.4L12 17l4-4H5z"/>',
    interfaz: '<path d="M4 7h12.2l-3-3L14.6 2.6 20 8l-5.4 5.4-1.4-1.4 3-3H4zM20 17H7.8l3 3-1.4 1.4L4 16l5.4-5.4 1.4 1.4-3 3H20z"/>',
    pedido: '<path fill-rule="evenodd" d="M5 1h10l5 5v17H5zM14 2.5V7h4.5z"/><path d="M8 11h9v1.6H8zM8 14.5h9v1.6H8zM8 18h6v1.6H8z" fill="#FFFBF3"/>',
    ubicacion: '<path fill-rule="evenodd" d="M12 1.5a6.4 6.4 0 0 0-6.4 6.4c0 4.7 6.4 11.4 6.4 11.4s6.4-6.7 6.4-11.4A6.4 6.4 0 0 0 12 1.5zm0 3.9a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2z"/><path d="M2 19.5h4.2l1.6 2H2zM17.8 19.5H22v2h-5.8z"/>',
    staging: '<path d="M2 3h6v5H2zM9 3h6v5H9zM16 3h6v5h-6zM2 10.5h6v5H2zM9 10.5h6v5H9zM2 18h6v3H2z"/><path d="M17 12h2v6.2l2.2-2.2 1.4 1.4-4.6 4.6-4.6-4.6 1.4-1.4 2.2 2.2z"/>',
    viajes: '<path d="M1 5h13v11H1zM15 8.5h4.6L23 12.8V16h-8z"/><circle cx="5.5" cy="18" r="2.6"/><circle cx="18.5" cy="18" r="2.6"/>',
    entrega: '<path fill-rule="evenodd" d="M6 1h12v22H6zM8 3.5v15h8v-15z"/><path d="M9.6 11.6 11.3 13.3 14.6 9.9 15.8 11.1 11.3 15.6 8.4 12.8z"/>',
    experiencia: '<circle cx="8.5" cy="7.5" r="4"/><path d="M1 21.5c0-4.4 3.4-7.6 7.5-7.6s7.5 3.2 7.5 7.6z"/><path d="M14 2h8.5v7.2h-3.6L16.4 12V9.2H14z"/>',
    caja: '<path d="M12 2 21 6.5v11L12 22l-9-4.5v-11z" opacity=".35"/><path d="M12 2 21 6.5 12 11 3 6.5zM3 8.2l8 4v8.6l-8-4zM13 12.2l8-4v8.6l-8 4z"/>',
    erp: '<path fill-rule="evenodd" d="M3 3h18v6H3zM5 5v2h2V5zM3 11h18v6H3zm2 2v2h2v-2z"/><path d="M11 19h2v2h-2zM6 20.5h12V22H6z"/>',
    tms: '<path fill-rule="evenodd" d="M2 3.5h20v13.5H2zM4 5.5V15h16V5.5z"/><path d="M8 19h8v2H8zM5.8 9.6l1.2-1.2 1.3 1.3 2.8-2.8 1.2 1.2-4 4zM13 8h5v1.8h-5zM6 12.6h12v1.8H6z"/>',
    deposito: '<path fill-rule="evenodd" d="M12 2 1.5 8v14h21V8L12 2zM6 12h12v10H6z"/><path d="M6 14h12v2H6zM6 18h12v2H6z"/>',
    lector: '<path d="M2 3.5h13l4 4v4.5H10.4L8.6 21H3.4l1.8-9H2z"/><path d="M19.5 7.2h3v1.6h-3z"/>',
    tilde: '<path d="M9.2 16.6 4.4 11.8l1.8-1.8 3 3 8.6-8.6 1.8 1.8z"/>'
  };
  const icono = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[k] || ''}</svg>`;

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

  // =========================================================
  // LAS PARADAS (datos/servicio.js → recorrido.paradas; "clave" dice qué demo va en el panel)
  // =========================================================
  const VISTA_DE = { pedido: 'pedido', ubicacion: 'carga', staging: 'staging', viajes: 'despachos', entrega: 'despachos', experiencia: 'experiencia' };
  const PARADAS = (R.paradas || []).filter((p) => VISTA_DE[p.clave]);
  const N = PARADAS.length;
  const PASO = 480;                       // px de scroll por parada
  const iTrack = [PARADAS.findIndex((p) => p.clave === 'staging'), PARADAS.findIndex((p) => p.clave === 'entrega')];
  const conTracking = (i) => iTrack[0] >= 0 && i >= iTrack[0] && i <= iTrack[1];

  // la sección mide 900 + lo que se recorre + las dos franjas de abajo
  const RECORRIDO = Math.max(0, N - 1) * PASO;
  seccion.style.height = (900 + RECORRIDO + 91) + 'px';
  crear('div', 'in-franjas', seccion);
  crear('div', 'ex-franjas', seccion).style.top = (900 + RECORRIDO) + 'px';
  const quieto = crear('div', 'rc-quieto', seccion);

  // =========================================================
  // COLUMNA IZQUIERDA: título y la ruta
  // =========================================================
  const izq = crear('div', 'tm-izq', quieto,
    `<div class="tm-cab ent" style="--i:0"><p class="tm-ante"><span>${txt(CO.antetitulo)}</span>` +
    `<span class="tm-sello"><i class="franjitas"></i>${txt(CO.sello)}</span></p><h2 class="tm-titulo">${txt(CO.titulo)}</h2></div>` +
    `<p class="tm-bajada ent" style="--i:1">${txt(CO.bajada)}</p>` +
    '<div class="rc-ruta ent" style="--i:2">' +
    '<i class="rc-linea"><i class="rc-track"></i><i class="rc-hecha"></i></i>' +
    `<span class="rc-bulto">${icono('caja')}</span>` +
    '<ol>' + PARADAS.map((p, i) => {
      const f = p.interfaz || {};
      return `<li class="rc-parada${conTracking(i) ? ' con-track' : ''}" data-i="${i}">` +
        `<button type="button" class="rc-nodo" aria-label="${esc(p.titulo)}">${icono(p.clave)}</button>` +
        `<div class="rc-cuerpo"><button type="button" class="rc-tit"><small>${String(i + 1).padStart(2, '0')}</small><b>${txt(p.titulo)}</b>` +
        (conTracking(i) ? `<em class="rc-vivo"><i></i>${txt(R.tracking || 'Tracking')}</em>` : '') + '</button>' +
        `<div class="rc-mas"><div><p class="rc-texto">${txt(p.texto)}</p>` +
        (f.nombre ? `<div class="rc-if">${icono('interfaz')}<div><span>${txt(R.interfaz || 'Interfaz')}</span><b>${txt(f.nombre)}</b><p>${txt(f.texto)}</p>` +
          `<div class="rc-via"><small>${txt(f.de)}</small><i><u></u></i><small>${txt(f.a)}</small></div></div></div>` : '') +
        '</div></div></div></li>';
    }).join('') + '</ol></div>' +
    (R.final ? `<button type="button" class="rc-final ent" style="--i:3"><span>${txt(R.final)}</span><b>${txt(R.finalBoton || '')}${icono('flecha')}</b></button>` : ''));
  const paradasEl = [...izq.querySelectorAll('.rc-parada')];
  const linea = izq.querySelector('.rc-linea'), hecha = izq.querySelector('.rc-hecha'), track = izq.querySelector('.rc-track');
  const bulto = izq.querySelector('.rc-bulto');
  const ruta = izq.querySelector('.rc-ruta');

  const panel = crear('div', 'tm-panel ent', quieto);
  panel.style.setProperty('--i', 3);
  const vistas = {};
  const CLASE = { pedido: 'pd', carga: 'tc', staging: 'st', despachos: 'td', experiencia: 'ex' };
  Object.keys(CLASE).forEach((k) => { vistas[k] = crear('div', 'tm-vista ' + CLASE[k], panel); });
  const vCarga = vistas.carga;
  const alElegir = {};   // ecosistema.js y este archivo anotan acá qué hacer al llegar a cada parada

  let parada = -1, pestana = null, modo = null, enVista = false;
  function elegir(i) {
    i = Math.max(0, Math.min(N - 1, i));
    if (i === parada) return;
    parada = i;
    const p = PARADAS[i];
    paradasEl.forEach((el, k) => {
      el.classList.toggle('activa', k === i);
      el.classList.toggle('hecha', k < i);
    });
    pestana = VISTA_DE[p.clave];
    modo = p.clave;
    Object.entries(vistas).forEach(([k, v]) => v.classList.toggle('activa', k === pestana));
    vistas.despachos.dataset.modo = modo;
    if (enVista) activarVista();
  }
  // cada demo arranca al llegar a su parada (con la sección en pantalla)
  function activarVista() { if (alElegir[pestana]) alElegir[pestana](modo); }
  // para ecosistema.js y experiencia.js
  SV.tms = { vistas, alElegir, get pestana() { return pestana; }, get modo() { return modo; }, get enVista() { return enVista; } };

  // ---------- El scroll mueve la mercadería; la pantalla queda quieta ----------
  const topeDe = () => seccion.offsetTop;
  const irParada = (i) => { if (window.desplazamiento) window.desplazamiento.ir(topeDe() + i * PASO); };
  paradasEl.forEach((el, i) => {
    el.querySelector('.rc-nodo').addEventListener('click', () => irParada(i));
    el.querySelector('.rc-tit').addEventListener('click', () => irParada(i));
  });
  const final = izq.querySelector('.rc-final');
  if (final) final.addEventListener('click', () => { const bi = document.querySelector('.sv-bi'); if (bi && window.desplazamiento) window.desplazamiento.ir(bi.offsetTop); });

  let avance = 0;                         // 0 … N−1 (en paradas, con decimales)
  function alDesplazar(y) {
    const d = y - topeDe();
    quieto.style.transform = `translate3d(0, ${Math.min(Math.max(d, 0), RECORRIDO).toFixed(2)}px, 0)`;
    avance = Math.min(Math.max(d / PASO, 0), N - 1);
    const antes = enVista;
    enVista = d > -700 && d < RECORRIDO + 700;
    seccion.classList.toggle('en-vista', enVista);
    if (enVista && !antes) seccion.classList.add('visible');
    const i = Math.round(avance);
    if (i !== parada) elegir(i);
    else if (enVista && !antes) activarVista();
    despertar();
  }
  document.addEventListener('desplazamiento', (e) => alDesplazar(e.detail.y));

  // la línea, lo recorrido, el tramo con tracking y la caja que baja (un cuadro solo mientras algo se mueve)
  let bucle = null, mostrado = -1, quietoDesde = 0;
  const centro = (el) => { const n = el.querySelector('.rc-nodo'); return el.offsetTop + n.offsetTop + n.offsetHeight / 2; };
  function cuadro(t) {
    bucle = null;
    if (!enVista || !N) return;
    mostrado += (avance - mostrado) * (mostrado < 0 ? 1 : .22);
    const cs = paradasEl.map(centro);
    const k = Math.min(N - 2, Math.floor(mostrado)), f = mostrado - Math.max(0, k);
    const yb = N > 1 ? cs[Math.max(0, k)] + (cs[Math.max(0, k) + 1] - cs[Math.max(0, k)]) * f : cs[0];
    linea.style.top = cs[0] + 'px';
    linea.style.height = (cs[N - 1] - cs[0]) + 'px';
    hecha.style.height = Math.max(0, yb - cs[0]) + 'px';
    if (iTrack[0] >= 0) { track.style.top = (cs[iTrack[0]] - cs[0]) + 'px'; track.style.height = (cs[iTrack[1]] - cs[iTrack[0]]) + 'px'; }
    bulto.style.transform = `translate3d(0, ${yb.toFixed(1)}px, 0)`;
    bulto.classList.toggle('en-track', conTracking(Math.round(mostrado)) || (mostrado > iTrack[0] && mostrado < iTrack[1]));
    // sigue unos cuadros más mientras se acomodan las paradas que se abren
    if (Math.abs(avance - mostrado) > .002) quietoDesde = t;
    if (t - quietoDesde < 700) despertar();
  }
  function despertar() { if (!bucle) bucle = requestAnimationFrame(cuadro); }
  ruta.addEventListener('transitionend', despertar);

  // =========================================================
  // 1. INGRESO DEL PEDIDO (interfaz con el ERP del cliente y llegada al depósito)
  // =========================================================
  (function pedido() {
    const v = vistas.pedido;
    const PED = (TP.pedidos || []).slice(0, 4);
    const COLOR_TIPO = {}; (TC.indicadores || []).forEach((ind, i) => { COLOR_TIPO[String(ind.nombre).toLowerCase()] = ['var(--azul)', 'var(--rojo)', 'var(--ambar)'][i]; });
    const totalBultos = PED.reduce((a, p) => a + (+p.bultos || 0), 0);
    v.innerHTML =
      `<div class="pd-cab"><b>${txt(TP.panel)}</b><span class="pd-if">${icono('interfaz')}${txt(R.interfaz || 'Interfaz')}</span></div>` +
      `<div class="pd-sis pd-erp">${icono('erp')}<div><b>${txt(TP.erp)}</b><small>${txt(TP.erpTexto)}</small></div></div>` +
      `<div class="pd-via"><i class="pd-linea"></i><span class="pd-archivo">${icono('pedido')}${esc(TP.archivo || 'pedidos.txt')}</span></div>` +
      `<div class="pd-sis pd-tms">${icono('tms')}<div><b>${txt(TP.tms)}</b><small>${txt(TP.tmsTexto)}</small></div></div>` +
      `<div class="pd-tabla"><p>${txt(TP.tabla)}</p><div class="pd-fila pd-enc"><span>Pedido</span><span>Destino</span><span>Bultos</span><span>Tipo</span><span>Estado</span></div><div class="pd-filas"></div></div>` +
      `<div class="pd-llegada"><p>${txt(TP.llegada)}</p><i class="pd-calle"></i>` +
      `<span class="pd-camion">${icono('viajes')}</span><span class="pd-dep">${icono('deposito')}<b>${txt(TP.deposito)}</b></span>` +
      '<div class="pd-cajas"></div><p class="pd-recibidos"></p></div>' +
      `<button type="button" class="pd-boton">${txt(TP.boton)}</button>`;
    const filas = v.querySelector('.pd-filas'), archivo = v.querySelector('.pd-archivo');
    const llegada = v.querySelector('.pd-llegada'), cajas = v.querySelector('.pd-cajas'), recibidos = v.querySelector('.pd-recibidos');
    const boton = v.querySelector('.pd-boton');
    const c = corredor();
    function reiniciar() {
      c.nueva();
      filas.innerHTML = '';
      cajas.innerHTML = '';
      recibidos.textContent = '';
      llegada.classList.remove('llega', 'listo');
      archivo.classList.remove('viaja');
      v.classList.remove('hecho');
    }
    async function correr() {
      reiniciar();
      const id = c.nueva();
      await c.dormir(500, id);
      for (const p of PED) {
        archivo.classList.remove('viaja'); void archivo.offsetWidth; archivo.classList.add('viaja');
        await c.dormir(900, id);
        const tipo = String(p.tipo || '');
        const fila = crear('div', 'pd-fila', filas,
          `<span><b>${esc(p.numero)}</b></span><span>${txt(p.destino)}</span><span>${esc(p.bultos)}</span>` +
          `<span class="pd-tipo" style="--c:${COLOR_TIPO[tipo.toLowerCase()] || 'var(--gris)'}"><i></i>${esc(tipo)}</span><span class="pd-ok">${icono('tilde')}Recibido</span>`);
        fila.classList.add('nueva');
        await c.dormir(350, id);
      }
      await c.dormir(500, id);
      llegada.classList.add('llega');               // el camión llega al depósito
      await c.dormir(1700, id);
      for (let k = 0; k < Math.min(18, totalBultos); k++) { crear('i', '', cajas).style.setProperty('--k', k); }
      llegada.classList.add('listo');
      recibidos.innerHTML = txt(TP.recibidos, { bultos: totalBultos });
      v.classList.add('hecho');
    }
    boton.addEventListener('click', () => correr().catch(cancelado));
    alElegir.pedido = () => correr().catch(cancelado);
  })();

  // =========================================================
  // 2. GEOPOSICIONAMIENTO INDOOR: la planchada (stages y z-stages)
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
  // Guía (compartido/guia.js): la mano señala un bulto de la cola
  if (window.GUIA) GUIA.pista({ id: 'servicio-lector', texto: 'tmsLector', objetivo: () => cola.querySelector('.tc-bulto:not(.leido):not(.leyendo)'), zona: '.tc-bulto', tipo: 'pasar', lado: 'arriba', espera: 1.6, activa: () => enVista && pestana === 'carga' });
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
  let usoCarga = -1e9;
  setInterval(() => {
    const auto = enVista && pestana === 'carga' && ahora() - usoCarga > 3500;
    ayuda.classList.toggle('auto', auto);
    ayuda.querySelector('span').innerHTML = auto ? txt(TC.ayudaAuto || 'Lector automático · pasá el mouse por un bulto para leerlo vos') : ayudaTxt;
    if (!auto || ocupado) return;
    const libres = [...cola.children].reverse();
    for (const el of libres) {
      if (!el.classList.contains('leyendo')) { el.dispatchEvent(new Event('lectura-auto')); break; }
    }
  }, 1500);

  // =========================================================
  // 3. STAGING POR RUTA (y empieza el tracking)
  // =========================================================
  (function staging() {
    const v = vistas.staging;
    const VIAJES = (TD.viajes || []).slice(0, 3);
    const COLORES = ['var(--rojo)', 'var(--ambar)', 'var(--azul)'];
    // código corto del destino: Rosario → ROS, San Luis → SLU, Sgo. del Estero → SES
    const siglas = (n) => {
      const p = String(n || '').replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 || /^[A-Z]/.test(w));
      const s = p.length > 1 ? p[0][0] + p[p.length - 1].slice(0, 2) : (p[0] || '').slice(0, 3);
      return s.toUpperCase();
    };
    const total = VIAJES.reduce((a, vj) => a + (+vj.bultos || 0), 0);
    v.innerHTML =
      `<div class="st-cab"><b>${txt(TS.panel)}</b><span class="tc-vivo"><i></i>EN VIVO</span>` +
      `<span class="st-track"><i></i>${txt(R.tracking || 'Tracking en tiempo real')}</span></div>` +
      `<div class="st-cola"><p>${txt(TS.desde)}</p><div class="st-chips"></div></div>` +
      '<div class="st-carriles">' + VIAJES.map((vj, i) => {
        const fin = (vj.paradas || []).slice(-1)[0] || '';
        return `<div class="st-carril" style="--c:${COLORES[i]}" data-i="${i}"><div class="st-ccab"><i></i><b>${txt(TS.ruta || 'Ruta')} ${esc(fin)}</b>` +
          `<small>${esc(vj.codigo)}</small><em><span>0</span> / ${+vj.bultos || 0}</em></div>` +
          '<div class="st-piso">' + Array.from({ length: +vj.bultos || 0 }, () => '<span class="st-lugar"></span>').join('') + `<p class="st-listo">${icono('tilde')}${txt(TS.rutaLista)}</p></div></div>`;
      }).join('') + '</div>' +
      `<div class="st-eventos"><p><span>${txt(TS.eventos)}</span><b class="st-control"></b></p><div class="st-lista"></div></div>`;
    const chipsEl = v.querySelector('.st-chips'), lista = v.querySelector('.st-lista'), control = v.querySelector('.st-control');
    const carriles = [...v.querySelectorAll('.st-carril')];
    const c = corredor();
    let chips = [];
    function reiniciar() {
      c.nueva();
      chipsEl.innerHTML = ''; lista.innerHTML = ''; control.innerHTML = ''; nEventos = 0;
      v.classList.remove('hecho');
      const orden = [];
      VIAJES.forEach((vj, i) => { for (let n = 0; n < (+vj.bultos || 0); n++) orden.push(i); });
      for (let i = orden.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [orden[i], orden[j]] = [orden[j], orden[i]]; }
      chips = orden.map((i, n) => {
        const fin = (VIAJES[i].paradas || []).slice(-1)[0];
        const el = crear('span', 'td-chip', chipsEl, `<i></i>${esc(siglas(fin))}-${String(4110 + n * 7).slice(-4)}`);
        el.style.setProperty('--c', COLORES[i]);
        return { el, i, cod: el.textContent };
      });
      carriles.forEach((cr) => {
        cr.classList.remove('listo');
        cr.querySelector('em span').textContent = '0';
        cr.querySelectorAll('.st-lugar').forEach((l) => { l.classList.remove('lleno'); l.style.removeProperty('--c'); l.textContent = ''; });
      });
    }
    let nEventos = 0;
    function evento(texto) {
      const d = new Date(2024, 6, 15, 8, 2 + 2 * nEventos++);
      const hh = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      const fila = crear('div', 'st-ev', null, `<span>${hh}</span><b>${texto}</b><small>${txt(TS.fuente)}</small>`);
      lista.prepend(fila);
      while (lista.children.length > 3) lista.lastChild.remove();
    }
    async function correr() {
      reiniciar();
      const id = c.nueva();
      await c.dormir(700, id);
      const cuenta = VIAJES.map(() => 0);
      // de abajo hacia arriba: los que quedan siguen arriba, sin huecos
      for (const ch of chips.slice().reverse()) {
        const cr = carriles[ch.i], lugar = cr.querySelectorAll('.st-lugar')[cuenta[ch.i]];
        const k = escala(), base = v.getBoundingClientRect(), a = ch.el.getBoundingClientRect(), b = lugar.getBoundingClientRect();
        const sx = (a.left - base.left) / k, sy = (a.top - base.top) / k, ex = (b.left - base.left) / k, ey = (b.top - base.top) / k;
        const clon = ch.el.cloneNode(true);
        clon.classList.add('td-vuela');
        v.appendChild(clon);
        ch.el.classList.add('ido');
        clon.animate([
          { transform: `translate(${sx}px, ${sy}px)` },
          { transform: `translate(${(sx + ex) / 2}px, ${Math.min(sy, ey) - 40}px) scale(1.06)`, offset: .45 },
          { transform: `translate(${ex}px, ${ey}px) scale(.9)` }
        ], { duration: 560, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).finished.then(() => {
          clon.remove();
          if (!c.vigente(id)) return;
          lugar.classList.add('lleno');
          lugar.style.setProperty('--c', COLORES[ch.i]);
          lugar.textContent = ch.cod.split('-')[1];
        });
        cuenta[ch.i]++;
        await c.dormir(600, id);
        cr.querySelector('em span').textContent = cuenta[ch.i];
        evento(txt(TS.evento, { codigo: ch.cod, ruta: (VIAJES[ch.i].paradas || []).slice(-1)[0] || '' }));
        if (cuenta[ch.i] === (+VIAJES[ch.i].bultos || 0)) cr.classList.add('listo');
        await c.dormir(240, id);
      }
      await c.dormir(500, id);
      control.innerHTML = icono('tilde') + txt(TS.control, { total });
      v.classList.add('hecho');
    }
    alElegir.staging = () => correr().catch(cancelado);
  })();

  elegir(0);
  alDesplazar(window.desplazamiento ? window.desplazamiento.y : 0);
})();
