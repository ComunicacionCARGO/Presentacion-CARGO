/* =========================================================
   MEJORA CONTINUA — después de "¿Por qué elegirnos?" (datos/mejora-continua.js)
   1. Pantalla partida (diseño de la persona): una banda de franjas rojas que
      viene de la izquierda arriba, dobla en curva, baja en diagonal y vuelve a
      doblar hacia la derecha abajo. Del lado crema, CALIDAD; del lado gris
      (que sigue al gris de "¿Por qué elegirnos?"), CAPACITACIONES. Al pasar el
      cursor la diagonal se corre y agranda ese lado; al hacer clic barre la
      pantalla y se abre el tema.
   2. Cada tema ("capítulo") tiene secciones que se recorren con la rueda,
      las flechas o las pestañas. Esc vuelve a la pantalla partida.
   ========================================================= */
(function () {
  const M = window.MEJORA;
  if (!M) return;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  // **negrita** y *rojo en cursiva*
  const formato = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
  function crear(tag, clase, padre, html) {
    const el = document.createElement(tag);
    if (clase) el.className = clase;
    if (html !== undefined) el.innerHTML = html;
    if (padre) padre.appendChild(el);
    return el;
  }
  const ruta = (r) => '../../' + r;

  // ---------- Íconos (sólidos, 24 × 24) ----------
  const ICONOS = {
    sello: '<path fill-rule="evenodd" d="M12 .8l2.7 2.1 3.4-.4 1.2 3.2 3 1.7-.9 3.3 1.3 3.2-2.8 2-.8 3.3-3.4.1L12 21.6l-2.7-2.1-3.4.1-.8-3.3-2.8-2 1.3-3.2-.9-3.3 3-1.7 1.2-3.2 3.4.4zM10.7 15.3l6-6-1.6-1.6-4.4 4.4-2.2-2.2-1.6 1.6z"/>',
    birrete: '<path d="M12 3 .8 8.6 12 14.2l8.6-4.3V16h2.2V8.6z"/><path d="M5 12.2v4.6c1.8 1.9 4.3 3 7 3s5.2-1.1 7-3v-4.6l-7 3.5z"/>',
    personas: '<circle cx="12" cy="5.6" r="3.2"/><path d="M6.8 21v-6.2c0-2.9 2.3-5 5.2-5s5.2 2.1 5.2 5V21z"/><circle cx="4.6" cy="8.2" r="2.4"/><path d="M.6 19v-4c0-2.1 1.7-3.6 3.9-3.6 1 0 1.8.3 2.5.8-.7.9-1.1 2.1-1.1 3.4V19z"/><circle cx="19.4" cy="8.2" r="2.4"/><path d="M23.4 19v-4c0-2.1-1.7-3.6-3.9-3.6-1 0-1.8.3-2.5.8.7.9 1.1 2.1 1.1 3.4V19z"/>',
    cono: '<path d="M10.1 1.5h3.8l1.1 4.3H9z"/><path d="M8.5 7.8h7l1.1 4.4H7.4z"/><path d="M6.9 14.2h10.2l1.3 5H5.6z"/><path d="M1.5 20.2h21v2.3h-21z"/>',
    hoja: '<path d="M21.6 2.4C11 2.2 4.2 6.8 3.6 14.2c-.1 1.6.2 3.1.8 4.4L2 21l1.4 1.4 2.4-2.4c1.3.7 2.8 1 4.4.9C17.6 20.3 22 13.5 21.6 2.4zM7.2 18.7c1.9-4.6 5.4-8.4 10.4-10.9-3.8 3.2-6.6 7.1-8.4 11.8z"/>',
    carretilla: '<path d="M1.5 2h4.2l3.6 13.4-2 .5L4.1 4.2H1.5z"/><circle cx="9.4" cy="18.6" r="3.1"/><path d="M9.4 6.9 18.2 4.6l2.3 8.6-8.8 2.3z"/><path d="M13.6 16.6l8.4-2.2.5 2-8.4 2.2z"/>',
    caja: '<path d="M12 2 21 6.6 12 11.2 3 6.6z"/><path d="M2.6 8.2 11.2 12.6V22l-8.6-4.6z"/><path d="M21.4 8.2 12.8 12.6V22l8.6-4.6z"/>',
    camion: '<path d="M1 4.5h13.5v11.5H1z"/><path d="M15.8 7.6h4l3.2 4.4V16h-7.2z"/><circle cx="5.6" cy="18" r="2.4"/><circle cx="18.4" cy="18" r="2.4"/>',
    casco: '<path d="M12 1.8c-3.6 0-6.5 2.8-6.8 6.4H4.4v2.3h15.2V8.2h-.8C18.5 4.6 15.6 1.8 12 1.8z"/><path d="M7.4 11.8h9.2a4.6 4.6 0 0 1-9.2 0z"/><path d="M3.2 22.5c0-4.2 3.6-6.8 8.8-6.8s8.8 2.6 8.8 6.8z"/>',
    monedas: '<ellipse cx="9" cy="5.5" rx="7" ry="3"/><path d="M2 7.6v2.6c0 1.7 3.1 3 7 3s7-1.3 7-3V7.6c-1.4 1.3-4 2.1-7 2.1S3.4 8.9 2 7.6z"/><path d="M2 12.4V15c0 1.7 3.1 3 7 3 .7 0 1.4 0 2-.1a6 6 0 0 1 1.2-4.1c-1 .1-2.1.2-3.2.2-3 0-5.6-.8-7-2.1z"/><circle cx="17.5" cy="16.8" r="5.2"/>',
    puzzle: '<path d="M3 3h6.2a2.6 2.6 0 1 1 5.2 0H20v5.6a2.6 2.6 0 1 0 0 5.2V20h-5.6a2.6 2.6 0 1 0-5.2 0H3v-6.2a2.6 2.6 0 1 1 0-5.2z"/>'
  };
  // Íconos de los pilares de S.C.O.P.E. (los SVG que mandó la persona, caja de 91 × 91)
  const ICONOS_SCOPE = {
    logistica: '<path d="M33.13,72.44c-2.71,0-4.83-2.13-4.83-4.83s2.13-4.83,4.83-4.83,4.83,2.13,4.83,4.83-2.22,4.83-4.83,4.83h0ZM33.13,53.6c-7.73,0-14.01,6.28-14.01,14.01s6.28,14.01,14.01,14.01,14.01-6.28,14.01-14.01-6.28-14.01-14.01-14.01h0Z"/><polygon points="50.74 64.43 41.13 41.22 70.58 29.02 80.2 52.23 50.74 64.43 50.74 64.43"/><path d="M34.29,49.83c2.51.19,4.93.87,7.05,2.03L23.76,8.57c0-.1-.1-.19-.1-.29l-5.41,2.22c0,.1.1.19.1.29l2.22,5.51-7.92,3.29c-1.45.58-2.22,2.32-1.55,3.77.48,1.16,1.55,1.84,2.71,1.84.39,0,.77-.1,1.06-.19l7.92-3.28,11.5,28.12h0Z"/><path d="M71.78,60.26c-.39,0-.77.1-1.16.19l-19.61,8.12c-.19,2.51-.77,4.93-1.93,7.05v.1l23.57-9.86c1.16-.39,2.03-1.45,2.03-2.71,0-1.55-1.35-2.9-2.9-2.9h0Z"/>',
    warehouse: '<polygon points="28.17 17.46 13.7 26.24 45.53 45.53 59.99 36.75 28.17 17.46 28.17 17.46"/><polygon points="77.35 26.24 45.53 6.95 31.83 15.24 63.66 34.53 77.35 26.24 77.35 26.24"/><polygon points="13.7 33.95 13.7 64.82 43.6 82.95 43.6 48.9 13.7 30.77 13.7 33.95 13.7 33.95"/><path d="M58.06,54.21l-6.75,3.86v-6.75l6.75-3.86v6.75h0ZM47.46,48.9v34.04l29.9-18.13V30.77l-29.9,18.13h0Z"/>',
    flota: '<path d="M28.75,58.93c0,3.09-2.5,5.59-5.59,5.59s-5.59-2.5-5.59-5.59,2.5-5.59,5.59-5.59,5.59,2.5,5.59,5.59h0Z"/><path d="M75.08,58.93c0,3.09-2.5,5.59-5.59,5.59s-5.59-2.5-5.59-5.59,2.5-5.59,5.59-5.59,5.59,2.5,5.59,5.59h0Z"/><polygon points="10.38 25.38 55.11 25.38 55.11 44.55 10.38 44.55 10.38 25.38 10.38 25.38"/><path d="M61.5,33.37h4.79c1.44,0,2.72.96,3.04,2.32l1.6,5.51c0,.08.08.08.08.16h-9.5v-7.99h0ZM66.29,30.17h-7.99v28.76h3.19c0-4.39,3.59-7.99,7.99-7.99s7.99,3.59,7.99,7.99c1.76,0,3.19-1.44,3.19-3.2v-7.99c0-1.04-.48-1.92-1.28-2.56l-4.23-3.2c-.56-.4-.96-1.04-1.12-1.68l-1.6-5.51c-.8-2.72-3.35-4.63-6.15-4.63h0Z"/><path d="M55.11,58.93h-23.96c0-4.39-3.59-7.99-7.99-7.99s-7.99,3.59-7.99,7.99h-4.79v-11.18h44.73v11.18h0Z"/>',
    delivery: '<path d="M32.55,55.66c1.92,2.13,1.35,5.77-1.27,8.14-2.62,2.36-6.3,2.55-8.22.42-1.92-2.13-1.35-5.77,1.27-8.14,2.62-2.36,6.3-2.55,8.22-.42h0Z"/><path d="M73.3,55.66c1.92,2.13,1.35,5.77-1.27,8.14-2.62,2.36-6.3,2.55-8.22.42-1.92-2.13-1.35-5.77,1.27-8.14s6.3-2.55,8.22-.42h0Z"/><polygon points="22.66 25.38 21.46 31.14 12.3 31.14 11.79 33.61 20.95 33.61 20.26 36.9 13.95 36.9 13.43 39.37 19.75 39.37 19.06 42.66 9.01 42.66 8.5 45.13 18.55 45.13 25.47 45.13 56.83 45.13 60.94 25.38 22.66 25.38 22.66 25.38 22.66 25.38"/><path d="M81.7,45.79l-3.68-3.29c-.49-.44-.78-1.07-.79-1.73l-.46-5.68c-.21-2.77-2.57-4.87-5.34-4.77h-8.23l-2.4,11.52-1.03,4.94-2.74,13.17h3.29c.94-4.53,5.42-8.23,9.94-8.23s7.45,3.7,6.51,8.23c1.91-.08,3.54-1.43,3.98-3.29l1.71-8.23c.24-.95-.06-1.96-.77-2.63h0ZM64.09,41.84l1.71-8.23h4.94c1.36-.09,2.54.94,2.63,2.3,0,.03,0,.06,0,.09l.46,5.68c-.02.08.07.08.05.16h-9.8Z"/><path d="M15.46,59.94h4.11c.94-4.53,5.42-8.23,9.94-8.23s7.46,3.7,6.51,8.23h17.71l2.4-11.52H17.86l-2.4,11.52h0Z"/>',
    calidad: '<path d="M45.53,24.89c-11.08,0-20.06,8.98-20.06,20.06s8.98,20.06,20.06,20.06,20.06-8.98,20.06-20.06c-.01-11.07-8.99-20.05-20.06-20.06h0ZM42.68,53.11l-8.74-8.74,2.97-2.97,5.77,5.77,11.82-11.82,2.97,2.97-14.79,14.79h0Z"/><path d="M75.28,46.05c-.52-.64-.52-1.56,0-2.21l2.15-2.63c.61-.75.5-1.84-.25-2.45-.05-.04-.1-.08-.16-.12l-2.86-1.84c-.7-.45-.98-1.33-.68-2.1l1.23-3.17c.35-.9-.1-1.91-.99-2.26-.06-.02-.12-.04-.19-.06l-3.29-.87c-.8-.21-1.34-.96-1.3-1.78l.19-3.39c.05-.96-.68-1.79-1.64-1.84-.07,0-.13,0-.2,0l-3.39.19c-.83.05-1.57-.5-1.78-1.3l-.87-3.29c-.25-.93-1.2-1.49-2.13-1.24-.06.02-.13.04-.19.06l-3.17,1.23c-.77.3-1.65.01-2.1-.68l-1.84-2.86c-.52-.81-1.6-1.04-2.41-.52-.06.04-.11.07-.16.12l-2.63,2.15c-.64.52-1.56.52-2.21,0l-2.63-2.15c-.75-.61-1.84-.5-2.45.25-.04.05-.08.1-.12.16l-1.84,2.86c-.45.7-1.33.98-2.1.68l-3.17-1.23c-.9-.35-1.91.1-2.26.99-.02.06-.04.12-.06.19l-.87,3.29c-.21.8-.96,1.34-1.78,1.3l-3.39-.19c-.96-.05-1.79.68-1.84,1.64,0,.07,0,.13,0,.2l.19,3.39c.05.83-.5,1.57-1.3,1.78l-3.29.87c-.93.25-1.49,1.2-1.24,2.13.02.06.04.13.06.19l1.23,3.17c.3.77.01,1.65-.68,2.1l-2.86,1.84c-.81.52-1.04,1.6-.52,2.41.04.06.07.11.12.16l2.15,2.63c.52.64.52,1.56,0,2.21l-2.15,2.63c-.61.75-.5,1.85.25,2.45.05.04.1.08.16.12l2.86,1.84c.7.45.98,1.33.68,2.1l-1.23,3.17c-.35.9.1,1.91.99,2.26.06.02.12.04.19.06l3.29.87c.8.21,1.34.96,1.3,1.78l-.19,3.39c-.05.96.68,1.79,1.64,1.84.07,0,.13,0,.2,0l3.39-.19c.83-.05,1.57.5,1.78,1.3l.87,3.29c.25.93,1.2,1.49,2.13,1.24.06-.02.13-.04.19-.06l3.17-1.23c.77-.3,1.65-.01,2.1.68l1.84,2.86c.52.81,1.6,1.04,2.41.52.06-.04.11-.07.16-.12l2.63-2.15c.64-.52,1.56-.52,2.21,0l2.63,2.15c.75.61,1.84.5,2.45-.25.04-.05.08-.1.12-.16l1.84-2.86c.45-.7,1.33-.98,2.1-.68l3.17,1.23c.9.35,1.91-.1,2.26-.99.02-.06.04-.12.06-.19l.87-3.29c.21-.8.96-1.34,1.78-1.3l3.39.19c.96.05,1.79-.68,1.84-1.64,0-.07,0-.13,0-.2l-.19-3.39c-.05-.83.5-1.57,1.3-1.78l3.29-.87c.93-.25,1.49-1.2,1.24-2.13-.02-.06-.04-.13-.06-.19l-1.23-3.17c-.3-.77-.01-1.65.68-2.1l2.86-1.84c.81-.52,1.04-1.6.52-2.41-.04-.06-.07-.11-.12-.16l-2.15-2.63ZM45.53,67.62c-12.52,0-22.67-10.15-22.67-22.68s10.15-22.68,22.67-22.68,22.67,10.15,22.67,22.68c-.01,12.52-10.16,22.66-22.67,22.68h0Z"/>',
    gente: '<path d="M31.79,29.2c0,4.55-3.69,8.24-8.24,8.24s-8.24-3.69-8.24-8.24,3.69-8.24,8.24-8.24,8.24,3.69,8.24,8.24h0Z"/><path d="M75.75,29.2c0,4.55-3.69,8.24-8.24,8.24s-8.24-3.69-8.24-8.24,3.69-8.24,8.24-8.24,8.24,3.69,8.24,8.24h0Z"/><path d="M62.01,68.94v-8.24c0-1.28-.55-2.56-1.65-3.3-2.2-1.83-5.13-3.11-8.06-3.85-2.01-.55-4.4-1.1-6.78-1.1-2.2,0-4.58.37-6.78,1.1-2.93.73-5.68,2.2-8.06,3.85-1.1.92-1.65,2.01-1.65,3.3v8.24h32.97Z"/><path d="M53.77,42.02c0,4.55-3.69,8.24-8.24,8.24s-8.24-3.69-8.24-8.24,3.69-8.24,8.24-8.24,8.24,3.69,8.24,8.24h0Z"/><path d="M82.34,44.58c-2.2-1.83-5.13-3.11-8.06-3.85-2.01-.55-4.4-1.1-6.78-1.1-2.2,0-4.58.37-6.78,1.1-1.1.37-2.2.73-3.3,1.28v.18c0,3.11-1.28,6.04-3.3,8.06,3.48,1.1,6.23,2.56,8.43,4.21.55.55,1.1.92,1.47,1.65h19.96v-8.24c0-1.28-.55-2.56-1.65-3.3h0Z"/><path d="M28.49,54.47h0c2.56-1.83,5.49-3.3,8.43-4.21-2.01-2.2-3.3-4.95-3.3-8.06v-.37c-1.1-.37-2.2-.92-3.3-1.1-2.01-.55-4.4-1.1-6.78-1.1-2.2,0-4.58.37-6.78,1.1-2.93.92-5.68,2.2-8.06,3.85-1.1.73-1.65,2.01-1.65,3.3v8.24h19.78c.55-.73.92-1.1,1.65-1.65h0Z"/>',
    hys: '<path d="M31.07,48.44c-3.42,1.15-6.62,2.86-9.48,5.07-1.94,1.52-3.09,3.83-3.13,6.29v14.59l.74.49c1.73,1.15,4.71,2.05,8.39,2.72v-5.34h15.78v6.68c.63,0,1.26.01,1.89.01.48,0,.95,0,1.43-.01v-6.69h15.78v5.4c3.83-.68,6.85-1.62,8.47-2.83l.66-.5v-14.57c-.04-2.44-1.18-4.73-3.1-6.23-2.85-2.2-6.06-3.92-9.47-5.07l-5.18-2.08c-.31-.13-.52-.43-.52-.77v-2.03c3.15-2.52,4.98-6.33,4.98-10.36v-5.81h.83c.92,0,1.66-.74,1.66-1.66s-.74-1.66-1.66-1.66h-.83c-.29-4.59-2.93-8.7-6.97-10.87l-1.33,5.26c-.09.38-.44.64-.83.63h-.2c-.45-.09-.74-.53-.64-.98,0,0,0,0,0,0,0-.02,0-.03.01-.05l1.58-6.22c-.28-1.1-1.27-1.88-2.4-1.88h-4.98c-1.14,0-2.13.78-2.41,1.88l1.58,6.22c.12.44-.14.9-.58,1.02h-.05s-.2.01-.2.01c-.39.01-.74-.25-.83-.63l-1.29-5.26c-4.05,2.17-6.69,6.28-6.97,10.87h-.87c-.92,0-1.66.74-1.66,1.66s.74,1.66,1.66,1.66h.83v5.81c0,4.03,1.83,7.83,4.98,10.35v2.04c0,.34-.2.64-.51.77l-5.15,2.06ZM35.07,33.22v-5.81h19.93v5.81c0,5.5-4.46,9.96-9.96,9.96s-9.96-4.46-9.96-9.96h0ZM43.37,68.93h-15.51l2.61-16.63,7.01-2.85s.09-.05.14-.07l5.76,13.73v5.81h0ZM45.03,49.83c-2.23.02-4.45-.3-6.59-.95,1.01-.78,1.61-1.99,1.61-3.27v-.08c3.19,1.31,6.77,1.31,9.97,0v.08c0,1.29.6,2.5,1.62,3.28-2.14.65-4.37.96-6.61.94h0ZM46.69,68.93v-5.81l5.76-13.73s.09.05.14.07l7.06,2.82,2.56,16.65h-15.53Z"/>',
    costos: '<path d="M71.65,62.25c0,.94-1.09,1.81-2.9,2.46v-2.61c1.01-.29,2.03-.72,2.9-1.16v1.3h0ZM65.86,57.48v-2.61c1.01-.29,2.03-.72,2.9-1.16v1.3c0,.94-1.09,1.81-2.9,2.46h0ZM65.86,65.58c-.87.22-1.88.36-2.9.51v-2.82c.94-.14,1.95-.29,2.9-.43v2.75h0ZM60.07,56.03c.94-.14,1.95-.29,2.9-.43v2.75c-.87.22-1.88.36-2.9.51v-2.82h0ZM60.07,66.45c-.94.07-1.88.14-2.9.14v-2.9c.87,0,1.88-.07,2.9-.14v2.9h0ZM54.28,59.36v-2.9c.87,0,1.88-.07,2.9-.14v2.9c-.94.07-1.88.07-2.9.14h0ZM54.28,66.6c-1.01,0-1.95-.07-2.9-.14v-2.75h2.9v2.9h0ZM48.49,56.32c.94.07,1.88.14,2.9.14v2.9c-1.01,0-1.95-.07-2.9-.14v-2.9h0ZM48.49,66.09c-1.01-.14-2.03-.29-2.9-.51v-2.32c.94.14,1.88.22,2.9.29v2.53h0ZM42.7,58.35v-2.82c.94.14,1.88.36,2.9.43v2.9c-1.01-.14-2.03-.29-2.9-.51h0ZM42.7,64.72c-1.81-.72-2.9-1.59-2.9-2.46v-.14h.07c.22.07.36.14.58.14.72.22,1.45.36,2.24.51v1.95h0ZM31.12,54.87c.51,0,.94.07,1.45.07v.07c0,1.01.22,2.03.72,2.82-.72,0-1.45-.07-2.17-.14v-2.82h0ZM28.23,46.18c.94.14,1.88.36,2.9.43v2.9c-1.01-.14-2.03-.29-2.9-.51v-2.82h0ZM28.23,57.4c-1.01-.14-2.03-.29-2.9-.51v-2.82c.94.14,1.88.36,2.9.43v2.9h0ZM22.44,45.61v-1.3c.87.43,1.81.8,2.9,1.09v2.68c-1.81-.65-2.9-1.52-2.9-2.46h0ZM22.44,56.03c-1.81-.72-2.9-1.59-2.9-2.46v-1.3c.87.43,1.81.8,2.9,1.09v2.68h0ZM19.54,33.45c.87.43,1.81.8,2.9,1.09v2.68c-1.81-.72-2.9-1.59-2.9-2.46v-1.3h0ZM28.23,35.76v2.9c-1.01-.14-2.03-.29-2.9-.51v-2.82c.94.14,1.88.29,2.9.43h0ZM35.46,23.17c8.83,0,15.92,1.95,15.92,4.34s-7.09,4.34-15.92,4.34-15.92-1.95-15.92-4.34,7.09-4.34,15.92-4.34h0ZM39.81,57.48c-1.81-.72-2.9-1.59-2.9-2.46v-1.3c.87.43,1.81.8,2.9,1.09v2.68h0ZM48.49,37.21v-2.61c1.01-.29,2.03-.72,2.9-1.16v1.3c0,.94-1.09,1.81-2.9,2.46h0ZM42.7,38.58v-2.82c.94-.14,1.95-.29,2.9-.43v2.75c-.87.22-1.88.36-2.9.51h0ZM36.91,39.09v-2.9c.87,0,1.88-.07,2.9-.14v2.9c-.94.07-1.88.07-2.9.14h0ZM31.12,38.95v-2.9c.94.07,1.88.14,2.9.14v2.9c-1.01-.07-1.95-.07-2.9-.14h0ZM68.76,47.78c0,2.39-7.09,4.34-15.92,4.34s-15.92-1.95-15.92-4.34,7.09-4.34,15.92-4.34,15.92,1.95,15.92,4.34h0ZM73.1,49.95v-2.17c0-3.4-2.68-5.86-7.89-7.24-1.95-.51-4.2-.94-6.73-1.16.07-.29.07-.65.07-1.01,0-2.03-.94-3.76-2.9-5.07v-5.79c0-3.4-2.68-5.86-7.89-7.24-3.4-.94-7.74-1.45-12.38-1.45-6.08,0-20.27.87-20.27,8.69v7.24c0,2.03.94,3.76,2.9,5.07v1.38c-1.74,1.23-2.9,2.9-2.9,5.14v7.24c0,3.4,2.68,5.86,7.89,7.24,3.4.94,7.74,1.45,12.38,1.45,0,3.4,2.68,5.86,7.89,7.24,3.4.94,7.74,1.45,12.38,1.45,6.08,0,20.27-.87,20.27-8.69v-7.24c.07-2.03-.87-3.76-2.82-5.07h0Z"/>'
  };
  // Ícono de Objetivos (Objetivo.svg de la persona): los anillos quietos y la flecha, que entra volando
  const ICONO_OBJETIVO = '<g class="ob-anillos"><path d="M78.7,180.16C35.3,180.16,0,144.86,0,101.47S35.3,22.79,78.7,22.79c20.95,0,40.65,8.14,55.5,22.92.78.71,1.27,1.73,1.27,2.87,0,2.14-1.72,3.88-3.86,3.88h-1.63l-1.14-1.14c-13.4-13.4-31.21-20.78-50.14-20.78C39.58,30.55,7.75,62.360,7.75,101.47s31.83,70.95,70.95,70.95,70.95-31.83,70.95-70.95c0-14-4.07-27.52-11.76-39.09-1.19-1.78-.7-4.19,1.08-5.37,1.78-1.19,4.18-.7,5.37,1.08,8.54,12.85,13.05,27.85,13.05,43.38,0,43.39-35.31,78.7-78.7,78.7Z"/><path d="M78.7,135.03c-18.51,0-33.56-15.06-33.56-33.56s15.06-33.56,33.56-33.56c8.93,0,17.36,3.48,23.73,9.8,1.52,1.51,1.53,3.96.03,5.48-1.51,1.52-3.96,1.53-5.48.03-4.92-4.87-11.41-7.56-18.28-7.56-14.23,0-25.81,11.58-25.81,25.81s11.58,25.81,25.81,25.81,25.81-11.58,25.81-25.81c0-3.04-.51-5.98-1.52-8.75-.73-2.01.3-4.24,2.31-4.97,2.01-.73,4.24.3,4.97,2.31,1.32,3.62,1.99,7.46,1.99,11.4,0,18.51-15.06,33.56-33.56,33.56Z"/><path d="M78.7,156.8c-30.5,0-55.31-24.82-55.31-55.33s24.81-55.31,55.31-55.31c14.79,0,28.68,5.76,39.11,16.21,1.51,1.52,1.51,3.97,0,5.48-1.52,1.51-3.97,1.51-5.48,0-8.96-8.98-20.9-13.93-33.62-13.93-26.22,0-47.56,21.33-47.56,47.56s21.33,47.58,47.56,47.58,47.56-21.34,47.56-47.58c0-7.66-1.78-14.99-5.3-21.76-.99-1.9-.25-4.24,1.65-5.23,1.9-.99,4.24-.24,5.23,1.65,4.04,7.78,6.17,16.54,6.17,25.33,0,30.51-24.81,55.33-55.31,55.33Z"/></g><g class="ob-flecha"><path d="M78.7,105.35c-.99,0-1.98-.38-2.74-1.14-1.51-1.51-1.51-3.97,0-5.48L157.39,17.3c1.51-1.510,3.97-1.51,5.48,0,1.51,1.51,1.51,3.97,0,5.48l-81.44,81.43c-.76.76-1.75,1.14-2.74,1.14Z"/><path d="M176.29,24.96h-21.08V3.88c0-2.14,1.74-3.88,3.88-3.88s3.88,1.74,3.88,3.88v13.33h13.32c2.14,0,3.88,1.74,3.88,3.88s-1.74,3.88-3.88,3.88Z"/><path d="M164.91,36.35h-21.080V15.27c0-2.14,1.74-3.88,3.88-3.88s3.88,1.74,3.88,3.88v13.33h13.32c2.14,0,3.88,1.74,3.88,3.88s-1.74,3.88-3.88,3.88Z"/></g>';
  const icono = (n, clase) => ICONOS_SCOPE[n]
    ? `<svg class="${clase || ''}" viewBox="0 0 91.05 91.05" aria-hidden="true">${ICONOS_SCOPE[n]}</svg>`
    : `<svg class="${clase || ''}" viewBox="0 0 24 24" aria-hidden="true">${ICONOS[n] || ICONOS.sello}</svg>`;
  const franjitas = '<i class="mc-franjitas" aria-hidden="true"><b></b><b></b><b></b></i>';

  const tramo = $('.mc-tramo'), elegir = $('.mc-elegir');
  const capitulo = $('.capitulo');

  // =========================================================
  // 1. PANTALLA PARTIDA
  // Geometría medida de la referencia de la persona (1921 px = 1600, ×0,8329):
  // la banda va arriba a la izquierda en y 35–125, dobla con una curva, baja en
  // diagonal (pendiente 0,4133, la misma de "¿Quiénes somos?") y vuelve a doblar
  // abajo a la derecha en y 810–900. "d" es la x de la diagonal en la mitad de la
  // altura (y 450). Todo se calcula en px del escenario.
  // =========================================================
  const OP = M.opciones || [];
  const G = {
    arriba: 80.2,        // eje de la banda en el tramo de arriba
    abajo: 854.8,        // eje de la banda en el tramo de abajo
    pend: 0.4133,        // corrimiento horizontal de la diagonal por cada px que baja
    r1: 98.1,            // radio (eje) de la curva de arriba a la derecha
    r2: 130.7,           // radio (eje) de la curva de abajo a la izquierda
    reposo: 781.6,       // x de la diagonal en y 450, sin cursor
    // capas, de afuera hacia adentro: [corrimiento hacia el lado gris, grosor, clase]
    capas: [[0, 90.4, 'mc-plata'], [17.5, 34.6, 'mc-rojo'], [-27.9, 34.6, 'mc-rojo']]
  };
  const L = -1200, R = 2800;                         // la banda llega a los bordes de cualquier ventana
  const NORMA = Math.hypot(1, G.pend);
  const NX = 1 / NORMA, NY = G.pend / NORMA;         // normal de la diagonal, hacia el lado gris
  const VX = -G.pend / NORMA, VY = 1 / NORMA;        // dirección de la diagonal, hacia abajo
  const TAN = Math.tan(Math.acos(VX) / 2);           // para el largo de las curvas (giro de 112°)
  const diagX = (d, y) => d - G.pend * (y - 450);
  // Camino de la banda corrido "o" px hacia el lado gris (mismos centros, otros radios)
  function camino(d, o) {
    const c1x = diagX(d, G.arriba) - G.r1 * TAN, c1y = G.arriba + G.r1;
    const c2x = diagX(d, G.abajo) + G.r2 * TAN, c2y = G.abajo - G.r2;
    const ra = G.r1 + o, rb = G.r2 - o, n = (v) => v.toFixed(1);
    return `M${L},${n(G.arriba - o)}H${n(c1x)}` +
      `A${n(ra)},${n(ra)} 0 0 1 ${n(c1x + ra * NX)},${n(c1y + ra * NY)}` +
      `L${n(c2x - rb * NX)},${n(c2y - rb * NY)}` +
      `A${n(rb)},${n(rb)} 0 0 0 ${n(c2x)},${n(G.abajo - o)}H${R}`;
  }
  // la zona gris sube 6 px por encima de la sección y se pisa con el gris de "¿Por qué elegirnos?":
  // así no queda una rendija de 1 px entre los dos grises
  const SOLAPE = 6;
  const zonaGris = (d) => camino(d, 0) + `V${-SOLAPE}H${L}Z`;

  elegir.innerHTML =
    `<svg class="mc-svg" viewBox="${L} ${-SOLAPE} ${R - L} ${1500 + SOLAPE}" preserveAspectRatio="none" aria-hidden="true">` +
      '<defs>' +
        '<clipPath id="mc-recorte-gris"><path/></clipPath>' +
        // líneas claras con brillo metálico (entre las rojas y del lado gris)
        '<linearGradient id="mc-brillo" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1600" y2="900">' +
          '<stop offset="0" stop-color="#B9B8B2"/><stop offset=".3" stop-color="#F3EEE4"/><stop offset=".5" stop-color="#C6C4BD"/>' +
          '<stop offset=".72" stop-color="#F6F1E7"/><stop offset="1" stop-color="#C2C0B9"/></linearGradient>' +
      '</defs>' +
      `<rect x="${L}" y="0" width="${R - L}" height="1500" fill="#FFFBF3"/>` +
      // fondos ya preparados (foto difuminada y mezclada como en la referencia): cubren x -200..1800
      `<image class="mc-foto-calidad" href="${ruta('img/slides/nuestra-estructura/fondo-calidad.jpg')}" x="-200" y="0" width="2000" height="1000" preserveAspectRatio="none"/>` +
      '<path class="mc-gris"/>' +
      `<image class="mc-foto-capacitaciones" href="${ruta('img/slides/nuestra-estructura/fondo-capacitaciones.jpg')}" x="-200" y="0" width="2000" height="1000" preserveAspectRatio="none" clip-path="url(#mc-recorte-gris)"/>` +
      G.capas.map(([o, g, c]) => `<path class="mc-banda ${c}" data-o="${o}" stroke-width="${g}"/>`).join('') +
    '</svg>' +
    OP.slice(0, 2).map((o, k) =>
      `<div class="mc-bloque mc-bloque-${k}">` +
        `<span class="mc-m-icono">${icono(o.icono)}</span>` +
        `<p class="mc-m-num">${franjitas}<span>${esc(o.numero)}</span></p>` +
        `<h3 class="mc-m-titulo">${esc(o.titulo)}</h3>` +
        `<p class="mc-m-bajada">${esc(o.bajada)}</p>` +
        `<span class="mc-m-boton">${esc(o.boton || 'Explorar')} <b>→</b></span>` +
      `</div>`).join('');
  const bloques = [...elegir.querySelectorAll('.mc-bloque')];
  const gris = $('.mc-gris', elegir), recorte = $('#mc-recorte-gris path', elegir);
  const bandas = [...elegir.querySelectorAll('.mc-banda')];
  // si un título no entra en su lado se achican los dos por igual (así quedan parejos)
  function ajustarTitulos() {
    const titulos = bloques.map((b) => $('.mc-m-titulo', b));
    titulos.forEach((t) => { t.style.fontSize = ''; });
    const max = 520, ancho = Math.max(...titulos.map((t) => t.scrollWidth));
    if (ancho > max) {
      const tam = (parseFloat(getComputedStyle(titulos[0]).fontSize) * max / ancho).toFixed(1) + 'px';
      titulos.forEach((t) => { t.style.fontSize = tam; });
    }
  }
  if (document.fonts) document.fonts.ready.then(ajustarTitulos); else ajustarTitulos();

  let d = G.reposo, dObjetivo = G.reposo, hover = -1, eligiendo = -1, bucle = null, ultimo = 0;
  function dibujarDivision() {
    const z = zonaGris(d);
    gris.setAttribute('d', z);
    recorte.setAttribute('d', z);
    bandas.forEach((b) => b.setAttribute('d', camino(d, +b.dataset.o)));
    // cada bloque queda centrado en su lado, a la altura del texto (sin contar la banda)
    bloques[0].style.transform = `translateX(${((diagX(d, 450) - 60) / 2 - 400).toFixed(1)}px)`;
    bloques[1].style.transform = `translateX(${((diagX(d, 450) + 60 + 1600) / 2 - 1200).toFixed(1)}px)`;
  }
  function animarDivision(t) {
    const dt = Math.min(.05, (t - ultimo) / 1000);
    ultimo = t;
    const rapidez = eligiendo >= 0 ? 5.5 : 8;
    d += (dObjetivo - d) * (1 - Math.exp(-dt * rapidez));
    if (Math.abs(dObjetivo - d) < .3) d = dObjetivo;
    dibujarDivision();
    bucle = d === dObjetivo ? null : requestAnimationFrame(animarDivision);
  }
  function moverDivision(nuevo) {
    dObjetivo = nuevo;
    if (!bucle) { ultimo = performance.now(); bucle = requestAnimationFrame(animarDivision); }
  }
  function resaltar(k) {
    if (eligiendo >= 0 || k === hover) return;
    hover = k;
    elegir.classList.toggle('con-foco', k >= 0);
    bloques.forEach((b, i) => b.classList.toggle('foco', i === k));
    moverDivision(k === 0 ? G.reposo + 220 : k === 1 ? G.reposo - 220 : G.reposo);
  }
  // de qué lado está el cursor: gris arriba de la banda y a la derecha de la diagonal
  function ladoEn(e) {
    const r = elegir.getBoundingClientRect(), k = r.width / 1600;
    const x = (e.clientX - r.left) / k, y = (e.clientY - r.top) / k;
    return (y < G.arriba || (y < G.abajo && x > diagX(d, y))) ? 1 : 0;
  }
  elegir.addEventListener('pointermove', (e) => resaltar(ladoEn(e)));
  elegir.addEventListener('pointerleave', () => resaltar(-1));
  elegir.addEventListener('click', (e) => elegirTema(ladoEn(e)));
  dibujarDivision();

  function elegirTema(k) {
    if (eligiendo >= 0 || !OP[k]) return;
    resaltar(k);
    eligiendo = k;
    elegir.classList.add('eligiendo');
    moverDivision(k === 0 ? 3200 : -1800);           // el lado elegido barre la pantalla
    setTimeout(() => abrirCapitulo(k), 420);
  }

  // =========================================================
  // Visibilidad con el scroll (la pantalla partida sube detrás de "¿Por qué elegirnos?")
  // =========================================================
  let bajada = 0;
  document.addEventListener('desplazamiento', (e) => {
    bajada = Math.max(0, e.detail.y);   // la pantalla partida empieza en y 900 de la diapositiva (debajo de "¿Por qué elegirnos?")
    elegir.classList.toggle('visible', bajada > 450);
    tramo.setAttribute('aria-hidden', bajada > 300 ? 'false' : 'true');
    if ((bajada < 600 || bajada > 1300) && hover >= 0 && eligiendo < 0) resaltar(-1);
  });
  // en la pantalla partida: ← → eligen un lado y Enter lo abre
  addEventListener('keydown', (e) => {
    if (capitulo.classList.contains('abierto') || bajada < 800 || bajada > 1100) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); resaltar(0); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); resaltar(1); }
    else if (e.key === 'Enter' && hover >= 0) { e.preventDefault(); elegirTema(hover); }
  });

  // =========================================================
  // 2. CAPÍTULOS (temas): secciones que se recorren
  // =========================================================
  const C = M.calidad || {}, K = M.capacitaciones || {};

  // ----- Secciones de cada tema (Calidad va en claro, como su lado crema; Capacitaciones en oscuro) -----
  const S = C.scope || {};
  const TEMAS = [
    {
      clase: 'tema-claro', numero: (OP[0] || {}).numero || '01', titulo: C.titulo || 'CALIDAD',
      secciones: [
        {
          pestana: 'S.C.O.P.E.',
          html: () => `<div class="s-scope">
            <div class="sc-izq">
              <p class="sc-ante ent">${esc(S.antetitulo)}</p>
              <h3 class="sc-titulo ent">${esc(S.titulo)}</h3>
              <p class="sc-texto ent">${formato(S.texto)}</p>
              <div class="sc-version ent"><b>“${esc(S.version)}”</b><p>${formato(S.versionTexto)}</p></div>
            </div>
            <div class="sc-der ent">
              <div class="sc-trama" aria-hidden="true"><img src="${ruta('img/scope/isologo-scope.svg')}" alt="" draggable="false"></div>
              <p class="sc-etq">¿Qué significa?</p>
              <ul class="sc-letras">${(S.significado || []).map((l, i) => `<li style="--i:${i}"><b>${esc(l.letra)}</b><span>${esc(l.resto)}</span></li>`).join('')}</ul>
              <p class="sc-sig">${formato(S.significadoTexto)}</p>
            </div>
          </div>`
        },
        {
          pestana: 'Objetivos',
          html: () => `<div class="s-obj">
            <h3 class="cap-h ent">${esc(C.objetivosTitulo)}</h3>
            <svg class="ob-diana ent" viewBox="0 0 180.17 180.16" aria-hidden="true">${ICONO_OBJETIVO}</svg>
            <ol class="ob-lista">${(C.objetivos || []).map((o, i) => `<li class="ent" style="--i:${i}"><b>${String(i + 1).padStart(2, '0')}</b><p>${formato(o)}</p></li>`).join('')}</ol>
          </div>`
        },
        {
          pestana: 'Pilares',
          html: () => {
            // Templo: frontón con el logo de S.C.O.P.E., una columna por pilar (entre x 100 y 900) y la base con los nombres
            const P = C.pilares || [], paso = 800 / Math.max(P.length, 1);
            return `<div class="s-pil">
            <h3 class="cap-h ent">${esc(C.pilaresTitulo)}</h3>
            <p class="pi-nota ent">${formato(C.pilaresNota)}</p>
            <div class="templo ent">
              <svg class="tp-cuerpo" viewBox="0 0 1000 560" aria-hidden="true">
                <ellipse class="tp-piso" cx="500" cy="548" rx="500" ry="16"/>
                <!-- frontón gris con las franjas de la marca debajo (gris, rojo, rojo) -->
                <path class="tp-gris" d="M270 92V70Q270 0 340 0H660Q730 0 730 70V92Z"/>
                <path class="tp-gris" d="M30 70H970V150H30Z"/>
                <path class="tp-rojo" d="M30 156H970V166H30Z"/>
                <path class="tp-rojo" d="M30 172H970V182H30Z"/>
                <path class="tp-blanco" d="M60 188H940V210H60Z"/>
                <!-- base: escalón rojo y zócalo gris con los nombres -->
                <path class="tp-blanco" d="M70 440H930V456H70Z"/>
                <path class="tp-rojo" d="M50 462H950V472H50Z"/>
                <path class="tp-gris" d="M30 492Q30 478 44 478H956Q970 478 970 492V540H30Z"/>
              </svg>
              <img class="tp-logo" src="${ruta('img/scope/logo-scope-crema.svg')}" alt="CARGO S.C.O.P.E." draggable="false">
              <ul class="tp-columnas">${P.map((p, i) => `<li class="ent" style="--i:${i + 2}; left:${(100 + paso * (i + .5)).toFixed(1)}px">
                <i class="tp-capitel"></i><span class="tp-fuste">${icono(p.icono)}</span><i class="tp-capitel"></i>
                <span class="tp-nombre">${esc(p.nombre)}</span>
              </li>`).join('')}</ul>
            </div>
          </div>`;
          }
        },
      ]
    },
    {
      clase: 'tema-oscuro', numero: (OP[1] || {}).numero || '02', titulo: K.titulo || 'CAPACITACIONES',
      secciones: [
        {
          pestana: (K.aprende || {}).pestana || '#Exp Aprende',
          html: () => {
            const A = K.aprende || {};
            return `<div class="s-apr">
              <div class="ap-izq">
                <h3 class="ap-titulo ent">${esc(A.titulo)}</h3>
                <p class="ap-texto ent">${formato(A.texto)}</p>
                <p class="ap-plat ent">${formato(A.plataforma)}</p>
              </div>
              <figure class="ap-nav ent">
                <div class="ap-vidrio">
                  <div class="ap-barra"><i></i><i></i><i></i><span>${esc(A.titulo)}</span></div>
                  ${A.imagen ? `<img src="${ruta(A.imagen)}" alt="Plataforma ${esc(A.titulo)}" draggable="false">` : ''}
                </div>
                <span class="ap-insignia">${icono('birrete')}</span>
              </figure>
            </div>`;
          },
          alMostrar: (el) => {
            // la ventana de la plataforma se inclina con el mouse
            const fig = $('.ap-nav', el), v = $('.ap-vidrio', el);
            fig.addEventListener('pointermove', (e) => {
              const r = fig.getBoundingClientRect();
              const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
              v.style.transform = `perspective(1400px) rotateY(${(x * 8).toFixed(2)}deg) rotateX(${(-y * 6).toFixed(2)}deg)`;
            });
            fig.addEventListener('pointerleave', () => { v.style.transform = ''; });
          }
        },
        {
          pestana: (K.equipo || {}).pestana || 'Trabajo en equipo',
          html: () => {
            const Q = K.equipo || {};
            return `<div class="s-eq">
              <h3 class="cap-h ent">${esc(Q.titulo)}</h3>
              <p class="eq-texto ent">${formato(Q.texto)}</p>
              <div class="eq-cols">
                <div class="eq-col ent" style="--i:0">
                  <h4>${icono('personas')}${esc(Q.induccionTitulo)}</h4>
                  ${(Q.induccion || []).map((it) => `<div class="eq-item"><b>${esc(it.titulo)}</b><p>${formato(it.texto)}</p></div>`).join('')}
                </div>
                <i class="eq-franjas" aria-hidden="true"><b></b><b></b><b></b></i>
                <div class="eq-col ent" style="--i:1">
                  <h4>${icono('puzzle')}${esc(Q.liderazgoTitulo)}</h4>
                  <p class="eq-lid">${formato(Q.liderazgo)}</p>
                  <span class="eq-puzzle" aria-hidden="true">${icono('puzzle')}${icono('puzzle')}${icono('puzzle')}</span>
                </div>
              </div>
            </div>`;
          }
        }
      ]
    }
  ];

  // ----- Estructura del capítulo -----
  capitulo.innerHTML =
    '<div class="cap-fondo"></div>' +
    '<button type="button" class="cap-cerrar">← Mejora continua <span>Esc</span></button>' +
    '<div class="cap-cabeza">' + franjitas + '<p class="cap-num"></p><h2 class="cap-titulo"></h2></div>' +
    '<nav class="cap-tabs" aria-label="Secciones"></nav>' +
    '<i class="cap-regla"></i>' +
    '<div class="cap-paginas"></div>' +
    '<div class="cap-pie"><p class="cap-ayuda">Rueda o ← → para recorrer · Esc para volver</p>' +
    '<p class="cap-cuenta"></p><button type="button" class="cap-flecha" data-dir="-1" aria-label="Anterior">‹</button><button type="button" class="cap-flecha" data-dir="1" aria-label="Siguiente">›</button></div>';
  const tabs = $('.cap-tabs', capitulo), paginas = $('.cap-paginas', capitulo), cuenta = $('.cap-cuenta', capitulo);
  let tema = null, actual = 0, secs = [];

  function abrirCapitulo(k) {
    tema = TEMAS[k];
    if (!tema) return;
    capitulo.className = 'capitulo ' + tema.clase;
    $('.cap-num', capitulo).textContent = tema.numero;
    $('.cap-titulo', capitulo).textContent = tema.titulo;
    tabs.innerHTML = tema.secciones.map((s, i) => `<button type="button" data-i="${i}"><span>${String(i + 1).padStart(2, '0')}</span>${esc(s.pestana)}</button>`).join('') + '<i class="cap-marca"></i>';
    tabs.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => irSeccion(+b.dataset.i)));
    paginas.innerHTML = '';
    secs = tema.secciones.map((s) => {
      const el = crear('section', 'cap-sec', paginas, s.html());
      if (s.alMostrar) s.alMostrar(el);
      return el;
    });
    actual = -1;
    document.body.classList.add('capitulo-abierto');
    capitulo.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      capitulo.classList.add('abierto');
      irSeccion(0);
    });
  }
  function cerrarCapitulo() {
    if (!tema) return;
    capitulo.classList.remove('abierto');
    capitulo.classList.add('cerrando');
    setTimeout(() => {
      capitulo.classList.remove('cerrando');
      capitulo.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('capitulo-abierto');
      tema = null;
      // las franjas vuelven a su lugar
      elegir.classList.remove('eligiendo');
      eligiendo = -1;
      resaltar(-1);
    }, 380);
  }
  function irSeccion(i) {
    if (!tema) return;
    i = Math.max(0, Math.min(secs.length - 1, i));
    if (i === actual) return;
    const desde = actual;
    actual = i;
    secs.forEach((s, j) => {
      s.classList.toggle('actual', j === i);
      s.classList.toggle('antes', j < i);
      s.classList.toggle('despues', j > i);
      s.setAttribute('aria-hidden', j === i ? 'false' : 'true');
    });
    // las entradas escalonadas se vuelven a ver cada vez que se entra
    const s = secs[i];
    s.classList.remove('visible');
    requestAnimationFrame(() => requestAnimationFrame(() => s.classList.add('visible')));
    if (desde >= 0) setTimeout(() => { if (actual !== desde) secs[desde].classList.remove('visible'); }, 500);
    const botones = [...tabs.querySelectorAll('button')];
    botones.forEach((b, j) => b.classList.toggle('activo', j === i));
    const b = botones[i], marca = $('.cap-marca', tabs);
    if (b && marca) {
      marca.style.width = b.offsetWidth + 'px';
      marca.style.transform = `translateX(${b.offsetLeft}px)`;
    }
    cuenta.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b> / ${String(secs.length).padStart(2, '0')}`;
    capitulo.querySelectorAll('.cap-flecha').forEach((f) => { f.disabled = (f.dataset.dir === '-1' ? i === 0 : i === secs.length - 1); });
  }
  capitulo.querySelectorAll('.cap-flecha').forEach((f) => f.addEventListener('click', () => irSeccion(actual + +f.dataset.dir)));
  $('.cap-cerrar', capitulo).addEventListener('click', cerrarCapitulo);
  // rueda, ↑ ↓, Av Pág… (las manda diapositiva.js)
  document.addEventListener('capitulo-paso', (e) => irSeccion(actual + e.detail));
  // Esc cierra el tema antes de volver a la portada; ← → recorren
  addEventListener('keydown', (e) => {
    if (!tema) return;
    if (e.key === 'Escape') { e.stopImmediatePropagation(); e.preventDefault(); cerrarCapitulo(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); irSeccion(actual + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); irSeccion(actual - 1); }
  }, true);
  addEventListener('resize', () => { ajustarTitulos(); if (tema && actual >= 0) { const a = actual; actual = -1; irSeccion(a); } });
})();
