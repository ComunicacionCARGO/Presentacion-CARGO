/* =========================================================
   ¿CÓMO LO HACEMOS? — el recorrido de un pedido de Ford, parada por parada
   (pedido de la persona, con el esquema de su equipo: más guiado y lineal).
   Las tres franjas de la marca entran por arriba, se doblan y bajan por la
   izquierda: son la ruta. La sección es larga: mientras se baja, la caja, el
   texto y el panel quedan quietos (.rc-quieto) y los puntos de las paradas
   suben con las franjas; en cada parada cambian el título, la explicación (y
   su interfaz, si tiene) y el panel de la derecha:
     1. Ingreso del pedido (interfaz Ingreso de pedidos): demo de este archivo.
     2. Geoposicionamiento indoor (interfaz Obtención de eventos; empieza el tracking): la
        planchada con un stage por ruta, que se escanea bulto por bulto (este archivo).
        Antes había una parada aparte de "Staging por ruta": la persona la unió con esta.
     3. Gestión de viajes (interfaz Precarga) y
     4. Entrega y digitalización (interfaz Devolución de eventos): ecosistema.js
        (los viajes, el tracking y la carta de porte que se completa al entregar).
     5. Experiencia de usuario: experiencia.js (No calidad y TICO).
   Al final las franjas se doblan hacia la derecha y la tercera se vuelve el
   rojo de la logística inversa.
   Textos en datos/servicio.js → como, recorrido, tms y experiencia.
   ========================================================= */
