/* =====================================================================
   MAPA DE DISTRIBUCIÓN - datos
   ---------------------------------------------------------------------
   NO EDITES ESTE ARCHIVO A MANO.
   Los datos se cambian en el Excel  datos/distribucion.xlsx  y después
   se hace doble clic en  datos/Actualizar mapa de distribucion.bat ,
   que vuelve a escribir este archivo.
   ===================================================================== */
window.DISTRIBUCION = {
  "textos": {
    "sello": "Servicio a medida",
    "antetitulo": "Red de distribución",
    "titulo": "Llegamos a todo el país",
    "bajada": "Una red propia que une nuestros centros logísticos y una red de redespachantes que extiende la cobertura a cada región, con tiempos de entrega definidos."
  },
  "bases": [
    { "nombre": "Córdoba", "provincia": "Córdoba", "lat": -31.4135, "lon": -64.1811, "detalle": "Administración central y centro logístico" },
    { "nombre": "Rosario", "provincia": "Santa Fe", "lat": -32.9468, "lon": -60.6393, "detalle": "Centro logístico" },
    { "nombre": "Buenos Aires", "provincia": "Buenos Aires", "lat": -34.4553, "lon": -58.6522, "detalle": "Centros logísticos Pacheco y Benavídez" }
  ],
  "entreBases": [
    { "desde": "Córdoba", "hasta": "Rosario", "idaYVuelta": false },
    { "desde": "Buenos Aires", "hasta": "Rosario", "idaYVuelta": false },
    { "desde": "Córdoba", "hasta": "Buenos Aires", "idaYVuelta": true }
  ],
  "destinos": [
    { "ciudad": "Jesús María", "provincia": "Córdoba", "lat": -30.9815, "lon": -64.0943, "desde": "Córdoba", "tipo": "propio" },
    { "ciudad": "Rafaela", "provincia": "Santa Fe", "lat": -31.2503, "lon": -61.4867, "desde": "Rosario", "tipo": "propio" },
    { "ciudad": "Paraná", "provincia": "Entre Ríos", "lat": -31.7319, "lon": -60.5238, "desde": "Rosario", "tipo": "propio" },
    { "ciudad": "La Plata", "provincia": "Buenos Aires", "lat": -34.9205, "lon": -57.9536, "desde": "Buenos Aires", "tipo": "propio" },
    { "ciudad": "San Salvador de Jujuy", "provincia": "Jujuy", "lat": -24.1858, "lon": -65.2995, "desde": "Córdoba", "tipo": "redespacho" },
    { "ciudad": "Salta", "provincia": "Salta", "lat": -24.7829, "lon": -65.4232, "desde": "Córdoba", "tipo": "redespacho" },
    { "ciudad": "Formosa", "provincia": "Formosa", "lat": -26.1775, "lon": -58.1781, "desde": "Córdoba", "tipo": "redespacho" },
    { "ciudad": "Pcia. Roque Sáenz Peña", "provincia": "Chaco", "lat": -26.7852, "lon": -60.4388, "desde": "Córdoba", "tipo": "redespacho" },
    { "ciudad": "San Miguel de Tucumán", "provincia": "Tucumán", "lat": -26.8083, "lon": -65.2176, "desde": "Córdoba", "tipo": "redespacho" },
    { "ciudad": "Santiago del Estero", "provincia": "Santiago del Estero", "lat": -27.7951, "lon": -64.2615, "desde": "Córdoba", "tipo": "redespacho" },
    { "ciudad": "Corrientes", "provincia": "Corrientes", "lat": -27.4692, "lon": -58.8306, "desde": "Córdoba", "tipo": "redespacho" },
    { "ciudad": "Catamarca", "provincia": "Catamarca", "lat": -28.4696, "lon": -65.7852, "desde": "Córdoba", "tipo": "redespacho" },
    { "ciudad": "La Rioja", "provincia": "La Rioja", "lat": -29.4131, "lon": -66.8558, "desde": "Córdoba", "tipo": "redespacho" },
    { "ciudad": "San Juan", "provincia": "San Juan", "lat": -31.5375, "lon": -68.5364, "desde": "Córdoba", "tipo": "redespacho" },
    { "ciudad": "Mendoza", "provincia": "Mendoza", "lat": -32.8895, "lon": -68.8458, "desde": "Córdoba", "tipo": "redespacho" },
    { "ciudad": "San Luis", "provincia": "San Luis", "lat": -33.3017, "lon": -66.3378, "desde": "Córdoba", "tipo": "redespacho" },
    { "ciudad": "Río Cuarto", "provincia": "Córdoba", "lat": -33.1307, "lon": -64.3499, "desde": "Córdoba", "tipo": "redespacho" },
    { "ciudad": "Posadas", "provincia": "Misiones", "lat": -27.3671, "lon": -55.8961, "desde": "Buenos Aires", "tipo": "redespacho" },
    { "ciudad": "Mar del Plata", "provincia": "Buenos Aires", "lat": -38.0055, "lon": -57.5426, "desde": "Buenos Aires", "tipo": "redespacho" },
    { "ciudad": "Bahía Blanca", "provincia": "Buenos Aires", "lat": -38.7196, "lon": -62.2724, "desde": "Buenos Aires", "tipo": "redespacho" },
    { "ciudad": "Santa Rosa", "provincia": "La Pampa", "lat": -36.6167, "lon": -64.2833, "desde": "Buenos Aires", "tipo": "redespacho" },
    { "ciudad": "Neuquén", "provincia": "Neuquén", "lat": -38.9516, "lon": -68.0591, "desde": "Buenos Aires", "tipo": "redespacho" },
    { "ciudad": "Viedma", "provincia": "Río Negro", "lat": -40.8135, "lon": -62.9967, "desde": "Buenos Aires", "tipo": "redespacho" },
    { "ciudad": "San Carlos de Bariloche", "provincia": "Río Negro", "lat": -41.1335, "lon": -71.3103, "desde": "Buenos Aires", "tipo": "redespacho" },
    { "ciudad": "Trelew", "provincia": "Chubut", "lat": -43.2489, "lon": -65.3051, "desde": "Buenos Aires", "tipo": "redespacho" },
    { "ciudad": "Comodoro Rivadavia", "provincia": "Chubut", "lat": -45.8641, "lon": -67.4966, "desde": "Buenos Aires", "tipo": "redespacho" },
    { "ciudad": "Río Gallegos", "provincia": "Santa Cruz", "lat": -51.623, "lon": -69.2168, "desde": "Buenos Aires", "tipo": "redespacho" },
    { "ciudad": "Ushuaia", "provincia": "Tierra del Fuego", "lat": -54.8019, "lon": -68.303, "desde": "Buenos Aires", "tipo": "redespacho" }
  ],
  "regiones": [
    { "nombre": "Centro", "desde": 24, "hasta": 48, "color": "#8C8E96" },
    { "nombre": "NOA", "desde": 48, "hasta": 72, "color": "#F4A127" },
    { "nombre": "Cuyo", "desde": 48, "hasta": 96, "color": "#C9654A" },
    { "nombre": "NEA", "desde": 72, "hasta": 96, "color": "#4C956C" },
    { "nombre": "Patagonia", "desde": 72, "hasta": 144, "color": "#759AAB" }
  ],
  "provincias": [
    { "nombre": "Buenos Aires", "region": "Centro" },
    { "nombre": "Córdoba", "region": "Centro" },
    { "nombre": "Santa Fe", "region": "Centro" },
    { "nombre": "Entre Ríos", "region": "Centro" },
    { "nombre": "Jujuy", "region": "NOA" },
    { "nombre": "Salta", "region": "NOA" },
    { "nombre": "Tucumán", "region": "NOA" },
    { "nombre": "Catamarca", "region": "NOA" },
    { "nombre": "Santiago del Estero", "region": "NOA" },
    { "nombre": "Mendoza", "region": "Cuyo" },
    { "nombre": "San Juan", "region": "Cuyo" },
    { "nombre": "San Luis", "region": "Cuyo" },
    { "nombre": "La Rioja", "region": "Cuyo" },
    { "nombre": "Formosa", "region": "NEA" },
    { "nombre": "Chaco", "region": "NEA" },
    { "nombre": "Corrientes", "region": "NEA" },
    { "nombre": "Misiones", "region": "NEA" },
    { "nombre": "La Pampa", "region": "Patagonia" },
    { "nombre": "Neuquén", "region": "Patagonia" },
    { "nombre": "Río Negro", "region": "Patagonia" },
    { "nombre": "Chubut", "region": "Patagonia" },
    { "nombre": "Santa Cruz", "region": "Patagonia" },
    { "nombre": "Tierra del Fuego", "region": "Patagonia" }
  ]
};
