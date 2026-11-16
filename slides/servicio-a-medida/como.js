/* =========================================================
   Funciones comunes de Servicio a medida (window.SV) para tms.js,
   ecosistema.js, experiencia.js, inversa.js, ventajas.js y centros.js.
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
    custom: '<svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 1.5a7.4 7.4 0 0 0-7.4 7.4c0 5.4 7.4 13.6 7.4 13.6s7.4-8.2 7.4-13.6A7.4 7.4 0 0 0 12 1.5zm0 4.4a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/></svg>',
    // experiencia de usuario: persona con un globito de chat
    usuario: '<svg viewBox="0 0 24 24"><circle cx="8.5" cy="7.5" r="4"/><path d="M1 21.5c0-4.4 3.4-7.6 7.5-7.6s7.5 3.2 7.5 7.6z"/><path d="M14 2h8.5v7.2h-3.6L16.4 12V9.2H14z"/></svg>'
  };

  window.SV = { S, cliente, $, esc, txt, crear, irA, escala, ICONOS };
  // (la pantalla de entrada con las 4 tarjetas se unió con el ecosistema: ahora el
  //  título "¿Cómo lo HACEMOS?" lo arma tms.js arriba de las pestañas)
})();
