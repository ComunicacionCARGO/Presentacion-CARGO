/* =========================================================
   TEMPLO DE LOS PILARES DE S.C.O.P.E. (tema Calidad, sección Pilares)
   Silueta copiada del diseño de la persona (su imagen de 1171 × 631: todas
   las medidas están en esos px y el conjunto se agranda 1,2 con CSS).
   Se arma como los mapas: una pieza de vidrio con espesor (copias apiladas
   de la silueta, de crema claro a tostado), cara clara con brillo, borde
   fino, resplandor rojo y sombra. Con el mouse hay paralaje: el espesor se
   corre hacia el lado contrario, el brillo se desliza y todo se inclina un
   poco. Al pasar por una columna, se levanta en rojo (como las provincias).
   mejora.js usa TEMPLO.html(...) y TEMPLO.activar(seccion).
   ========================================================= */
(function () {
  'use strict';

  // ---- Geometría (px de la imagen del diseño) ----
  const CUERPO = [
    // frontón (esquinas de radio 62) y cornisa (chaflán a 45° y curva cóncava de radio 37)
    'M212.5 162H314V165A62 62 0 0 1 376 103H806A62 62 0 0 1 868 165V162H969.5L1028 220.5V241A37 37 0 0 0 991 278H191A37 37 0 0 0 154 241V220.5Z',
    // base (esquinas de arriba redondeadas, radio 32,5)
    'M159 557.5V521.5A32.5 32.5 0 0 1 191.5 489H990.5A32.5 32.5 0 0 1 1023 521.5V557.5Z'
  ];
  const CAJA = { x: 154, y: 103, w: 874, h: 455 };
  const ICONO_Y = 383.5, ICONO_ESCALA = .5;      // centro de los íconos y px por unidad del ícono
  const centro = (i, n) => n > 1 ? 237 + i * 708 / (n - 1) : 591;
  const rect = (x, y, w, h, r) => `<rect x="${x.toFixed(1)}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
  const columna = (c) =>
    rect(c - 22, 288, 44, 190, 0) +          // fuste
    rect(c - 33, 277.5, 66, 11.5, 4) +       // capitel de arriba
    rect(c - 31, 298.5, 62, 9, 4.5) +        // anillo
    rect(c - 31, 458.5, 62, 9, 4.5) +        // anillo de abajo
    rect(c - 33, 477, 66, 11.5, 4);          // capitel de abajo

  // ---- Vidrio ----
  const ESPESOR = 15, CAPAS = 16;                       // como los mapas: copias apiladas
  const LADOS = ['#F3E6DB', '#D9B39D'];                 // del borde de la cara hacia el fondo
  const ALZA = 16, CAPAS_ALZA = 12;                     // columna que se levanta
  const LADOS_ROJOS = ['#DE3F22', '#A52612'];
  const mezcla = (a, b, t) => {
    const ca = a.match(/\w\w/g).map((h) => parseInt(h, 16)), cb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
    return '#' + ca.map((v, k) => Math.round(v + (cb[k] - v) * t).toString(16).padStart(2, '0')).join('');
  };
  const SIN_COSTURA = 'stroke-width=".9" stroke-linejoin="round"';

  function html({ pilares, iconos, ruta, esc, titulo }) {
    const P = pilares || [], n = P.length;
    const silueta = '<use href="#tp-cuerpo"/>' + P.map((p, i) => `<use href="#tp-col-${i}"/>`).join('');
    let lados = '';
    for (let k = CAPAS; k >= 1; k--) {
      const c = mezcla(LADOS[0], LADOS[1], k / CAPAS);
      lados += `<g class="tp-capa" data-k="${k}" fill="${c}" stroke="${c}" ${SIN_COSTURA}>${silueta}</g>`;
    }
    const rojos = [];
    for (let k = 0; k < CAPAS_ALZA; k++) rojos.push(mezcla(LADOS_ROJOS[1], LADOS_ROJOS[0], k / (CAPAS_ALZA - 1)));

    return `<div class="templo ent">
      <!-- detrás: resplandor rojo y sombra (pintados una vez; con el mouse solo se corren) -->
      <svg class="tp-halo" viewBox="0 0 1171 631" aria-hidden="true">
        <defs><filter id="tp-desenfoque" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="15"/></filter></defs>
        <g filter="url(#tp-desenfoque)" fill="#EF4529" opacity=".26" transform="translate(0 10)">
          ${CUERPO.map((d) => `<path d="${d}"/>`).join('')}${P.map((p, i) => columna(centro(i, n))).join('')}
        </g>
      </svg>
      <svg class="tp-sombra" viewBox="0 0 1171 631" aria-hidden="true">
        <defs><filter id="tp-desenfoque-2" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur stdDeviation="11"/></filter></defs>
        <g filter="url(#tp-desenfoque-2)" fill="#8C2A14" opacity=".14" transform="translate(6 22)">
          ${CUERPO.map((d) => `<path d="${d}"/>`).join('')}${P.map((p, i) => columna(centro(i, n))).join('')}
        </g>
      </svg>
      <!-- la pieza: espesor, cara, brillo, borde, logo, columnas que se levantan e íconos -->
      <svg class="tp-svg" viewBox="0 0 1171 631" aria-label="${esc(titulo)}">
        <defs>
          <g id="tp-cuerpo">${CUERPO.map((d) => `<path d="${d}"/>`).join('')}</g>
          ${P.map((p, i) => `<g id="tp-col-${i}">${columna(centro(i, n))}</g>`).join('')}
          <clipPath id="tp-recorte">${silueta}</clipPath>
          <linearGradient id="tp-cara" gradientUnits="userSpaceOnUse" x1="0" y1="${CAJA.y}" x2="0" y2="${CAJA.y + CAJA.h}">
            <stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FCF2E9"/>
          </linearGradient>
          <linearGradient id="tp-brillo" gradientUnits="userSpaceOnUse" x1="${CAJA.x}" y1="${CAJA.y}" x2="${CAJA.x + CAJA.w}" y2="${CAJA.y + CAJA.h}">
            <stop offset=".22" stop-color="#fff" stop-opacity="0"/><stop offset=".36" stop-color="#fff" stop-opacity=".95"/>
            <stop offset=".5" stop-color="#fff" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <g class="tp-lados">${lados}</g>
        <g class="tp-cara" fill="url(#tp-cara)" stroke="url(#tp-cara)" ${SIN_COSTURA}>${silueta}</g>
        <rect class="tp-reflejo" x="${CAJA.x - 300}" y="${CAJA.y}" width="${CAJA.w + 600}" height="${CAJA.h}" fill="url(#tp-brillo)" clip-path="url(#tp-recorte)"/>
        <g class="tp-borde" fill="none" stroke="#E7D3C4" stroke-width=".75" stroke-linejoin="round">${silueta}</g>
        <image class="tp-logo" href="${ruta('img/scope/logo-scope-gris.svg')}" x="462" y="139" width="307" height="116"/>
        ${P.map((p, i) => `<g class="tp-col" data-i="${i}" style="--i:${i}">
          <g class="tp-alzado">${rojos.map((c) => `<use href="#tp-col-${i}" fill="${c}" stroke="${c}" ${SIN_COSTURA}/>`).join('')}<use class="tp-alzado-cara" href="#tp-col-${i}"/></g>
          <g class="tp-ico-mov"><svg class="tp-ico" x="${(centro(i, n) - 22.75).toFixed(1)}" y="${ICONO_Y - 22.75}" width="45.5" height="45.5" viewBox="0 0 91.05 91.05"><g>${iconos[p.icono] || ''}</g></svg></g>
          <use class="tp-toque" href="#tp-col-${i}"/>
          <text class="tp-nombre" x="${centro(i, n).toFixed(1)}" y="528">${esc(p.nombre)}</text>
        </g>`).join('')}
      </svg>
    </div>`;
  }

  function activar(seccion) {
    const templo = seccion.querySelector('.templo');
    if (!templo) return;
    const svg = templo.querySelector('.tp-svg');
    const capas = [...svg.querySelectorAll('.tp-capa')].map((g) => ({ g, k: +g.dataset.k }));
    const reflejo = svg.querySelector('.tp-reflejo');
    const halo = templo.querySelector('.tp-halo'), sombra = templo.querySelector('.tp-sombra');
    const cols = [...svg.querySelectorAll('.tp-col')].map((g) => ({
      g,
      alzado: g.querySelector('.tp-alzado'),
      rojos: [...g.querySelectorAll('.tp-alzado use:not(.tp-alzado-cara)')],
      cara: g.querySelector('.tp-alzado-cara'),
      ico: g.querySelector('.tp-ico-mov'),
      alto: 0, meta: 0
    }));

    // cada ícono se centra por su dibujo (no por su caja), a 0,5 px por unidad como en el diseño
    svg.querySelectorAll('.tp-ico').forEach((s) => {
      const bb = s.firstElementChild.getBBox();
      if (!bb.width) return;
      const cx = +s.getAttribute('x') + 22.75;
      s.setAttribute('viewBox', `${bb.x} ${bb.y} ${bb.width} ${bb.height}`);
      s.setAttribute('width', (bb.width * ICONO_ESCALA).toFixed(2));
      s.setAttribute('height', (bb.height * ICONO_ESCALA).toFixed(2));
      s.setAttribute('x', (cx - bb.width * ICONO_ESCALA / 2).toFixed(2));
      s.setAttribute('y', (ICONO_Y - bb.height * ICONO_ESCALA / 2).toFixed(2));
    });

    // ---- Estado ----
    let mx = 0, my = 0, ox = 0, oy = 0;      // mouse (−1..1) y lo que se muestra (suavizado)
    let sube = 0, subeMeta = 0;               // el espesor crece al entrar
    let bucle = null, ultimo = 0;

    function pintar() {
      // dirección del espesor: hacia abajo y un poco a la derecha; el mouse la corre (paralaje)
      const vx = (.28 - ox * .7) * ESPESOR * sube, vy = (.8 - oy * .5) * ESPESOR * sube;
      for (const c of capas) c.g.setAttribute('transform', `translate(${(vx * c.k / CAPAS).toFixed(2)} ${(vy * c.k / CAPAS).toFixed(2)})`);
      sombra.style.translate = `${(vx * .9).toFixed(1)}px ${(vy * .6).toFixed(1)}px`;
      halo.style.translate = `${(-ox * 6).toFixed(1)}px ${(-oy * 4).toFixed(1)}px`;
      reflejo.setAttribute('x', (CAJA.x - 300 + ox * 260).toFixed(1));
      templo.style.setProperty('--rx', (-oy * 3).toFixed(2) + 'deg');
      templo.style.setProperty('--ry', (ox * 4.5).toFixed(2) + 'deg');
      // columnas levantadas: hacia el que mira (contrario al espesor)
      const largo = Math.hypot(vx, vy) || 1, ux = -vx / largo, uy = -vy / largo;
      for (const c of cols) {
        if (c.alto < .001) { c.alzado.style.display = 'none'; c.ico.removeAttribute('transform'); continue; }
        c.alzado.style.display = '';
        const a = ALZA * c.alto;
        c.rojos.forEach((u, k) => u.setAttribute('transform', `translate(${(ux * a * k / CAPAS_ALZA).toFixed(2)} ${(uy * a * k / CAPAS_ALZA).toFixed(2)})`));
        const t = `translate(${(ux * a).toFixed(2)} ${(uy * a).toFixed(2)})`;
        c.cara.setAttribute('transform', t);
        c.ico.setAttribute('transform', t);
      }
    }

    function cuadro(ahora) {
      const dt = Math.min(.05, (ahora - (ultimo || ahora)) / 1000);
      ultimo = ahora;
      if (!seccion.isConnected) { bucle = null; return; }
      const k = 1 - Math.exp(-dt * 7);
      ox += (mx - ox) * k; oy += (my - oy) * k;
      sube += (subeMeta - sube) * (1 - Math.exp(-dt * 3.2));
      let quieto = Math.abs(mx - ox) < .002 && Math.abs(my - oy) < .002 && Math.abs(subeMeta - sube) < .002;
      for (const c of cols) {
        c.alto += (c.meta - c.alto) * (1 - Math.exp(-dt * 11));
        if (Math.abs(c.meta - c.alto) > .002) quieto = false; else c.alto = c.meta;
      }
      pintar();
      bucle = quieto ? null : requestAnimationFrame(cuadro);
    }
    const mover = () => { if (!bucle) { ultimo = 0; bucle = requestAnimationFrame(cuadro); } };

    // mouse: solo con la sección en pantalla
    const alMover = (e) => {
      if (!seccion.isConnected) { window.removeEventListener('pointermove', alMover); return; }
      if (!seccion.classList.contains('actual')) return;
      const r = templo.getBoundingClientRect();
      const cx = r.left + r.width * (591 / 1171), cy = r.top + r.height * (330 / 631);
      mx = Math.max(-1, Math.min(1, (e.clientX - cx) / (r.width * .55)));
      my = Math.max(-1, Math.min(1, (e.clientY - cy) / (r.height * .7)));
      mover();
    };
    window.addEventListener('pointermove', alMover);

    cols.forEach((c) => {
      const toque = c.g.querySelector('.tp-toque');
      toque.addEventListener('pointerenter', () => { c.meta = 1; c.g.classList.add('alzada'); mover(); });
      toque.addEventListener('pointerleave', () => { c.meta = 0; c.g.classList.remove('alzada'); mover(); });
    });

    // al entrar a la sección el espesor crece (la pieza "se levanta"); al salir vuelve a cero
    new MutationObserver(() => {
      const visible = seccion.classList.contains('visible');
      if (visible && subeMeta === 0) { sube = 0; subeMeta = 1; setTimeout(mover, 250); }
      else if (!visible && subeMeta === 1) { subeMeta = 0; sube = 0; mx = my = ox = oy = 0; pintar(); }
    }).observe(seccion, { attributes: true, attributeFilter: ['class'] });
    pintar();
  }

  window.TEMPLO = { html, activar };
})();
