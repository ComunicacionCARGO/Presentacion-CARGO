/* =========================================================
   MILK RUN — el camino se recorre con el scroll.
   El rojo de la entrada sigue en las tres franjas de la marca (rojo, rojo,
   gris; franjas de 34,6 y huecos de 10,8 como en el resto): cruzan arriba,
   doblan en la esquina, bajan por el costado derecho y vuelven por abajo
   (diseño de la persona). Es un camino lineal: el camión va por la franja
   roja del medio, parando en cada paso. Lleva los embalajes vacíos
   (contorno) y los cambia por llenos (rojo) en cada proveedor.
   Mientras se baja, el contenido queda quieto (.mr-fijo).
   Las franjas van hasta los bordes de la ventana (se recalculan al cambiar
   su tamaño). Textos en datos/servicio.js → milkRun.
   ========================================================= */
(function () {
  const SV = window.SV;
  const seccion = document.querySelector('.sv-milk');
  if (!SV || !seccion) return;
  const { S, txt, crear, escala } = SV;
  const M = S.milkRun || {};
  const fijo = seccion.querySelector('.mr-fijo');
  const NS = 'http://www.w3.org/2000/svg';

  const RECORRIDO = 1600;                 // px de scroll para hacer todo el camino
  seccion.style.height = 900 + RECORRIDO + 'px';

  // ---------- Franjas (medidas desde el borde de la ventana) ----------
  const F = 34.6, H = 10.8;               // franja y hueco (los mismos de toda la presentación)
  const C_ROJO = F + H + F / 2;           // centro de la franja roja: el camino del camión
  const C_GRIS = 2 * (F + H) + F / 2;
  const ANCHO_FONDO = 400;                // la franja de afuera es el rojo de la entrada: ancha, sale de la pantalla
  const C_FONDO = F - ANCHO_FONDO / 2;
  const RC = 2 * (F + H) + F + 50;        // radio de afuera de las curvas (la gris queda con 50 de radio adentro)
  const GAP = 80;                         // el camión frena antes de cada parada (no la tapa)
  const DEMORA = .3;                      // parte de cada tramo en que el camión queda quieto

  const PROV = M.proveedores || [];
  const PASOS = (M.pasos || []).slice(0, 6);
  const N = PASOS.length;
  // banda: arriba (x), der (y) o abajo (x)
  const PARADAS = [
    { banda: 'arriba', pos: 400, icono: 'planta', em: M.planta },
    { banda: 'arriba', pos: 680, icono: 'carga' },
    { banda: 'arriba', pos: 960, icono: 'hoja' },
    { banda: 'arriba', pos: 1240, icono: 'viaje' },
    { banda: 'der', pos: 300, icono: 'proveedor', em: PROV[0] },
    { banda: 'abajo', pos: 1000, icono: 'llegada', em: M.planta }
  ].slice(0, N);
  const OTROS_PROV = [{ banda: 'der', pos: 440, nombre: PROV[1] }, { banda: 'der', pos: 580, nombre: PROV[2] }].filter((p) => p.nombre);

  const ICONOS = {
    planta: '<path d="M2 21V10l5 3v-3l5 3v-3l5 3V4h4.5v17z"/>',
    carga: '<path d="M3 11h8v9H3zM13 14h8v6h-8zM12 2.5l4.2 4.2h-2.6V11h-3.2V6.7H7.8z"/>',
    hoja: '<path fill-rule="evenodd" d="M5 2h10l4 4v16H5zM8 9h8v1.8H8zm0 4h8v1.8H8zm0 4h5v1.8H8z"/>',
    viaje: '<path fill-rule="evenodd" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 4.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z"/>',
    proveedor: '<path fill-rule="evenodd" d="M12 2 1.5 8v14h21V8L12 2zM6 12h12v10H6z"/><path d="M6 14h12v2H6zM6 18h12v2H6z"/>',
    llegada: '<path fill-rule="evenodd" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2.5a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15zM11 7h2v5.2l3.4 2-1 1.7-4.4-2.5z"/>'
  };
  const svgIcono = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONOS[k] || ''}</svg>`;

  // ---------- Columna izquierda ----------
  const izq = crear('div', 'mr-izq', fijo,
    `<p class="mr-ante ent" style="--i:0">${txt(M.antetitulo)}</p><h2 class="mr-titulo ent" style="--i:1">${txt(M.titulo)}</h2>` +
    `<p class="mr-bajada ent" style="--i:2">${txt(M.bajada)}</p>` +
    `<p class="mr-sub ent" style="--i:3">${txt(M.incluyeTitulo)}</p>` +
    `<ul class="mr-incluye ent" style="--i:4">${(M.incluye || []).map((t) => `<li>${txt(t)}</li>`).join('')}</ul>` +
    `<div class="mr-progreso ent" style="--i:5"><p>${txt(M.ayuda)}</p><div class="mr-rayas">` +
    PASOS.map((p, i) => `<button type="button" data-i="${i}" aria-label="${String(i + 1).padStart(2, '0')} ${txt(p.titulo)}"><i></i></button>`).join('') +
    '</div></div>');

  // ---------- Dibujo: franjas, marcas del camino y camión ----------
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'mr-svg');
  svg.setAttribute('aria-hidden', 'true');
  let slots = '';
  for (let f = 0; f < 2; f++) for (let c = 0; c < 3; c++) {
    slots += `<rect class="mr-slot" x="${-37 + c * 17.5}" y="${-11 + f * 11.5}" width="15" height="9.5" rx="1.5"/>`;
  }
  svg.innerHTML =
    `<path class="mr-f r fondo" style="stroke-width:${ANCHO_FONDO}"/><path class="mr-f r camino"/><path class="mr-f g"/>` +
    '<path class="mr-marca"/><path class="mr-hecho"/>' +
    '<g class="mr-camion"><g class="mr-camion-cuerpo">' +
      '<rect class="mr-sombra" x="-42" y="-14" width="90" height="34" rx="7"/>' +
      '<rect class="mr-caja" x="-43" y="-15.5" width="62" height="31" rx="3.5"/>' + slots +
      '<rect class="mr-cabina" x="21" y="-14" width="22" height="28" rx="6"/>' +
      '<rect class="mr-vidrio" x="35.5" y="-10.5" width="4.5" height="21" rx="1.6"/>' +
    '</g></g>';
  fijo.appendChild(svg);
  const [pFondo, pRojo, pGris] = svg.querySelectorAll('.mr-f');
  const marca = svg.querySelector('.mr-marca'), hecho = svg.querySelector('.mr-hecho');
  const camion = svg.querySelector('.mr-camion');
  const slotsEl = [...svg.querySelectorAll('.mr-slot')];

  // Paradas (círculos sobre la franja roja) y proveedores B y C
  const capaNodos = crear('div', 'mr-nodos', fijo);
  const etqDe = { arriba: 'etq-abajo', der: 'etq-izq', abajo: 'etq-arriba' };
  PARADAS.forEach((p, i) => {
    const b = crear('button', `mr-nodo ${etqDe[p.banda]}`, capaNodos,
      `<span class="mr-circulo">${svgIcono(p.icono)}</span>` +
      `<span class="mr-etq"><b>${String(i + 1).padStart(2, '0')}</b>${txt(PASOS[i].titulo)}${p.em ? `<em>${txt(p.em)}</em>` : ''}</span>`);
    b.type = 'button';
    b.addEventListener('click', () => irPaso(i));
    p.el = b;
  });
  OTROS_PROV.forEach((p) => {
    p.el = crear('div', `mr-prov ${etqDe[p.banda]}`, capaNodos, `<span class="mr-circulo">${svgIcono('proveedor')}</span><span class="mr-etq">${txt(p.nombre)}</span>`);
  });

  // ---------- Geometría según el tamaño de la ventana ----------
  let E = 1600, L = 1, muestras = [];
  function camino(o, x0) {                // o: distancia del centro de la franja al borde
    const r = RC - o, cx = E - RC;
    return `M${x0},${o}H${cx}A${r},${r} 0 0 1 ${E - o},${RC}V${900 - RC}A${r},${r} 0 0 1 ${cx},${900 - o}H${x0}`;
  }
  function puntoDe(p) {
    if (p.banda === 'arriba') return [p.pos, C_ROJO];
    if (p.banda === 'abajo') return [p.pos, 900 - C_ROJO];
    return [E - C_ROJO, p.pos];
  }
  function largoEn(x, y) {
    let mejor = 0, d = 1e9;
    for (const m of muestras) { const dd = (m[1] - x) ** 2 + (m[2] - y) ** 2; if (dd < d) { d = dd; mejor = m[0]; } }
    return mejor;
  }
  function armar() {
    const k = escala();
    const mitadAncho = Math.max(800, innerWidth / k / 2), mitadAlto = Math.max(450, innerHeight / k / 2);
    E = 800 + mitadAncho;
    const izqX = 800 - mitadAncho, arriba = 450 - mitadAlto, ancho = 2 * mitadAncho, alto = 2 * mitadAlto;
    Object.assign(svg.style, { left: izqX + 'px', top: arriba + 'px', width: ancho + 'px', height: alto + 'px' });
    svg.setAttribute('viewBox', `${izqX} ${arriba} ${ancho} ${alto}`);
    const x0 = izqX - 300;
    pFondo.setAttribute('d', camino(C_FONDO, x0));
    pRojo.setAttribute('d', camino(C_ROJO, x0));
    pGris.setAttribute('d', camino(C_GRIS, x0));
    marca.setAttribute('d', camino(C_ROJO, x0));
    hecho.setAttribute('d', camino(C_ROJO, x0));
    L = pRojo.getTotalLength();
    muestras = [];
    for (let i = 0; i <= 1500; i++) { const l = L * i / 1500, q = pRojo.getPointAtLength(l); muestras.push([l, q.x, q.y]); }
    [...PARADAS, ...OTROS_PROV].forEach((p) => {
      const [x, y] = puntoDe(p);
      p.el.style.left = x.toFixed(1) + 'px';
      p.el.style.top = y.toFixed(1) + 'px';
      p.s = largoEn(x, y);
      p.parada = p.s - GAP;
    });
    estadoSlots = '';
    pintar(avance);
  }

  // ---------- Tarjeta del paso ----------
  const tarjeta = crear('div', 'mr-card', fijo,
    '<div class="mr-card-cont"><p class="mr-paso"><b></b><span></span></p><h3 class="mr-card-titulo"></h3><p class="mr-card-texto"></p>' +
    '<p class="mr-dato"><i class="franjitas"></i><span></span></p></div>' +
    `<div class="mr-medios"><div class="mr-medios-slots">${'<i></i>'.repeat(6)}</div>` +
    `<p><span class="v"></span>${txt(M.vacios)}<span class="l"></span>${txt(M.llenos)}</p></div>`);
  const cont = tarjeta.querySelector('.mr-card-cont');
  const medios = [...tarjeta.querySelectorAll('.mr-medios-slots i')];

  // ---------- Pintar según el avance (0 a 1) ----------
  // 5 tramos entre las 6 paradas y un rato quieto en la última
  const UNIDADES = N - 1 + .5;
  const suave = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let pasoActual = -1, estadoSlots = '', avance = 0;
  function pintar(p) {
    avance = p = Math.max(0, Math.min(1, p));
    const u = Math.min(UNIDADES - 1e-6, p * UNIDADES);
    let k = Math.floor(u), t = u - k, l, paso;
    if (k >= N - 1) { l = PARADAS[N - 1].parada; paso = N - 1; }
    else {
      const m = t < DEMORA ? 0 : suave((t - DEMORA) / (1 - DEMORA));
      l = PARADAS[k].parada + (PARADAS[k + 1].parada - PARADAS[k].parada) * m;
      paso = Math.min(N - 1, k + (t > .82 ? 1 : 0));
    }
    const q = pRojo.getPointAtLength(l), q1 = pRojo.getPointAtLength(l - 2), q2 = pRojo.getPointAtLength(l + 2);
    const ang = Math.atan2(q2.y - q1.y, q2.x - q1.x) * 180 / Math.PI;
    camion.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
    // línea del camino ya recorrida (desde la primera parada hasta el camión)
    const desde = PARADAS[0].parada;
    hecho.style.strokeDasharray = `0 ${desde.toFixed(1)} ${Math.max(0, l - desde).toFixed(1)} ${(L * 2).toFixed(0)}`;

    // embalajes: vacíos desde la carga; llenos en cada proveedor
    const conVacios = l >= PARADAS[1].parada - 1;
    const cambios = [PARADAS[4], ...OTROS_PROV].filter(Boolean);
    const porProv = Math.ceil(6 / Math.max(1, cambios.length));
    const llenos = Math.min(6, cambios.filter((c) => l >= c.s - GAP - 1).length * porProv);
    const estado = slotsEl.map((_, i) => (i < llenos ? 'l' : conVacios ? 'v' : 'o')).join('');
    if (estado !== estadoSlots) {
      estadoSlots = estado;
      const clase = { l: 'lleno', v: 'vacio', o: '' };
      slotsEl.forEach((el, i) => el.setAttribute('class', 'mr-slot ' + clase[estado[i]]));
      medios.forEach((el, i) => { el.className = clase[estado[i]]; });
    }

    PARADAS.forEach((pp, i) => {
      pp.el.classList.toggle('activa', i === paso);
      pp.el.classList.toggle('pasada', i < paso);
    });
    OTROS_PROV.forEach((pp) => pp.el.classList.toggle('pasada', l >= pp.s - GAP - 1));
    if (paso !== pasoActual) mostrarPaso(paso);
    izq.querySelector('.mr-rayas').style.setProperty('--avance', p.toFixed(4));
  }
  function mostrarPaso(i) {
    pasoActual = i;
    const p = PASOS[i];
    cont.querySelector('.mr-paso b').textContent = String(i + 1).padStart(2, '0');
    cont.querySelector('.mr-paso span').textContent = '/ ' + String(N).padStart(2, '0');
    cont.querySelector('.mr-card-titulo').innerHTML = txt(p.titulo);
    cont.querySelector('.mr-card-texto').innerHTML = txt(p.texto);
    cont.querySelector('.mr-dato span').innerHTML = txt(p.dato);
    cont.classList.remove('cambia');
    void cont.offsetWidth;                 // reinicia la animación de entrada del texto
    cont.classList.add('cambia');
    izq.querySelectorAll('.mr-rayas button').forEach((b, k) => b.classList.toggle('activa', k === i));
  }

  // Clic en una parada o en las rayitas: ir a ese paso (el camión quieto en la parada)
  function irPaso(i) {
    SV.irA(seccion, Math.round(RECORRIDO * (i + DEMORA * .5) / UNIDADES));
  }
  izq.querySelectorAll('.mr-rayas button').forEach((b) => b.addEventListener('click', () => irPaso(+b.dataset.i)));

  // ---------- Scroll: la sección queda quieta y el avance mueve el camión ----------
  let visto = false;
  document.addEventListener('desplazamiento', (e) => {
    const local = e.detail.y - seccion.offsetTop;
    if (local < -900 || local > RECORRIDO + 900) return;
    fijo.style.translate = `0 ${Math.max(0, Math.min(RECORRIDO, local)).toFixed(1)}px`;
    if (!visto && local > -450) { visto = true; seccion.classList.add('visible'); }
    pintar(local / RECORRIDO);
  });
  let relojTam = null;
  addEventListener('resize', () => { clearTimeout(relojTam); relojTam = setTimeout(armar, 60); });
  armar();
})();
