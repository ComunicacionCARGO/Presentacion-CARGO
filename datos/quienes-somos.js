/* =====================================================================
   DIAPOSITIVA "¿QUIÉNES SOMOS?"
   ---------------------------------------------------------------------
   Se abre con el Bloc de notas. Cambiá solo lo que está entre comillas
   y los números. Para poner una parte en NEGRITA, encerrala entre dos
   asteriscos:   **así queda en negrita**
   Guardá y recargá la presentación (F5).
   ===================================================================== */

window.QUIENES_SOMOS = {

  // ---------- Portada de la diapositiva ----------
  pregunta: "Una forma inteligente de hacer logística.",

  // Frase debajo del camión
  lema: "Manejando la logística de la región.",

  // ---------- Línea de tiempo ----------
  titulo: "¿Quiénes somos?",
  historia: "**Grupo CARGO** es una empresa de logística fundada en **1980.** En 1998 sumamos **CSI CARGO en Brasil** y consolidamos nuestro servicio a **nivel internacional.**",

  /* Cada año de la línea de tiempo es un bloque { ... }.
     anio:   el año que aparece en la línea.
     foto:   imagen del año, guardada en la carpeta img/linea-de-tiempo
             (por ejemplo "img/linea-de-tiempo/1980.jpg"). Se muestra
             automáticamente con estilo de grabado en blanco y negro.
     dibujo: si no hay foto, la ilustración que se muestra. Opciones:
             camion-clasico, fabrica, alimentos, autoelevador, contenedor, camion-moderno
     hitos:  lo que pasó en ese período. Cada hito tiene su año (opcional)
             y su texto. Se pueden poner varios, separados por coma.
             Con anio: "*" el hito es un comentario sobre la década:
             aparece con un asterisco y el texto en cursiva.
     Para agregar un año: copiá un bloque completo con su coma y pegalo
     en el lugar que corresponda. La línea se reacomoda sola. */
  lineaDeTiempo: [
    {
      anio: "1980",
      foto: "",
      dibujo: "camion-clasico",
      hitos: [
        { anio: "", texto: "Nace la empresa con la creación de **EXPRESO CARGO.**" }
      ]
    },
    {
      anio: "1990",
      foto: "",
      dibujo: "fabrica",
      hitos: [
        { anio: "1994", texto: "Se crea CARGO Servicios Industriales Servicios Logísticos, afianzándonos en el rubro automotriz." },
        { anio: "1998", texto: "Desembarco en Brasil." },
        { anio: "*", texto: "En esta década comenzamos a trabajar con grandes marcas del rubro incluyendo Ford Argentina." }
      ]
    },
    {
      anio: "2000",
      foto: "",
      dibujo: "alimentos",
      hitos: [
        { anio: "2000", texto: "Llevamos a cabo tareas de **distribución de P&A** y transporte **Milk Run.**" },
        { anio: "2002", texto: "Comienza el servicio de distribución de alimentos y bebidas." },
        { anio: "*", texto: "A su vez en esta década realizamos alianzas con grandes marcas del rubro automotriz, agrícola y alimenticia llevando a cabo la distribución y actuando como operadores logísticos integrales." }
      ]
    },
    {
      anio: "2010",
      foto: "",
      dibujo: "autoelevador",
      hitos: [
        { anio: "2010", texto: "Se consolidó el servicio de warehousing y distribución de repuestos como uno de nuestros servicios principales." }
      ]
    },
    {
      anio: "2020",
      foto: "",
      dibujo: "contenedor",
      hitos: [
        { anio: "2025", texto: "En diciembre, Grupo CARGO cumple **45 años** de trayectoria." }
      ]
    }
  ],

  // ---------- Mapa y números ----------
  numerosTitulo: "Grupo CARGO en números",

  // Subtítulo que separa los datos destacados del resto ("" para no mostrarlo)
  numerosOperativosTitulo: "Datos operativos",

  /* Cada dato tiene:
     prefijo:   lo que va antes del número (por ejemplo "+"), o "" si no lleva.
     valor:     el número SIN puntos ni comas (se cuenta animado hasta llegar a él).
     sufijo:    lo que va después del número (por ejemplo " m²"), o "".
     texto:     la descripción.
     icono:     uno de estos: ubicacion, deposito, racks, personas, camion, ruta, contenedor
     destacado: true para mostrarlo grande, arriba de todo (conviene que sean dos).
                Los que no lo tienen van más chicos, debajo de "Datos operativos". */
  numeros: [
    { prefijo: "",  valor: 23,     sufijo: "",      texto: "bases operativas en Argentina y Brasil", icono: "ubicacion", destacado: true },
    { prefijo: "+", valor: 372000, sufijo: " m²",   texto: "de superficie de depósitos",             icono: "deposito",  destacado: true },
    { prefijo: "+", valor: 145000, sufijo: " m²",   texto: "de almacenaje en racks",                 icono: "racks" },
    { prefijo: "+", valor: 2450,   sufijo: "",      texto: "colaboradores",                          icono: "personas" },
    { prefijo: "+", valor: 250,    sufijo: "",      texto: "vehículos de flota a disposición",       icono: "camion" },
    { prefijo: "+", valor: 10,     sufijo: " M km", texto: "recorridos por año",                     icono: "ruta" },
    { prefijo: "+", valor: 4500,   sufijo: "",      texto: "contenedores movilizados por año",       icono: "contenedor" }
  ],

  // ---------- Logros (cierre de la diapositiva) ----------
  logrosAntetitulo: "Nuestros",
  logrosTitulo: "LOGROS",
  logrosNota: "*Distribution Process Optimization (DPO) y World Class Manufacturing (WCM) son dos sistemas de gestión que garantizan la calidad de nuestros servicios.",

  /* Cada tarjeta de vidrio tiene:
     icono:   uno de estos: insignia, engranaje, trofeo, medalla
     sigla:   etiqueta chica junto al ícono (por ejemplo "DPO"), o "" si no lleva.
     titulo:  la operación.
     premios: lista de reconocimientos. Cada uno tiene su texto y, si querés,
              la fuente o programa ("DPO", "WCM"...), que se ve en rojo y cursiva.
     texto:   explicación debajo de los premios, o "" si no lleva.
     Si una tarjeta tiene mucho texto, la letra se achica sola para que entre. */
  logros: [
    {
      icono: "insignia",
      sigla: "DPO",
      titulo: "Operación de Consumo Masivo",
      premios: [
        { texto: "1° Puesto CD Tucumán en Sudamérica", fuente: "DPO" },
        { texto: "4° Puesto CD Tucumán Mundial", fuente: "DPO" },
        { texto: "CD Córdoba Top Performance en SAZ", fuente: "DPO" },
        { texto: "CD Córdoba Mejor Pilar People en SAZ", fuente: "Convención Supply Chain Ambev" }
      ],
      texto: ""
    },
    {
      icono: "engranaje",
      sigla: "WCM",
      titulo: "Operación FCA Cba",
      premios: [
        { texto: "Planta Plata", fuente: "WCM" },
        { texto: "KAIZEN", fuente: "Final" }
      ],
      texto: "En nuestra planta del cliente FCA-Chrysler en Córdoba, logramos el reconocimiento de **Planta Plata.** También llegamos a instancias finales en el programa **KAIZEN.**"
    },
    {
      icono: "trofeo",
      sigla: "",
      titulo: "Operación P&A",
      premios: [
        { texto: "1° Puesto MPR Renault", fuente: "" }
      ],
      texto: "En el caso de Renault, nos reconocieron por la **calidad del servicio postventa** de todas las automotrices en Brasil."
    },
    {
      icono: "medalla",
      sigla: "",
      titulo: "Operación CMQ CBA",
      premios: [
        { texto: "Operador Logístico #1", fuente: "GETrans" },
        { texto: "Premio a las mejores prácticas", fuente: "" }
      ],
      texto: "Reconocimientos a nuestro Centro de Distribución en Córdoba del programa **GETrans** de nuestro cliente Quilmes."
    }
  ],

  /* Sedes que aparecen al pasar el cursor por Argentina o Brasil.
     pais:      "AR" o "BR".
     ciudad:    nombre que se muestra.
     detalle:   texto chico debajo de la ciudad.
     lon / lat: ubicación (longitud y latitud; se pueden copiar de Google Maps:
                clic derecho sobre el lugar → los números son  lat, lon).
     principal: true en la sede principal de cada país (de ahí sale la línea de la tarjeta).
     Ubicaciones estimadas a partir de información pública: conviene verificarlas. */
  sedes: [
    { pais: "AR", ciudad: "Córdoba", detalle: "Administración central, Centro Logístico Córdoba, CD Quilmes CBA, Depósito Georgalos y STELLANTIS", lon: -64.18, lat: -31.40, principal: true },
    { pais: "AR", ciudad: "Buenos Aires", detalle: "C.L. Benavidez, C.L. Pacheco y Plaza Logística (TIGRE) • Centro logístico Pepirí (CABA)", lon: -58.62, lat: -34.45 },
    { pais: "AR", ciudad: "Rosario", detalle: "Centro logístico Rosario", lon: -60.69, lat: -32.95 },
    { pais: "AR", ciudad: "San Miguel de Tucumán", detalle: "CD Quilmes Tucumán", lon: -65.21, lat: -26.82 },
    { pais: "BR", ciudad: "São José dos Pinhais (PR)", detalle: "Matriz CSI CARGO · centros logísticos CL-I y CL-II", lon: -49.17, lat: -25.53, principal: true },
    { pais: "BR", ciudad: "Jundiaí (SP)", detalle: "Unidad operativa", lon: -46.88, lat: -23.19 },
    { pais: "BR", ciudad: "Uruguaiana (RS)", detalle: "Centro de distribución", lon: -57.09, lat: -29.75 }   // dato de 2009: verificar
  ]
};
