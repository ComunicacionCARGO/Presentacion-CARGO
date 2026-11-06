/* =========================================================
   SERVICIO A MEDIDA — "¿Cómo lo hacemos?"
   (diapositiva slides/servicio-a-medida: Milk run, Nuestro TMS y
   Logística inversa, antes del mapa de distribución)

   Cómo editar:
   - Cambiá solo lo que está entre comillas.
   - **texto** se ve en negrita.
   - {cliente} se reemplaza por el nombre de abajo (así, si cambia el
     cliente, se cambia en un solo lugar).
   ========================================================= */
window.SERVICIO = {

  cliente: "FORD",

  // ---------- Pantalla de entrada ----------
  como: {
    antetitulo: "¿Cómo lo",
    titulo: "HACEMOS?",
    sello: "Pensado para {cliente}",
    bajada: "Tres herramientas que trabajan juntas para que cada pieza esté **donde tiene que estar, cuando tiene que estar**.",
    partes: [
      { titulo: "Milk run", texto: "Recolectamos en cada proveedor y abastecemos la planta en su ventana horaria." },
      { titulo: "Nuestro TMS", texto: "Gestión de carga e interfases con los sistemas de {cliente}." },
      { titulo: "Logística inversa", texto: "Simulá un reclamo y mirá cómo lo resolvemos." }
    ],
    ayuda: "Bajá para empezar"
  },

  // ---------- Milk run (se recorre con el scroll) ----------
  milkRun: {
    antetitulo: "Abastecimiento de planta",
    titulo: "MILK RUN",
    bajada: "Un circuito programado con la producción de {cliente}: el mismo camión lleva los embalajes vacíos, recorre varios proveedores y vuelve a planta con las piezas.",
    incluyeTitulo: "El servicio incluye",
    incluye: [
      "Flota dedicada",
      "Coordinación del servicio",
      "Ruteo y planificación",
      "Documentación de cada viaje",
      "Gestión de embalajes vacíos",
      "Seguimiento en línea",
      "Monitoreo 24 × 7",
      "Tablero de KPI"
    ],
    planta: "Planta {cliente}",
    proveedores: ["Proveedor A", "Proveedor B", "Proveedor C"],
    // Un paso por parada del circuito (son 6: el dibujo está pensado para esa cantidad)
    pasos: [
      { titulo: "Playa de vacíos", texto: "Los **embalajes vacíos** (racks y cajones) esperan en la playa de la planta.", dato: "Gestión de medios vacíos" },
      { titulo: "Carga de medios", texto: "El camión se posiciona y carga los vacíos que va a dejar en cada proveedor.", dato: "Carga optimizada en 3D" },
      { titulo: "Hoja de ruta", texto: "Con los volúmenes que los proveedores confirman por web **hasta las 15 h**, el TMS genera el día anterior la **hoja de ruta** y los remitos de embalajes.", dato: "TMS + ruteo optimizado" },
      { titulo: "En viaje", texto: "Cada unidad tiene **seguimiento satelital**: el Centro de Monitoreo ve en línea cuándo entra y sale de cada proveedor.", dato: "Monitoreo 24 × 7" },
      { titulo: "Proveedores", texto: "En cada proveedor descarga los vacíos y carga los **embalajes llenos**, según las tarjetas Kanban. Cada movimiento se confirma con handheld.", dato: "Kanban + handheld" },
      { titulo: "Vuelta a planta", texto: "Las piezas llegan a la planta en su **ventana horaria** y la hoja de ruta se conforma en la web.", dato: "Tablero de KPI en línea" }
    ],
    vacios: "Vacíos",
    llenos: "Llenos",
    ayuda: "Bajá para recorrer el circuito"
  },

  // ---------- Nuestro TMS ----------
  tms: {
    antetitulo: "¿Qué puede hacer",
    titulo: "NUESTRO TMS?",
    bajada: "Sistema de gestión de despacho **personalizado para el cliente**.",
    carga: {
      titulo: "Gestión de carga",
      resumen: "Planchada ordenada y a la vista",
      texto: "Diagramamos zonas de **stage y zstage** parametrizadas en el sistema para ordenar la salida. Cada bulto se lee con **handheld** y va a su zona.",
      panel: "Situación de la planchada",
      // Indicadores: nombre y valor inicial (después cambian con la demo)
      indicadores: [
        { nombre: "Stock", valor: 508 },
        { nombre: "Urgente", valor: 264 },
        { nombre: "V.I.", valor: 9 }
      ],
      total: "Total",
      recepcion: "Recepción",
      ayuda: "Pasá el lector por los bultos que llegan"
    },
    interfases: {
      titulo: "Interfases",
      resumen: "Conectado con tus sistemas",
      texto: "Comunicación con **sistemas propios y de terceros** (clientes, warehouse y transporte de terceros) mediante distintos protocolos.",
      nodos: {
        cliente: "ERP {cliente}",
        tms: "Grupo CARGO",
        warehouse: "Warehouse",
        terceros: "Transporte de terceros",
        app: "App de choferes"
      },
      // Las 4 interfases (el orden importa: cada una tiene su recorrido en el dibujo)
      lista: [
        { titulo: "Ingreso de pedidos", texto: "Recibe y procesa los archivos txt que informa el cliente.", paquete: "pedidos.txt" },
        { titulo: "Precarga", texto: "Informa los datos de la carga por entregar: nadie tiene que volver a cargarlos.", paquete: "datos de carga" },
        { titulo: "Obtención de eventos", texto: "Busca los eventos relacionados a cada carga.", paquete: "eventos" },
        { titulo: "Devolución de eventos", texto: "Informa los eventos de tracking al ERP del cliente.", paquete: "tracking" }
      ]
    },
    inversa: {
      titulo: "Logística inversa",
      resumen: "Reclamos sin papeles",
      boton: "Ver la simulación"
    }
  },

  // ---------- Logística inversa: simulación de un reclamo ----------
  // Los horarios, números y cantidades son de ejemplo (es una simulación).
  inversa: {
    antetitulo: "Logística",
    titulo: "INVERSA",
    bajada: "Gestionamos de forma integral la **recolección, traslado, trazabilidad y disposición final** de productos y partes que reingresan al circuito logístico por devolución, garantía o rotación.",
    app: "Fénix",                        // App del chofer
    appConcesionario: "Devoluciones",    // lo que ve el concesionario en el celular
    quienConcesionario: "Concesionario",
    quienChofer: "Chofer CARGO",
    concesionario: "Concesionario {cliente}",
    direccion: "Av. Ejemplo 1234",
    centro: "Depósito",
    numero: "RC-24117",
    pieza: "Pieza 7A2B-14K",
    introTitulo: "¿Y si una pieza tiene que volver?",
    introTexto: "Seguí una devolución de {cliente}: el concesionario la **autogestiona** y nosotros nos ocupamos del resto. **Vos manejás el celular.**",
    empezar: "Simular un reclamo",
    ejemplo: "Simulación con datos de ejemplo",
    sinReclamo: "Todavía no hay ningún reclamo. Empezá la simulación y mirá cómo se completa el seguimiento.",
    // Estado del reclamo en la ficha, en orden (uno por paso a partir del registro, y el último al cerrar)
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
        texto: "El reclamo entra solo al TMS y se avisa **por mail** a {cliente} y al concesionario.",
        eventos: [
          { hora: "Día 1 · 10:43", texto: "Reclamo {numero} creado en el TMS" },
          { hora: "Día 1 · 10:43", texto: "Aviso por mail a {cliente} y al concesionario" }
        ],
        mails: ["{cliente}: reclamo {numero} registrado", "Concesionario: recibimos tu devolución"]
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
      titulo: "Reclamo cerrado",
      texto: "Un proceso controlado que aporta valor real: {cliente} lo siguió en línea y **no se usó un solo papel**.",
      reposicion: "Reposición entregada al concesionario",
      evento: { hora: "Día 3 · 10:15", texto: "Reclamo cerrado" },
      mail: "{cliente}: reclamo {numero} cerrado",
      // Beneficios que se muestran al final
      beneficios: ["Trazabilidad total", "Respuesta ágil", "Menos pérdidas", "Autogestión del concesionario"],
      boton: "Simular otro reclamo"
    }
  },

  // ---------- Ventajas y oportunidades del software de gestión (después de la simulación) ----------
  // Seis columnas: al pasar el cursor (o tocar) se abre una y muestra su texto.
  // icono: ruta, escudo, barras, arbol, ciclo, cabeza
  // lista (opcional): renglones que van debajo del texto
  // irATableros: true → la columna lleva un botón que baja a los tableros
  ventajas: {
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
      indicadores: [
        { nombre: "Cantidad ADD", valor: 114863 },
        { nombre: "Cantidad ADD on time", valor: 108889 },
        { nombre: "OTD", valor: 98.12, porcentaje: true }
      ],
      graficoTitulo: "OTD por mes",
      // mes, kilos distribuidos y OTD (%) de cada mes
      meses: [
        { mes: "Enero", kg: 183862, otd: 95.08 },
        { mes: "Febrero", kg: 234050, otd: 94.70 },
        { mes: "Marzo", kg: 204188, otd: 95.23 },
        { mes: "Abril", kg: 199154, otd: 95.28 },
        { mes: "Mayo", kg: 282470, otd: 95.62 },
        { mes: "Junio", kg: 220178, otd: 95.20 },
        { mes: "Julio", kg: 98830, otd: 95.67 }
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
  }
};