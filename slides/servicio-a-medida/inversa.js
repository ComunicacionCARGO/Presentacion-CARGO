/* =========================================================
   LOGÍSTICA INVERSA — simulación de un reclamo (con la info de la persona:
   recolección, traslado, trazabilidad y disposición final por devolución,
   garantía o rotación; el concesionario autogestiona su devolución).
   Una escena (depósito, calle y concesionario con el camión), el celular
   (primero lo usa el concesionario, después el chofer: Nueva devolución,
   motivo, foto, escaneo y firma) y la ficha del reclamo en el TMS, que se
   completa con cada evento. Pasos: solicitud → registro → programación →
   retiro → traslado → disposición final → análisis de causas → cierre.
   Si nadie toca nada, cada acción se hace sola al rato (y la simulación
   arranca sola si la sección queda en pantalla sin uso).
   Textos en datos/servicio.js → inversa.
   ========================================================= */
(function () {
  const SV = window.SV;
  const seccion = document.querySelector('.sv-inv');
  if (!SV || !seccion) return;
  const { S, txt, esc, crear, escala, cliente } = SV;
  const I = S.inversa || {};
  const PASOS = (I.pasos || []).slice(0, 7);
  const TIPOS = I.tipos || [];
  const DESTINOS = (I.destinos || []).slice();
  const ESTADOS = I.estados || [];
  const C = I.cierre || {};
  const $ = (s) => seccion.querySelector(s);
  const ahora = () => performance.now();
  const pad = (n) => String(n).padStart(2, '0');

  let tipo = null;
  const vars = () => ({ numero: I.numero || '', tipo: tipo ? tipo.nombre : '', destino: tipo ? tipo.destino : '' });
  const t = (s) => txt(s, vars());
  const plano = (s) => { const d = document.createElement('div'); d.innerHTML = t(s); return d.textContent; };

  // ---------- Posiciones en la escena (viewBox 720 × 430) ----------
  const X_CD = 190, X_CON = 520, PISO = 384, VEREDA = 356;
  const LUGARES = [612, 640, 668];     // bultos entregados en la vereda del concesionario
  const PUERTA_CD = 274;               // donde queda el bulto al volver

  // =========================================================
  // ARMADO
  // =========================================================
  const caja = (clase, extra) =>
    `<g class="iv-caja ${clase}"><rect x="-14" y="-26" width="28" height="26" rx="2.5"/>` +
    '<path class="cinta" d="M-14 -16.5h28M-3 -26v9.5"/>' + (extra || '') + '</g>';
  const ruedas = [-48, -24, 40].map((x) =>
    `<g transform="translate(${x} -10)"><g class="iv-giro"><circle class="iv-goma" r="10"/><circle class="iv-llanta" r="4.5"/><path class="iv-rayos" d="M0 -7.5v15M-7.5 0h15"/></g></g>`).join('');
  const ESCENA =
    '<svg class="iv-svg" viewBox="0 0 720 430" aria-hidden="true"><defs>' +
    '<linearGradient id="iv-vidrio" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E6EEF1"/><stop offset=".6" stop-color="#C9D8DF"/><stop offset="1" stop-color="#B3C7D0"/></linearGradient></defs>' +
    // satélite (se enciende en el regreso)
    '<g class="iv-sat" transform="translate(360 52)"><g class="iv-sat-cuerpo"><rect x="-30" y="-5" width="18" height="10" rx="1.5"/><rect x="12" y="-5" width="18" height="10" rx="1.5"/>' +
    '<rect x="-8" y="-8" width="16" height="16" rx="3"/></g><path class="iv-ondas o1" d="M-10 18a14 14 0 0 0 20 0"/><path class="iv-ondas o2" d="M-17 26a24 24 0 0 0 34 0"/><path class="iv-ondas o3" d="M-24 34a34 34 0 0 0 48 0"/></g>' +
    // suelo
    '<rect class="iv-vereda" x="0" y="356" width="720" height="8"/><rect class="iv-calle" x="0" y="364" width="720" height="34" rx="2"/>' +
    '<line class="iv-linea" x1="10" y1="381" x2="710" y2="381"/>' +
    // centro de distribución
    '<g class="iv-cd"><path class="iv-edif" d="M20 356V196L58 174V196L96 174V196L134 174V196L172 174V196L210 174V196L250 174V356Z"/>' +
    '<rect class="iv-fr r" x="20" y="204" width="230" height="7"/><rect class="iv-fr r" x="20" y="214" width="230" height="7"/><rect class="iv-fr g" x="20" y="224" width="230" height="5"/>' +
    '<image href="../../img/marca/logo-cargo.svg" x="34" y="242" width="96" height="26" preserveAspectRatio="xMinYMid meet"/>' +
    `<text class="iv-rotulo" x="35" y="284">${esc(plano(I.centro).toUpperCase())}</text>` +
    '<g class="iv-porton"><rect x="140" y="296" width="94" height="60"/><path d="M140 306h94M140 316h94M140 326h94M140 336h94M140 346h94"/></g>' +
    '<rect class="iv-puertita" x="40" y="306" width="40" height="50"/></g>' +
    // concesionario
    '<g class="iv-con"><rect class="iv-edif" x="470" y="214" width="232" height="142"/>' +
    '<rect class="iv-cartel" x="462" y="192" width="248" height="34" rx="3"/>' +
    `<text class="iv-cartel-txt" x="586" y="217">${esc(cliente)}</text>` +
    '<text class="iv-rotulo centro" x="586" y="240">CONCESIONARIO</text>' +
    '<rect class="iv-vidrio" x="484" y="248" width="204" height="108"/>' +
    '<path class="iv-montante" d="M535 248v108M637 248v108M484 300h82M606 300h82"/>' +
    '<rect class="iv-puerta" x="566" y="286" width="40" height="70"/>' +
    '<path class="iv-auto" d="M490 352c2-10 8-14 16-15l8-8c3-3 7-4 12-4h10c5 0 9 2 12 5l6 7c5 1 8 4 8 9v6z"/></g>' +
    // bultos
    caja('iv-b0') + caja('iv-b1') +
    caja('iv-b2', '<g class="iv-alerta" transform="translate(13 -28)"><circle r="8.5"/><text y="4">!</text></g>') +
    caja('iv-repo', '<g class="iv-ok" transform="translate(13 -28)"><circle r="8.5"/><path d="M-4 0l2.8 2.8L4.2-3"/></g>') +
    // camión (origen: donde las ruedas tocan la calle; mira hacia +x)
    '<g class="iv-camion"><g class="iv-gps" transform="translate(-26 -96)"><circle class="iv-gps-onda" r="10"/><path d="M0 9s-8-7.5-8-13a8 8 0 0 1 16 0c0 5.5-8 13-8 13z"/><circle class="iv-gps-centro" cy="-4" r="3"/></g>' +
    '<ellipse class="iv-sombra" cx="-6" cy="2" rx="74" ry="5"/>' +
    '<rect class="iv-carga" x="-74" y="-76" width="94" height="58" rx="4"/>' +
    '<rect class="iv-fr r" x="-68" y="-42" width="82" height="5"/><rect class="iv-fr r" x="-68" y="-35" width="82" height="5"/><rect class="iv-fr g" x="-68" y="-28" width="82" height="3.5"/>' +
    '<path class="iv-cabina" d="M22 -18V-60h22l15 21v21z"/><path class="iv-ventana" d="M28 -55h13l10 14H28z"/>' +
    '<rect class="iv-chasis" x="-74" y="-20" width="134" height="6" rx="2"/>' + ruedas + '</g></svg>';

  const ICONO_MAIL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M2 5h20v14H2zm2.2 2 7.8 6 7.8-6z"/></svg>';
  const ICONO_RELOJ = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2.5a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15zM11 7h2v5.2l3.4 2-1 1.7-4.4-2.5z"/></svg>';
  const ICONO_MANO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11.2V4.6a1.6 1.6 0 0 1 3.2 0v5.6h.4V8.7a1.6 1.6 0 0 1 3.2 0v1.6h.4V9.5a1.6 1.6 0 0 1 3.2 0v5.4c0 3.8-2.6 6.8-6.4 6.8h-1.1c-1.9 0-3.6-.9-4.6-2.5l-3-4.6a1.5 1.5 0 0 1 2.4-1.8L9 14.4z"/></svg>';

  seccion.insertAdjacentHTML('beforeend',
    `<div class="iv-izq"><p class="iv-ante ent" style="--i:0">${t(I.antetitulo)}</p><h2 class="iv-titulo ent" style="--i:1">${t(I.titulo)}</h2>` +
    `<p class="iv-bajada ent" style="--i:2">${t(I.bajada)}</p></div>` +
    '<div class="iv-ticket ent" style="--i:3"><div class="tk-cab"><div><span class="tk-ante">Reclamo</span><b class="tk-num">—</b></div><span class="tk-estado">—</span></div>' +
    `<p class="tk-tipo"></p><div class="tk-barra" style="--n:${PASOS.length}">${'<i></i>'.repeat(PASOS.length)}</div>` +
    `<ol class="tk-eventos"></ol><p class="tk-vacio">${t(I.sinReclamo)}</p><p class="tk-pie">${t(I.ejemplo)}</p></div>` +
    `<ol class="iv-pasos ent" style="--i:2;--n:${PASOS.length}">${PASOS.map((p, i) => `<li><b>${pad(i + 1)}</b><span>${t(p.titulo)}</span></li>`).join('')}</ol>` +
    `<div class="iv-escena ent" style="--i:3">${ESCENA}<p class="iv-dia">${ICONO_RELOJ}<span></span></p>` +
    `<div class="iv-insp"><p>Inspección</p><ul>${DESTINOS.map((d) => `<li><i></i>${t(d)}</li>`).join('')}</ul></div>` +
    '<div class="iv-analisis"></div></div>' +
    '<div class="iv-relato ent" style="--i:4"><p class="iv-num"></p><h3 class="iv-rel-titulo"></h3><p class="iv-rel-texto"></p><div class="iv-acciones"></div></div>' +
    '<div class="iv-cel ent" style="--i:5"><p class="cel-quien"></p><div class="cel-marco"><div class="cel-barra"><span class="cel-hora">9:41</span><span class="cel-bat"><i></i></span></div>' +
    `<div class="cel-cab"><span class="cel-menu"></span><b>${esc(I.app || '')}</b></div><div class="cel-cuerpo"></div><i class="cel-home"></i></div></div>` +
    '<div class="iv-mails"></div>' +
    `<div class="iv-mano">${ICONO_MANO}</div><i class="iv-dato"></i>`);

  const svg = $('.iv-svg');
  const camion = $('.iv-camion');
  const bultos = [0, 1, 2].map((i) => $('.iv-b' + i));
  const repo = $('.iv-repo');
  const insp = $('.iv-insp');
  const dia = $('.iv-dia span');
  const relatoEl = $('.iv-relato'), acciones = $('.iv-acciones');
  const cuerpo = $('.cel-cuerpo'), celTitulo = $('.cel-cab b'), celHora = $('.cel-hora');
  const mails = $('.iv-mails');
  const manoEl = $('.iv-mano');
  const ticket = $('.iv-ticket'), eventosEl = $('.tk-eventos');

  // =========================================================
  // TIEMPOS (se cancelan al reiniciar; se pausan fuera de pantalla)
  // =========================================================
  class Cancelado extends Error {}
  let corrida = 0, enVista = false, usoInv = -1e9;
  seccion.addEventListener('pointermove', () => { usoInv = ahora(); });
  function esperar(ms) {
    const mia = corrida;
    return new Promise((ok, mal) => {
      let resta = ms, ult = ahora();
      (function tic() {
        if (mia !== corrida) return mal(new Cancelado());
        const tt = ahora();
        if (enVista) resta -= tt - ult;
        ult = tt;
        if (resta <= 0) ok(); else setTimeout(tic, 40);
      })();
    });
  }
  // Espera un clic en alguno de los elementos; si nadie hace nada (y la sección está
  // en pantalla) durante "ms", lo hace solo: llama a alAuto y elige el primero.
  function esperarClic(els, ms, alAuto, sinIndicar) {
    els = [].concat(els);
    const mia = corrida;
    if (!sinIndicar) mano(els[0]);
    return new Promise((ok, mal) => {
      let listo = false, resta = ms, ult = ahora();
      const salir = () => { listo = true; clearInterval(reloj); els.forEach((el, i) => el.removeEventListener('click', clics[i])); sinMano(); };
      const clics = els.map((el, i) => () => { if (listo) return; salir(); ok(i); });
      els.forEach((el, i) => el.addEventListener('click', clics[i]));
      const reloj = setInterval(async () => {
        if (listo) return;
        if (mia !== corrida) { salir(); mal(new Cancelado()); return; }
        const tt = ahora();
        if (enVista && tt - usoInv > 1800) resta -= tt - ult;
        ult = tt;
        if (resta > 0) return;
        salir();
        try { if (alAuto) await alAuto(); } catch (e) { /* nada */ }
        if (mia !== corrida) { mal(new Cancelado()); return; }
        ok(0);
      }, 100);
    });
  }

  // Mano que señala dónde tocar
  function mano(el) {
    if (!el) return;
    const s = seccion.getBoundingClientRect(), r = el.getBoundingClientRect(), k = escala();
    manoEl.style.left = ((r.left + r.width * .6 - s.left) / k).toFixed(0) + 'px';
    manoEl.style.top = ((r.top + r.height * .55 - s.top) / k).toFixed(0) + 'px';
    manoEl.classList.add('visible');
  }
  function sinMano() { manoEl.classList.remove('visible'); }

  // =========================================================
  // ESCENA: camión y bultos (animaciones con WAAPI)
  // =========================================================
  const vivas = new Set();
  function animar(el, cuadros, opciones) {
    const a = el.animate(cuadros, Object.assign({ fill: 'forwards' }, opciones));
    vivas.add(a);
    const fin = a.finished.then(() => {
      // deja el estado final escrito en el elemento y suelta la animación (no se acumulan)
      try { a.commitStyles(); } catch (e) { /* elemento oculto */ }
      a.cancel();
    }, () => { throw new Cancelado(); });
    fin.then(() => vivas.delete(a), () => vivas.delete(a));
    return fin;
  }
  const tr = (x, y, s, dir) => `translate(${x}px, ${y}px) scale(${(dir || 1) * (s == null ? 1 : s)}, ${s == null ? 1 : s})`;
  let camX = X_CD, camDir = 1;
  function ponerCamion(x, dir) {
    camX = x; camDir = dir;
    camion.style.transform = tr(x, PISO, 1, dir);
  }
  async function moverCamion(x, ms) {
    const dir = x >= camX ? 1 : -1;
    const desde = tr(camX, PISO, 1, dir), hasta = tr(x, PISO, 1, dir);
    camion.classList.add('andando');
    camX = x; camDir = dir;
    camion.style.transform = desde;
    await animar(camion, [{ transform: desde }, { transform: hasta }], { duration: ms, easing: 'cubic-bezier(.45,0,.25,1)' });
    camion.classList.remove('andando');
    camion.style.transform = hasta;
  }
  function poner(el, x, y, s, o) {
    el._e = [x, y, s == null ? 1 : s, o == null ? 1 : o];
    el.style.transform = tr(x, y, el._e[2]);
    el.style.opacity = el._e[3];
  }
  async function mover(el, x, y, s, o, ms, arco) {
    const [x0, y0, s0, o0] = el._e;
    s = s == null ? 1 : s; o = o == null ? 1 : o;
    const cuadros = [{ transform: tr(x0, y0, s0), opacity: o0 }];
    if (arco) cuadros.push({ transform: tr((x0 + x) / 2, Math.min(y0, y) - arco, (s0 + s) / 2), opacity: (o0 + o) / 2, offset: .5 });
    cuadros.push({ transform: tr(x, y, s), opacity: o });
    el._e = [x, y, s, o];
    await animar(el, cuadros, { duration: ms, easing: 'cubic-bezier(.4,0,.2,1)' });
    el.style.transform = tr(x, y, s);
    el.style.opacity = o;
  }

  // =========================================================
  // CELULAR (App del chofer)
  // =========================================================
  function pantalla(titulo, html, clase) {
    celTitulo.textContent = titulo;
    const nueva = crear('div', 'cel-pant' + (clase ? ' ' + clase : ''), null, html);
    [...cuerpo.children].forEach((v) => { v.classList.add('sale'); setTimeout(() => v.remove(), 420); });
    cuerpo.appendChild(nueva);
    return nueva;
  }
  const IC = {
    ruta: '<svg viewBox="0 0 24 24"><path d="M6 3a3 3 0 0 0-3 3c0 2.3 3 5.5 3 5.5S9 8.3 9 6a3 3 0 0 0-3-3zM18 12a3 3 0 0 0-3 3c0 2.3 3 5.5 3 5.5s3-3.2 3-5.5a3 3 0 0 0-3-3z"/><path d="M6 13v2a4 4 0 0 0 4 4h4v-2h-4a2 2 0 0 1-2-2v-2zM10 5h4a4 4 0 0 1 4 4v1h-2V9a2 2 0 0 0-2-2h-4z"/></svg>',
    entrega: '<svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="M5 2h14v20H5zM8 6v2h8V6zm0 4v2h8v-2zm0 4v2h5v-2z"/></svg>',
    contacto: '<svg viewBox="0 0 24 24"><circle cx="12" cy="7.5" r="4.5"/><path d="M3.5 21c0-4.4 3.8-7.5 8.5-7.5s8.5 3.1 8.5 7.5z"/></svg>',
    ok: '<svg viewBox="0 0 24 24"><path d="M9.5 16.2 5.3 12l-1.6 1.6 5.8 5.8L20.3 8.6 18.7 7z"/></svg>'
  };
  // Quién usa el celular en cada momento (el concesionario o el chofer)
  const quienEl = $('.cel-quien');
  function quien(texto, chofer) {
    quienEl.textContent = plano(texto);
    quienEl.classList.toggle('chofer', !!chofer);
    quienEl.classList.remove('cambia'); void quienEl.offsetWidth; quienEl.classList.add('cambia');
  }
  // App del chofer (inicio, como la captura de Fénix)
  const vChofer = () => pantalla(I.app || '',
    '<div class="cel-banner"></div><div class="cel-iconos">' +
    `<span><i class="naranja">${IC.ruta}</i>Hojas de ruta</span><span><i class="amarillo">${IC.entrega}</i>Entrega</span><span><i class="celeste">${IC.contacto}</i>Contacto</span></div>`);
  // Lo que ve el concesionario: autogestión de devoluciones
  const vConcesionario = () => pantalla(plano(I.appConcesionario),
    `<div class="cel-tarj"><b>${t(I.concesionario).toUpperCase()}</b><small>${t(I.direccion)}</small></div>` +
    '<button type="button" class="cel-nueva"><i>+</i>Nueva devolución</button>' +
    '<p class="cel-sub">Últimas devoluciones</p>' +
    '<div class="cel-hist"><span><b>RC-23980</b>Cerrado</span><span><b>RC-23871</b>Cerrado</span></div>');
  const vTipos = () => pantalla(plano(I.appConcesionario),
    `<p class="cel-preg">¿Por qué la devolvés?</p><p class="cel-pieza">${t(I.pieza)}</p>` +
    TIPOS.map((tp) => `<button type="button" class="cel-tipo"><b>${t(tp.nombre)}</b><small>${t(tp.detalle)}</small></button>`).join(''));
  const vFoto = () => pantalla(plano(I.appConcesionario),
    '<p class="cel-preg">Sacá una foto de la pieza</p><div class="cel-visor"><i class="esq"></i>' +
    '<svg viewBox="0 0 120 100"><g transform="translate(60 78)"><rect x="-30" y="-52" width="60" height="52" rx="4" fill="#EADBC2" stroke="#3A3A3A" stroke-width="2"/><path d="M-30 -33h60M-6 -52v19" stroke="#EF4529" stroke-width="5" fill="none"/>' +
    '<path d="M18 -52l-6 12 7 6-8 12" stroke="#3A3A3A" stroke-width="2" fill="none"/></g></svg><i class="flash"></i></div>' +
    '<button type="button" class="cel-disparo" aria-label="Sacar foto"><i></i></button>');
  const vListo = (cabecera, titulo, sub) => pantalla(plano(cabecera),
    `<div class="cel-listo"><i>${IC.ok}</i><b>${titulo}</b><small>${sub || ''}</small></div>`);
  const vRuta = () => {
    const pr = pantalla('Hoja de ruta · Día 2',
      '<ol class="cel-ruta">' + (PASOS[2] && PASOS[2].paradas || []).map((p, i) =>
        `<li><time>${pad(8 + i)}:${i ? '40' : '30'}</time><span>${t(p)}</span></li>`).join('') + '</ol>');
    return pr;
  };
  const vRetiro = () => pantalla('Retiro',
    `<div class="cel-tarj"><small>Retiro</small><b>${t(I.numero)}</b><small>${t(I.concesionario)} · ${t(I.pieza)}</small><small class="rojo">${t(tipo ? tipo.nombre : '')}</small></div>` +
    '<div class="cel-codigo"><i class="barras"></i><i class="laser"></i><span>Escaneá la pieza</span></div>' +
    '<div class="cel-botones"><button type="button" class="cel-btn cel-escanear">Escanear pieza</button></div>');
  const vFirma = () => pantalla('Firma',
    `<div class="cel-tarj"><b>${t(I.concesionario).toUpperCase()}</b><small>Conformidad del retiro ${t(I.numero)}</small></div>` +
    '<div class="cel-firma"><canvas></canvas><span>Firmá acá</span></div>' +
    '<div class="cel-botones"><button type="button" class="cel-btn borde cel-borrar">Borrar</button><button type="button" class="cel-btn cel-ok" disabled>Firmar</button></div>');
  const vViaje = () => pantalla('En viaje',
    `<div class="cel-tarj"><small>Destino</small><b>${t(I.centro)}</b><small>Retiro ${t(I.numero)} · ${t(I.pieza)}</small></div>` +
    '<div class="cel-viaje"><span>Seguimiento satelital</span><div><i></i></div></div>');

  // Firma: con el mouse (o sola, si nadie firma)
  function prepararFirma(p) {
    const cv = p.querySelector('canvas'), ok = p.querySelector('.cel-ok'), ctx = cv.getContext('2d');
    const W = 200, H = 116;
    cv.width = W * 2; cv.height = H * 2;
    ctx.scale(2, 2);
    ctx.lineWidth = 2.2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#26313A';
    let trazos = 0, ult = null, abajo = false;
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
    const linea = (a, b) => { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); };
    const sumar = () => { trazos++; if (trazos > 16) { ok.disabled = false; p.querySelector('.cel-firma').classList.add('firmada'); } };
    cv.addEventListener('pointerdown', (e) => { abajo = true; ult = pos(e); cv.setPointerCapture(e.pointerId); usoInv = ahora(); });
    cv.addEventListener('pointermove', (e) => { if (!abajo) return; const q = pos(e); linea(ult, q); ult = q; sumar(); usoInv = ahora(); });
    const soltar = () => { abajo = false; };
    cv.addEventListener('pointerup', soltar);
    cv.addEventListener('pointercancel', soltar);
    p.querySelector('.cel-borrar').addEventListener('click', () => {
      ctx.clearRect(0, 0, W, H); trazos = 0; ok.disabled = true; p.querySelector('.cel-firma').classList.remove('firmada');
    });
    // firma automática: una curva que se dibuja de a poco
    p.firmar = () => new Promise((listo) => {
      if (trazos > 16) { listo(); return; }
      const f = (s) => [22 + 150 * s + 10 * Math.sin(s * 34), 64 + 20 * Math.sin(s * 10) * (1 - s * .5) + 9 * Math.cos(s * 34)];
      let s = 0, a = f(0);
      (function paso() {
        for (let k = 0; k < 6 && s < 1; k++) { s += .006; const b = f(s); linea(a, b); a = b; sumar(); }
        if (s < 1) requestAnimationFrame(paso); else setTimeout(listo, 250);
      })();
    });
  }

  // =========================================================
  // FICHA DEL RECLAMO, RELATO, PASOS Y MAILS
  // =========================================================
  function relato(num, titulo, texto) {
    $('.iv-num').innerHTML = num;
    $('.iv-rel-titulo').innerHTML = titulo;
    $('.iv-rel-texto').innerHTML = texto;
    acciones.innerHTML = '';
    relatoEl.classList.remove('cambia'); void relatoEl.offsetWidth; relatoEl.classList.add('cambia');
  }
  function relatoPaso(i) {
    relato(`Paso <b>${pad(i + 1)}</b> / ${pad(PASOS.length)}`, t(PASOS[i].titulo), t(PASOS[i].texto));
  }
  function pista(texto) {
    acciones.innerHTML = `<p class="iv-pista">${ICONO_MANO}<span>${texto}</span></p>`;
  }
  function boton(texto, clase) {
    acciones.innerHTML = '';
    const b = crear('button', 'iv-btn ' + (clase || ''), acciones, `<span>${texto}</span><svg viewBox="0 0 24 24"><path d="M5 11h11l-4-4 1.4-1.4L19.8 12l-6.4 6.4L12 17l4-4H5z"/></svg>`);
    b.type = 'button';
    return b;
  }
  function marcarPaso(i) {
    seccion.querySelectorAll('.iv-pasos li').forEach((li, k) => { li.classList.toggle('hecho', k < i); li.classList.toggle('activo', k === i); });
    seccion.querySelectorAll('.tk-barra i').forEach((el, k) => el.classList.toggle('hecho', k < i || (k === i && i >= PASOS.length)));
  }
  function estado(i) {
    const el = $('.tk-estado');
    el.textContent = ESTADOS[i] || '';
    el.className = 'tk-estado' + (i >= ESTADOS.length - 1 ? ' cerrado' : ' abierto');
    el.classList.remove('cambia'); void el.offsetWidth; el.classList.add('cambia');
  }
  function evento(ev) {
    if (!ev || (ev.soloConReposicion && !(tipo && tipo.reposicion))) return false;
    ticket.classList.add('con-eventos');
    const li = document.createElement('li');
    li.innerHTML = `<time>${t(ev.hora)}</time><span>${t(ev.texto)}</span>`;
    eventosEl.prepend(li);
    dia.innerHTML = t(ev.hora);
    const hora = String(ev.hora || '').match(/(\d{1,2}:\d{2})/);
    if (hora) celHora.textContent = hora[1];
    return true;
  }
  async function eventos(lista, pausa) {
    for (const ev of lista || []) { if (evento(ev)) await esperar(pausa || 650); }
  }
  function mail(texto) {
    const m = crear('div', 'iv-mail', mails, `${ICONO_MAIL}<span>${t(texto)}</span>`);
    while (mails.children.length > 2) mails.firstElementChild.remove();   // dos a la vista: así no bajan hasta las franjas
    setTimeout(() => m.classList.add('visto'), 6000);
  }
  // Un punto rojo vuela del celular a la ficha del reclamo (el dato entra al TMS)
  async function volarDato() {
    const s = seccion.getBoundingClientRect(), k = escala();
    const a = $('.cel-marco').getBoundingClientRect(), b = $('.tk-cab').getBoundingClientRect();
    const x0 = (a.left + a.width / 2 - s.left) / k, y0 = (a.top + a.height * .45 - s.top) / k;
    const x1 = (b.left + b.width * .3 - s.left) / k, y1 = (b.top + b.height / 2 - s.top) / k;
    const el = $('.iv-dato');
    el.classList.add('visible');
    await animar(el, [
      { transform: `translate(${x0}px, ${y0}px) scale(.6)` },
      { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 160}px) scale(1.3)`, offset: .5 },
      { transform: `translate(${x1}px, ${y1}px) scale(.8)` }
    ], { duration: 1100, easing: 'cubic-bezier(.4,0,.2,1)' });
    el.classList.remove('visible');
  }

  // =========================================================
  // PASOS DE LA SIMULACIÓN
  // =========================================================
  // 1. El concesionario autogestiona la devolución desde el celular
  async function solicitud() {
    marcarPaso(0); relatoPaso(0);
    quien(I.quienConcesionario);
    const pd = vConcesionario();
    pista(t(PASOS[0].accion));
    await esperarClic(pd.querySelector('.cel-nueva'), 9000);
    const pt = vTipos();
    pista('Elegí el motivo de la devolución');
    const k = await esperarClic([...pt.querySelectorAll('.cel-tipo')], 8000);
    tipo = TIPOS[k] || TIPOS[0];
    pt.querySelectorAll('.cel-tipo')[k].classList.add('elegido');
    svg.classList.add('con-alerta');
    await esperar(350);
    const pf = vFoto();
    pista('Tocá el botón para sacar la foto');
    await esperarClic(pf.querySelector('.cel-disparo'), 6000);
    pf.querySelector('.cel-visor').classList.add('disparo');
    await esperar(700);
    vListo(I.appConcesionario, 'Solicitud enviada', 'Te avisamos por mail en cada paso');
    await eventos(PASOS[0].eventos);
  }
  // 2. Entra al TMS y se avisa por mail
  async function registro() {
    marcarPaso(1); relatoPaso(1); acciones.innerHTML = '';
    await volarDato();
    ticket.classList.add('activo');
    $('.tk-num').textContent = plano(I.numero);
    $('.tk-tipo').innerHTML = `<b>${t(tipo.nombre)}</b> · ${t(tipo.detalle)} · ${t(I.concesionario)}`;
    estado(0);
    const ev = PASOS[1].eventos || [];
    evento(ev[0]);
    await esperar(650);
    evento(ev[1]);
    for (const m of PASOS[1].mails || []) { mail(m); await esperar(450); }
    await eventos(ev.slice(2));
  }
  // 3. El retiro se suma a la hoja de ruta del chofer
  async function programacion() {
    marcarPaso(2); relatoPaso(2); acciones.innerHTML = '';
    quien(I.quienChofer, true);
    const pr = vRuta();
    await esperar(1100);
    const lista = pr.querySelector('.cel-ruta');
    const nueva = document.createElement('li');
    nueva.className = 'nueva';
    nueva.innerHTML = `<time>09:15</time><span>Retiro ${t(I.numero)}<small>${t(I.concesionario)}</small></span>`;
    lista.insertBefore(nueva, lista.children[1] || null);
    estado(1);
    await eventos(PASOS[2].eventos);
    await esperar(500);
  }
  // 4. Retiro: escaneo y firma
  async function retiro() {
    marcarPaso(3); relatoPaso(3);
    pista('El camión pasa por el concesionario');
    await moverCamion(X_CON, 2300);
    const pr = vRetiro();
    pista('Tocá «Escanear pieza»');
    await esperarClic(pr.querySelector('.cel-escanear'), 6000);
    pr.querySelector('.cel-codigo').classList.add('escaneando');
    await esperar(1100);
    pr.querySelector('.cel-codigo').classList.add('leido');
    await esperar(500);
    const pf = vFirma();
    prepararFirma(pf);
    pista(t(PASOS[3].accion) + ' (con el mouse)');
    const firma = esperarClic(pf.querySelector('.cel-ok'), 9000, () => pf.firmar());
    mano(pf.querySelector('canvas'));        // la mano señala dónde firmar
    await firma;
    vListo(I.app, 'Retiro conformado', 'Firmado por el concesionario');
    // la pieza sube al camión
    await mover(bultos[2], X_CON + 20, 336, .6, 0, 700, 30);
    estado(2);
    await eventos(PASOS[3].eventos);
  }
  // 5. Traslado al depósito con seguimiento satelital
  async function traslado() {
    marcarPaso(4); relatoPaso(4); acciones.innerHTML = '';
    const ev = PASOS[4].eventos || [];
    evento(ev[0]);
    estado(3);
    const pv = vViaje();
    svg.classList.add('rastreo');
    const barra = pv.querySelector('.cel-viaje div i');
    requestAnimationFrame(() => { barra.style.transitionDuration = '3.4s'; barra.style.width = '100%'; });
    await moverCamion(X_CD, 3400);
    svg.classList.remove('rastreo');
    poner(bultos[2], X_CD + 20, 336, .6, 0);
    await mover(bultos[2], PUERTA_CD, VEREDA, 1, 1, 650, 26);
    await eventos(ev.slice(1));
    vChofer();
  }
  // 6. Disposición final: inspección, destino y reposición
  async function disposicion() {
    marcarPaso(5); relatoPaso(5); acciones.innerHTML = '';
    estado(4);
    insp.classList.add('visible');
    await esperar(700);
    await mover(bultos[2], 130, 150, .5, 0, 900, 40);
    let d = DESTINOS.findIndex((x) => plano(x) === plano(tipo.destino));
    if (d < 0) d = 0;
    insp.classList.add('leyendo');
    await esperar(900);
    insp.querySelectorAll('li')[d].classList.add('elegido');
    const ev = PASOS[5].eventos || [];
    evento(ev[0]);
    await esperar(900);
    if (tipo.reposicion) {
      poner(repo, PUERTA_CD, VEREDA, .4, 0);
      await mover(repo, PUERTA_CD, VEREDA, 1, 1, 400);
      await esperar(300);
      await mover(repo, X_CD + 20, 336, .6, 0, 650, 26);
      await eventos(ev.slice(1));
      await moverCamion(X_CON, 2100);
      poner(repo, X_CON + 30, 340, .6, 0);
      await mover(repo, LUGARES[2], VEREDA, 1, 1, 650, 26);
    } else {
      await eventos(ev.slice(1));
    }
  }
  // 7. Análisis de causas: el motivo se suma al gráfico del mes
  function armarAnalisis() {
    const max = Math.max(1, ...TIPOS.map((tp) => (+tp.delMes || 0) + 1));
    analisisEl.innerHTML = `<p>${t((PASOS[6] || {}).grafico)}</p><ul>` + TIPOS.map((tp) =>
      `<li><span>${t(tp.nombre)}</span><i><u style="width:${((+tp.delMes || 0) / max * 100).toFixed(1)}%"></u></i><b>${+tp.delMes || 0}</b></li>`).join('') + '</ul>';
    analisisEl.dataset.max = max;
  }
  async function analisis() {
    marcarPaso(6); relatoPaso(6); acciones.innerHTML = '';
    estado(5);
    insp.classList.remove('visible');
    armarAnalisis();
    analisisEl.classList.add('visible');
    await esperar(900);
    const k = TIPOS.indexOf(tipo), li = analisisEl.querySelectorAll('li')[k];
    if (li) {
      const n = (+tipo.delMes || 0) + 1;
      li.classList.add('elegido');
      li.querySelector('u').style.width = (n / +analisisEl.dataset.max * 100).toFixed(1) + '%';
      li.querySelector('b').textContent = n;
    }
    await esperar(600);
    await eventos((PASOS[6] || {}).eventos);
  }
  async function cierre() {
    marcarPaso(PASOS.length);
    if (tipo.reposicion) { evento({ hora: C.evento && C.evento.hora, texto: C.reposicion }); await esperar(500); }
    evento(C.evento);
    estado(ESTADOS.length - 1);
    if (C.mail) mail(C.mail);
    ticket.classList.add('cerrado');
    quien(I.quienChofer, true);
    vListo(I.app, 'Sin pendientes', 'Ruta del día completa');
    relato('', `<i class="iv-check">${IC.ok}</i><span>${t(C.titulo)}</span>`,
      t(C.texto) + '<span class="iv-beneficios">' + (C.beneficios || []).map((b) => `<span>${IC.ok}${t(b)}</span>`).join('') + '</span>');
    boton(t(C.boton), 'otra').addEventListener('click', correr);
  }

  // Botón "Siguiente" entre pasos (se pasa solo después de unos segundos)
  async function siguiente(i) {
    const sig = PASOS[i + 1];
    const b = boton(sig ? 'Siguiente: ' + t(sig.titulo) : 'Ver el cierre', 'siguiente');
    await esperarClic(b, 6000, null, true);
  }

  // =========================================================
  // REINICIO Y ARRANQUE
  // =========================================================
  const analisisEl = $('.iv-analisis');
  function reiniciar() {
    vivas.forEach((a) => a.cancel());
    vivas.clear();
    sinMano();
    tipo = null;
    svg.classList.remove('con-alerta', 'rastreo');
    camion.classList.remove('andando');
    ponerCamion(X_CD, 1);
    bultos.forEach((b, i) => poner(b, LUGARES[i], VEREDA, 1, 1));   // las piezas ya están en el concesionario
    poner(repo, PUERTA_CD, VEREDA, 1, 0);
    insp.classList.remove('visible', 'leyendo');
    insp.querySelectorAll('li').forEach((li) => li.classList.remove('elegido'));
    analisisEl.classList.remove('visible');
    ticket.classList.remove('activo', 'con-eventos', 'cerrado');
    $('.tk-num').textContent = '—';
    $('.tk-tipo').innerHTML = '';
    $('.tk-estado').textContent = '—';
    $('.tk-estado').className = 'tk-estado';
    eventosEl.innerHTML = '';
    mails.innerHTML = '';
    dia.textContent = 'Día 1 · 10:30';
    celHora.textContent = '10:30';
    marcarPaso(-1);
    quien(I.quienConcesionario);
    vConcesionario();
  }
  async function correr() {
    corrida++;
    reiniciar();
    seccion.classList.add('corriendo');
    try {
      const pasos = [solicitud, registro, programacion, retiro, traslado, disposicion, analisis].slice(0, PASOS.length);
      for (let i = 0; i < pasos.length; i++) {
        await pasos[i]();
        await siguiente(i);
      }
      await cierre();
    } catch (e) {
      if (!(e instanceof Cancelado)) console.error(e);
    }
  }
  function inicio() {
    reiniciar();
    relato('', t(I.introTitulo), t(I.introTexto));
    const b = boton(t(I.empezar), 'empezar');
    // arranca sola si la sección queda en pantalla sin uso un rato
    esperarClic(b, 14000).then(correr, () => {});
  }

  new IntersectionObserver((en) => {
    enVista = en[0].isIntersecting;
    seccion.classList.toggle('en-vista', enVista);
    if (enVista) seccion.classList.add('visible');
  }, { threshold: .4 }).observe(seccion);
  inicio();
})();
