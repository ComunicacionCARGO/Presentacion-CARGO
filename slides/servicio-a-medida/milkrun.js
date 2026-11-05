/* =========================================================
   MILK RUN — el circuito se recorre con el scroll.
   La sección mide 900 + RECORRIDO: mientras se baja, su contenido queda
   quieto (.mr-fijo) y el camión da la vuelta al circuito (las tres franjas
   de la marca), parando en cada paso. Lleva los embalajes vacíos (contorno)
   y los cambia por llenos (rojo) en cada proveedor.
   Textos en datos/servicio.js → milkRun.
   ========================================================= */
(function () {
  const SV = window.SV;
  const seccion = document.querySelector('.sv-milk');
  if (!SV || !seccion) return;
  const { S, txt, crear } = SV;
  const M = S.milkRun || {};
  const fijo = seccion.querySelector('.mr-fijo');
  const NS = 'http://www.w3.org/2000/svg';

  const RECORRIDO = 1600;                 // px de scroll para dar la vuelta
  seccion.style.height = 900 + RECORRIDO + 'px';

  // ---------- Circuito: rectángulo redondeado (px del escenario) ----------
  const X0 = 540, X1 = 1400, Y0 = 160, Y1 = 790, R = 150;
  const INICIO = 1010;                    // la planta, en el lado de abajo
  const GAP = 80;                         // el camión frena antes de cada parada (no la tapa)
  const DEMORA = .3;                      // parte de cada tramo en que el camión queda quieto
  function camino(o) {                    // o > 0: corrido hacia adentro
    const x0 = X0 + o, x1 = X1 - o, y0 = Y0 + o, y1 = Y1 - o, r = R - o;
    return `M${INICIO},${y1}L${x1 - r},${y1}A${r},${r} 0 0 0 ${x1},${y1 - r}L${x1},${y0 + r}` +
      `A${r},${r} 0 0 0 ${x1 - r},${y0}L${x0 + r},${y0}A${r},${r} 0 0 0 ${x0},${y0 + r}` +
      `L${x0},${y1 - r}A${r},${r} 0 0 0 ${x0 + r},${y1}Z`;
  }

  const PROV = M.proveedores || [];
  const PASOS = (M.pasos || []).slice(0, 6);
  const N = PASOS.length;
  const PARADAS = [
    { x: 1010, y: Y1, lado: 'abajo', icono: 'planta', em: M.planta },
    { x: 1200, y: Y1, lado: 'abajo', icono: 'carga' },
    { x: 1150, y: Y0, lado: 'arriba', icono: 'hoja' },
    { x: 760, y: Y0, lado: 'arriba', icono: 'viaje' },
    { x: X0, y: 300, lado: 'der', icono: 'proveedor', em: PROV[0] },
    { x: 800, y: Y1, lado: 'abajo', icono: 'llegada' }
  ].slice(0, N);
  const OTROS_PROV = [{ x: X0, y: 470, nombre: PROV[1] }, { x: X0, y: 640, nombre: PROV[2] }].filter((p) => p.nombre);

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

  // ---------- Dibujo: franjas, camión ----------
  const OFF = [-12, 0, 12], TONO = ['r', 'r', 'g'];
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'mr-svg');
  svg.setAttribute('viewBox', '0 0 1600 900');
  svg.setAttribute('aria-hidden', 'true');
  // Camión visto desde arriba, mirando hacia +x; la caja tiene 6 lugares (2 × 3) para los embalajes
  let slots = '';
  for (let f = 0; f < 2; f++) for (let c = 0; c < 3; c++) {
    slots += `<rect class="mr-slot" x="${-37 + c * 17.5}" y="${-11 + f * 11.5}" width="15" height="9.5" rx="1.5"/>`;
  }
  svg.innerHTML =
    `<g class="mr-base">${OFF.map((o, i) => `<path class="${TONO[i]}" d="${camino(o)}"/>`).join('')}</g>` +
    `<g class="mr-prog">${OFF.map((o, i) => `<path class="${TONO[i]}" d="${camino(o)}"/>`).join('')}</g>` +
    '<g class="mr-camion"><g class="mr-camion-cuerpo">' +
      '<rect class="mr-sombra" x="-42" y="-14" width="90" height="34" rx="7"/>' +
      '<rect class="mr-caja" x="-43" y="-16" width="62" height="32" rx="3.5"/>' + slots +
      '<rect class="mr-cabina" x="21" y="-14.5" width="22" height="29" rx="6"/>' +
      '<rect class="mr-vidrio" x="35.5" y="-11" width="4.5" height="22" rx="1.6"/>' +
    '</g></g>';
  fijo.appendChild(svg);
  const camion = svg.querySelector('.mr-camion');
  const slotsEl = [...svg.querySelectorAll('.mr-slot')];
  const medio = svg.querySelector('.mr-base path:nth-child(2)');
  const L = medio.getTotalLength();
  const progs = [...svg.querySelectorAll('.mr-prog path')].map((el) => {
    const largo = el.getTotalLength();
    el.style.strokeDasharray = `${largo} ${largo}`;
    el.style.strokeDashoffset = largo;
    const muestras = [];
    for (let i = 0; i <= 900; i++) { const l = largo * i / 900, q = el.getPointAtLength(l); muestras.push([l, q.x, q.y]); }
    return { el, largo, muestras };
  });
  // largo del camino en el punto más cercano a (x, y)
  const muestrasMedio = [];
  for (let i = 0; i <= 1200; i++) { const l = L * i / 1200, q = medio.getPointAtLength(l); muestrasMedio.push([l, q.x, q.y]); }
  function largoEn(muestras, x, y) {
    let mejor = 0, d = 1e9;
    for (const m of muestras) { const dd = (m[1] - x) ** 2 + (m[2] - y) ** 2; if (dd < d) { d = dd; mejor = m[0]; } }
    return mejor;
  }
  const punto = (l) => medio.getPointAtLength(((l % L) + L) % L);

  // ---------- Paradas y proveedores ----------
  const capaNodos = crear('div', 'mr-nodos', fijo);
  PARADAS.forEach((p, i) => {
    p.s = i === 0 ? 0 : largoEn(muestrasMedio, p.x, p.y);
    p.parada = (i === 0 ? 0 : p.s) - GAP;            // donde frena el camión
    const b = crear('button', `mr-nodo lado-${p.lado}`, capaNodos,
      `<span class="mr-circulo">${svgIcono(p.icono)}</span>` +
      `<span class="mr-etq"><b>${String(i + 1).padStart(2, '0')}</b>${txt(PASOS[i].titulo)}${p.em ? `<em>${txt(p.em)}</em>` : ''}</span>`);
    b.type = 'button';
    b.style.left = p.x + 'px';
    b.style.top = p.y + 'px';
    b.addEventListener('click', () => irPaso(i));
    p.el = b;
  });
  OTROS_PROV.forEach((p) => {
    p.s = largoEn(muestrasMedio, p.x, p.y);
    p.el = crear('div', 'mr-prov', capaNodos, `<span class="mr-circulo">${svgIcono('proveedor')}</span><span class="mr-etq">${txt(p.nombre)}</span>`);
    p.el.style.left = p.x + 'px';
    p.el.style.top = p.y + 'px';
  });
  // Lugares donde se cambian vacíos por llenos (2 por proveedor)
  const cambios = [PARADAS[4], ...OTROS_PROV].filter(Boolean).map((p) => (p.parada !== undefined ? p.parada : p.s - GAP));
  const POR_PROV = Math.ceil(6 / Math.max(1, cambios.length));

  // ---------- Tarjeta del paso ----------
  const tarjeta = crear('div', 'mr-card', fijo,
    '<div class="mr-card-cont"><p class="mr-paso"><b></b><span></span></p><h3 class="mr-card-titulo"></h3><p class="mr-card-texto"></p>' +
    '<p class="mr-dato"><i class="franjitas"></i><span></span></p></div>' +
    `<div class="mr-medios"><div class="mr-medios-slots">${'<i></i>'.repeat(6)}</div>` +
    `<p><span class="v"></span>${txt(M.vacios)}<span class="l"></span>${txt(M.llenos)}</p></div>`);
  const cont = tarjeta.querySelector('.mr-card-cont');
  const medios = [...tarjeta.querySelectorAll('.mr-medios-slots i')];

  // ---------- Pintar según el avance (0 a 1) ----------
  const suave = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  let pasoActual = -1, estadoSlots = '';
  function pintar(p) {
    p = Math.max(0, Math.min(1, p));
    const seg = Math.min(N - 1e-6, p * N), k = Math.floor(seg), t = seg - k;
    const m = t < DEMORA ? 0 : suave((t - DEMORA) / (1 - DEMORA));
    const a = PARADAS[k].parada, b = k + 1 < N ? PARADAS[k + 1].parada : L - GAP;
    const l = a + (b - a) * m;
    const q = punto(l), q1 = punto(l - 2), q2 = punto(l + 2);
    const ang = Math.atan2(q2.y - q1.y, q2.x - q1.x) * 180 / Math.PI;
    camion.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);

    // franjas recorridas
    const completo = p > .995;
    progs.forEach((g) => {
      const lp = completo ? g.largo : (l <= 0 ? 0 : largoEn(g.muestras, q.x, q.y));
      g.el.style.strokeDashoffset = (g.largo - lp).toFixed(1);
    });
    svg.classList.toggle('completo', completo);

    // embalajes: vacíos desde la carga; llenos en cada proveedor
    const conVacios = l >= PARADAS[1].parada - 1;
    const llenos = Math.min(6, cambios.filter((c) => l >= c - 1).length * POR_PROV);
    const estado = slotsEl.map((_, i) => (i < llenos ? 'l' : conVacios ? 'v' : 'o')).join('');
    if (estado !== estadoSlots) {
      estadoSlots = estado;
      slotsEl.forEach((el, i) => el.setAttribute('class', 'mr-slot ' + { l: 'lleno', v: 'vacio', o: '' }[estado[i]]));
      medios.forEach((el, i) => { el.className = { l: 'lleno', v: 'vacio', o: '' }[estado[i]]; });
    }

    // paradas
    const paso = Math.min(N - 1, k + (t > .82 ? 1 : 0));
    PARADAS.forEach((pp, i) => {
      pp.el.classList.toggle('activa', i === paso);
      pp.el.classList.toggle('pasada', i < paso || completo);
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
    SV.irA(seccion, Math.round(RECORRIDO * (i + DEMORA * .5) / N));
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
  pintar(0);
})();
