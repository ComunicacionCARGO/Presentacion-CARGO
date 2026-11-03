/* =====================================================================
   RSE — "Hacia un impacto CERO" (diapositiva "Nuestra estructura",
   después de "Políticas y Certificaciones")
   ---------------------------------------------------------------------
   Un tablero con palancas: cada palanca que se activa muestra su acción
   y baja la aguja del medidor hacia CERO.
   • Cambiá SOLO lo que está entre comillas "...".
   • **texto** = negrita.
   • Cada elemento de una lista va entre comillas y separado por coma
     (el último no lleva coma).
   • Guardá y recargá la página (F5) para ver el cambio.
   ===================================================================== */

window.RSE = {

  // =====================================================================
  // 2. LO QUE HACEMOS, EN NÚMEROS (debajo del tablero)
  //    Los números van entre comillas, como se escriben: "65.916", "2,1".
  // =====================================================================
  numeros: {
    titulo: "Lo que hacemos,",
    tituloGrande: "EN NÚMEROS",

    // ---------- Reciclaje ----------
    reciclajeTitulo: "Reciclaje junto a ZYCLAR",
    reciclajeTexto: "Reciclamos **cartón y papel** de nuestras operaciones en Plaza Logística y el Centro de Distribución Benavídez, y recibimos **film recuperado** a cambio.",
    kilos: "65.916",
    kilosTexto: "kg de papel y cartón reciclados",
    arboles: "1.186",
    arbolesTexto: "árboles que no fueron talados",
    registroTitulo: "Registro 2024 (kg por mes)",
    // OJO: los 12 meses suman 68.234 kg y el total de arriba dice 65.916: verificar
    meses: [
      { mes: "Ene", kg: "7.472" }, { mes: "Feb", kg: "6.240" }, { mes: "Mar", kg: "6.096" },
      { mes: "Abr", kg: "5.680" }, { mes: "May", kg: "5.808" }, { mes: "Jun", kg: "5.040" },
      { mes: "Jul", kg: "4.496" }, { mes: "Ago", kg: "6.176" }, { mes: "Sep", kg: "5.776" },
      { mes: "Oct", kg: "6.992" }, { mes: "Nov", kg: "3.060" }, { mes: "Dic", kg: "5.398" }
    ],

    // ---------- Huella de carbono ----------
    huellaTitulo: "Huella de carbono",
    huellaTexto: "Medimos y seguimos este indicador junto a la **Cámara Empresaria de Operadores Logísticos (CEDOL)**.",
    huellaUnidad: "Índice relativo · t CO₂ por m³ transportado",
    // comparación que se calcula sola con los promedios de cada año
    comparacionDesde: "2023",
    comparacionHasta: "2025",
    comparacionTexto: "baja del índice promedio",
    // Un renglón por mes: m3 transportados e índice (t CO₂ / m³).
    // Los marcados con "verificar" se leyeron de una captura y pueden estar mal.
    huella: [
      { mes: "ene-23", m3: "18879", indice: "2,1" },
      { mes: "feb-23", m3: "14817", indice: "2,3" },
      { mes: "mar-23", m3: "20754", indice: "2,1" },
      { mes: "abr-23", m3: "20047", indice: "2,1" },
      { mes: "may-23", m3: "20047", indice: "2,1" },
      { mes: "jun-23", m3: "19425", indice: "2,2" },
      { mes: "jul-23", m3: "18895", indice: "2,4" },
      { mes: "ago-23", m3: "20508", indice: "2,3" },   // verificar
      { mes: "sep-23", m3: "18801", indice: "2,5" },
      { mes: "oct-23", m3: "19057", indice: "2,5" },
      { mes: "nov-23", m3: "18017", indice: "2,5" },
      { mes: "dic-23", m3: "15453", indice: "2,6" },
      { mes: "ene-24", m3: "16314", indice: "2,3" },
      { mes: "feb-24", m3: "13638", indice: "2,6" },
      { mes: "mar-24", m3: "12450", indice: "3,0" },
      { mes: "abr-24", m3: "16690", indice: "2,4" },
      { mes: "may-24", m3: "15640", indice: "2,6" },
      { mes: "jun-24", m3: "11888", indice: "2,8" },
      { mes: "jul-24", m3: "19773", indice: "2,4" },
      { mes: "ago-24", m3: "20051", indice: "2,1" },   // verificar
      { mes: "sep-24", m3: "19054", indice: "2,3" },
      { mes: "oct-24", m3: "19768", indice: "2,2" },
      { mes: "nov-24", m3: "18839", indice: "2,1" },
      { mes: "dic-24", m3: "18101", indice: "1,9" },   // verificar
      { mes: "ene-25", m3: "16201", indice: "1,9" },
      { mes: "feb-25", m3: "12187", indice: "2,1" },
      { mes: "mar-25", m3: "13435", indice: "2,0" },
      { mes: "abr-25", m3: "16117", indice: "1,9" },
      { mes: "may-25", m3: "15311", indice: "2,3" },
      { mes: "jun-25", m3: "15448", indice: "2,3" },
      { mes: "jul-25", m3: "19800", indice: "1,8" },   // verificar
      { mes: "ago-25", m3: "17919", indice: "1,8" },   // verificar
      { mes: "sep-25", m3: "19875", indice: "1,7" },   // verificar
      { mes: "oct-25", m3: "23802", indice: "1,4" },
      { mes: "nov-25", m3: "21504", indice: "1,4" },
      { mes: "dic-25", m3: "18930", indice: "1,5" }    // verificar
    ]
  },

  // =====================================================================
  // 3. COMUNIDAD Y ALIADOS (después del tablero)
  // =====================================================================
  comunidad: {
    titulo: "Acompañamos a la",
    tituloGrande: "COMUNIDAD",
    // imagen: en img/rse/acciones/
    acciones: [
      {
        titulo: "Camión solidario",
        imagen: "camion-solidario.jpg",
        texto: "Ponemos a disposición de las fundaciones aliadas **equipos y camiones** para trasladar donaciones o insumos a sus centros."
      },
      {
        titulo: "Colectas de colaboradores",
        imagen: "colectas.jpg",
        texto: "Como equipo, hacemos colectas de **alimentos, abrigos, juguetes y útiles escolares** para donar a las fundaciones que acompañamos."
      },
      {
        titulo: "Apoyo económico",
        imagen: "apoyo-economico.jpg",
        texto: "Acompañamos a nuestras fundaciones aliadas con **sustento económico** para alquileres, mantenimiento de sus centros o nuevos proyectos."
      }
    ],
    aliadosTitulo: "Organizaciones con las que colaboramos",
    // grupo: "Ambiente" o "Comunidad";  imagen: en img/rse/aliados/ (PNG con fondo transparente)
    aliados: [
      { nombre: "Forestando", imagen: "forestando.png", grupo: "Ambiente" },
      { nombre: "Acción Ambiental", imagen: "accion-ambiental.png", grupo: "Ambiente" },
      { nombre: "ZYCLAR", imagen: "zyclar.png", grupo: "Ambiente" },
      { nombre: "Fundación Mi Pueblo", imagen: "mi-pueblo.png", grupo: "Comunidad" },
      { nombre: "Fundación Grupo Educativo MDG", imagen: "mdg.png", grupo: "Comunidad" },
      { nombre: "Hospital de Pediatría Garrahan", imagen: "garrahan.png", grupo: "Comunidad" },
      { nombre: "Effetá", imagen: "effeta.png", grupo: "Comunidad" },
      { nombre: "Pull Solidario", imagen: "pull-solidario.png", grupo: "Comunidad" },
      { nombre: "Fundación CONIN", imagen: "conin.png", grupo: "Comunidad" }
    ]
  },

  // =====================================================================
  // 1. TABLERO "HACIA UN IMPACTO CERO" (va primero)
  //    titulo = texto chico de arriba;  tituloGrande = la palabra grande
  // =====================================================================
  titulo: "Hacia un impacto",
  tituloGrande: "CERO",
  texto: "Nos propusimos alcanzar un **impacto cero en nuestra huella de carbono**. Para lograrlo diseñamos un plan con **acciones concretas**.",
  ayuda: "Activá cada palanca",
  ayudaTexto: "Cada acción de nuestro plan baja la aguja del medidor. Activalas una por una para ver cómo llegamos a **impacto cero**.",

  // Medidor: arranca al máximo (HOY, a la derecha) y baja hasta CERO (izquierda).
  // Texto de cada punta y lo que dice cuando están todas activadas
  medidorDesde: "HOY",
  medidorHasta: "CERO",
  medidorTitulo: "Huella de carbono",
  finalTitulo: "IMPACTO CERO",
  finalTarjetaTitulo: "Un compromiso de todos",
  finalTexto: "Este objetivo es un **compromiso compartido** de toda nuestra empresa, donde cada acción nos acerca a **un futuro más sustentable**.",

  // ---------- Palancas (se recomiendan 8) ----------
  // icono: ruta, camion, grafico, foco, escudo, arboles, reciclar, digital
  // nombre: lo que se lee debajo de la palanca (corto)
  // texto: la frase principal;  puntos: hasta 4 renglones cortos
  palancas: [
    {
      nombre: "Optimización operativa",
      icono: "ruta",
      texto: "Menos kilómetros y menos viajes vacíos: **menos combustible, menos CO₂**.",
      puntos: [
        "Rutas más cortas y proveedores cercanos agrupados.",
        "Máximo llenado de cada vehículo (factor de carga).",
        "Conducción eficiente (eco-driving): baja entre **5 % y 15 %** el consumo.",
        "Control del consumo de combustible por km recorrido."
      ]
    },
    {
      nombre: "Flota más limpia",
      icono: "camion",
      texto: "Una flota que **contamina cada vez menos**.",
      puntos: [
        "Migración progresiva a vehículos **híbridos o con GNC**.",
        "Incorporación de **unidades eléctricas**.",
        "Mantenimiento preventivo: filtros, alineación, presión y motores.",
        "Neumáticos fuera de uso a **Geocycle**, para su reutilización."
      ]
    },
    {
      nombre: "Gestión de emisiones",
      icono: "grafico",
      texto: "Medimos cada año nuestra **huella de carbono**: el combustible de toda la flota y los kilómetros de cada operación.",
      puntos: [
        "Seguimiento del indicador junto a **CEDOL**.",
        "Monitoreo del consumo energético (incluido el aire acondicionado).",
        "Estimación del carbono equivalente por posibles fugas de gases."
      ]
    },
    {
      nombre: "Eficiencia energética",
      icono: "foco",
      texto: "Optimizamos el consumo de energía en **oficinas y centros logísticos**.",
      puntos: [
        "Uso responsable de la climatización.",
        "Reconversión progresiva a **iluminación LED**.",
        "Programas internos de concientización."
      ]
    },
    {
      nombre: "Riesgos ambientales",
      icono: "escudo",
      texto: "Prevenimos y actuamos **con rapidez y responsabilidad** ante cualquier eventualidad.",
      puntos: [
        "**Kits de contención** en cada unidad.",
        "Capacitación continua para el manejo de derrames.",
        "Protocolos de actuación ante incidentes."
      ]
    },
    {
      nombre: "Reforestación",
      icono: "arboles",
      texto: "Todos los años plantamos **árboles autóctonos** en distintas zonas del país.",
      puntos: [
        "En los espacios verdes de nuestros predios y operaciones.",
        "En zonas estratégicas, junto a fundaciones.",
        "Con jornadas participativas de nuestros equipos."
      ]
    },
    {
      nombre: "Residuos y reciclaje",
      icono: "reciclar",
      texto: "Separamos y reciclamos lo que generan nuestras operaciones.",
      puntos: [
        "Capacitaciones y **tachos separadores**.",
        "Reciclamos cartón y papel junto a **ZYCLAR** y recibimos film recuperado a cambio."
      ]
    },
    {
      nombre: "Despapelización",
      icono: "digital",
      texto: "Con el nuevo **software de transporte**, el conformado pasa a ser digital.",
      puntos: [
        "Menos papel en cada viaje.",
        "Menos árboles talados para producirlo."
      ]
    }
  ]
};
