/* =========================================================
   EXPERIENCIA DE USUARIO — quinta pestaña de ¿Cómo lo hacemos? (tms.js): dos
   tarjetas (fotos de la diapositiva de la persona):
   - Aplicativo NO CALIDAD: se elige la instancia del proceso y el tipo de
     evento, se registra y aparece en el "Sistema de siniestros" (Abierto →
     En análisis).
   - Customer service ARTIFICIAL: chat con TICO; se toca una pregunta y
     responde (escribe de a poco).
   Si nadie toca nada, las dos se usan solas. Textos de ejemplo en
   datos/servicio.js → experiencia.
   ========================================================= */
(function () {
  const SV = window.SV;
  // va en la quinta pestaña del ecosistema (tms.js deja la vista en SV.tms.vistas)
  const seccion = SV && SV.tms && SV.tms.vistas.experiencia;
  if (!seccion) return;
  const { S, txt, crear, esc } = SV;
  const E = S.experiencia || {};
  const C = E.calidad || {}, A = E.asistente || {};
  const ahora = () => performance.now();
  // solo se usa sola con la pestaña abierta y la sección en pantalla
  const enVista = () => SV.tms.enVista && SV.tms.pestana === 'experiencia';

  const ICO = {
    foto: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M8.5 3h7l1.6 2.5H22V21H2V5.5h4.9zM12 8.5a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4z"/></svg>',
    alerta: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2 1 21h22zm-1.3 7h2.6l-.4 6.2h-1.8zm1.3 7.6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/></svg>',
    enviar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 21 23 12 2 3v7l15 2-15 2z"/></svg>',
    // TICO: cabeza de robot con la franja de la marca
    bot: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 1.5h2V4h-2z"/><path fill-rule="evenodd" d="M5 5h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-4l-3 3-3-3H5a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3zm3.5 5.2a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2zm7 0a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z"/></svg>'
  };

  seccion.insertAdjacentHTML('beforeend',
    // ---- No calidad ----
    '<article class="ex-tarjeta ex-calidad">' +
    '<div class="ex-foto"><img src="../../img/ecosistema/no-calidad.webp" alt="" decoding="async"></div>' +
    `<div class="ex-txt"><p class="ex-t1">${C.titulo ? txt(C.titulo) + ' ' : ''}<b>${txt(C.tituloGrande)}</b></p><p class="ex-t2">${txt(C.texto)}</p></div>` +
    '<div class="nc-app">' +
    '<div class="nc-form">' +
    '<p class="nc-rot">Instancia</p><div class="nc-chips nc-inst">' + (C.instancias || []).map((t, i) => `<button type="button" data-i="${i}">${esc(t)}</button>`).join('') + '</div>' +
    '<p class="nc-rot">Tipo de evento</p><div class="nc-chips nc-tipo">' + (C.tipos || []).map((t, i) => `<button type="button" data-i="${i}">${esc(t)}</button>`).join('') + '</div>' +
    `<div class="nc-pie"><span class="nc-foto">${ICO.foto}<small>Foto</small></span><button type="button" class="nc-registrar">${ICO.alerta}${txt(C.boton)}</button></div>` +
    '</div>' +
    `<div class="nc-sistema"><p class="nc-rot">${txt(C.sistema)}</p><div class="nc-tabla"></div></div>` +
    '</div></article>' +
    // ---- Asistente ----
    '<article class="ex-tarjeta ex-asistente">' +
    '<div class="ex-foto"><img src="../../img/ecosistema/robot.webp" alt="" decoding="async">' +
    `<p class="ch-bot">${ICO.bot}<span><b>${txt(A.nombre)}</b><small><i></i>${txt(A.estado)}</small></span></p></div>` +
    `<div class="ex-txt"><p class="ex-t1">${A.titulo ? txt(A.titulo) + ' ' : ''}<b>${txt(A.tituloGrande)}</b></p><p class="ex-t2">${txt(A.texto)}</p></div>` +
    '<div class="ch-app"><div class="ch-mensajes"></div>' +
    '<div class="ch-preguntas">' + (A.preguntas || []).slice(0, 3).map((p, i) => `<button type="button" data-i="${i}">${txt(p.pregunta)}${ICO.enviar}</button>`).join('') + '</div>' +
    '</div></article>');

  // =========================================================
  // NO CALIDAD
  // =========================================================
  (function noCalidad() {
    const app = seccion.querySelector('.nc-app');
    const inst = [...app.querySelectorAll('.nc-inst button')];
    const tipos = [...app.querySelectorAll('.nc-tipo button')];
    const foto = app.querySelector('.nc-foto');
    const bReg = app.querySelector('.nc-registrar');
    const tabla = app.querySelector('.nc-tabla');
    let iSel = -1, tSel = -1, conFoto = false, numero = 1045, uso = -1e9, auto = false;
    const ESTADOS = ['Abierto', 'En análisis', 'Resuelto'];
    function fila(n, i, t, est, nueva) {
      const f = document.createElement('div');
      f.className = 'nc-fila' + (nueva ? ' nueva' : '');
      f.innerHTML = `<b>NC-${n}</b><span><b>${esc((C.tipos || [])[t] || '')}</b><small>${esc((C.instancias || [])[i] || '')}</small></span><em class="e${est}">${ESTADOS[est]}</em>`;
      tabla.prepend(f);
      while (tabla.children.length > 4) tabla.lastChild.remove();
      return f;
    }
    // dos registros de ejemplo
    fila(numero - 2, 2, 2, 2); fila(numero - 1, 1, 1, 1);
    function marcar() {
      inst.forEach((b, k) => b.classList.toggle('activo', k === iSel));
      tipos.forEach((b, k) => b.classList.toggle('activo', k === tSel));
      foto.classList.toggle('activo', conFoto);
      bReg.disabled = iSel < 0 || tSel < 0;
    }
    inst.forEach((b, k) => b.addEventListener('click', () => { if (!auto) uso = ahora(); iSel = k; marcar(); }));
    tipos.forEach((b, k) => b.addEventListener('click', () => { if (!auto) uso = ahora(); tSel = k; conFoto = true; marcar(); }));
    foto.addEventListener('click', () => { uso = ahora(); conFoto = !conFoto; marcar(); });
    function registrar() {
      if (iSel < 0 || tSel < 0) return;
      const f = fila(numero++, iSel, tSel, 0, true);
      bReg.classList.add('hecho');
      setTimeout(() => bReg.classList.remove('hecho'), 900);
      setTimeout(() => { const em = f.querySelector('em'); em.className = 'e1'; em.textContent = ESTADOS[1]; }, 1900);
      iSel = tSel = -1; conFoto = false;
      marcar();
    }
    bReg.addEventListener('click', () => { if (!auto) uso = ahora(); registrar(); });
    marcar();
    // solo, si nadie lo usa: elige instancia, tipo y registra
    const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
    setInterval(async () => {
      if (!enVista() || auto || ahora() - uso < 7000) return;
      auto = true;
      try {
        inst[Math.floor(Math.random() * inst.length)].click(); await esperar(700);
        tipos[Math.floor(Math.random() * tipos.length)].click(); await esperar(800);
        if (ahora() - uso > 7000) bReg.click();
      } finally { auto = false; uso = ahora() - 1500; }
    }, 1000);
  })();

  // =========================================================
  // ASISTENTE (TICO)
  // =========================================================
  (function asistente() {
    const lista = seccion.querySelector('.ch-mensajes');
    const botones = [...seccion.querySelectorAll('.ch-preguntas button')];
    const P = (A.preguntas || []).slice(0, 3);
    let ocupado = false, uso = -1e9, proxima = 0;
    function mensaje(clase, html) {
      const m = crear('div', 'ch-msj ' + clase, lista, html);
      while (lista.children.length > 4) lista.firstChild.remove();
      return m;
    }
    mensaje('tico', txt(A.saludo));
    const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
    async function preguntar(i, auto) {
      if (ocupado || !P[i]) return;
      ocupado = true;
      if (!auto) uso = ahora();
      botones.forEach((b, k) => b.classList.toggle('activo', k === i));
      mensaje('yo', txt(P[i].pregunta));
      await esperar(450);
      const escribiendo = mensaje('tico escribiendo', '<i></i><i></i><i></i>');
      await esperar(1100);
      escribiendo.classList.remove('escribiendo');
      escribiendo.innerHTML = '';
      const r = String(P[i].respuesta || '');
      for (let k = 1; k <= r.length; k += 2) { escribiendo.textContent = r.slice(0, k); await esperar(16); }
      escribiendo.innerHTML = txt(r);
      botones[i].classList.remove('activo');
      proxima = (i + 1) % P.length;
      ocupado = false;
    }
    botones.forEach((b, i) => b.addEventListener('click', () => preguntar(i)));
    setInterval(() => {
      if (!enVista() || ocupado || ahora() - uso < 6500) return;
      uso = ahora() - 1500;
      preguntar(proxima, true);
    }, 1000);
  })();

})();
