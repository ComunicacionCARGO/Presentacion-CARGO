/* =========================================================
   GUÍAS — los carteles que indican qué se puede tocar
   (los usa compartido/guia.js en todas las páginas)

   - El cartel de "Bajá para seguir" aparece abajo cuando la persona
     se queda quieta un rato en una diapositiva larga.
   - Los carteles con la mano aparecen sobre cada cosa que se puede
     tocar, hasta que la persona la usa por primera vez.

   Cómo editar:
   - Cambiá solo lo que está entre comillas.
   - **texto** se ve en negrita y en rojo.
   - texto:  lo que se ve en la computadora (con mouse).
     tactil: lo que se ve en celulares y tablets (con el dedo).
   ========================================================= */
window.GUIAS = {

  // ---------- Cartel de abajo (diapositivas largas) ----------
  scroll:              { texto: "**Bajá** con la rueda del mouse para seguir",  tactil: "**Deslizá hacia arriba** para seguir" },
  // si nadie baja, el cartel vuelve a aparecer después de estos segundos sin moverse
  segundosSinBajar: 6,

  // ---------- Portada ----------
  portadaCartas:       { texto: "**Hacé clic** en una carta para entrar · arrastrá para girar", tactil: "**Tocá** una carta para entrar · deslizá para girar" },

  // ---------- ¿Quiénes somos? ----------
  lineaDeTiempo:       { texto: "**Hacé clic** en un año para ver su historia",   tactil: "**Tocá** un año para ver su historia" },
  mapaPaises:          { texto: "**Pasá el mouse** por Argentina o Brasil",        tactil: "**Tocá** Argentina o Brasil" },
  estructura:          { texto: "**Hacé clic** en un área para conocerla",          tactil: "**Tocá** un área para conocerla" },
  politicas:           { texto: "**Hacé clic** en cada política",                   tactil: "**Tocá** cada política" },

  // ---------- Servicio a medida ----------
  entradaPartes:       { texto: "**Hacé clic** para ir directo a cada parte",       tactil: "**Tocá** para ir directo a cada parte" },
  tmsLector:           { texto: "**Pasá el mouse** por un bulto para leerlo",       tactil: "**Tocá** un bulto para leerlo" },
  tmsInterfases:       { texto: "**Hacé clic** para ver las interfases",            tactil: "**Tocá** para ver las interfases" },
  tablerosPestana:     { texto: "**Hacé clic** para ver el tablero de logística inversa", tactil: "**Tocá** para ver el tablero de logística inversa" },
  tablerosPuntos:      { texto: "**Pasá el mouse** por los meses",                  tactil: "**Tocá** un mes para ver el detalle" },
  tablerosBarras:      { texto: "**Hacé clic** en una barra para ver esa provincia", tactil: "**Tocá** una barra para ver esa provincia" },
  ventajas:            { texto: "**Pasá el mouse** por cada ventaja",               tactil: "**Tocá** cada ventaja" },
  mapaProvincias:      { texto: "**Hacé clic** en una provincia para ver sus rutas", tactil: "**Tocá** una provincia para ver sus rutas" },
  mapaFlujograma:      { texto: "**Hacé clic** para ver el flujograma de la provincia", tactil: "**Tocá** para ver el flujograma de la provincia" },

  // ---------- ¿Por qué elegirnos? ----------
  mejoraLados:         { texto: "**Hacé clic** en un lado para entrar",             tactil: "**Tocá** un lado para entrar" },
  temaSecciones:       { texto: "**Hacé clic** en las pestañas o usá la rueda",     tactil: "**Tocá** las pestañas o deslizá" },
  pilares:             { texto: "**Pasá el mouse** por cada pilar",                 tactil: "**Tocá** cada pilar" },
  palancas:            { texto: "**Hacé clic** en una palanca para activarla",      tactil: "**Tocá** una palanca para activarla" },
  reciclaje:           { texto: "**Pasá el mouse** por cada mes",                   tactil: "**Tocá** cada mes" },
  clientesRubros:      { texto: "**Hacé clic** en un rubro para filtrar",           tactil: "**Tocá** un rubro para filtrar" }
};
