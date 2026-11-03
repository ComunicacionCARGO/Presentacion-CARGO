/* =====================================================================
   MEJORA CONTINUA (diapositiva "Nuestra estructura", después de
   "¿Por qué elegirnos?")
   ---------------------------------------------------------------------
   • Cambiá SOLO lo que está entre comillas "...".
   • **texto** = negrita.   *texto* = rojo en cursiva.
   • Cada elemento de una lista va entre comillas y separado por coma
     (el último no lleva coma).
   • Guardá y recargá la página (F5) para ver el cambio.
   ===================================================================== */

window.MEJORA = {

  // ---------- Pantalla partida: las dos opciones ----------
  // La primera va del lado crema (izquierda) y la segunda del lado gris (derecha).
  // icono: sello, birrete, personas, cono, hoja
  opciones: [
    {
      id: "calidad",
      numero: "01",
      titulo: "CALIDAD",
      bajada: "S.C.O.P.E. · Políticas · Certificaciones",
      icono: "sello",
      boton: "Explorar"
    },
    {
      id: "capacitaciones",
      numero: "02",
      titulo: "CAPACITACIONES",
      bajada: "#Exp Aprende · Trabajo en equipo",
      icono: "birrete",
      boton: "Explorar"
    }
  ],

  // =====================================================================
  // CALIDAD
  // =====================================================================
  calidad: {
    titulo: "CALIDAD",

    // 1. ¿Qué es S.C.O.P.E.?
    scope: {
      antetitulo: "¿Qué es",
      titulo: "S.C.O.P.E.?",
      texto: "Es un sistema de **gestión integral propio** basado en **ISO, World Class y DPO** para lograr un **nivel estándar de excelencia** con foco en la **mejora constante de nuestros servicios y operaciones** así también como en la **experiencia de nuestros clientes.**",
      // ¿Qué significa? Cada línea: la letra y el resto de la palabra
      significado: [
        { letra: "S", resto: "ervice Standards," },
        { letra: "C", resto: "ustomer Experience," },
        { letra: "O", resto: "perational" },
        { letra: "P", resto: "erformance &" },
        { letra: "E", resto: "xcellence Vision" }
      ],
      significadoTexto: "Este sistema es un **servicio estándar** enfocado en la **experiencia del cliente, la performance operacional y con alcance de excelencia.**",
      version: "1.0",
      versionTexto: "Hace referencia a la **versión**, ya que es un **sistema vivo, cíclico y en constante evolución.**"
    },

    // 2. Objetivos generales
    objetivosTitulo: "Objetivos generales",
    objetivos: [
      "**Estandarizar y nivelar** nuestras operaciones.",
      "Asegurar un **nivel de servicio con los más altos estándares.**",
      "**Optimizar y equilibrar** el rendimiento general de la organización en todas sus unidades de negocio.",
      "Asegurar **confianza y satisfacción** de nuestros clientes.",
      "Garantizar que nuestros servicios aspiren a la **excelencia, mediante la mejora continua.**",
      "Favorecer la **integración, sinergia y coherencia** entre las distintas unidades de negocio para lograr una gestión unificada y consistente."
    ],

    // 3. Pilares (icono: carretilla, caja, camion, sello, personas, casco, monedas)
    pilaresTitulo: "Pilares",
    pilares: [
      { nombre: "Logística", icono: "carretilla" },
      { nombre: "Warehouse", icono: "caja" },
      { nombre: "Distribución", icono: "camion" },
      { nombre: "Calidad", icono: "sello" },
      { nombre: "Gente", icono: "personas" },
      { nombre: "Higiene & Seguridad", icono: "casco" },
      { nombre: "Costos", icono: "monedas" }
    ],
    pilaresNota: "La cantidad de Pilares y sus nombres, contenidos y aplicabilidad, podrían variar a medida que SCOPE vaya evolucionando.",

    // 4. Políticas (icono: sello, cono, hoja)
    politicasTitulo: "Políticas",
    certificadoPor: "Certificado por IRAM · IQNET",
    politicas: [
      {
        nombre: "Política de Calidad",
        codigo: "CALD001 06",
        norma: "ISO 9001",
        icono: "sello",
        cita: "Grupo CARGO se compromete a ofrecer productos y servicios que satisfagan las necesidades de nuestros clientes por medio de los procesos logísticos e industriales que desarrolla.",
        directrices: [
          "Cumplir los requisitos del cliente, los legales y otros requisitos aplicables.",
          "Exigir calidad en todos los productos, servicios y procesos.",
          "Fomentar la detección temprana de riesgos que puedan afectar al SGC y la prestación de los servicios del cliente.",
          "Promover la mejora continua y desarrollar nuestro equipo de trabajo con personas competentes, motivadas y responsables por la calidad.",
          "Fomentar relaciones de largo plazo con los colaboradores, accionistas.",
          "Contar con un marco adecuado para la definición y seguimiento de objetivos de calidad."
        ]
      },
      {
        nombre: "Política de Seguridad y Salud Ocupacional",
        codigo: "CALD009 02",
        norma: "ISO 45001",
        icono: "cono",
        cita: "Las personas constituyen el pilar más importante de una compañía, garantizan el éxito. Es por eso que Grupo CARGO se compromete a generar un ambiente de trabajo seguro y saludable para nuestros colaboradores y la comunidad.",
        directrices: [
          "Cumplir con la legislación en la materia de Seguridad y Salud Ocupacional y otros requisitos.",
          "Prevenir accidentes y enfermedades profesionales.",
          "Fomentar la detección temprana de riesgos que puedan resultar en accidentes o enfermedades profesionales.",
          "Promover la mejora continua y el aprovechamiento de las oportunidades saludables.",
          "Desarrollar una cultura de ambiente y conductas seguras.",
          "Contar con un marco adecuado para la definición y seguimiento de objetivos y para la consulta y participación de los trabajadores."
        ]
      },
      {
        nombre: "Política Ambiental",
        codigo: "CALD008 02",
        norma: "ISO 14001",
        icono: "hoja",
        cita: "Grupo CARGO se compromete a cuidar el medio ambiente mediante el desarrollo sustentable de sus operaciones y procesos.",
        directrices: [
          "Cumplir con la legislación ambiental y otros requisitos.",
          "Prevenir la polución de aire, suelo y agua.",
          "Minimizar la generación de residuos.",
          "Desarrollar una cultura de hábitos ambientalmente correctos involucrando a colaboradores, proveedores, clientes y a la comunidad.",
          "Fomentar métodos de trabajo orientados al uso eficiente de los recursos naturales.",
          "Contar con un marco adecuado para la definición y seguimiento de objetivos ambientales."
        ]
      }
    ],

    // 5. Certificaciones (sellos)
    certificacionesTitulo: "Certificaciones",
    certificacionesTexto: "Nuestros sistemas de gestión están certificados por **IRAM** e **IQNET** bajo las normas:",
    certificaciones: [
      { norma: "ISO", numero: "9001", nombre: "Gestión de la Calidad", politica: "CALD001 06" },
      { norma: "ISO", numero: "45001", nombre: "Seguridad y Salud Ocupacional", politica: "CALD009 02" },
      { norma: "ISO", numero: "14001", nombre: "Gestión Ambiental", politica: "CALD008 02" }
    ],
    certificadoras: "IRAM · IQNET"
  },

  // =====================================================================
  // CAPACITACIONES
  // =====================================================================
  capacitaciones: {
    titulo: "CAPACITACIONES",

    // 1. #Exp Aprende
    aprende: {
      pestana: "#Exp Aprende",
      titulo: "#Exp Aprende",
      texto: "**En CARGO,** buscamos brindarles a nuestros equipos nuevas **herramientas**, **técnicas** y **conceptos** a través de capacitaciones para poder mejorar nuestro **desempeño** de manera constante.",
      plataforma: "En la nueva plataforma **#Exp Aprende**, podemos capacitar y evaluar a nuestros colaboradores con cursos creados a medida.",
      imagen: "img/slides/nuestra-estructura/exp-aprende.jpg"
    },

    // 2. Trabajo en equipo
    equipo: {
      pestana: "Trabajo en equipo",
      titulo: "Trabajo en equipo",
      texto: "Apostamos en el trabajo en equipo, por eso buscamos a través de programas y capacitaciones, preparar a los miembros y mejorar nuestros grupos de trabajo para poder brindarles a nuestros clientes un **servicio de excelencia.**",
      induccionTitulo: "Inducción",
      induccion: [
        { titulo: "Onboarding", texto: "Proceso de bienvenida y formación inicial de cada nuevo integrante para que se integre rápidamente a la empresa, conozca su cultura y cuente con las herramientas necesarias para desempeñar su rol." },
        { titulo: "Programa de padrinos", texto: "A cada nuevo integrante se le asigna un \"padrino\" con más experiencia, que lo acompaña en sus inicios para facilitar su integración al entorno, los equipos y alinearlo con las necesidades tanto de la empresa como del cliente." }
      ],
      liderazgoTitulo: "Liderazgo",
      liderazgo: "Se trata de capacitaciones orientadas a la **comunicación**, la **toma de decisiones**, la **empatía** y **la gestión de equipos**, generando líderes que sean capaces de guiar, motivar y potenciar el rendimiento del grupo para elevar constantemente el desempeño de los equipos."
    }
  }
};
