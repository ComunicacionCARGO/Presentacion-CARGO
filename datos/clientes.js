/* =====================================================================
   NUESTROS CLIENTES (final de la diapositiva "¿Por qué elegirnos?")
   ---------------------------------------------------------------------
   Los logos se muestran en una grilla y se pueden filtrar por rubro.
   • Cambiá SOLO lo que está entre comillas "...".
   • Cada cliente: nombre, imagen (archivo PNG o SVG con fondo transparente,
     en blanco, guardado en img/clientes/) y rubro (uno de la lista "rubros",
     escrito igual).
   • Para agregar un cliente, copiá un renglón completo con su coma.
   • Los clientes aparecen en este orden (de izquierda a derecha y de arriba
     hacia abajo); conviene dejarlos agrupados por rubro.
   • Guardá y recargá la página (F5) para ver el cambio.
   ===================================================================== */

window.CLIENTES = {

  titulo: "Nuestros",
  tituloGrande: "CLIENTES",
  // contador: "36 marcas nos eligieron" / con un rubro elegido: "12 en Automotriz"
  contadorTexto: "marcas nos eligieron",
  contadorRubro: "en",
  todos: "Todos",
  volver: "Volver al inicio",

  // Rubros (botones para filtrar). OJO: verificar en qué rubro va cada cliente.
  rubros: ["Automotriz", "Consumo masivo", "Industria y construcción", "Energía"],

  clientes: [
    { nombre: "Ford", imagen: "ford.png", rubro: "Automotriz" },
    { nombre: "Volkswagen", imagen: "volkswagen.png", rubro: "Automotriz" },
    { nombre: "Stellantis", imagen: "stellantis.png", rubro: "Automotriz" },
    { nombre: "Renault", imagen: "renault.png", rubro: "Automotriz" },
    { nombre: "Nissan", imagen: "nissan.png", rubro: "Automotriz" },
    { nombre: "Audi", imagen: "audi.png", rubro: "Automotriz" },
    { nombre: "Scania", imagen: "scania.png", rubro: "Automotriz" },
    { nombre: "Iveco", imagen: "iveco.png", rubro: "Automotriz" },
    { nombre: "CNH Industrial", imagen: "cnh-industrial.png", rubro: "Automotriz" },
    { nombre: "John Deere", imagen: "john-deere.png", rubro: "Automotriz" },
    { nombre: "Maxion Montich", imagen: "maxion-montich.png", rubro: "Automotriz" },
    { nombre: "Nemak", imagen: "nemak.png", rubro: "Automotriz" },

    { nombre: "Arcor", imagen: "arcor.png", rubro: "Consumo masivo" },
    { nombre: "AB InBev", imagen: "ab-inbev.png", rubro: "Consumo masivo" },
    { nombre: "Quilmes", imagen: "quilmes.png", rubro: "Consumo masivo" },
    { nombre: "PepsiCo", imagen: "pepsico.png", rubro: "Consumo masivo" },
    { nombre: "Unilever", imagen: "unilever.png", rubro: "Consumo masivo" },
    { nombre: "Chandon", imagen: "chandon.png", rubro: "Consumo masivo" },
    { nombre: "Paclín", imagen: "paclin.png", rubro: "Consumo masivo" },
    { nombre: "Puma", imagen: "puma.png", rubro: "Consumo masivo" },
    { nombre: "Farmesa", imagen: "farmesa.png", rubro: "Consumo masivo" },
    { nombre: "Georgalos", imagen: "georgalos.png", rubro: "Consumo masivo" },

    { nombre: "Whirlpool", imagen: "whirlpool.png", rubro: "Industria y construcción" },
    { nombre: "Siemens", imagen: "siemens.png", rubro: "Industria y construcción" },
    { nombre: "Alladio", imagen: "alladio.png", rubro: "Industria y construcción" },
    { nombre: "Cerro Negro", imagen: "cerro-negro.png", rubro: "Industria y construcción" },
    { nombre: "Red Copmaco", imagen: "red-copmaco.png", rubro: "Industria y construcción" },
    { nombre: "AMG Obras Civiles", imagen: "amg.png", rubro: "Industria y construcción" },
    { nombre: "Nibbler", imagen: "nibbler.png", rubro: "Industria y construcción" },
    { nombre: "Gemplast", imagen: "gemplast.png", rubro: "Industria y construcción" },
    { nombre: "Plotter Service", imagen: "plotter-service.png", rubro: "Industria y construcción" },
    { nombre: "Cambras", imagen: "cambras.png", rubro: "Industria y construcción" },
    { nombre: "Vitnik", imagen: "vitnik.png", rubro: "Industria y construcción" },

    { nombre: "YPF", imagen: "ypf.png", rubro: "Energía" },
    { nombre: "Axion Energy", imagen: "axion.png", rubro: "Energía" },
    { nombre: "BR", imagen: "br.png", rubro: "Energía" }
  ]
};
