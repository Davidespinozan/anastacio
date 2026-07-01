// ═══ BRANCH CONFIG — Anastacio Marisquería ═══
// Culiacán es la única sucursal (Guadalajara cerró). Cualquier ruta (/,
// /gdl, /cln) resuelve a Culiacán; /gdl se redirige a /cln en _redirects.

var BRANCH_CONFIGS = {
  cln: {
    slug: 'cln',
    city: 'Culiacán',
    whatsapp: '526677852780',
    instagram: '@anastacio_marisqueriadebarrio',
    instagramUrl: 'https://instagram.com/anastacio_marisqueriadebarrio',
    googleReviewUrl: 'https://maps.google.com/?q=Anastacio+Marisqueria+de+Barrio,+Cdad+de+Puebla+1318,+Las+Quintas,+Culiacan',
    googleMapsEmbed: 'https://maps.google.com/maps?q=Anastacio+Marisqueria+de+Barrio,+Cdad+de+Puebla+1318,+Las+Quintas,+Culiacan&output=embed&z=16',
    googleMapsUrl: 'https://maps.google.com/?q=Anastacio+Marisqueria+de+Barrio,+Cdad+de+Puebla+1318,+Las+Quintas,+Culiacan',
    address: 'Cdad. de Puebla 1318, Las Quintas',
    metaPixelId: '1564615811495027',   // Pixel único de la marca (reutilizado)
    footerCity: 'CULIACÁN',
    timeZone: 'America/Mazatlan'
  }
};

// Sucursal única: siempre Culiacán, sin importar el path.
var BRANCH = BRANCH_CONFIGS.cln;
