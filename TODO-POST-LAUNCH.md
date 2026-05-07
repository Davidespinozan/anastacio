# TODO post-lanzamiento Anastacio

Pendientes técnicos identificados durante el lanzamiento de Culiacán
(2026-05-08). Ninguno bloquea el go-live, pero todos mejoran la
experiencia y deben atenderse pronto.

## SEO / Open Graph

- **Crear imagen Open Graph dedicada 1200x630 (1.91:1).**
  Hoy se reutiliza el logo cuadrado 512x512 (`anastaciologo512.png`) que
  funciona pero no aprovecha el formato landscape de los previews
  sociales. Composición ideal: foto premium del platillo estrella —
  cuando el pulpo esté listo, esa es la foto.
  - Subir a Supabase Storage como `og-cover-1200x630.jpg`
  - Actualizar `<meta property="og:image">`, `og:image:width`,
    `og:image:height` en `landing.html` y `index.html`
  - Re-validar en https://www.opengraph.xyz/ y
    https://cards-dev.twitter.com/validator

- **Server-side rendering de meta tags por sucursal en /gdl y /cln.**
  Hoy `index.html` se sirve estático con og:* genéricos apuntando a la
  raíz. Cuando alguien comparte `anastaciomarisqueria.com/gdl` en
  WhatsApp, el preview no dice "Sucursal Guadalajara" porque los meta
  tags no son dinámicos por ruta. Inyectar vía JS no funciona (los
  crawlers no ejecutan JS). Solución: Netlify Edge Functions o pre-render
  de dos `index-gdl.html` / `index-cln.html`.

## Branding pendiente Culiacán (`branch-config.js`)

Estos placeholders rompen experiencia en `/cln`:

- `whatsapp: 'NUMERO_CLN'` → bloquea WhatsApp checkout y modal post-pago
- `instagramUrl: 'https://instagram.com/anastacio_cln'` → ¿existe el handle?
- `googleReviewUrl: 'URL_RESENA_CLN'` → link roto
- `googleMapsEmbed: 'URL_EMBED_CLN'` → mapa no carga
- `googleMapsUrl: 'URL_MAPS_CLN'` → link roto
- `address: 'DIRECCIÓN CLN'` → texto literal en pantalla
- `metaPixelId: 'PIXEL_ID_CLN'` → Pixel no trackea conversiones reales

Cuando lleguen los datos del cliente, actualizar en commit limpio +
agregar `streetAddress` real al Schema.org de Culiacán en
`landing.html`.

## Mejoras assets desktop (post-lanzamiento)

Assets desktop ya integrados (commit feat(hero) responsive). Los 4
viven en Supabase Storage: pulpo-hero-desktop.{webm,mp4},
pulpo-hero-desktop-poster.jpg, hero-interno-desktop.webp.

- [ ] Considerar generar versión 4K (3840×2160) del video desktop para
  monitores Retina/4K — el actual es 1080p
- [ ] A/B test del breakpoint 768px vs 1024px para el switch
  mobile/desktop
- [ ] Imagen OG dedicada 1200×630 con composición horizontal para
  shares en WhatsApp / X / Facebook (hoy se usa el logo cuadrado 512px)

## Hero menú interno — pulidos posteriores

- [ ] Reemplazar emojis 🛵🥡🍽️ de los 3 botones de modo por iconografía SVG consistente con la paleta dorada
- [ ] Unificar bordes de los 3 botones de modo (actualmente verde/dorado/naranja → solo dorado uniforme)
- [ ] Cambiar botón "PROMOS" de naranja a dorado de marca para consistencia
- [ ] Versión específica del wave dorado por sucursal (variación visual sutil GDL vs CLN)
- [ ] A/B test posición del plato en hero (right vs left) para conversión
- [ ] Generar versión horizontal nítida 1920x1080 de la imagen para desktop ≥1200px
- [ ] Considerar feature de "cierra en X min" y "alta demanda" — actualmente desactivadas en la urgency-bar inline del top-nav (los IDs urgency-closes/urgency-demand fueron removidos al compactar al header). Si se quiere restaurar, agregar como tooltip o subline al hover

## Otras mejoras

- Validar Schema.org en https://validator.schema.org/ tras el primer push
- Validar Open Graph en https://www.opengraph.xyz/ tras el primer push
- Submit `sitemap.xml` a Google Search Console y Bing Webmaster Tools
