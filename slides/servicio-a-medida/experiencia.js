/* =========================================================
   EXPERIENCIA DE USUARIO — última parada del recorrido de ¿Cómo lo hacemos? (tms.js): dos
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
    `<p class="nc-rot" data-paso="0">${txt(C.pasoDonde || 'Instancia')}</p><div class="nc-chips nc-inst">` + (C.instancias || []).map((t, i) => `<button type="button" data-i="${i}">${esc(t)}</button>`).join('') + '</div>' +
    `<p class="nc-rot" data-paso="1">${txt(C.pasoQue || 'Tipo de evento')}</p><div class="nc-chips nc-tipo">` + (C.tipos || []).map((t, i) => `<button type="button" data-i="${i}">${esc(t)}</button>`).join('') + '</div>' +
    (C.pasoRegistro ? `<p class="nc-rot" data-paso="2">${txt(C.pasoRegistro)}</p>` : '') +
    `<div class="nc-pie"><button type="button" class="nc-foto">${ICO.foto}<small>${txt(C.foto || 'Foto')}</small></button><button type="button" class="nc-registrar">${ICO.alerta}${txt(C.boton)}</button></div>` +
    '</div>' +
    `<div class="nc-sistema"><p class="nc-rot">${txt(C.sistema)}</p><p class="nc-aviso"></p><div class="nc-tabla"></div></div>` +
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
  // PRIMER INTENTO A MANO (pedido de la persona): las dos tarjetas esperan que la persona las
  // use una vez (una manito la guía paso a paso: primero No calidad, después TICO); después de
  // probarlas, se usan solas si nadie toca nada.
  // =========================================================
  const mano = SV.manito ? SV.manito(seccion) : { mostrar() {}, ocultar() {} };
  const probado = { nc: false, tico: false };
  const guias = { nc: () => null, tico: () => null };
  function guiar() {
    for (const k of ['nc', 'tico']) {
      const o = !probado[k] && guias[k]();
      if (o) { mano.mostrar(o.el, o.texto, o.op); return; }
    }
    mano.ocultar();
    // probadas las dos: aparece "Ver el siguiente paso" en la columna del texto (tms.js)
    if (probado.nc && probado.tico && SV.tms.pasoFinal) SV.tms.pasoFinal.classList.add('visible');
  }

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
    const aviso = app.querySelector('.nc-aviso');
    const rotulos = [...app.querySelectorAll('.nc-rot[data-paso]')];
    let iSel = -1, tSel = -1, conFoto = false, numero = 1045, uso = -1e9, auto = false, relojAviso = 0;
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
      // el paso que toca hacer se marca en rojo: dónde pasó → qué pasó → foto y registro
      const toca = iSel < 0 ? 0 : tSel < 0 ? 1 : 2;
      rotulos.forEach((r) => r.classList.toggle('toca', +r.dataset.paso === toca));
      bReg.classList.toggle('toca', toca === 2);
      tocaAhora = toca;
      guiar();
    }
    let tocaAhora = 0;
    guias.nc = () => (tocaAhora === 0 ? { el: inst[0], texto: txt(C.invitaDonde || '**Elegí** dónde pasó'), op: { lado: 'abajo' } }
      : tocaAhora === 1 ? { el: tipos[0], texto: txt(C.invitaQue || '**Elegí** qué pasó'), op: { lado: 'abajo' } }
        : { el: bReg, texto: txt(C.invitaRegistro || '**Registralo**'), op: { lado: 'abajo' } });
    inst.forEach((b, k) => b.addEventListener('click', () => { if (!auto) uso = ahora(); iSel = k; marcar(); }));
    tipos.forEach((b, k) => b.addEventListener('click', () => { if (!auto) uso = ahora(); tSel = k; marcar(); }));
    foto.addEventListener('click', () => { if (!auto) uso = ahora(); conFoto = !conFoto; marcar(); });
    const cambiar = (f, est) => { const em = f.querySelector('em'); em.className = 'e' + est; em.textContent = ESTADOS[est]; };
    function registrar() {
      if (iSel < 0 || tSel < 0) return;
      const n = numero++;
      const f = fila(n, iSel, tSel, 0, true);
      bReg.classList.add('hecho');
      setTimeout(() => bReg.classList.remove('hecho'), 900);
      // el caso se sigue hasta resolverlo
      setTimeout(() => cambiar(f, 1), 2600);
      setTimeout(() => cambiar(f, 2), 6200);
      aviso.textContent = txt(C.registrado || '{numero} registrado', { numero: 'NC-' + n }).replace(/<[^>]+>/g, '');
      aviso.classList.remove('visible'); void aviso.offsetWidth; aviso.classList.add('visible');
      clearTimeout(relojAviso);
      relojAviso = setTimeout(() => aviso.classList.remove('visible'), 4200);
      iSel = tSel = -1; conFoto = false;
      marcar();
    }
    bReg.addEventListener('click', () => { if (!auto) { uso = ahora(); if (iSel >= 0 && tSel >= 0) probado.nc = true; } registrar(); guiar(); });
    marcar();
    // solo, si nadie lo usa: elige dónde y qué pasó, suma la foto y registra (despacio, paso por paso)
    const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
    setInterval(async () => {
      if (!probado.nc || !enVista() || auto || ahora() - uso < 7000) return;
      auto = true;
      try {
        await esperar(600);
        inst[Math.floor(Math.random() * inst.length)].click(); await esperar(1500);
        tipos[Math.floor(Math.random() * tipos.length)].click(); await esperar(1400);
        foto.click(); await esperar(1300);
        if (ahora() - uso > 7000) bReg.click();
      } finally { auto = false; uso = ahora() + 3000; }   // deja ver cómo avanza el caso antes de repetir
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
      if (!auto) { uso = ahora(); if (!probado.tico) { probado.tico = true; guiar(); } }
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
    guias.tico = () => (botones[0] ? { el: botones[0], texto: txt(A.invitacion || '**Tocá** una pregunta'), op: { lado: 'arriba' } } : null);
    guiar();
    setInterval(() => {
      if (!probado.tico || !enVista() || ocupado || ahora() - uso < 6500) return;
      uso = ahora() - 1500;
      preguntar(proxima, true);
    }, 1000);
  })();

})();
