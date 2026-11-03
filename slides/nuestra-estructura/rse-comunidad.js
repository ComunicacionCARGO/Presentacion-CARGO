/* =========================================================
   RSE 3 — "Acompañamos a la COMUNIDAD" (datos/rse.js → comunidad)
   Tres acciones con foto (la foto se acerca con el cursor) y los logos de las
   organizaciones aliadas en fichas crema, agrupadas (Ambiente / Comunidad).
   ========================================================= */
(function () {
  const R = window.RSE, D = R && R.comunidad;
  const raiz = document.querySelector('.mc-com');
  if (!D || !raiz) return;
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const formato = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // agrupa los aliados en el orden en que aparece cada grupo
  const grupos = [];
  (D.aliados || []).forEach((a) => {
    let g = grupos.find((x) => x.nombre === (a.grupo || ''));
    if (!g) { g = { nombre: a.grupo || '', items: [] }; grupos.push(g); }
    g.items.push(a);
  });
  let k = 0;

  raiz.innerHTML =
    '<div class="rse-fondo"></div>' +
    `<h2 class="rse-titulo ent" style="--i:1"><span>${esc(D.titulo)}</span><b>${esc(D.tituloGrande)}</b></h2>` +
    `<div class="co-acciones">${(D.acciones || []).map((a, i) => `
      <article class="co-accion ent" style="--i:${i + 2}">
        <figure class="co-foto"><img src="../../img/rse/acciones/${esc(a.imagen)}" alt="${esc(a.titulo)}" loading="lazy"><span class="co-num">${String(i + 1).padStart(2, '0')}</span></figure>
        <h3>${esc(a.titulo)}</h3>
        <p>${formato(a.texto)}</p>
      </article>`).join('')}</div>` +
    `<p class="co-aliados-t ent" style="--i:4">${esc(D.aliadosTitulo)}</p>` +
    `<div class="co-aliados">${grupos.map((g) => `
      <div class="co-grupo">${g.nombre ? `<span class="ent" style="--i:5">${esc(g.nombre)}</span>` : ''}
        <div class="co-fichas">${g.items.map((a) => `<div class="co-ficha ent" style="--i:${5 + (k++) * .5}" title="${esc(a.nombre)}"><img src="../../img/rse/aliados/${esc(a.imagen)}" alt="${esc(a.nombre)}" loading="lazy"></div>`).join('')}</div>
      </div>`).join('')}</div>`;

  // ---------- Entrada con el scroll (ver rse-numeros.js) ----------
  const TOP = raiz.offsetTop;
  let visible = false, asentar = 0;
  document.addEventListener('desplazamiento', (e) => {
    const baj = Math.max(0, e.detail.y - 900);
    const ver = baj > TOP + 150;
    if (ver === visible) return;
    visible = ver;
    raiz.classList.toggle('visible', ver);
    clearTimeout(asentar);
    if (ver) asentar = setTimeout(() => raiz.classList.add('asentado'), 1800);
    else raiz.classList.remove('asentado');
  });
})();
