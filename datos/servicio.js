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
  // Los horarios y números son de ejemplo (es una simulación).
  inversa: {
    antetitulo: "Logística",
    titulo: "INVERSA",
    bajada: "Cuando algo no llega como debía, el reclamo se resuelve con el mismo sistema que la entrega: **digital, trazable y sin viajes de más**.",
    app: "Fénix",
    concesionario: "Concesionario {cliente}",
    direccion: "Av. Ejemplo 1234",
    centro: "Centro de distribución",
    numero: "RC-24117",
    remito: "0001-00012345",
    bultos: 3,
    introTitulo: "¿Y si algo llega mal?",
    introTexto: "Seguí un pedido de {cliente} desde la entrega hasta que el reclamo se cierra. **Vos manejás la App del chofer.**",
    empezar: "Simular un reclamo",
    ejemplo: "Simulación con datos de ejemplo",
    sinReclamo: "Todavía no hay ningún reclamo. Empezá la simulación y mirá cómo se completa el seguimiento.",
    // Estado del reclamo en la ficha, en orden
    estados: ["Abierto", "Retiro programado", "Retirado", "En viaje", "En resolución", "Cerrado"],
    // Qué le pasó al bulto (se elige en el celular)
    tipos: [
      { nombre: "Bulto dañado", detalle: "La caja llegó golpeada", destino: "Devolución al proveedor", reposicion: true },
      { nombre: "Pieza equivocada", detalle: "No coincide con el pedido", destino: "Reingreso a stock", reposicion: true },
      { nombre: "Devolución", detalle: "El concesionario no la necesita", destino: "Reingreso a stock", reposicion: false }
    ],
    // Los 3 destinos posibles después de la inspección
    destinos: ["Reingreso a stock", "Devolución al proveedor", "Destrucción certificada"],
    pasos: [
      {
        titulo: "Observación",
        texto: "En la entrega, el chofer registra la observación en la App, **con foto**.",
        accion: "Tocá «Observaciones» en el celular",
        eventos: [{ hora: "Día 1 · 10:42", texto: "Observación en la entrega: {tipo}, con foto" }]
      },
      {
        titulo: "Registro",
        texto: "El reclamo entra solo al TMS y se avisa **por mail** a {cliente} y al concesionario.",
        eventos: [
          { hora: "Día 1 · 10:43", texto: "Reclamo {numero} creado en el TMS" },
          { hora: "Día 1 · 10:43", texto: "Aviso por mail a {cliente} y al concesionario" }
        ],
        mails: ["{cliente}: reclamo {numero} registrado", "Concesionario: recibimos tu reclamo"]
      },
      {
        titulo: "Programación",
        texto: "El retiro se suma a la **próxima ruta** que pasa por el concesionario: sin viajes extra.",
        eventos: [{ hora: "Día 1 · 15:00", texto: "Retiro programado en la hoja de ruta del día 2" }],
        paradas: ["Concesionario Norte", "Concesionario Centro", "Concesionario Sur"]
      },
      {
        titulo: "Retiro",
        texto: "El chofer escanea el bulto y el concesionario **firma en la App**.",
        accion: "Firmá en el celular",
        eventos: [{ hora: "Día 2 · 09:18", texto: "Bulto retirado: escaneado y firmado" }]
      },
      {
        titulo: "Regreso",
        texto: "Vuelve al centro de distribución con **seguimiento satelital** en todo el camino.",
        eventos: [
          { hora: "Día 2 · 09:20", texto: "En viaje al centro de distribución" },
          { hora: "Día 2 · 14:05", texto: "Ingreso al centro de distribución" }
        ]
      },
      {
        titulo: "Resolución",
        texto: "Se inspecciona, se le da su destino y, si hace falta, la **reposición** sale en el próximo despacho.",
        eventos: [
          { hora: "Día 2 · 15:30", texto: "Inspección: {destino}" },
          // soloConReposicion: este evento no aparece si el tipo elegido no lleva reposición
          { hora: "Día 2 · 18:00", texto: "Reposición despachada", soloConReposicion: true }
        ]
      }
    ],
    cierre: {
      titulo: "Reclamo cerrado",
      texto: "Cada paso quedó registrado, {cliente} lo siguió en línea y **no se usó un solo papel**.",
      reposicion: "Reposición entregada al concesionario",
      evento: { hora: "Día 3 · 10:15", texto: "Reclamo cerrado" },
      mail: "{cliente}: reclamo {numero} cerrado",
      boton: "Simular otro reclamo"
    }
  }
};
