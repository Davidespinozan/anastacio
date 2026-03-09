// ═══ BRANCH CONFIG — Anastacio Marisquería ═══
// Cada sucursal tiene su propia config. El branch se detecta automáticamente del URL.
// /gdl → Guadalajara · /cln → Culiacán

var BRANCH_CONFIGS = {
  gdl: {
    slug: 'gdl',
    city: 'Guadalajara',
    whatsapp: '523318916060',
    instagram: '@anastacio_gdl',
    instagramUrl: 'https://instagram.com/anastacio_gdl',
    googleReviewUrl: 'https://maps.app.goo.gl/Lcn5kNqrHzQY8cMr6',
    googleMapsEmbed: 'https://maps.google.com/maps?q=Anastacio+Marisqueria+de+Barrio,+Av+Guadalupe+290,+Chapalita,+Guadalajara&output=embed&z=16',
    googleMapsUrl: 'https://maps.app.goo.gl/Lcn5kNqrHzQY8cMr6',
    address: 'Av Guadalupe 290, Chapalita',
    metaPixelId: '1564615811495027',
    footerCity: 'GUADALAJARA'
  },
  cln: {
    slug: 'cln',
    city: 'Culiacán',
    whatsapp: 'NUMERO_CLN',            // ← Reemplaza con el número de Culiacán (521XXXXXXXXXX)
    instagram: '@anastacio_cln',        // ← Reemplaza si el handle es diferente
    instagramUrl: 'https://instagram.com/anastacio_cln',
    googleReviewUrl: 'URL_RESENA_CLN',  // ← Link de Google Maps para reseñas CLN
    googleMapsEmbed: 'URL_EMBED_CLN',   // ← URL del iframe de Google Maps CLN
    googleMapsUrl: 'URL_MAPS_CLN',      // ← Link para "Abrir en Maps" CLN
    address: 'DIRECCIÓN CLN',           // ← Dirección de la sucursal CLN
    metaPixelId: 'PIXEL_ID_CLN',        // ← ID del Pixel de Meta CLN
    footerCity: 'CULIACÁN'
  }
};

// Auto-detect branch desde el path del URL (/gdl o /cln)
var _branchSlug = (window.location.pathname.split('/')[1] || 'gdl').toLowerCase();
var BRANCH = BRANCH_CONFIGS[_branchSlug] || BRANCH_CONFIGS.gdl;