(function () {
  const SV = window.SV;
  const seccion = document.querySelector('.sv-tms');
  if (!SV || !seccion) return;
  const { S, txt, crear, esc, escala } = SV;
  const T = S.tms || {};
  const TC = T.carga || {}, TP = T.pedido || {}, TD = T.despachos || {};
  // colores de las rutas (los mismos en la planchada y en Gestión de viajes)
  const COLORES_RUTA = ['var(--rojo)', 'var(--ambar)', 'var(--azul)'];
  // código corto del destino: Rosario → ROS, San Luis → SLU, Sgo. del Estero → SES
  const siglas = (n) => {
    const p = String(n || '').replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 || /^[A-Z]/.test(w));
    const s = p.length > 1 ? p[0][0] + p[p.length - 1].slice(0, 2) : (p[0] || '').slice(0, 3);
    return s.toUpperCase();
  };
  const CO = S.como || {}, R = S.recorrido || {};
  const ahora = () => performance.now();

  const ICONOS = {
    flecha: '<path d="M5 11h11l-4-4 1.4-1.4L19.8 12l-6.4 6.4L12 17l4-4H5z"/>',
    interfaz: '<path d="M4 7h12.2l-3-3L14.6 2.6 20 8l-5.4 5.4-1.4-1.4 3-3H4zM20 17H7.8l3 3-1.4 1.4L4 16l5.4-5.4 1.4 1.4-3 3H20z"/>',
    pedido: '<path fill-rule="evenodd" d="M5 1h10l5 5v17H5zM14 2.5V7h4.5z"/><path d="M8 11h9v1.6H8zM8 14.5h9v1.6H8zM8 18h6v1.6H8z" fill="#FFFBF3"/>',
    ubicacion: '<path fill-rule="evenodd" d="M12 1.5a6.4 6.4 0 0 0-6.4 6.4c0 4.7 6.4 11.4 6.4 11.4s6.4-6.7 6.4-11.4A6.4 6.4 0 0 0 12 1.5zm0 3.9a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2z"/><path d="M2 19.5h4.2l1.6 2H2zM17.8 19.5H22v2h-5.8z"/>',
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
  const VISTA_DE = { pedido: 'pedido', ubicacion: 'carga', viajes: 'despachos', entrega: 'despachos', experiencia: 'experiencia' };
  const PARADAS = (R.paradas || []).filter((p) => VISTA_DE[p.clave]);
  const N = PARADAS.length;

  // =========================================================
  // LAS FRANJAS: entran por arriba (encabezan la sección cuando sube por encima de
  // la portada), se doblan hacia abajo y bajan por la izquierda; al final se doblan
  // otra vez y salen hacia la derecha (la tercera se vuelve el rojo de la logística
  // inversa). Van con la sección (no quietas): por eso los puntos de las paradas
  // suben con el scroll mientras la caja queda quieta en pantalla.
  // =========================================================
  const PASO = 360;                       // px de scroll por parada (= distancia entre puntos)
  const CAJA_Y = 450;                     // altura de la caja en la pantalla
  const X0 = 24, ANCHO = 125.4, RADIO = 60;   // franjas de 34,6 con huecos de 10,8; radio interior de las curvas
  const CODO = RADIO + ANCHO;             // 185,4: lado del cuadrado de cada curva
  const MEDIO = X0 + ANCHO / 2;           // eje de las franjas
  // Entrada (pedido de la persona): al llegar solo está el título grande "¿Cómo lo / HACEMOS?"
  // con la invitación a bajar; en los primeros TITULO px de scroll se achica y sube arriba a
  // la izquierda, y recién ahí aparece el recorrido. La parada 1 llega a la caja en ENTRADA.
  const ENTRADA = 520, TITULO = 340;
  const RECORRIDO = ENTRADA + Math.max(0, N - 1) * PASO;
  const ABAJO = 900 + RECORRIDO;          // donde arrancan las franjas de abajo
  const yParada = (i) => ENTRADA + i * PASO;   // scroll (desde el comienzo de la sección) de cada parada
  seccion.style.height = (ABAJO + 91) + 'px';
  // el tracking va desde la planchada (ahí se ubica cada bulto en el stage de su ruta) hasta la entrega
  const iTrack = [PARADAS.findIndex((p) => p.clave === 'ubicacion'), PARADAS.findIndex((p) => p.clave === 'entrega')];
  const conTracking = (i) => iTrack[0] >= 0 && i >= iTrack[0] && i <= iTrack[1];
  // una curva: dos arcos (gris y rojo, con el crema de los huecos) de un cuarto de círculo;
  // la franja de afuera no es un arco: todo lo de afuera de la curva va en rojo (pedido de la
  // persona: el costado izquierdo es rojo, como si la tercera franja llenara la esquina)
  const arcos = (cx, cy, desde) => {
    const arco = (r) => desde === 'arriba'
      ? `M${cx} ${cy - r}A${r} ${r} 0 0 0 ${cx - r} ${cy}`
      : `M${cx - r} ${cy}A${r} ${r} 0 0 0 ${cx} ${cy + r}`;
    const r = RADIO + 90.8;               // borde de afuera del último hueco
    const afuera = desde === 'arriba'
      ? `M-1 -1H${CODO + 1}V${CODO - r}H${CODO}A${r} ${r} 0 0 0 ${CODO - r} ${CODO}V${CODO + 1}H-1Z`
      : `M-1 -1H${CODO - r}V0A${r} ${r} 0 0 0 ${CODO} ${r}H${CODO + 1}V${CODO + 1}H-1Z`;
    return `<path d="${arco(RADIO + ANCHO / 2)}" stroke="var(--blanco)" stroke-width="${ANCHO}"/>` +
      `<path d="${afuera}" fill="var(--rojo)"/>` +
      `<path d="${arco(RADIO + 17.3)}" stroke="var(--gris)" stroke-width="34.6"/>` +
      `<path d="${arco(RADIO + 62.7)}" stroke="var(--rojo)" stroke-width="34.6"/>`;
  };
  const franjas = crear('div', 'rc-franjas', seccion,
    '<i class="rc-f-sombra"></i><i class="rc-f-arriba"></i>' +
    // el costado izquierdo, de arriba hasta el rojo de la logística inversa: rojo
    `<i class="rc-f-izq" style="height:${ABAJO + 91 + 136.2 + 2}px"></i>` +
    `<svg class="rc-f-codo" style="left:${X0}px;top:-136.2px" viewBox="0 0 ${CODO} ${CODO}" aria-hidden="true">${arcos(CODO, CODO, 'arriba')}</svg>` +
    `<i class="rc-f-baja" style="left:${X0}px;top:${CODO - 137.2}px;height:${ABAJO - RADIO - (CODO - 136.2) + 2}px"></i>` +
    `<svg class="rc-f-codo" style="left:${X0}px;top:${ABAJO - RADIO}px" viewBox="0 0 ${CODO} ${CODO}" aria-hidden="true">${arcos(CODO, 0, 'abajo')}</svg>` +
    `<i class="rc-f-abajo" style="top:${ABAJO}px"></i>` +
    (iTrack[0] >= 0 ? `<i class="rc-f-track" style="left:${X0 + ANCHO + 9}px;top:${CAJA_Y + yParada(iTrack[0])}px;height:${(iTrack[1] - iTrack[0]) * PASO}px"></i>` : '') +
    // cada punto lleva el nombre de su parada: se ve solo el de la siguiente, cuando asoma abajo
    PARADAS.map((p, i) => `<button type="button" class="rc-punto${p.interfaz && p.interfaz.nombre ? ' con-if' : ''}" style="left:${MEDIO}px;top:${CAJA_Y + yParada(i)}px" data-i="${i}" aria-label="${esc(p.titulo)}"><b>${String(i + 1).padStart(2, '0')}</b>` +
      `<span class="rc-sig"><small>${txt(i ? (R.siguiente || 'Siguiente') : (R.primera || 'Primera parada'))}</small>${txt(p.titulo)}</span></button>`).join(''));
  const puntosEl = [...franjas.querySelectorAll('.rc-punto')];
  const quieto = crear('div', 'rc-quieto', seccion);

  // =========================================================
  // LA CAJA (quieta en pantalla, sobre las franjas) Y EL TEXTO DE CADA PARADA
  // =========================================================
  const caja = crear('div', 'rc-caja', quieto, icono('caja'));
  caja.style.left = MEDIO + 'px';
  caja.style.top = CAJA_Y + 'px';
  // el título "¿Cómo lo HACEMOS?": grande en dos renglones al llegar, chico en un renglón después
  const gran = crear('h2', 'rc-gran', quieto, `<span>${txt(CO.antetitulo)}</span><b>${txt(CO.titulo)}</b>`);
  const [granAnte, granTit] = gran.children;
  // lo demás de la entrada (se va al bajar): la frase, el mapa de las paradas y la invitación
  const portada = crear('div', 'rc-portada', quieto,
    `<p class="rc-ent-rotulo"><i class="franjitas"></i>${txt(CO.sello)}</p>` +
    `<p class="rc-ent-txt">${txt(CO.entrada)}</p>` +
    `<div class="rc-mapa"><p>${txt(CO.mapa)}</p><ol>` + PARADAS.map((p, i) =>
      `<li style="--i:${i}"><button type="button" data-i="${i}"><i></i><b>${String(i + 1).padStart(2, '0')}</b><span>${txt(p.titulo)}</span>` +
      (p.interfaz && p.interfaz.nombre ? `<em>${icono('interfaz')}${txt(p.interfaz.nombre)}</em>` : '') + '</button></li>').join('') + '</ol></div>' +
    `<p class="rc-invita"><i class="rc-raton"><u></u></i><span class="rc-inv-mouse">${txt(CO.invitacion)}</span><span class="rc-inv-tactil">${txt(CO.invitacionTactil || CO.invitacion)}</span>` +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4h2v12l4.6-4.6L19 12.8 12 19.8l-7-7 1.4-1.4L11 16z"/></svg></p>');
  const invita = portada.querySelector('.rc-invita');
  invita.addEventListener('click', () => { if (window.desplazamiento) window.desplazamiento.ir(topeDe() + yParada(0)); });
  portada.querySelectorAll('.rc-mapa button').forEach((b) => b.addEventListener('click', () => { if (window.desplazamiento) window.desplazamiento.ir(topeDe() + yParada(+b.dataset.i)); }));
  const izq = crear('div', 'tm-izq', quieto,
    `<div class="tm-cab"><p class="tm-sello"><i class="franjitas"></i>${txt(CO.sello)}</p></div>` +
    '<div class="rc-etapas ent" style="--i:1">' + PARADAS.map((p, i) => {
      const f = p.interfaz || {};
      // número y avance (una rayita por parada, rojas hasta la actual)
      return `<div class="rc-etapa" data-i="${i}">` +
        `<p class="rc-num"><b>${String(i + 1).padStart(2, '0')}</b><span class="rc-prog">${PARADAS.map((_, k) => `<i${k <= i ? ' class="si"' : ''}></i>`).join('')}</span>` +
        `<small>${txt(R.de || 'de')} ${String(N).padStart(2, '0')}</small>` +
        (conTracking(i) ? `<em class="rc-vivo"><i></i>${txt(R.tracking || 'Tracking')}</em>` : '') + '</p>' +
        `<h3 class="rc-titulo">${txt(p.titulo)}</h3><p class="rc-texto">${txt(p.texto)}</p>` +
        (f.nombre ? `<div class="rc-if">${icono('interfaz')}<div><span>${txt(R.interfaz || 'Interfaz')}</span><b>${txt(f.nombre)}</b><p>${txt(f.texto)}</p>` +
          `<div class="rc-via"><small>${txt(f.de)}</small><i><u></u></i><small>${txt(f.a)}</small></div></div></div>` : '') +
        // en la última parada, el enlace a los tableros
        (i === N - 1 && R.final ? `<button type="button" class="rc-final"><span>${txt(R.final)}</span><b>${txt(R.finalBoton || '')}${icono('flecha')}</b></button>` : '') +
        '</div>';
    }).join('') + '</div>');
  const etapasEl = [...izq.querySelectorAll('.rc-etapa')];
  // el título grande se achica si una palabra no entra en la columna
  const ajustarTitulos = () => izq.querySelectorAll('.rc-titulo').forEach((h) => {
    let t = 58;
    h.style.fontSize = t + 'px';
    while (h.scrollWidth > h.clientWidth + 1 && t > 30) { t -= 2; h.style.fontSize = t + 'px'; }
  });
  ajustarTitulos();
  if (document.fonts) document.fonts.ready.then(ajustarTitulos);

  const panel = crear('div', 'tm-panel ent', quieto);
  panel.style.setProperty('--i', 3);
  const vistas = {};
  const CLASE = { pedido: 'pd', carga: 'tc', despachos: 'td', experiencia: 'ex' };
  Object.keys(CLASE).forEach((k) => { vistas[k] = crear('div', 'tm-vista ' + CLASE[k], panel); });
  const vCarga = vistas.carga;
  const alElegir = {};   // ecosistema.js y este archivo anotan acá qué hacer al llegar a cada parada

  let parada = -1, pestana = null, modo = null, enVista = false, enEntrada = true;
  function elegir(i) {
    i = Math.max(0, Math.min(N - 1, i));
    if (i === parada) return;
    parada = i;
    const p = PARADAS[i];
    etapasEl.forEach((el, k) => { el.classList.toggle('activa', k === i); el.classList.toggle('pasada', k < i); });
    puntosEl.forEach((el, k) => { el.classList.toggle('activa', k === i); el.classList.toggle('pasada', k < i); });
    caja.classList.toggle('en-track', conTracking(i));
    caja.classList.remove('llega'); void caja.offsetWidth; caja.classList.add('llega');
    pestana = VISTA_DE[p.clave];
    modo = p.clave;
    Object.entries(vistas).forEach(([k, v]) => v.classList.toggle('activa', k === pestana));
    vistas.despachos.dataset.modo = modo;
    if (enVista && !enEntrada) activarVista();
  }
  // cada demo arranca al llegar a su parada (con la sección en pantalla)
  function activarVista() { if (alElegir[pestana]) alElegir[pestana](modo); }
  // para ecosistema.js y experiencia.js
  SV.tms = { vistas, alElegir, get pestana() { return pestana; }, get modo() { return modo; }, get enVista() { return enVista; } };

  // ---------- El scroll sube los puntos; la caja y el panel quedan quietos ----------
  const topeDe = () => seccion.offsetTop;
  const irParada = (i) => { if (window.desplazamiento) window.desplazamiento.ir(topeDe() + yParada(i)); };
  puntosEl.forEach((el, i) => el.addEventListener('click', () => irParada(i)));
  const final = izq.querySelector('.rc-final');
  if (final) final.addEventListener('click', () => { const bi = document.querySelector('.sv-bi'); if (bi && window.desplazamiento) window.desplazamiento.ir(bi.offsetTop); });

  // ---------- El título de la entrada: de grande a chico, siempre alineado a la izquierda ----------
  // (se mide una vez con la letra grande y después solo se mueve y se escala con transform;
  // al estar los dos alineados a la izquierda, al bajar el título solo se achica y sube)
  const GRANDE = { ante: 88, tit: 196 }, CHICO = { ante: 28, tit: 32 };
  const IZQ_X = 236, ARRIBA_Y = 186;      // borde izquierdo del texto y alto del "¿Cómo lo" grande
  let med = null;
  const fraseEl = portada.querySelector('.rc-ent-txt');
  const medir = () => {
    med = { a: granAnte.offsetWidth, t: granTit.offsetWidth };
    // la frase va a la derecha del "HACEMOS?" grande, hasta el margen de 1536
    const x = Math.max(1080, IZQ_X + med.t + 56);
    fraseEl.style.left = x + 'px';
    fraseEl.style.width = Math.max(300, 1536 - x) + 'px';
    ubicarTitulo(ultimoM);
  };
  const suave = (x) => x * x * (3 - 2 * x);
  let ultimoM = 0;
  function ubicarTitulo(m) {
    ultimoM = m;
    if (!med) return;
    const e = suave(m);
    const sA = 1 + (CHICO.ante / GRANDE.ante - 1) * e, sT = 1 + (CHICO.tit / GRANDE.tit - 1) * e;
    // chico: en un renglón, alineados por la línea de base (Inter .864, Oswald .952 con interlineado 1)
    const base = 84 + .864 * CHICO.ante;
    const fin = { ax: 196, ay: 84, tx: 196 + med.a * CHICO.ante / GRANDE.ante + 10, ty: base - .952 * CHICO.tit };
    // grande: el "¿" y la H corridos lo que mide su margen, así los dos quedan parejos a la izquierda
    const ini = { ax: IZQ_X - 6, ay: ARRIBA_Y, tx: IZQ_X - 11, ty: ARRIBA_Y + GRANDE.ante + 4 };
    const l = (a, b) => (a + (b - a) * e).toFixed(2);
    granAnte.style.transform = `translate(${l(ini.ax, fin.ax)}px, ${l(ini.ay, fin.ay)}px) scale(${sA.toFixed(4)})`;
    granTit.style.transform = `translate(${l(ini.tx, fin.tx)}px, ${l(ini.ty, fin.ty)}px) scale(${sT.toFixed(4)})`;
    // lo demás de la entrada se va enseguida, hacia arriba
    const s = Math.min(1, m * 2.4);
    portada.style.opacity = (1 - s).toFixed(3);
    portada.style.transform = `translate3d(0, ${(-60 * s).toFixed(1)}px, 0)`;
    portada.style.visibility = s >= 1 ? 'hidden' : '';
  }
  medir();
  if (document.fonts) document.fonts.ready.then(medir);

  let reloj = null;
  function alDesplazar(y) {
    const d = y - topeDe();
    quieto.style.transform = `translate3d(0, ${Math.min(Math.max(d, 0), RECORRIDO).toFixed(2)}px, 0)`;
    ubicarTitulo(Math.min(Math.max(d / TITULO, 0), 1));
    const antes = enVista, antesEntrada = enEntrada;
    enVista = d > -700 && d < RECORRIDO + 700;
    enEntrada = d < TITULO - 10;
    seccion.classList.toggle('en-vista', enVista);
    seccion.classList.toggle('entrada', enEntrada);
    // en la entrada la invitación propia reemplaza al cartel común de "Bajá para seguir"
    document.body.classList.toggle('sin-guia-scroll', enVista && enEntrada);
    if (enVista && !antes) seccion.classList.add('visible');
    // mientras se baja, la caja traquetea un poco (va andando por las franjas)
    if (d > TITULO && d < RECORRIDO) { caja.classList.add('anda'); clearTimeout(reloj); reloj = setTimeout(() => caja.classList.remove('anda'), 180); }
    const i = Math.min(N - 1, Math.max(0, Math.round((d - ENTRADA) / PASO)));
    if (i !== parada) elegir(i);
    else if (enVista && !enEntrada && (!antes || antesEntrada)) activarVista();
    caja.classList.toggle('espera', enEntrada);
    // los puntos se apagan al llegar arriba (no se meten debajo de "Volver") y el de la parada
    // siguiente muestra su nombre cuando asoma abajo
    const dq = Math.min(Math.max(d, 0), RECORRIDO);
    puntosEl.forEach((el, k) => {
      const ys = CAJA_Y + yParada(k) - dq;
      el.classList.toggle('oculto', ys < 160);
      el.classList.toggle('sig', ys > 600 && ys < 870 && k === (enEntrada ? 0 : parada + 1));
    });
  }
  document.addEventListener('desplazamiento', (e) => alDesplazar(e.detail.y));

  // =========================================================
  // 1. INGRESO DEL PEDIDO (interfaz con el ERP del cliente y llegada al depósito)
  // =========================================================
  (function pedido() {
    const v = vistas.pedido;
    const PED = (TP.pedidos || []).slice(0, 4);
    // el tipo va en gris: en la planchada los colores son los de cada ruta y el tipo es una marca
    const COLOR_TIPO = {};
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
  // 2. GEOPOSICIONAMIENTO INDOOR: la planchada, con un stage por ruta
  //    (pedido de la persona: el geoposicionamiento y el staging son el mismo proceso, y los
  //    stages son las rutas). Los bultos llegan a la recepción de arriba y nada se mueve hasta
  //    que se escanea uno: el primero abre una ventana que lo explica y, al cerrarla, va a su
  //    lugar; los demás van directo. Después de unos cuantos a mano sigue el lector automático.
  //    Colores de las rutas = los de Gestión de viajes (continuidad).
  // =========================================================
  const RUTAS = (TD.viajes || []).slice(0, 3).map((vj, i) => ({
    nombre: (vj.paradas || []).slice(-1)[0] || '', codigo: vj.codigo || '', color: COLORES_RUTA[i]
  }));
  const TIPOS = (TC.indicadores || []).slice(0, 3).map((ind) => ({ nombre: ind.nombre, marca: ind.marca || '', valor: +ind.valor || 0 }));
  const PESOS_TIPO = [.6, .3, .1];                       // qué tan seguido llega cada tipo
  const PESOS_RUTA = [.4, .33, .27];                     // y a qué ruta va
  const ZS_POR_STAGE = 3;                                // z-stages de cada stage
  const MAX_ZONA = 18;                                   // con tantos bultos, la zona se despacha
  const MANUALES = Math.max(1, parseInt(TC.manualesParaAuto, 10) || 4);
  const VT = TC.ventana || {};
  const zonasDe = (r) => Array.from({ length: ZS_POR_STAGE }, (_, z) => `${r + 1}0${z + 1}`);
  const chipTipo = (t, extra) => `<i class="tc-b${extra || ''}" data-t="${t}">${esc(TIPOS[t] ? TIPOS[t].marca : '')}</i>`;

  vCarga.innerHTML =
    `<div class="tc-cabeza"><b>${txt(TC.panel)}</b><span class="tc-vivo"><i></i>EN VIVO</span>` +
    `<span class="tc-track"><i></i>${txt(R.tracking || 'Tracking')}</span></div>` +
    `<div class="tc-recepcion"><span>${txt(TC.recepcion)}</span><div class="tc-cola"></div></div>` +
    '<div class="tc-plano">' + RUTAS.map((r, s) =>
      `<div class="tc-stage" style="--c:${r.color}"><div class="tc-scab"><small>${txt(TC.stage || 'Stage')}</small>` +
      `<b>${txt(TC.ruta || 'Ruta')} ${esc(r.nombre)}</b><em>${esc(r.codigo)}</em></div>` +
      zonasDe(s).map((z) => `<div class="tc-celda" data-z="${z}"><span>ZS ${z}</span><em class="tc-sale">Despacho</em><div class="tc-bultos"></div></div>`).join('') +
      '</div>').join('') + '</div>' +
    // lo que antes iba arriba (los contadores por tipo), abajo y con menos importancia
    '<div class="tc-pie"><div class="tc-inds">' + TIPOS.map((t, i) =>
      `<span class="tc-ind">${chipTipo(i)}${txt(t.nombre)}<b>${t.valor}</b></span>`).join('') +
    `<span class="tc-ind total">${txt(TC.total)}<b>0</b></span></div>` +
    `<p class="tc-ayuda">${icono('lector')}<span></span></p></div>` +
    // la ventana del primer escaneo
    '<div class="tc-ventana" aria-hidden="true"><div class="tc-vcard" role="dialog" aria-modal="true">' +
    '<button type="button" class="tc-vcerrar" aria-label="Cerrar">×</button>' +
    `<p class="tc-vrot">${icono('lector')}${txt(VT.titulo || 'Bulto escaneado')}</p>` +
    '<div class="tc-vbulto"><b></b><small></small><u></u></div>' +
    '<dl class="tc-vdatos"></dl><p class="tc-vtxt"></p>' +
    `<button type="button" class="tc-vboton">${txt(VT.boton || 'Ubicarlo en la planchada')}${icono('flecha')}</button>` +
    '</div></div>';

  const cola = vCarga.querySelector('.tc-cola');
  const ayuda = vCarga.querySelector('.tc-ayuda'), ayudaEl = ayuda.querySelector('span');
  const ventana = vCarga.querySelector('.tc-ventana');
  const celdas = {};
  vCarga.querySelectorAll('.tc-celda').forEach((el) => { celdas[el.dataset.z] = { el, bultos: el.querySelector('.tc-bultos'), n: 0, ocupada: false }; });
  const indEls = [...vCarga.querySelectorAll('.tc-ind b')];
  const valores = TIPOS.map((t) => t.valor);
  let manuales = 0, auto = false, explicado = false, ocupado = false, abierta = null, usoCarga = -1e9;

  // Números que cuentan hasta el valor nuevo
  function mostrarValores() {
    const total = valores.reduce((a, b) => a + b, 0);
    [...valores, total].forEach((v, i) => {
      const el = indEls[i];
      const desde = +el.dataset.v || 0;
      el.dataset.v = v;
      if (desde === v) return;
      const t0 = ahora();
      (function paso() {
        const t = Math.min(1, (ahora() - t0) / 450);
        el.textContent = Math.round(desde + (v - desde) * t).toLocaleString('es-AR');
        if (t < 1) requestAnimationFrame(paso);
      })();
    });
  }
  indEls.forEach((el) => { el.dataset.v = 0; });
  mostrarValores();

  const azar = (a) => a[Math.floor(Math.random() * a.length)];
  const conPeso = (p) => { let r = Math.random(); for (let i = 0; i < p.length; i++) { if ((r -= p[i]) < 0) return i; } return 0; };
  function agregarEnZona(z, tipo) {
    const c = celdas[z];
    c.bultos.insertAdjacentHTML('beforeend', chipTipo(tipo));
    c.n++;
    return c.bultos.lastElementChild;
  }
  // Planchada con algo de carga al empezar
  Object.keys(celdas).forEach((z) => { const n = 3 + Math.floor(Math.random() * 8); for (let k = 0; k < n; k++) agregarEnZona(z, conPeso(PESOS_TIPO)); });

  // ---------- La recepción: llegan por la izquierda; el próximo a escanear es el de la derecha ----------
  let numero = 4180;
  function nuevoBulto(fijo) {
    const ruta = fijo ? fijo.ruta : conPeso(PESOS_RUTA), tipo = fijo ? fijo.tipo : conPeso(PESOS_TIPO);
    const zonas = zonasDe(ruta), libres = zonas.filter((z) => !celdas[z].ocupada);
    const b = { ruta, tipo, z: azar(libres.length ? libres : zonas), estado: null, cod: `${siglas(RUTAS[ruta].nombre)}-${numero++}` };
    b.el = crear('button', 'tc-bulto');
    b.el.type = 'button';
    b.el._b = b;
    b.el.style.setProperty('--c', RUTAS[ruta].color);
    b.el.innerHTML = `<b>${esc(b.cod)}</b><small>${txt(TIPOS[tipo].nombre)} · ${esc(RUTAS[ruta].nombre)}</small><u></u>` +
      `<em class="tc-invita">${txt(TC.escanear || 'Escaneá')}</em>`;
    b.el.addEventListener('click', () => leer(b, true));
    return b;
  }
  const ANCHO_COLA = 6;
  for (let i = 0; i < ANCHO_COLA - 1; i++) cola.appendChild(nuevoBulto().el);
  // el primero que se escanea es un V.I. a Rosario (el ejemplo de la ventana)
  cola.appendChild(nuevoBulto({ ruta: 0, tipo: Math.min(2, TIPOS.length - 1) }).el);
  const siguiente = () => { const el = [...cola.children].reverse().find((e) => !e._b.estado); return el ? el._b : null; };
  // el próximo bulto lleva el cartelito "Escaneá" mientras se escanea a mano
  function marcarInvita() {
    const s = siguiente();
    [...cola.children].forEach((el) => el.classList.toggle('invita', !auto && !abierta && !!s && el === s.el));
  }
  function actualizarAyuda() {
    ayuda.classList.toggle('auto', auto);
    ayudaEl.innerHTML = auto ? txt(TC.ayudaAuto)
      : manuales ? txt(TC.ayudaFaltan, { faltan: MANUALES - manuales }) : txt(TC.ayuda);
  }
  actualizarAyuda();
  marcarInvita();
  // Guía (compartido/guia.js): la mano señala el próximo bulto hasta que se escanea uno
  if (window.GUIA) GUIA.pista({ id: 'servicio-lector', texto: 'tmsLector', objetivo: () => { const s = siguiente(); return s && s.el; }, zona: '.tc-bulto', lado: 'izq', espera: 1.2, activa: () => enVista && pestana === 'carga' && !auto && !abierta });

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

  // ---------- Escanear: el láser barre, aparece el visto y el bulto vuela a su z-stage ----------
  function leer(b, manual) {
    if (b.estado || ocupado || abierta) return;
    if (manual) usoCarga = ahora();
    ocupado = true;
    b.estado = 'leyendo';
    b.el.classList.add('leyendo');
    marcarInvita();
    setTimeout(() => {
      b.el.classList.add('leido');
      b.el.querySelector('small').textContent = `✓ ${TIPOS[b.tipo].nombre} · ${RUTAS[b.ruta].nombre}`;
      if (manual && !explicado) { explicado = true; setTimeout(() => abrirVentana(b), 260); }
      else setTimeout(() => volar(b, manual), 280);
    }, 380);
  }

  // La ventana del primer bulto: qué es, adónde va y por qué queda en ese lugar
  function abrirVentana(b) {
    abierta = b;
    const r = RUTAS[b.ruta], t = TIPOS[b.tipo];
    const vars = { codigo: b.cod, tipo: t.nombre, ruta: r.nombre, viaje: r.codigo, zona: 'ZS ' + b.z };
    const vb = ventana.querySelector('.tc-vbulto');
    vb.style.setProperty('--c', r.color);
    vb.querySelector('b').textContent = b.cod;
    vb.querySelector('small').textContent = `${t.nombre} · ${r.nombre}`;
    ventana.querySelector('.tc-vdatos').innerHTML =
      [[VT.datoRuta || 'Ruta', `<i style="--c:${r.color}"></i>${esc(r.nombre)}`], [VT.datoViaje || 'Viaje', esc(r.codigo)],
        [VT.datoTipo || 'Tipo', `${chipTipo(b.tipo)}${esc(t.nombre)}`], [VT.datoZona || 'Posición', `${txt(TC.stage || 'Stage')} ${esc(r.nombre)} · ZS ${b.z}`]]
        .map(([k, v]) => `<div style="--c:${r.color}"><dt>${txt(k)}</dt><dd>${v}</dd></div>`).join('');
    ventana.querySelector('.tc-vtxt').innerHTML = txt(VT.texto, vars);
    ventana.classList.add('abierta');
    ventana.setAttribute('aria-hidden', 'false');
    marcarInvita();
    setTimeout(() => { const bt = ventana.querySelector('.tc-vboton'); if (abierta && bt) bt.focus({ preventScroll: true }); }, 350);
  }
  function cerrarVentana() {
    const b = abierta;
    if (!b) return;
    abierta = null;
    usoCarga = ahora();
    ventana.classList.remove('abierta');
    ventana.setAttribute('aria-hidden', 'true');
    setTimeout(() => volar(b, true), 260);
  }
  ventana.querySelector('.tc-vboton').addEventListener('click', cerrarVentana);
  ventana.querySelector('.tc-vcerrar').addEventListener('click', cerrarVentana);
  ventana.addEventListener('click', (e) => { if (e.target === ventana) cerrarVentana(); });
  // Esc cierra la ventana antes de volver a la portada
  document.addEventListener('keydown', (e) => {
    if (!abierta || e.key !== 'Escape') return;
    e.preventDefault(); e.stopImmediatePropagation();
    cerrarVentana();
  }, true);

  function volar(b, manual) {
    const k = escala();
    const base = vCarga.getBoundingClientRect();
    const c = celdas[b.z];
    const chip = agregarEnZona(b.z, b.tipo);         // su lugar (invisible hasta que llega)
    chip.style.visibility = 'hidden';
    const r0 = b.el.getBoundingClientRect(), r1 = chip.getBoundingClientRect();
    const sx = (r0.left + r0.width / 2 - base.left) / k - 11, sy = (r0.top + r0.height / 2 - base.top) / k - 8;
    const ex = (r1.left - base.left) / k, ey = (r1.top - base.top) / k;
    const punto = crear('i', 'tc-vuela', vCarga, esc(TIPOS[b.tipo].marca));
    punto.style.setProperty('--c', RUTAS[b.ruta].color);
    const mx = (sx + ex) / 2, my = Math.min(sy, ey) - 50;
    const anim = punto.animate([
      { transform: `translate(${sx}px, ${sy}px) scale(1.9)` },
      { transform: `translate(${mx}px, ${my}px) scale(1.4)`, offset: .45 },
      { transform: `translate(${ex}px, ${ey}px) scale(1)` }
    ], { duration: 760, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
    // sale de la recepción y llega uno nuevo por la izquierda
    flip(() => { b.el.remove(); cola.prepend(nuevoBulto().el); });
    marcarInvita();
    anim.onfinish = () => {
      punto.remove();
      chip.style.visibility = '';
      chip.classList.add('nuevo');
      ocupado = false;
      c.el.classList.add('llega');
      setTimeout(() => c.el.classList.remove('llega'), 450);
      if (valores[b.tipo] !== undefined) valores[b.tipo]++;
      mostrarValores();
      if (manual && !auto) {
        manuales++;
        if (manuales >= MANUALES) auto = true;   // ya entendió: sigue el lector automático
        actualizarAyuda();
      }
      marcarInvita();
      if (c.n >= MAX_ZONA && !c.ocupada) despachar(b.z);
    };
  }
  // una zona llena se despacha (los bultos salen hacia su viaje) y queda vacía
  function despachar(z) {
    const c = celdas[z];
    c.ocupada = true;
    setTimeout(() => {
      [...c.bultos.children].forEach((i, k) => i.style.setProperty('--k', k));
      c.el.classList.add('despacha');
      setTimeout(() => {
        [...c.bultos.children].forEach((i) => { const t = +i.dataset.t; if (valores[t] !== undefined) valores[t] = Math.max(0, valores[t] - 1); });
        c.bultos.innerHTML = '';
        c.n = 0;
        mostrarValores();
        c.el.classList.remove('despacha');
        c.ocupada = false;
      }, 1100);
    }, 500);
  }

  // Lector automático: recién después de escanear unos cuantos a mano (antes, nada se mueve solo)
  setInterval(() => {
    if (!auto || !enVista || pestana !== 'carga' || ocupado || abierta || ahora() - usoCarga < 2500) return;
    const s = siguiente();
    if (s) leer(s, false);
  }, 1500);

  elegir(0);
  alDesplazar(window.desplazamiento ? window.desplazamiento.y : 0);
})();
