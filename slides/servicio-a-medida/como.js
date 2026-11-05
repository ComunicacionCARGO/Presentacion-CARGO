/* =========================================================
   ¿CÓMO LO HACEMOS? — pantalla de entrada y funciones comunes
   para milkrun.js, tms.js e inversa.js (window.SV).
   Textos en datos/servicio.js (window.SERVICIO).
   ========================================================= */
(function () {
  const S = window.SERVICIO || {};
  const cliente = S.cliente || '';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // {cliente} (y otras marcas como {numero}) + **negrita**
  function txt(t, vars) {
    let s = String(t == null ? '' : t).replace(/\{cliente\}/g, cliente);
    if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
    return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }
  function crear(tag, clase, padre, html) {
    const el = document.createElement(tag);
    if (clase) el.className = clase;
    if (html !== undefined) el.innerHTML = html;
    if (padre) padre.appendChild(el);
    return el;
  }
  // Llevar el scroll a una sección (o a una posición dentro de ella)
  function irA(seccion, extra) {
    if (window.desplazamiento && seccion) window.desplazamiento.ir(seccion.offsetTop + (extra || 0));
  }
  // Escala real del escenario (para pasar coordenadas de la pantalla a px del escenario)
  const escala = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--escala')) || 1;

  const ICONOS = {
    milk: '<svg viewBox="0 0 24 24"><path d="M12 2.5a9.5 9.5 0 0 1 9.4 8h-2.6A7 7 0 0 0 6 8.2l2.3 1.3L2.5 12 2 5.6l1.9 1.1A9.5 9.5 0 0 1 12 2.5zM2.6 13.5h2.6A7 7 0 0 0 18 15.8l-2.3-1.3 5.8-2.5.5 6.4-1.9-1.1A9.5 9.5 0 0 1 2.6 13.5z"/><path d="M8 10h5v4.5H8zM13.6 11.4h1.7l1.2 1.4v1.7h-2.9z"/></svg>',
    tms: '<svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="M2 3.5h20v13.5H2zM4 5.5V15h16V5.5z"/><path d="M8 19h8v2H8zM5.8 9.6l1.2-1.2 1.3 1.3 2.8-2.8 1.2 1.2-4 4zM13 8h5v1.8h-5zM6 12.6h12v1.8H6z"/></svg>',
    inversa: '<svg viewBox="0 0 24 24"><path d="M9.5 3.5 3 9l6.5 5.5V11H16a3.5 3.5 0 0 1 0 7h-4.5v2.6H16A6.1 6.1 0 0 0 16 8.4H9.5z"/></svg>'
  };

  window.SV = { S, cliente, $, esc, txt, crear, irA, escala, ICONOS };

  // ---------- Pantalla de entrada ----------
  const C = S.como || {};
  const intro = $('.sv-intro');
  if (!intro) return;
  const destinos = ['.sv-milk', '.sv-tms', '.sv-inv'];
  const iconos = [ICONOS.milk, ICONOS.tms, ICONOS.inversa];
  intro.innerHTML = '<div class="sv-fondo"></div>' +
    `<div class="in-titulo ent" style="--i:0"><p class="in-sello"><i class="franjitas"></i>${txt(C.sello)}</p>` +
    `<span>${txt(C.antetitulo)}</span><b>${txt(C.titulo)}</b></div>` +
    `<p class="in-bajada ent" style="--i:1">${txt(C.bajada)}</p>` +
    '<div class="in-partes">' + (C.partes || []).map((p, i) =>
      `<button type="button" class="in-parte ent" style="--i:${i + 2}" data-i="${i}">` +
      `<span class="in-num">${String(i + 1).padStart(2, '0')}</span><span class="in-ico">${iconos[i] || ''}</span>` +
      `<b>${txt(p.titulo)}</b><span class="in-texto">${txt(p.texto)}</span>` +
      '<span class="in-ir" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 11h11l-4-4 1.4-1.4L19.8 12l-6.4 6.4L12 17l4-4H5z"/></svg></span></button>').join('') + '</div>' +
    `<p class="in-ayuda indicador-scroll"><span>${txt(C.ayuda)}</span><i></i></p>`;
  intro.querySelectorAll('.in-parte').forEach((b) => b.addEventListener('click', () => irA($(destinos[+b.dataset.i]))));

  const mostrar = () => intro.classList.add('visible');
  if (document.body.classList.contains('lista')) mostrar();
  else document.addEventListener('pagina-lista', mostrar);
})();
