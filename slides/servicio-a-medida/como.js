/* =========================================================
   ¿CÓMO LO HACEMOS? — pantalla de entrada y funciones comunes
   para tms.js, inversa.js y ventajas.js (window.SV).
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
    tms: '<svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="M2 3.5h20v13.5H2zM4 5.5V15h16V5.5z"/><path d="M8 19h8v2H8zM5.8 9.6l1.2-1.2 1.3 1.3 2.8-2.8 1.2 1.2-4 4zM13 8h5v1.8h-5zM6 12.6h12v1.8H6z"/></svg>',
    inversa: '<svg viewBox="0 0 24 24"><path d="M9.5 3.5 3 9l6.5 5.5V11H16a3.5 3.5 0 0 1 0 7h-4.5v2.6H16A6.1 6.1 0 0 0 16 8.4H9.5z"/></svg>',
    tableros: '<svg viewBox="0 0 24 24"><path d="M3 19.5h18v2H3zM4.5 12h3.6v6H4.5zM10.2 7.5h3.6V18h-3.6zM15.9 3h3.6v15h-3.6z"/></svg>',
    // las 4 partes del ecosistema (como los íconos de la diapositiva de la persona)
    cargas: '<svg viewBox="0 0 24 24"><path d="M2 8h11v13H2zM6 8V5.5h3V8z"/><path d="M14.5 13H22v8h-7.5zM18.25 3l4 4.2h-2.7V11h-2.6V7.2h-2.7z"/></svg>',
    despachos: '<svg viewBox="0 0 24 24"><path d="M1 5h13v11H1zM15 8.5h4.6L23 12.8V16h-8z"/><circle cx="5.5" cy="18" r="2.6"/><circle cx="18.5" cy="18" r="2.6"/></svg>',
    digital: '<svg viewBox="0 0 24 24"><path d="M18.6 9.2A6.9 6.9 0 0 0 5.3 8.1 5.1 5.1 0 0 0 6 18.3h12.4a4.6 4.6 0 0 0 .2-9.1zM13.3 13.5V17h-2.6v-3.5H7.9L12 9l4.1 4.5z"/></svg>',
    custom: '<svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 1.5a7.4 7.4 0 0 0-7.4 7.4c0 5.4 7.4 13.6 7.4 13.6s7.4-8.2 7.4-13.6A7.4 7.4 0 0 0 12 1.5zm0 4.4a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg>'
  };

  window.SV = { S, cliente, $, esc, txt, crear, irA, escala, ICONOS };

  // ---------- Pantalla de entrada ----------
  const C = S.como || {};
  const intro = $('.sv-intro');
  if (!intro) return;
  // las 4 tarjetas abren su pestaña del ecosistema (tms.js deja SV.elegirPestana)
  const pestanas = ['carga', 'despachos', 'tracking', 'inter'];
  const iconos = [ICONOS.cargas, ICONOS.despachos, ICONOS.digital, ICONOS.custom];
  intro.innerHTML = '<div class="sv-fondo"></div><div class="in-franjas"></div>' +
    `<div class="in-titulo ent" style="--i:0"><p class="in-sello"><i class="franjitas"></i>${txt(C.sello)}</p>` +
    `<span>${txt(C.antetitulo)}</span><b>${txt(C.titulo)}</b></div>` +
    `<p class="in-bajada ent" style="--i:1">${txt(C.bajada)}</p>` +
    '<div class="in-partes">' + (C.partes || []).slice(0, 4).map((p, i) =>
      `<button type="button" class="in-parte ent" style="--i:${i + 2}" data-i="${i}">` +
      (p.foto ? `<span class="in-foto"><img src="../../${SV.esc(p.foto)}" alt="" decoding="async"></span>` : '') +
      `<span class="in-num">${String(i + 1).padStart(2, '0')}</span>` +
      `<span class="in-cabeza"><span class="in-ico">${iconos[i] || ''}</span><b>${txt(p.titulo)}</b></span><span class="in-texto">${txt(p.texto)}</span>` +
      '<span class="in-ir" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 11h11l-4-4 1.4-1.4L19.8 12l-6.4 6.4L12 17l4-4H5z"/></svg></span></button>').join('') + '</div>';
  intro.querySelectorAll('.in-parte').forEach((b) => b.addEventListener('click', () => {
    if (SV.elegirPestana) SV.elegirPestana(pestanas[+b.dataset.i]);
    irA($('.sv-tms'));
  }));
  // el cartel "Bajá para seguir" lo pone compartido/guia.js; la mano señala las tarjetas
  if (window.GUIA) GUIA.pista({ id: 'servicio-partes', texto: 'entradaPartes', objetivo: () => intro.querySelector('.in-parte .in-ir'), zona: '.in-parte', lado: 'abajo', espera: 2.6 });

  // aparece cuando sube por encima de la portada (o enseguida si no hay portada)
  const mostrar = () => intro.classList.add('visible');
  const yIntro = () => intro.offsetTop;
  const revisar = (y) => { if (y > yIntro() - 520) mostrar(); };
  document.addEventListener('desplazamiento', (e) => revisar(e.detail.y));
  const alAbrir = () => revisar(window.desplazamiento ? window.desplazamiento.y : 0);
  if (document.body.classList.contains('lista')) alAbrir();
  else document.addEventListener('pagina-lista', alAbrir);
})();
