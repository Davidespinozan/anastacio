// ═══ BRANCH CONFIG — Anastacio Marisquería ═══
// Cada sucursal tiene su propia config. El branch se detecta automáticamente del URL.
// /gdl → Guadalajara · /cln → Culiacán

var BRANCH_CONFIGS = {
  gdl: {
    slug: 'gdl',
    city: 'Guadalajara',
    whatsapp: '523318916060',
    instagram: '@anastacio_marisqueriadebarrio',
    instagramUrl: 'https://instagram.com/anastacio_marisqueriadebarrio',
    googleReviewUrl: 'https://maps.app.goo.gl/Lcn5kNqrHzQY8cMr6',
    googleMapsEmbed: 'https://maps.google.com/maps?q=Anastacio+Marisqueria+de+Barrio,+Av+Guadalupe+290,+Chapalita,+Guadalajara&output=embed&z=16',
    googleMapsUrl: 'https://maps.app.goo.gl/Lcn5kNqrHzQY8cMr6',
    address: 'Av Guadalupe 290, Chapalita',
    metaPixelId: '1564615811495027',
    footerCity: 'GUADALAJARA',
    timeZone: 'America/Mexico_City'
  },
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
    metaPixelId: 'PIXEL_ID_CLN',        // ← Pendiente: ID del Pixel de Meta dedicado para Culiacán
    footerCity: 'CULIACÁN',
    timeZone: 'America/Mazatlan'
  }
};

// Auto-detect branch desde el path del URL (/gdl o /cln)
var _branchSlug = (window.location.pathname.split('/')[1] || 'gdl').toLowerCase();
var BRANCH = BRANCH_CONFIGS[_branchSlug] || BRANCH_CONFIGS.gdl;
