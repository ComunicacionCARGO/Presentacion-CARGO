/* =========================================================
   RSE 2 — "Lo que hacemos, EN NÚMEROS" (datos/rse.js → numeros), debajo del
   tablero. Dos tarjetas de vidrio que flotan y se inclinan con el mouse:
   • Reciclaje: contadores que suben al llegar y 12 columnas de "fardos"
     (cada bloque son 500 kg) que caen uno por uno; el cursor muestra los kg.
   • Huella de carbono: la línea del índice es una ruta y un camioncito la
     recorre. Al llegar maneja de ene-23 al último mes; con el mouse sobre el
     gráfico se elige el mes (muestra índice y m³). La comparación entre años
     se calcula sola con los promedios.
   ========================================================= */
(function () {
  const R = window.RSE, D = R && R.numeros;
  const raiz = document.querySelector('.mc-num');
  if (!D || !raiz) return;
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const formato = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // "65.916" → 65916;  "2,1" → 2.1
  const num = (t) => parseFloat(String(t == null ? '' : t).replace(/\./g, '').replace(',', '.')) || 0;
  const miles = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const coma = (n, d) => n.toFixed(d).replace('.', ',');
  const ICONO = {
    reciclar: '<path d="M12 3a9 9 0 0 1 8.5 6h-2.3A7 7 0 0 0 5.6 8.4L8 10.8H1.5V4.3l2.6 2.6A9 9 0 0 1 12 3z"/><path d="M12 21a9 9 0 0 1-8.5-6h2.3a7 7 0 0 0 12.6.6L16 13.2h6.5v6.5l-2.6-2.6A9 9 0 0 1 12 21z"/>',
    arboles: '<path d="M8 1 2.6 9.4h2.8L1.4 16.2h5.4V21h2.6v-4.8h5.4l-4-6.8h2.8z"/><path d="M17.6 6.6l-3.4 5.4h1.9l-2.4 4.2h2.7V22h2.4v-5.8h2.7l-2.4-4.2H21z"/>'
  };
  const svg = (n) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONO[n]}</svg>`;

  // ---------- Datos ----------
  const meses = (D.meses || []).map((m) => ({ mes: m.mes, kg: num(m.kg) }));
  const huella = (D.huella || []).map((m) => ({ mes: m.mes, m3: num(m.m3), indice: num(m.indice) }));
  const promedio = (anio) => {
    const f = huella.filter((m) => m.mes.endsWith('-' + String(anio).slice(-2)));
    return f.length ? f.reduce((s, m) => s + m.indice, 0) / f.length : 0;
  };
  const pDesde = promedio(D.comparacionDesde), pHasta = promedio(D.comparacionHasta);
  const baja = pDesde ? Math.round((1 - pHasta / pDesde) * 100) : 0;

  // ---------- Fardos ----------
  const KG_BLOQUE = 500, ALTO_BLOQUE = 15.1, PASO = 18.1;
  const ancho = 648, colW = 40, sep = meses.length > 1 ? (ancho - meses.length * colW) / (meses.length - 1) : 0;
  const fardos = meses.map((m, c) => {
    const llenos = Math.floor(m.kg / KG_BLOQUE), resto = (m.kg % KG_BLOQUE) / KG_BLOQUE;
    let bloques = '';
    for (let k = 0; k < llenos; k++) bloques += `<i class="nu-bloque" style="--d:${(c * .05 + k * .03).toFixed(2)}s"></i>`;
    if (resto > .05) bloques += `<i class="nu-bloque" style="--d:${(c * .05 + llenos * .03).toFixed(2)}s;height:${(resto * ALTO_BLOQUE).toFixed(1)}px"></i>`;
    return `<div class="nu-col" style="left:${(c * (colW + sep)).toFixed(1)}px" data-c="${c}">${bloques}<span class="nu-kg">${miles(m.kg)} kg</span><span class="nu-mes">${esc(m.mes)}</span></div>`;
  }).join('');

  // ---------- Ruta de la huella (SVG 688 × 300 de gráfico + 30 de años) ----------
  const GW = 648, GH = 290, PAD = 14, MAX_I = 3.5, MAX_M3 = 25000;
  const n = huella.length;
  const X = (i) => PAD + (n > 1 ? i * (GW - 2 * PAD) / (n - 1) : 0);
  const Y = (v) => GH - (v / MAX_I) * (GH - 10);
  const P = huella.map((m, i) => [X(i), Y(m.indice)]);
  // curva suave por los puntos (Catmull-Rom → Bézier)
  const ctrl = (i) => {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n - 1, i + 2)];
    return [p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2];
  };
  const tramos = [];
  for (let i = 0; i < n - 1; i++) tramos.push(ctrl(i));
  const camino = n ? `M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}` + tramos.map((t) => `C${t[1].map((v) => v.toFixed(1))} ${t[2].map((v) => v.toFixed(1))} ${t[3].map((v) => v.toFixed(1))}`).join('') : '';
  // punto y dirección en la posición f (0 … n−1)
  function puntoEn(f) {
    if (n < 2) return { x: P[0] ? P[0][0] : 0, y: P[0] ? P[0][1] : 0, a: 0 };
    const i = Math.max(0, Math.min(n - 2, Math.floor(f))), t = Math.max(0, Math.min(1, f - i));
    const [a, b, c, d] = tramos[i], u = 1 - t;
    const x = u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0];
    const y = u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1];
    const dx = 3 * u * u * (b[0] - a[0]) + 6 * u * t * (c[0] - b[0]) + 3 * t * t * (d[0] - c[0]);
    const dy = 3 * u * u * (b[1] - a[1]) + 6 * u * t * (c[1] - b[1]) + 3 * t * t * (d[1] - c[1]);
    return { x, y, a: Math.atan2(dy, dx) * 180 / Math.PI };
  }
  let rejilla = '';
  for (let v = 0; v <= 3; v++) rejilla += `<line class="nu-rejilla" x1="0" x2="${GW}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}"/><text class="nu-eje-txt" x="${GW + 8}" y="${(Y(v) + 4).toFixed(1)}">${coma(v, 1)}</text>`;
  const anchoBarra = (GW - 2 * PAD) / Math.max(1, n - 1) * .55;
  const barras = huella.map((m, i) => `<rect class="nu-m3" data-i="${i}" x="${(X(i) - anchoBarra / 2).toFixed(1)}" width="${anchoBarra.toFixed(1)}" y="${(GH - m.m3 / MAX_M3 * (GH - 10)).toFixed(1)}" height="${(m.m3 / MAX_M3 * (GH - 10)).toFixed(1)}"/>`).join('');
  // años: un rótulo por cada grupo de meses del mismo año, con un corte entre años
  let anios = '';
  for (let i = 0; i < n;) {
    const a = huella[i].mes.slice(-2); let j = i;
    while (j + 1 < n && huella[j + 1].mes.slice(-2) === a) j++;
    anios += `<text class="nu-anio" x="${((X(i) + X(j)) / 2).toFixed(1)}" y="${GH + 26}">20${esc(a)}</text>`;
    if (j + 1 < n) { const xc = ((X(j) + X(j + 1)) / 2).toFixed(1); anios += `<line class="nu-corte" x1="${xc}" x2="${xc}" y1="${GH}" y2="${GH + 30}"/>`; }
    i = j + 1;
  }

  raiz.innerHTML =
    '<div class="rse-fondo"></div><div class="rse-orbes" aria-hidden="true"><i></i><i></i><i></i></div>' +
    `<h2 class="rse-titulo ent" style="--i:1"><span>${esc(D.titulo)}</span><b>${esc(D.tituloGrande)}</b></h2>` +
    `<div class="nu-flota izq"><div class="nu-vidrio ent" style="--i:2"><div class="nu-panel">
       <h3 class="ent" style="--i:2">${esc(D.reciclajeTitulo)}</h3>
       <p class="nu-texto ent" style="--i:2">${formato(D.reciclajeTexto)}</p>
       <div class="nu-datos ent" style="--i:3">
         <div class="nu-dato">${svg('reciclar')}<div><b data-hasta="${num(D.kilos)}">0</b><span>${esc(D.kilosTexto)}</span></div></div>
         <div class="nu-dato">${svg('arboles')}<div><b data-hasta="${num(D.arboles)}">0</b><span>${esc(D.arbolesTexto)}</span></div></div>
       </div>
       <p class="nu-etq ent" style="--i:4">${esc(D.registroTitulo)}</p>
       <div class="nu-fardos">${fardos}</div>
     </div></div></div>` +
    `<div class="nu-flota der"><div class="nu-vidrio ent" style="--i:3"><div class="nu-panel">
       <h3 class="ent" style="--i:2">${esc(D.huellaTitulo)}</h3>
       <p class="nu-texto ent" style="--i:2">${formato(D.huellaTexto)}</p>
       <div class="nu-datos ent" style="--i:3">
         <div class="nu-dato nu-compara"><div><b data-hasta="${Math.abs(baja)}" data-prefijo="${baja >= 0 ? '−' : '+'}" data-sufijo=" %">0</b>
           <span>${esc(D.comparacionTexto)} ${esc(D.comparacionDesde)} → ${esc(D.comparacionHasta)}: ${coma(pDesde, 2)} → ${coma(pHasta, 2)}</span></div></div>
       </div>
       <p class="nu-etq ent" style="--i:4">${esc(D.huellaUnidad)}</p>
       <div class="nu-ruta ent" style="--i:5">
         <svg viewBox="0 0 ${GW} ${GH + 40}" aria-hidden="true">
           ${rejilla}<g>${barras}</g>
           <path class="nu-camino" d="${camino}"/>
           <path class="nu-recorrido" d="${camino}"/>
           <path class="nu-carril" d="${camino}"/>
           ${anios}
           <line class="nu-guia" x1="0" x2="0" y1="0" y2="${GH}"/>
           <g class="nu-camion"><g transform="translate(-14 -24) scale(1.15)"><path d="M1 4.5h13.5v11.5H1z"/><path d="M15.8 7.6h4l3.2 4.4V16h-7.2z"/><circle class="rueda" cx="5.6" cy="18" r="2.4"/><circle class="rueda" cx="18.4" cy="18" r="2.4"/></g></g>
         </svg>
         <div class="nu-info"></div>
       </div>
     </div></div></div>`;

  // ---------- Vidrio: cada tarjeta se inclina apenas hacia el cursor ----------
  const vidrios = [...raiz.querySelectorAll('.nu-vidrio')];
  raiz.addEventListener('pointermove', (e) => {
    vidrios.forEach((v) => {
      const r = v.getBoundingClientRect();
      const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / r.width));
      const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / r.height));
      v.style.setProperty('--ry', (dx * 4).toFixed(2) + 'deg');
      v.style.setProperty('--rx', (-dy * 4).toFixed(2) + 'deg');
    });
  });
  raiz.addEventListener('pointerleave', () => vidrios.forEach((v) => { v.style.setProperty('--rx', '0deg'); v.style.setProperty('--ry', '0deg'); }));

  // ---------- Fardos: el cursor muestra los kg ----------
  const cajaFardos = raiz.querySelector('.nu-fardos');
  cajaFardos.querySelectorAll('.nu-col').forEach((col) => {
    col.addEventListener('pointerenter', () => { cajaFardos.classList.add('enfocado'); col.classList.add('foco'); });
    col.addEventListener('pointerleave', () => { cajaFardos.classList.remove('enfocado'); col.classList.remove('foco'); });
  });

  // ---------- Contadores ----------
  function contar() {
    raiz.querySelectorAll('.nu-dato b[data-hasta]').forEach((b) => {
      const hasta = +b.dataset.hasta, pre = b.dataset.prefijo || '', suf = b.dataset.sufijo || '', t0 = performance.now();
      const paso = (ahora) => {
        const t = Math.min(1, (ahora - t0) / 1600), e = 1 - Math.pow(1 - t, 3);
        b.textContent = pre + miles(hasta * e) + suf;
        if (t < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    });
  }

  // ---------- Camioncito sobre la ruta ----------
  const ruta = raiz.querySelector('.nu-ruta'), camion = raiz.querySelector('.nu-camion'), guia = raiz.querySelector('.nu-guia');
  const info = raiz.querySelector('.nu-info'), recorrido = raiz.querySelector('.nu-recorrido');
  const barrasEl = [...raiz.querySelectorAll('.nu-m3')];
  const largo = recorrido.getTotalLength ? recorrido.getTotalLength() : 0;
  let fPos = 0, fObj = 0, manejando = 0, enMarcha = false, previo = 0, visible = false, mesFoco = -1;
  if (largo) { recorrido.style.strokeDasharray = `${largo} ${largo}`; }
  function dibujar() {
    const p = puntoEn(fPos);
    camion.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.a.toFixed(1)})`);
    guia.setAttribute('x1', p.x.toFixed(1)); guia.setAttribute('x2', p.x.toFixed(1));
    // el tramo recorrido se pinta de verde
    if (largo) recorrido.style.strokeDashoffset = (largo * (1 - fPos / Math.max(1, n - 1))).toFixed(1);
    const i = Math.max(0, Math.min(n - 1, Math.round(fPos)));
    if (i !== mesFoco) {
      mesFoco = i;
      barrasEl.forEach((b, k) => b.classList.toggle('foco', k === i));
      const m = huella[i];
      if (m) info.innerHTML = `<b>${esc(m.mes)}</b><em>${coma(m.indice, 1)}</em> t CO₂/m³ · ${miles(m.m3)} m³`;
    }
    info.style.left = p.x.toFixed(1) + 'px';
    info.style.top = (p.y - 34).toFixed(1) + 'px';
  }
  function cuadro(ahora) {
    const dt = Math.min(.05, (ahora - (previo || ahora)) / 1000); previo = ahora;
    if (manejando) {
      const t = Math.max(0, Math.min(1, (ahora - manejando) / 3800));
      fObj = (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2) * (n - 1);
      if (t >= 1) manejando = 0;
    }
    fPos += (fObj - fPos) * Math.min(1, dt * 9);
    dibujar();
    if (visible && (manejando || Math.abs(fObj - fPos) > .002)) requestAnimationFrame(cuadro); else { enMarcha = false; previo = 0; }
  }
  function despertar() { if (!enMarcha && visible) { enMarcha = true; requestAnimationFrame(cuadro); } }
  ruta.addEventListener('pointermove', (e) => {
    const r = ruta.getBoundingClientRect(), x = (e.clientX - r.left) * (GW / r.width);
    manejando = 0;
    fObj = Math.max(0, Math.min(n - 1, (x - PAD) / (GW - 2 * PAD) * (n - 1)));
    despertar();
  });
  ruta.addEventListener('pointerleave', () => { fObj = n - 1; despertar(); });
  dibujar();

  // ---------- Entrada con el scroll ----------
  // la sección empieza en su "top" dentro del tramo (que arranca en y 900): en pantalla
  // queda en y 900 + TOP − bajada; entra cuando ya asoma 300 px
  const TOP = raiz.offsetTop;
  let yaEntro = false, asentar = 0;
  document.addEventListener('desplazamiento', (e) => {
    const baj = Math.max(0, e.detail.y - 900);
    const ver = baj > TOP + 300 && baj < TOP + 1500;
    if (ver === visible) return;
    visible = ver;
    raiz.classList.toggle('visible', ver);
    clearTimeout(asentar);
    if (ver) {
      asentar = setTimeout(() => raiz.classList.add('asentado'), 1600);
      if (!yaEntro) { yaEntro = true; contar(); fPos = 0; fObj = 0; manejando = performance.now() + 500; }
      despertar();
    } else raiz.classList.remove('asentado');
  });
})();
