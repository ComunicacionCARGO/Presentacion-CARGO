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

  antetitulo: "Responsabilidad Social Empresaria",
  titulo: "Hacia un impacto",
  tituloGrande: "CERO",
  texto: "Nos propusimos alcanzar un **impacto cero en nuestra huella de carbono**. Para lograrlo diseñamos un plan con **acciones concretas**.",
  ayuda: "Activá cada palanca",
  ayudaTexto: "Cada acción de nuestro plan baja la aguja del medidor. Activalas una por una para ver cómo llegamos a **impacto cero**.",

  // Medidor: texto de cada punta y lo que dice cuando están todas activadas
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
