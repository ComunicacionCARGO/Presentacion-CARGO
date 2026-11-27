/* =========================================================
   SERVICIO A MEDIDA (diapositiva slides/servicio-a-medida)
   Portada con la intro, ¿Cómo lo hacemos? (el recorrido de un pedido), Logística inversa,
   Tableros y Ventajas, y después del mapa de distribución los Centros
   logísticos con su ubicación.

   Cómo editar:
   - Cambiá solo lo que está entre comillas.
   - **texto** se ve en negrita.
   - {cliente} se reemplaza por el nombre de abajo (así, si cambia el
     cliente, se cambia en un solo lugar).
   ========================================================= */
window.SERVICIO = {

  cliente: "FORD",

  // ---------- Portada (la foto en capas del camión en la ruta) ----------
  portada: {
    antetitulo: "Nosotros",
    titulo: "LLEGAMOS",
    // Las capas, de atrás para adelante: el cielo (quieto, se muestra espejado), el campo
    // con los árboles (fondo) y el alambrado (medio). Fondo y medio pasan sin parar de
    // derecha a izquierda; los números son los segundos que tarda cada imagen en pasar
    // entera (más segundos = más lento). El fondo va más lento que el medio.
    cielo: "img/portada-servicio/cielo.webp",
    fondo: "img/portada-servicio/fondo.webp",
    medio: "img/portada-servicio/medio.webp",
    segundosFondo: "45",
    segundosMedio: "9",
    // desenfoque de movimiento del alambrado, solo de costado (en px; "0" = nítido)
    desenfoqueMedio: "5",
    // bruma del color del cielo sobre los árboles (efecto de atmósfera): "1" normal,
    // "0" sin bruma, "1.5" más fuerte
    atmosfera: "0.6",
    // el camión andando: secuencia de cuadros (carpeta, cantidad y cuadros por segundo)
    camion: { carpeta: "img/portada-servicio/camion/", cuadros: 121, porSegundo: 24 },
    // Intro: tarjeta sobre la foto que pasa sola por los párrafos (uno por vez, con
    // rayitas que se llenan arriba) y termina en la pregunta, la invitación y el botón,
    // que baja a "¿Cómo lo hacemos?". Se pueden agregar o sacar párrafos.
    intro: {
      rotulo: "Nuestra propuesta",
      parrafos: [
        "Nos ocupamos de gestionar y coordinar la distribución de **repuestos y accesorios** hacia la **red de concesionarios oficiales {cliente}**, asegurando que cada entrega llegue donde se necesita.",
        "Nuestro objetivo es claro: garantizar, a través de un servicio diseñado y alineado a los estándares y necesidades de {cliente}, la **continuidad, eficiencia y una experiencia de calidad** para sus clientes."
      ],
      // ícono grande y suave de la esquina de abajo a la izquierda, uno por párrafo y en el
      // mismo orden: "gestion" (caja con flechas), "objetivo" (diana) o "" (sin ícono)
      iconos: ["gestion", "objetivo"],
      pregunta: "¿Están listos para conocer cómo lo haríamos?",
      invitacion: "Los invitamos a recorrer nuestra experiencia interactiva y descubrir nuestra propuesta para {cliente}.",
      botonSiguiente: "Siguiente",   // el botón para pasar al párrafo siguiente
      boton: "Empezar el recorrido"
    }
  },

  // ---------- ¿Cómo lo hacemos? (título de la pantalla del recorrido) ----------
  como: {
    antetitulo: "¿Cómo lo",
    titulo: "HACEMOS?",
    sello: "Pensado para {cliente}",
    // la entrada: la frase al lado del título grande, el rótulo del mapa de las paradas y la
    // invitación a bajar (con mouse y con el dedo)
    entrada: "Seguí un pedido de **{cliente}** desde que nos llega hasta el concesionario: cinco paradas, cuatro interfaces con sus sistemas y **tracking en tiempo real**.",
    mapa: "El recorrido · **elegí una parada** para ir directo",
    verParada: "Ver esta parada",       // aparece al pasar el cursor por cada parada del recorrido
    invitacion: "**Elegí** una parada o **bajá** para recorrerlas todas",
    invitacionTactil: "**Tocá** una parada o **deslizá** para recorrerlas todas"
    // el cartel "Bajá para seguir" está en datos/guias.js
  },

  // ---------- El recorrido de ¿Cómo lo hacemos?, parada por parada ----------
  // Al bajar, la mercadería avanza por la ruta de la izquierda y cada parada muestra
  // su explicación y su demo a la derecha.
  //   clave: qué demo se muestra (NO cambiar): pedido, ubicacion, viajes,
  //          entrega o experiencia. Se pueden sacar paradas o cambiar el orden.
  //   titulo y texto: lo que se lee en la parada.
  //   interfaz (opcional): la conexión entre sistemas que actúa en esa parada:
  //          nombre, texto, y de dónde (de) y hacia dónde (a) viaja la información.
  recorrido: {
    interfaz: "Interfaz",               // el rótulo de las interfaces
    tracking: "Tracking",               // marca de las paradas con seguimiento en tiempo real
    de: "de",                           // "01 de 05"
    siguiente: "Siguiente",             // al lado del punto de la parada que viene
    irParada: "Ir a esta parada",       // al pasar el cursor por cualquier punto de la ruta
    primera: "Primera parada",
    // el botón que aparece al terminar cada demo (y el de la última parada, que lleva a las devoluciones)
    verSiguiente: "Ver el siguiente paso",
    verSiguienteFinal: "¿Y si hay una devolución?",
    paradas: [
      {
        clave: "pedido",
        titulo: "Ingreso del pedido",
        texto: "**{cliente}** nos envía el pedido desde su sistema y la mercadería llega al **depósito de CARGO**. Desde que se recibe el pedido empieza el **tracking en tiempo real**.",
        interfaz: { nombre: "Ingreso de pedidos", texto: "Recibe y procesa los archivos que informa {cliente}: nadie vuelve a cargar los datos.", de: "ERP {cliente}", a: "TMS CARGO" }
      },
      {
        clave: "ubicacion",
        titulo: "Geoposicionamiento indoor",
        texto: "Cada bulto se lee al ingresar y queda **en el stage de su ruta**, en su posición exacta (z-stage): así cada ruta se prepara **sin pérdidas**.",
        interfaz: { nombre: "Obtención de eventos", texto: "Busca y registra los eventos de cada carga: así se sigue cada bulto.", de: "Depósito y socios", a: "TMS CARGO" }
      },
      {
        clave: "viajes",
        titulo: "Gestión de viajes",
        texto: "Al despachar, cada bulto sube al **viaje de su ruta** y se emite la **carta de porte**, que queda pendiente hasta la entrega.",
        interfaz: { nombre: "Precarga", texto: "Informa los datos de la carga por entregar a los redespachantes y a la App de choferes.", de: "TMS CARGO", a: "Redespachantes y App" }
      },
      {
        clave: "entrega",
        titulo: "Entrega y digitalización",
        texto: "En el concesionario se **firma la carta de porte**: el documento se digitaliza (**e-POD**) y el **tracking se cierra**.",
        interfaz: { nombre: "Devolución de eventos", texto: "Informa los eventos del tracking al sistema de {cliente}.", de: "TMS CARGO", a: "ERP {cliente}" }
      },
      {
        clave: "experiencia",
        titulo: "Experiencia de usuario",
        texto: "La red de concesionarios nos tiene **siempre a mano**: registro de **no calidad** en todo el proceso y atención **24 hs** con TICO."
      }
    ],
    // abajo de la ruta (lleva a los tableros)
    final: "Todo lo que pasa en el recorrido alimenta los tableros de **Inteligencia de negocio**.",
    finalBoton: "Ver tableros"
  },

  // ---------- Las demos de cada parada (los datos son de ejemplo) ----------
  tms: {
    // 1. Ingreso del pedido
    pedido: {
      panel: "Ingreso de pedidos",
      erp: "ERP {cliente}",
      erpTexto: "Sistema de {cliente}",
      tms: "TMS CARGO",
      tmsTexto: "Recibe y procesa el pedido",
      archivo: "pedidos.txt",
      tabla: "Pedidos recibidos en el TMS",
      // Pedidos: número, destino, bultos y tipo (Stock, Urgente o V.I., como en la planchada)
      pedidos: [
        { numero: "PD-58211", destino: "Concesionario Rosario", bultos: 6, tipo: "Urgente" },
        { numero: "PD-58212", destino: "Concesionario San Luis", bultos: 4, tipo: "Stock" },
        { numero: "PD-58213", destino: "Concesionario Sgo. del Estero", bultos: 3, tipo: "Stock" },
        { numero: "PD-58214", destino: "Concesionario Villa María", bultos: 2, tipo: "V.I." }
      ],
      llegada: "Llegada de la mercadería",
      deposito: "Depósito CARGO",
      recibidos: "✓ **{bultos} bultos** recibidos: empieza su **tracking en tiempo real**",
      // La primera vez la demo espera que la persona la empiece (después arranca sola)
      botonInicio: "Recibir el pedido",
      invitacion: "**Hacé clic** para recibir el pedido de {cliente}",
      boton: "Recibir otro pedido"
    },
    // 2. Geoposicionamiento indoor: la planchada, con un stage por ruta (las rutas y sus
    //    colores son las de los viajes de abajo, en "despachos")
    carga: {
      panel: "Planchada por ruta",
      recepcion: "Recepción · bultos que llegan",
      stage: "Stage",
      ruta: "Ruta",
      // Tipos de bulto: nombre, la marca que lleva en la planchada y el valor inicial del contador
      indicadores: [
        { nombre: "Stock", marca: "", valor: 508 },
        { nombre: "Urgente", marca: "U", valor: 264 },
        { nombre: "V.I.", marca: "VI", valor: 9 }
      ],
      total: "Total en planchada",
      indicadoresTitulo: "Indicadores de planchada en vivo:",   // abajo, al lado de los contadores
      // Ayuda de arriba (al lado del título): antes de escanear, mientras se escanea a mano ({faltan})
      // y con el lector automático
      ayuda: "Hacé clic en un bulto que llega para escanearlo",
      ayudaFaltan: "Seguí escaneando: {faltan} más y el lector sigue solo",
      ayudaAuto: "Lector automático · hacé clic en un bulto para escanearlo",
      escanear: "**Escaneá** este bulto", // el texto al lado de la manito que señala el bulto
      manualesParaAuto: "4",            // cuántos bultos se escanean a mano antes del lector automático
      // La ventana que aparece una sola vez, al escanear el primer bulto.
      // {codigo}, {tipo}, {ruta}, {viaje} y {zona} se completan solos.
      ventana: {
        titulo: "Bulto escaneado",
        texto: "Este es un bulto **{tipo}** que se dirige a **{ruta}**: por eso se posiciona en el **stage de la ruta {ruta}** ({zona}) y queda marcado como **{tipo}**",
        datoRuta: "Ruta",
        datoViaje: "Viaje",
        datoTipo: "Tipo",
        datoZona: "Posición",
        boton: "Ubicarlo en la planchada"
      }
    },
    // 3 y 4. Gestión de viajes y entrega (los datos del documento y de los viajes son de ejemplo)
    despachos: {
      docTitulo: "Carta de porte digital",
      docTexto: "Se emite **100% digital** al despachar (no se imprime) y queda **pendiente hasta la entrega**.",
      docTextoEntrega: "Se firma **en el celular**: se genera el documento digital (**e-POD**) y queda a disposición de {cliente} en nuestra web.",
      docApp: "Carta de porte",              // el título de la app en el celular
      docQuien: "Chofer CARGO",              // quién usa la app
      docDigital: "100% digital · sin papel",
      firmaAca: "Firma del concesionario",
      // La primera vez cada demo espera que la persona la haga (después se hace sola): textos de la manito
      invitaViajes: "**Hacé clic** para armar los viajes",
      invitaFirma: "**Hacé clic** para firmar la entrega",
      docPendiente: "Pendiente de conformar",
      firmaPendiente: "Se firma en la entrega",
      docBoton: "Firmar la entrega",
      docListo: "Publicado en el portal de {cliente}",
      documento: {
        numero: "00003-00412387",
        fecha: "18/07",
        remitente: "{cliente} · Centro de repuestos",
        destinatario: "Concesionario oficial (ejemplo)",
        localidad: "Rosario, Santa Fe",
        bultos: "6",
        m3: "0,84",
        kg: "126,5"
      },
      viajesTitulo: "Armado de rutas y viajes",
      viajesTexto: "Cada stage de la planchada llena el camión de su ruta y se controla la salida.",
      viajesPlanchada: "Planchada · staging por ruta",   // el rótulo de la planchada simplificada
      viajesBoton: "Armar los viajes",
      // Viajes: código, unidad, paradas (la primera es la salida) y cuántos bultos lleva
      viajes: [
        { codigo: "VJ-2411", unidad: "Unidad 14", paradas: ["CD Córdoba", "Villa María", "Rosario"], bultos: 5 },
        { codigo: "VJ-2412", unidad: "Unidad 08", paradas: ["CD Córdoba", "Río Cuarto", "San Luis"], bultos: 4 },
        { codigo: "VJ-2413", unidad: "Unidad 21", paradas: ["CD Córdoba", "Jesús María", "Sgo. del Estero"], bultos: 3 }
      ]
    },
    // 4. Entrega: el tracking del envío hasta que se firma (el envío y sus eventos son de ejemplo)
    tracking: {
      panel: "Tracking en tiempo real",
      texto: "Cada estado con fecha, hora y lugar, de **varias fuentes**: nuestros eventos, los socios de transporte, el concesionario y la App de choferes.",
      numero: "ADD 0031-2411873",
      esperando: "esperando la firma",
      fin: "Tracking cerrado · eventos devueltos al sistema de {cliente}",
      boton: "Seguir el envío",                              // la primera vez el seguimiento espera este clic
      invitacion: "**Hacé clic** para seguir el envío",      // el texto de la manito
      // Las 4 fuentes (el orden importa: cada evento dice de cuál viene, 1 a 4)
      fuentes: ["Nuestros eventos", "Socios estratégicos de transporte", "Confirmación del concesionario", "App de choferes (última milla)"],
      // Eventos del envío: fecha y hora, qué pasó, dónde y de qué fuente viene (1 a 4).
      // Los que dicen "Entrega" (y los que siguen) llegan recién cuando se firma la carta de porte.
      eventos: [
        // (el tracking empieza cuando se recibe el pedido)
        { hora: "15/07 08:02", texto: "Pedido recibido en el TMS", lugar: "Interfaz con el ERP de {cliente}", fuente: 1 },
        { hora: "15/07 10:41", texto: "Ingreso a depósito", lugar: "Depósito CARGO Córdoba", fuente: 1 },
        { hora: "15/07 13:37", texto: "En tránsito", lugar: "Ruta 9 · socio de transporte", fuente: 2 },
        { hora: "16/07 11:11", texto: "Ingreso a depósito", lugar: "Depósito CARGO Rosario", fuente: 1 },
        { hora: "18/07 07:51", texto: "Salida a distribución", lugar: "Chofer CARGO · Unidad 14", fuente: 4 },
        { hora: "18/07 11:40", texto: "Entrega realizada · e-POD", lugar: "Av. Ejemplo 1234", fuente: 4 },
        { hora: "18/07 15:03", texto: "Recepción confirmada", lugar: "Concesionario oficial (ejemplo)", fuente: 3 }
      ]
    }
  },

  // ---------- Experiencia de usuario: última parada del recorrido ----------
  // (las preguntas y los registros son de ejemplo)
  experiencia: {
    calidad: {
      titulo: "",
      tituloGrande: "NO CALIDAD",
      texto: "Si algo falla en el proceso, se **registra en el momento**, con foto, y se **sigue hasta resolverlo**.",
      // los tres pasos del aplicativo (el que toca hacer se marca en rojo)
      pasoDonde: "1 · ¿Dónde pasó?",
      pasoQue: "2 · ¿Qué pasó?",
      pasoRegistro: "3 · Foto y registro",
      instancias: ["Recepción", "Depósito", "Transporte", "Entrega"],
      tipos: ["Faltante", "Daño", "Demora", "Documentación"],
      foto: "Sumar foto",
      boton: "Registrar",
      sistema: "Sistema de siniestros",
      // aviso al registrar ({numero} = el número del caso)
      registrado: "{numero} registrado · el equipo de calidad lo analiza",
      // la primera vez, una manito guía cada paso (después se usa sola)
      invitaDonde: "**Elegí** dónde pasó",
      invitaQue: "**Elegí** qué pasó",
      invitaRegistro: "**Registralo**"
    },
    asistente: {
      titulo: "",
      tituloGrande: "CUSTOMER SERVICE",
      texto: "Atención **24 hs** a la red sobre envíos, consultas de procesos y más, **asistido por bot**.",
      nombre: "TICO",
      estado: "Asistente CARGO · en línea 24 hs",
      saludo: "¡Hola! Soy TICO. ¿En qué te ayudo?",
      invitacion: "**Tocá** una pregunta para TICO",   // la manito, hasta que se pregunta algo
      // Preguntas que se pueden tocar y lo que responde
      preguntas: [
        { pregunta: "¿Dónde está mi envío ADD 0031-2411873?", respuesta: "Salió a distribución hoy a las 07:51 con la Unidad 14. Te aviso apenas se confirme la entrega." },
        { pregunta: "¿Cómo va mi devolución RC-24117?", respuesta: "Ya la retiramos y está en inspección en el depósito. Cuando tenga su disposición final te llega un mail." },
        { pregunta: "¿Dónde veo el remito conformado?", respuesta: "Está en el portal de clientes, en Documentos. Si querés, te lo mando por mail ahora." }
      ]
    }
  },

  // ---------- Logística inversa: simulación de una devolución ----------
  // Los horarios, números y cantidades son de ejemplo (es una simulación).
  inversa: {
    antetitulo: "¿Y si hay una",
    titulo: "DEVOLUCIÓN?",
    bajada: "Empieza en {cliente}: el concesionario **autogestiona** la devolución y, si el número de la pieza coincide con nuestra base, **se aprueba** y arranca la logística inversa.",
    app: "Fénix",                        // App del chofer
    appConcesionario: "Devoluciones",    // lo que ve el concesionario en el celular
    quienConcesionario: "Concesionario",
    quienChofer: "Chofer CARGO",
    concesionario: "Concesionario {cliente}",
    direccion: "Av. Ejemplo 1234",
    centro: "Depósito",
    numero: "RC-24117",
    fichaRotulo: "Devolución",           // el rótulo de la ficha del TMS (arriba del número)
    pieza: "Pieza 7A2B-14K",
    introTitulo: "Así funciona una devolución",
    introTexto: "El número de cada pieza ya está en la base de datos de CARGO gracias a la **interfaz** con {cliente}: si coincide, la devolución se aprueba y nos ocupamos del resto (retiro, traslado, trazabilidad y disposición final). **Vos manejás el celular.**",
    empezar: "Simular una devolución",
    anterior: "Paso anterior",           // el botón para volver un paso (al lado de "Siguiente")
    ejemplo: "Simulación con datos de ejemplo",
    sinReclamo: "Todavía no hay ninguna devolución. Empezá la simulación y mirá cómo se completa el seguimiento.",
    // Estado de la devolución en la ficha, en orden (uno por paso a partir del registro, y el último al cerrar)
    estados: ["Abierto", "Retiro programado", "Retirado", "En viaje", "En depósito", "En análisis", "Cerrado"],
    // Motivos que elige el concesionario.
    // destino: a dónde va después de la inspección (tiene que estar en la lista "destinos")
    // reposicion: true = se le manda una pieza nueva / false = no
    // delMes: cuántas hubo este mes por ese motivo (para el gráfico del análisis, ejemplo)
    tipos: [
      { nombre: "Devolución", detalle: "Pieza equivocada o que no se necesita", destino: "Reingreso a stock", reposicion: true, delMes: 14 },
      { nombre: "Garantía", detalle: "La pieza presentó una falla", destino: "Devolución al proveedor", reposicion: true, delMes: 8 },
      { nombre: "Rotación", detalle: "Stock sin movimiento en el concesionario", destino: "Reingreso a stock", reposicion: false, delMes: 5 }
    ],
    // Los 3 destinos posibles después de la inspección (disposición final)
    destinos: ["Reingreso a stock", "Devolución al proveedor", "Destrucción certificada"],
    pasos: [
      {
        titulo: "Solicitud",
        texto: "El concesionario **autogestiona su devolución** desde el celular: elige el motivo y adjunta una foto.",
        accion: "Tocá «Nueva devolución» en el celular",
        eventos: [{ hora: "Día 1 · 10:42", texto: "Solicitud del concesionario: {tipo}, con foto" }]
      },
      {
        titulo: "Registro",
        texto: "El número de la pieza se **valida contra la base de CARGO**: coincide, así que la devolución **se aprueba** y se avisa **por mail** a {cliente} y al concesionario.",
        eventos: [
          { hora: "Día 1 · 10:43", texto: "{pieza}: coincide con la base de CARGO · aprobada" },
          { hora: "Día 1 · 10:43", texto: "Devolución {numero} creada en el TMS" },
          { hora: "Día 1 · 10:43", texto: "Aviso por mail a {cliente} y al concesionario" }
        ],
        mails: ["{cliente}: devolución {numero} registrada", "Concesionario: recibimos tu devolución"]
      },
      {
        titulo: "Programación",
        texto: "El retiro se suma a la **próxima ruta** que pasa por el concesionario: menos tiempo y menos costo.",
        eventos: [{ hora: "Día 1 · 15:00", texto: "Retiro programado en la hoja de ruta del día 2" }],
        paradas: ["Concesionario Norte", "Concesionario Centro", "Concesionario Sur"]
      },
      {
        titulo: "Retiro",
        texto: "El chofer escanea la pieza y el concesionario **firma en la App**.",
        accion: "Firmá en el celular",
        eventos: [{ hora: "Día 2 · 09:18", texto: "Pieza retirada: escaneada y firmada" }]
      },
      {
        titulo: "Traslado",
        texto: "Vuelve al depósito con **seguimiento satelital**: trazabilidad total en todo el camino.",
        eventos: [
          { hora: "Día 2 · 09:20", texto: "En viaje al depósito" },
          { hora: "Día 2 · 14:05", texto: "Ingreso al depósito" }
        ]
      },
      {
        titulo: "Disposición final",
        texto: "Se inspecciona y se le da su destino. Si hace falta, la **reposición** sale en el próximo despacho.",
        eventos: [
          { hora: "Día 2 · 15:30", texto: "Inspección: {destino}" },
          // soloConReposicion: este evento no aparece si el motivo elegido no lleva reposición
          { hora: "Día 2 · 18:00", texto: "Reposición despachada", soloConReposicion: true }
        ]
      },
      {
        titulo: "Análisis",
        texto: "Cada motivo queda registrado: **analizamos las causas** de los desvíos para prevenir reincidencias y minimizar las devoluciones.",
        eventos: [{ hora: "Día 3 · 09:00", texto: "Motivo «{tipo}» sumado al análisis de causas" }],
        grafico: "Motivos de devolución · este mes"
      }
    ],
    cierre: {
      titulo: "Devolución cerrada",
      texto: "Un proceso controlado que aporta valor real: {cliente} lo siguió en línea y **no se usó un solo papel**.",
      reposicion: "Reposición entregada al concesionario",
      evento: { hora: "Día 3 · 10:15", texto: "Devolución cerrada" },
      mail: "{cliente}: devolución {numero} cerrada",
      // Beneficios que se muestran al final
      beneficios: ["Trazabilidad total", "Respuesta ágil", "Menos pérdidas", "Autogestión del concesionario"],
      boton: "Simular otra devolución"
    }
  },

  // ---------- Ventajas y oportunidades del software de gestión (después de la simulación) ----------
  // Seis columnas: al pasar el cursor (o tocar) se abre una y muestra su texto.
  // icono: ruta, escudo, barras, arbol, ciclo, cabeza
  // lista (opcional): renglones que van debajo del texto
  // irATableros: true → la columna lleva un botón que vuelve a la pestaña de los tableros
  // Es la tercera pestaña de la pantalla de los tableros (pestana = su nombre en el botón).
  ventajas: {
    pestana: "Ventajas y oportunidades",
    antetitulo: "Ventajas y",
    titulo: "OPORTUNIDADES",
    bajada: "Lo que nuestro **software de gestión** suma a la logística de {cliente}.",
    botonTableros: "Ver los tableros",
    items: [
      { titulo: "Monitoreo en tiempo real", icono: "ruta",
        texto: "Sistema de **tracking web** adaptado a las necesidades del cliente, que permite **visualizar en línea el estado de los envíos** con información detallada y actualizada." },
      { titulo: "Transparencia y seguridad", icono: "escudo",
        texto: "El cliente tiene **disponibilidad inmediata las 24 hs** para acceder a su **archivo en la web**. También puede ver:",
        lista: ["Geoposicionamiento", "Fecha y hora de la transacción", "Participantes involucrados"] },
      { titulo: "Trazabilidad", icono: "barras", irATableros: true,
        texto: "Los **tableros de indicadores** permiten medir resultados, detectar desvíos, realizar seguimiento en tiempo real y aplicar correcciones rápidamente." },
      { titulo: "Aporte a la sustentabilidad", icono: "arbol",
        texto: "Gracias a la **digitalización**, reducimos considerablemente el **consumo de papel**." },
      { titulo: "Eficiencia logística", icono: "ciclo",
        texto: "La **automatización** y el **seguimiento en línea** optimizan los tiempos y procesos, reduciendo errores y costos operativos." },
      { titulo: "Servicio customizado", icono: "cabeza",
        texto: "El sistema está **customizado** para el servicio de **repuestos**, completamente **integrado** con las operaciones logísticas, con una **visualización personalizada** según los requerimientos de {cliente}." }
    ]
  },

  // ---------- Tableros de Business Intelligence ----------
  // OJO: los números se leyeron de capturas de los tableros (algunos se ven mal): verificarlos.
  // Las provincias de "Logística inversa" son de EJEMPLO (la captura no se lee).
  tableros: {
    antetitulo: "Tableros de",
    titulo: "BUSINESS INTELLIGENCE",
    bajada: "Resumen de la situación de las entregas: desde un **paneo general** hasta el **desglose por provincias y concesionarios**.",
    nota: "Valores de referencia de nuestros tableros",
    actualizado: "Actualizado 22/07/2025 · 06:04",
    entregas: {
      pestana: "Entregas a concesionarios",
      titulo: "Entregas a concesionarios",
      verPor: "Ver por",                 // el rótulo de los filtros de arriba
      porMes: "Por mes",                 // el primero de los filtros (los otros: provincias y concesionarios → pestana)
      indicadores: [
        { nombre: "Cantidad ADD", valor: 114863 },
        { nombre: "Cantidad ADD on time", valor: 112704 },
        { nombre: "OTD", valor: 98.12, porcentaje: true }
      ],
      graficoTitulo: "OTD por mes",
      serieReal: "Resultado",            // los nombres de las dos líneas del gráfico
      serieObjetivo: "Expectativa",
      // mes, kilos distribuidos, OTD real (%) y la expectativa (%) de cada mes.
      // Ejemplo: la expectativa sube de a poco (siempre arriba del 98 %); el resultado casi
      // siempre la cumple o la supera, una vez queda un poco abajo y después repunta.
      meses: [
        { mes: "Enero", kg: 183862, otd: 98.05, objetivo: 98.02 },
        { mes: "Febrero", kg: 234050, otd: 98.05, objetivo: 98.05 },
        { mes: "Marzo", kg: 204188, otd: 98.10, objetivo: 98.08 },
        { mes: "Abril", kg: 199154, otd: 98.03, objetivo: 98.11 },
        { mes: "Mayo", kg: 282470, otd: 98.14, objetivo: 98.14 },
        { mes: "Junio", kg: 220178, otd: 98.21, objetivo: 98.17 },
        { mes: "Julio", kg: 98830, otd: 98.26, objetivo: 98.20 }
      ]
    },
    // % de entregas en tiempo por provincia — EJEMPLO (las entregas suman la "Cantidad ADD" de
    // arriba y el promedio da su OTD). otd: % de entregas en tiempo. expectativa: la línea punteada
    // (es uno de los filtros de "Entregas a concesionarios": pestana = el nombre del filtro)
    provincias: {
      pestana: "Por provincia",
      graficoTitulo: "% de entregas en tiempo por provincia",
      expectativa: 98,
      ordenarPor: "Ordenar por",
      porPorcentaje: "% en tiempo",
      porEntregas: "Entregas",
      lista: [
        { nombre: "Buenos Aires", entregas: 38440, otd: 98.22 },
        { nombre: "CABA", entregas: 15880, otd: 98.38 },
        { nombre: "Córdoba", entregas: 12950, otd: 98.14 },
        { nombre: "Santa Fe", entregas: 11240, otd: 98.15 },
        { nombre: "Mendoza", entregas: 6310, otd: 97.94 },
        { nombre: "Tucumán", entregas: 4720, otd: 97.86 },
        { nombre: "Entre Ríos", entregas: 4180, otd: 98.05 },
        { nombre: "Salta", entregas: 3210, otd: 97.71 },
        { nombre: "Chaco", entregas: 2640, otd: 97.62 },
        { nombre: "Corrientes", entregas: 2410, otd: 97.80 },
        { nombre: "San Juan", entregas: 2280, otd: 98.02 },
        { nombre: "Río Negro", entregas: 2120, otd: 97.88 },
        { nombre: "Sgo. del Estero", entregas: 1740, otd: 97.65 },
        { nombre: "La Pampa", entregas: 1580, otd: 98.40 },
        { nombre: "San Luis", entregas: 1530, otd: 98.71 },
        { nombre: "Chubut", entregas: 1460, otd: 97.74 },
        { nombre: "Jujuy", entregas: 1390, otd: 97.52 },
        { nombre: "Santa Cruz", entregas: 783, otd: 97.45 }
      ]
    },
    // % de entregas en tiempo por concesionario — EJEMPLO (concesionarios inventados)
    concesionarios: {
      pestana: "Por concesionario",
      graficoTitulo: "Concesionarios de la red · ejemplo",
      columnas: ["Concesionario", "Provincia", "Entregas", "En tiempo", "% en tiempo"],
      ayuda: "Tocá una columna para ordenar",
      lista: [
        { nombre: "Concesionario 1", provincia: "Buenos Aires", entregas: 9840, otd: 98.74 },
        { nombre: "Concesionario 2", provincia: "CABA", entregas: 8620, otd: 98.51 },
        { nombre: "Concesionario 3", provincia: "Córdoba", entregas: 7310, otd: 98.20 },
        { nombre: "Concesionario 4", provincia: "Santa Fe", entregas: 6480, otd: 98.12 },
        { nombre: "Concesionario 5", provincia: "Buenos Aires", entregas: 6150, otd: 97.96 },
        { nombre: "Concesionario 6", provincia: "Mendoza", entregas: 4230, otd: 97.88 },
        { nombre: "Concesionario 7", provincia: "Tucumán", entregas: 3170, otd: 97.73 },
        { nombre: "Concesionario 8", provincia: "Entre Ríos", entregas: 2860, otd: 98.31 },
        { nombre: "Concesionario 9", provincia: "Salta", entregas: 2140, otd: 97.58 },
        { nombre: "Concesionario 10", provincia: "San Luis", entregas: 1530, otd: 98.71 },
        { nombre: "Concesionario 11", provincia: "Chaco", entregas: 1490, otd: 97.49 },
        { nombre: "Concesionario 12", provincia: "Santa Cruz", entregas: 783, otd: 97.45 }
      ]
    },
    inversa: {
      pestana: "Logística inversa",
      titulo: "Resultados de logística inversa",
      cumplimiento: "Cumplimiento",
      enTiempo: "En tiempo",
      demorado: "Demorado",
      solicitudes: "Solicitudes de retiro en tiempo",
      graficoTitulo: "Estados por provincia",
      todas: "Todas las provincias",
      ayuda: "Tocá una barra para ver esa provincia",
      // provincia (nombre corto y completo), retiros en tiempo y demorados — EJEMPLO
      provincias: [
        { corto: "BA", nombre: "Buenos Aires", enTiempo: 88, demorado: 1 },
        { corto: "CABA", nombre: "Ciudad de Buenos Aires", enTiempo: 36, demorado: 1 },
        { corto: "CBA", nombre: "Córdoba", enTiempo: 30, demorado: 0 },
        { corto: "SF", nombre: "Santa Fe", enTiempo: 21, demorado: 1 },
        { corto: "MZA", nombre: "Mendoza", enTiempo: 18, demorado: 0 },
        { corto: "TUC", nombre: "Tucumán", enTiempo: 16, demorado: 1 },
        { corto: "ER", nombre: "Entre Ríos", enTiempo: 13, demorado: 0 },
        { corto: "NQN", nombre: "Neuquén", enTiempo: 11, demorado: 0 },
        { corto: "SAL", nombre: "Salta", enTiempo: 10, demorado: 1 },
        { corto: "CHA", nombre: "Chaco", enTiempo: 8, demorado: 0 },
        { corto: "MIS", nombre: "Misiones", enTiempo: 7, demorado: 0 },
        { corto: "COR", nombre: "Corrientes", enTiempo: 6, demorado: 0 },
        { corto: "SJ", nombre: "San Juan", enTiempo: 6, demorado: 1 },
        { corto: "RN", nombre: "Río Negro", enTiempo: 5, demorado: 0 },
        { corto: "LP", nombre: "La Pampa", enTiempo: 4, demorado: 0 },
        { corto: "SE", nombre: "Santiago del Estero", enTiempo: 4, demorado: 0 },
        { corto: "JUJ", nombre: "Jujuy", enTiempo: 3, demorado: 0 },
        { corto: "CHU", nombre: "Chubut", enTiempo: 3, demorado: 0 },
        { corto: "SL", nombre: "San Luis", enTiempo: 3, demorado: 0 },
        { corto: "CAT", nombre: "Catamarca", enTiempo: 2, demorado: 0 },
        { corto: "FOR", nombre: "Formosa", enTiempo: 2, demorado: 0 },
        { corto: "LR", nombre: "La Rioja", enTiempo: 2, demorado: 0 },
        { corto: "SC", nombre: "Santa Cruz", enTiempo: 1, demorado: 0 },
        { corto: "TDF", nombre: "Tierra del Fuego", enTiempo: 1, demorado: 0 }
      ]
    }
  },

  // ---------- Centros logísticos (después del mapa de distribución) ----------
  // Comparten pantalla con el mapa de Ubicación estratégica: a la izquierda va este
  // encabezado, el total de m² y la lista de centros (el elegido se despliega).
  centros: {
    antetitulo: "Centros logísticos /",
    titulo: "CROSSDOCKING",
    bajada: "Almacenamiento y crossdocking en los puntos clave de la red, con **entrega al cliente en 24 hs**.",
    totalTexto: "de depósito en 4 centros",
    // Cada centro: nombre, metros cuadrados (número, sin puntos), dirección, servicios y entrega.
    // Van por cercanía al depósito del cliente (el orden de la lista es el de la pantalla).
    // ubicacion: qué muestra el mapa al elegirlo: "plaza" o "benavidez" (su ruta en el plano de
    // calles), "rosario" o "cordoba" (la vista del país, ver "regionales" más abajo) o "" (nada)
    lista: [
      { nombre: "Plaza Logística", m2: 17000, direccion: "Av. J. D. Perón 4000, Pacheco, Buenos Aires", servicios: "Almacenamiento, crossdocking, carga paletizada y reparto local", entrega: "**24 hs** entrega al cliente", ubicacion: "plaza" },
      { nombre: "Benavídez", m2: 5680, direccion: "V. Tedín 111, Benavídez, Provincia de Buenos Aires", servicios: "Almacenamiento multicliente, carga paletizada y reparto local", entrega: "**24 hs** entrega al cliente", ubicacion: "benavidez" },
      { nombre: "Rosario", m2: 1800, direccion: "Vélez Sársfield 6501-6599, Rosario, Santa Fe", servicios: "Almacenamiento, crossdocking, carga seca y reparto local", entrega: "**24 hs** entrega al cliente", ubicacion: "rosario" },
      { nombre: "Córdoba", m2: 4000, direccion: "Rosa Ferreyra de Roca 2862, Córdoba Capital", servicios: "Almacenamiento, crossdocking, carga seca y reparto local", entrega: "**24 hs** entrega al cliente", ubicacion: "cordoba" }
    ]
  },

  // ---------- Ubicación estratégica: mapa de la zona de Pacheco (al lado de la lista de centros) ----------
  // bajada: se suma a la de los centros. nota: va abajo a la derecha, junto a la atribución del mapa.
  ubicacion: {
    bajada: "Nuestros centros de Buenos Aires están **a minutos del depósito de repuestos de {cliente}**.",
    destino: "Depósito de repuestos {cliente}",
    pinDestino: "img/ubicacion/pin-cliente.svg",   // el pin del depósito (con el logo del cliente)
    zona: "General Pacheco · Buenos Aires",
    // los dos centros (km y minutos por calle hasta el depósito). alternativas: las otras rutas
    // que se dibujan (en orden: por El Salvador y por Sarmiento), con sus km y minutos
    centros: [
      { k: "plaza", nombre: "Centro Logístico Plaza Logística", km: "1,1", minutos: 4 },
      { k: "benavidez", nombre: "Centro Logístico Benavídez", km: "3,3", minutos: 9,
        alternativas: [{ km: "3,4", minutos: 10 }, { km: "4", minutos: 11 }] }
    ],
    nota: "Distancia y tiempo por calle hasta el depósito de repuestos.",
    // Los centros del interior: al elegirlos, el mapa pasa a una vista de la zona central del
    // país con la flecha desde los centros de Buenos Aires y flechitas naranjas hacia afuera.
    // lat y lon: dónde va el punto (coordenadas aproximadas de la ciudad).
    origen: "Centros Buenos Aires",
    regional: "Recibe desde Buenos Aires y **distribuye a toda su zona**",
    regionales: [
      { k: "rosario", nombre: "Centro Logístico Rosario", lat: -32.90, lon: -60.69 },
      { k: "cordoba", nombre: "Centro Logístico Córdoba", lat: -31.39, lon: -64.20 }
    ]
  },

  // ---------- Resumen: todo lo que hay en la diapositiva ----------
  // Aparece al bajar desde la portada, encima de ella (el fondo se oscurece). Una parada por
  // parte de la diapositiva; al tocarla se va a esa parte.
  //   seccion: a qué parte lleva (NO cambiar): como, devoluciones, tableros, mapa o centros.
  // "volver": el botón del final de la diapositiva (al lado de "Siguiente", que sale solo).
  cierre: {
    antetitulo: "Todo esto,",
    titulo: "PENSADO PARA {cliente}",
    bajada: "Un servicio **a medida, de punta a punta**: desde que {cliente} nos envía el pedido hasta que el concesionario lo recibe… y, si hace falta, de vuelta.",
    verDeNuevo: "Ver esta parte",       // aparece al pasar el cursor por cada parada
    volver: "Volver al inicio",
    partes: [
      { seccion: "como", titulo: "¿Cómo lo hacemos?", texto: "El recorrido de cada pedido, del sistema de {cliente} al concesionario, con **tracking en tiempo real** y carta de porte **100 % digital**." },
      { seccion: "devoluciones", titulo: "Devoluciones", texto: "El concesionario **autogestiona** la devolución y seguimos cada pieza hasta su **disposición final**." },
      { seccion: "tableros", titulo: "Tableros y ventajas", texto: "**Indicadores** de entregas y de logística inversa para decidir con datos y **mejorar cada mes**." },
      { seccion: "mapa", titulo: "¿Dónde lo hacemos?", texto: "Red propia y redespachantes para **llegar a todo el país** con tiempos de entrega definidos." },
      { seccion: "centros", titulo: "Centros logísticos", texto: "**28.480 m²** de crossdocking, con dos centros **a minutos** del depósito de {cliente}." }
    ]
  }
};
