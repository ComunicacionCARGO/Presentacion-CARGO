/* =====================================================================
   PORTADA Y CARTAS DEL CARRUSEL
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que hay que tocar para cambiar textos y
   cartas de la portada. Se puede abrir con el Bloc de notas.

   REGLAS PARA NO ROMPER NADA:
   • Cambiá solo lo que está ENTRE COMILLAS "..." o los números.
   • No borres las comas del final de cada línea.
   • Si un texto lleva comillas adentro, usá comillas simples: 'así'.
   • Guardá el archivo y recargá la página (tecla F5) para ver el cambio.

   Instrucciones completas en: LEEME - Como editar las cartas.txt
   ===================================================================== */

window.PORTADA = {
  antetitulo: "Tu solución en",
  titulo: "MARCHA",
  sello: "Propuesta de servicio logístico",

  segundosPorVuelta: 40,   // velocidad del carrusel: más alto = más lento
  sentido: 1,              // 1 = gira hacia la derecha, -1 = hacia la izquierda
  intensidadParalaje: 1,   // movimiento con el mouse: 0 = nada, 1 = normal, 2 = el doble
  mostrarNombres: true,    // true = muestra el número y nombre sobre cada carta

  // Palabras que aparecen alrededor de la pantalla con un "camino" hacia las cartas.
  // Se pueden agregar o quitar libremente (cada una entre comillas y separadas por coma).
  palabrasSimultaneas: 4,  // cuántas palabras se ven al mismo tiempo
  palabras: [
    "Trazabilidad",
    "Cross docking",
    "Picking & packing",
    "Inventario en tiempo real",
    "Gestión de stock",
    "Distribución",
    "Almacenaje",
    "Just in time",
    "Abastecimiento",
    "Logística inversa",
    "Cobertura nacional"
  ]
};

/* ---------------------------------------------------------------------
   CARTAS — una por diapositiva. Se pueden agregar las que hagan falta:
   copiá un bloque { ... }, pegalo debajo y cambiá los datos.
   Las cartas son largas y entre todas completan el círculo: con más
   cartas, cada una se hace más corta.

   antetitulo: la palabra chica de arriba (por ejemplo "¿Quiénes").
               Si empieza con "¿", ese signo queda colgado a la izquierda.
   titulo:     la palabra grande (por ejemplo "SOMOS?").
               Si el título es largo, la letra se achica sola para que entre.
               El número (01, 02…) se pone solo, según el orden.
   portada:    foto que se ve "detrás" de la carta, como por una ventana
               (guardala en la carpeta img/cartas). Sirve una foto común,
               horizontal (por ejemplo 2000 × 1125 px), en JPG o WEBP.
               Si se deja vacía "" se muestra una carta de vidrio sin foto.
   foco:       qué parte de la foto se ve, de arriba a abajo:
               0 = la parte de arriba, 50 = el medio, 100 = la de abajo.
   destino:    la diapositiva que se abre al hacer clic.
   --------------------------------------------------------------------- */

window.CARTAS = [
  {
    antetitulo: "¿Quiénes",
    titulo: "SOMOS?",
    portada: "img/cartas/quienes-somos.webp",
    foco: 50,
    destino: "slides/quienes-somos/index.html"
  },
  {
    antetitulo: "Servicio",
    titulo: "DIFERENCIAL",
    portada: "img/cartas/servicio-diferencial.webp",
    foco: 30,
    destino: "slides/servicio-a-medida/index.html"
  },
  {
    antetitulo: "Nuestra",
    titulo: "ESTRUCTURA",
    portada: "img/cartas/nuestra-estructura.jpg",
    foco: 50,
    destino: "slides/nuestra-estructura/index.html"
  }
];
