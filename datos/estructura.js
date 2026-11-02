/* =====================================================================
   DIAPOSITIVA "NUESTRA ESTRUCTURA"
   ---------------------------------------------------------------------
   Se abre con el Bloc de notas. Cambiá solo lo que está entre comillas
   y los números. Para poner una parte en NEGRITA, encerrala entre dos
   asteriscos:  **así**   y para destacarla en rojo y cursiva, entre uno:  *así*
   Guardá y recargá la presentación (F5).
   ===================================================================== */

window.ESTRUCTURA = {

  antetitulo: "Nuestra",
  titulo: "ESTRUCTURA",
  bajada: "Un equipo interconectado: cada área sostiene y potencia a las demás.",
  ayuda: "Tocá cada área para conocerla",

  // Título que aparece al bajar con el scroll (después de la transición de anillos)
  mejoraAntetitulo: "Mejora",
  mejoraTitulo: "CONTINUA",

  /* Cada área es una burbuja de la red. Tiene:
     id:      nombre corto sin espacios ni acentos (no se ve; no lo repitas).
     nombre:  lo que aparece debajo de la burbuja.
     titulo:  el título de la tarjeta (si se deja "", usa el nombre).
     nivel:   0 = centro (la dirección), 1 = áreas principales (burbujas grandes),
              2 = áreas medianas, 3 = áreas de servicio (borde de la red).
              Las áreas de un mismo nivel se ubican en un anillo, en el orden de esta lista.
     icono:   ícono incluido: direccion, logistica, sistemas, calidad, seguridad, salud,
              personas, facturacion, finanzas, compras, legajo, relaciones, impuestos,
              tesoreria, contabilidad, comercial, legal, comunicacion
     imagen:  (opcional) tu propio ícono en SVG, en la carpeta img/estructura
              (por ejemplo "img/estructura/logistica.svg"). Si no está, se usa "icono".

     Contenido de la tarjeta (todos opcionales, se muestran en este orden):
     intro:       párrafo de presentación.
     subtitulo:   título chico en rojo (por ejemplo "Responsabilidades").
     destacados:  2 a 4 recuadros numerados, cada uno con titulo y texto.
     lista:       viñetas.
     parrafos:    párrafos sueltos.
     nota:        frase de cierre resaltada.
     personas:    lista de cargo y nombre (se usa en la dirección).
     Si una tarjeta tiene mucho texto, la letra se achica sola para que entre. */
  areas: [
    {
      id: "direccion", nombre: "Dirección", titulo: "Autoridades", nivel: 0, icono: "direccion", imagen: "",
      personas: [
        { cargo: "Presidente y director titular", nombre: "Luciano Bernardi" },
        { cargo: "Directora titular", nombre: "Florencia Bernardi" },
        { cargo: "Directora titular", nombre: "Carolina Bernardi" },
        { cargo: "Director general", nombre: "Leonardo Ferreyra" },
        { cargo: "Directora de Administración y Finanzas", nombre: "Gabriela Kirigin" },
        { cargo: "Director de Operaciones", nombre: "Emiliano Karlen" }
      ]
    },

    // ---------- Nivel 1: áreas principales ----------
    {
      id: "logistica", nombre: "Logística", titulo: "", nivel: 1, icono: "logistica", imagen: "",
      destacados: [
        { titulo: "Servicios generales", texto: "Diseño, implementación y evaluación de proyectos. Dirección técnica. Soporte al desarrollo de sistemas de gestión (TMS, WMS)." },
        { titulo: "Ingeniería de transportes", texto: "Distribución de repuestos, multimodal, carga general, expreso, distribución, contenedores e infraestructura." },
        { titulo: "Infraestructura automotriz", texto: "Almacén, aprovisionamiento de línea, secuenciado, JIT, Kanban, diseño de embalajes, inventarios cíclicos, playa de contenedores, MTM." }
      ]
    },
    {
      id: "sistemas", nombre: "I+D+I y Sistemas", titulo: "I+D+I & Sistemas", nivel: 1, icono: "sistemas", imagen: "",
      lista: [
        "Desarrollo e implementación de **soluciones digitales** que mejoren la *trazabilidad, eficiencia y calidad del servicio*.",
        "**Automatización de procesos** y mejora de la conectividad entre sucursales.",
        "Investigación de nuevas tecnologías aplicadas **a logística 4.0**: *inteligencia artificial, big data, IoT, sensores en camiones, entre otros*.",
        "**Soporte técnico y mantenimiento** de la infraestructura informática y comunicaciones.",
        "Gestión de **seguridad** informática, **protección** de datos y **ciberseguridad**."
      ]
    },
    {
      id: "comercial", nombre: "Área Comercial", titulo: "", nivel: 1, icono: "comercial", imagen: "",
      intro: "Responsable de **desarrollar y mantener la cartera de clientes**, promoviendo los servicios logísticos y asegurando la satisfacción.",
      subtitulo: "Principales tareas",
      lista: [
        "Captación de nuevos clientes y desarrollo de oportunidades de negocio.",
        "Armado de presupuestos, cotizaciones y contratos de servicios de transporte, almacenaje y distribución.",
        "Seguimiento postventa, fidelización y atención personalizada.",
        "Análisis de mercado y benchmarking de servicios.",
        "Coordinación con Operaciones para garantizar que se cumplan los estándares pactados con el cliente."
      ]
    },
    {
      id: "calidad", nombre: "Calidad", titulo: "", nivel: 1, icono: "calidad", imagen: "",
      intro: "Todos los servicios prestados por **Grupo Cargo** están regidos por un *Sistema de Gestión de Calidad* que toma como referencia la norma internacional **ISO 9001**. Está compuesto por procedimientos e instructivos propios de cada unidad de negocio y procedimientos corporativos aplicables a todos los procesos.",
      subtitulo: "Se basa en 3 pilares fundamentales",
      destacados: [
        { titulo: "Sistema de Gestión Integrado", texto: "" },
        { titulo: "Mejora de procesos", texto: "Kaizen" },
        { titulo: "Metodología 5S", texto: "Seiri, Seiton, Seiso, Seiketsu, Shitsuke" }
      ]
    },

    // ---------- Nivel 2 ----------
    {
      id: "rrhh", nombre: "Recursos Humanos", titulo: "", nivel: 2, icono: "personas", imagen: "",
      intro: "Es el área encargada de administrar el capital humano de la empresa, fomentando un entorno de trabajo **saludable, productivo y alineado con los valores organizacionales**.",
      subtitulo: "Principales responsabilidades",
      lista: [
        "Atracción, selección y onboarding de nuevos talentos, tanto operativos como administrativos.",
        "Gestión de procesos de capacitación, desarrollo de carrera y evaluación de desempeño.",
        "Clima organizacional, comunicación interna y resolución de conflictos.",
        "Administración de legajos, licencias, ART y nóminas.",
        "Implementación de acciones para mejorar el bienestar y la motivación del personal.",
        "Beneficios corporativos."
      ]
    },
    {
      id: "finanzas", nombre: "Finanzas", titulo: "", nivel: 2, icono: "finanzas", imagen: "",
      intro: "Nuestra área de finanzas es el motor que garantiza **decisiones sólidas**: asegura la confiabilidad de cada requerimiento financiero y bancario, gestionando los recursos de forma:",
      destacados: [
        { titulo: "Eficiente", texto: "" },
        { titulo: "Ordenada", texto: "" },
        { titulo: "Transparente", texto: "" }
      ],
      nota: "Genera información clave para anticiparnos, tomar decisiones estratégicas y acompañar el crecimiento sostenible del negocio."
    },
    {
      id: "compras", nombre: "Compras", titulo: "", nivel: 2, icono: "compras", imagen: "",
      intro: "Gestiona de forma eficiente los procesos de adquisición de bienes y servicios necesarios para el funcionamiento operativo y administrativo.",
      subtitulo: "Responsabilidades",
      lista: [
        "Identificación de necesidades de insumos, repuestos, servicios, herramientas y tecnología.",
        "Búsqueda, evaluación y negociación con proveedores estratégicos.",
        "Control de stock crítico y optimización de niveles de inventario.",
        "Generación de órdenes de compra, seguimiento de entregas y evaluación de calidad.",
        "Implementación de políticas de compras responsables y sostenibles."
      ]
    },
    {
      id: "legal", nombre: "Área Legal", titulo: "", nivel: 2, icono: "legal", imagen: "",
      intro: "Asiste a la empresa en **todos los aspectos jurídicos y regulatorios necesarios para operar en el sector logístico y de transporte**.",
      subtitulo: "Actividades destacadas",
      lista: [
        "Elaboración, análisis y seguimiento de contratos comerciales con clientes, proveedores y convenios con terceros.",
        "Asesoramiento en derecho laboral, civil, comercial, de transporte y ambiental.",
        "Representación legal ante organismos gubernamentales, juicios o auditorías.",
        "Monitoreo de normativas vigentes que afecten la operación (transporte de cargas, seguridad vial, licencias, etc.).",
        "Soporte en la elaboración de políticas internas (acoso, privacidad, compliance)."
      ]
    },
    {
      id: "seguridad", nombre: "Seguridad e Higiene", titulo: "Seguridad & Higiene", nivel: 2, icono: "seguridad", imagen: "",
      subtitulo: "Objetivos del área",
      lista: [
        "Proteger la vida y preservar la integridad psicofísica de los trabajadores.",
        "Prevenir riesgos que conduzcan a posibles accidentes o enfermedades de trabajo.",
        "Estimular y desarrollar en todas las personas una actitud o conducta preventiva.",
        "Promover y mantener adecuadas condiciones ambientales."
      ]
    },

    // ---------- Nivel 3: áreas de servicio ----------
    {
      id: "personal", nombre: "Administración de Personal", titulo: "", nivel: 3, icono: "legajo", imagen: "",
      intro: "Gestiona de forma integral los procesos administrativos vinculados al **ciclo laboral de los colaboradores**.",
      subtitulo: "Sus principales funciones",
      destacados: [
        { titulo: "Gestión de altas y bajas en el sistema ARCA", texto: "" },
        { titulo: "Liquidación mensual", texto: "" },
        { titulo: "Final de haberes", texto: "" }
      ],
      nota: "Desde ADP se garantiza el cumplimiento de las obligaciones legales y los convenios laborales vigentes, con una administración ordenada, eficiente y alineada con las necesidades operativas de la compañía."
    },
    {
      id: "relaciones", nombre: "Relaciones Laborales", titulo: "", nivel: 3, icono: "relaciones", imagen: "",
      intro: "Se enfoca en la **interacción de la empresa y los trabajadores**, asegurando:",
      destacados: [
        { titulo: "El cumplimiento de la ley laboral", texto: "" },
        { titulo: "Convenios colectivos y negociación con el sindicato", texto: "" }
      ]
    },
    {
      id: "facturacion", nombre: "Facturación y Cobranzas", titulo: "", nivel: 3, icono: "facturacion", imagen: "",
      intro: "Nos asegura la **correcta gestión del ciclo económico de nuestras operaciones**.",
      parrafos: [
        "*Emite y administra*, de forma precisa y oportuna, los documentos comerciales vinculados a la prestación de servicios, conforme a los acuerdos con nuestros clientes.",
        "Además, *lidera el proceso de cobranzas*, con un seguimiento activo de las cuentas por cobrar y **manteniendo una relación fluida con los clientes**, garantizando el cumplimiento de los plazos pactados."
      ]
    },
    {
      id: "tesoreria", nombre: "Tesorería y Cuentas a Pagar", titulo: "", nivel: 3, icono: "tesoreria", imagen: "",
      intro: "Asegura la disponibilidad de fondos necesarios para el **funcionamiento diario de la operación**.",
      parrafos: [
        "Administra pagos a proveedores críticos (combustible, mantenimiento, seguros, peajes, etc.), conciliaciones bancarias y flujos de caja."
      ],
      nota: "Su rol es clave para evitar interrupciones en la cadena de suministro y mantener relaciones comerciales sólidas y confiables, con sistemas como ebuyplace para agilizar el registro y el proceso de pago."
    },
    {
      id: "contabilidad", nombre: "Contabilidad", titulo: "", nivel: 3, icono: "contabilidad", imagen: "",
      intro: "Garantiza la registración precisa y oportuna de las **operaciones financieras de la compañía**.",
      parrafos: [
        "Su trabajo permite contar **con información confiable para la toma de decisiones**, garantiza el cumplimiento de las normativas contables y brinda soporte tanto a auditorías internas como externas."
      ],
      nota: "Además, colabora de forma activa con las áreas operativas para asegurar la trazabilidad de los costos y resultados de cada unidad de negocio."
    },
    {
      id: "impuestos", nombre: "Impuestos", titulo: "", nivel: 3, icono: "impuestos", imagen: "",
      intro: "Garantiza el cumplimiento integral de las **obligaciones fiscales** en los ámbitos nacional, provincial y municipal.",
      lista: [
        "Analiza de forma permanente el **impacto tributario de las actividades del negocio**.",
        "Trabaja con un **enfoque preventivo y de mejora continua**, minimizando riesgos legales, asegurando la **transparencia fiscal** y **optimizando la carga impositiva**."
      ]
    },
    {
      id: "comunicacion", nombre: "Comunicación y Diseño", titulo: "", nivel: 3, icono: "comunicacion", imagen: "",
      intro: "Encargada de diseñar, **gestionar y alinear los mensajes visuales y verbales de la empresa**, tanto hacia el interior como hacia el exterior.",
      subtitulo: "Responsabilidades",
      lista: [
        "Diseño gráfico de piezas institucionales, presentaciones, branding, manuales de identidad y señalética.",
        "Gestión de redes sociales, página web y comunicación con medios de prensa.",
        "Comunicación interna: campañas, newsletters, eventos corporativos y actividades de cultura organizacional.",
        "Apoyo visual y comunicacional a todas las áreas que lo requieran (RRHH, comercial, seguridad, etc.).",
        "Producción de contenidos audiovisuales y diseño para entornos físicos y digitales."
      ]
    },
    {
      id: "salud", nombre: "Salud Ocupacional", titulo: "", nivel: 3, icono: "salud", imagen: "",
      intro: "Área transversal que promueve el **cuidado integral de la salud física, mental y emocional** de todo el personal.",
      subtitulo: "Objetivos del área",
      lista: [
        "Soporte en las evaluaciones médicas de ingreso y periódicas, y seguimiento de ausentismo.",
        "Implementación de programas preventivos: ergonomía, pausas activas, estrés laboral, alimentación saludable.",
        "Coordinación con la ART, control de incidentes laborales y acciones correctivas.",
        "Campañas de salud, vacunación, controles clínicos y concientización."
      ]
    }
  ]
};
