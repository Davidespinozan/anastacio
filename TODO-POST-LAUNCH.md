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

## Hero desktop (pendiente del asset)

- **Generar video horizontal 16:9 del pulpo** (Higgsfield Kling 2.5
  Turbo o equivalente). El hero mobile ya está integrado con el video
  vertical 9:16 del pulpo; en desktop se sigue mostrando la composición
  clásica (logo + título estático) hasta que exista asset horizontal.
  - Comprimir con ffmpeg a `pulpo-hero-desktop.webm` + `pulpo-hero-desktop.mp4`
  - Generar `pulpo-hero-desktop-poster.jpg`
  - Subir los 3 a Supabase Storage (`bucket imagenes`)
  - Reemplazar el bloque `.brand-logo + .brand` (HTML) por un
    `<section class="hero-desktop">` con `<video>` análogo al de mobile
  - Toggle responsive: mobile usa `.hero-mobile`, desktop usa `.hero-desktop`
  - Actualizar `og:image` de landing.html a un frame del video desktop
    (composición landscape funciona mejor en previews de WhatsApp/X)

## Mejoras visuales menú interno (post-lanzamiento)

- [ ] Reducir tamaño del hero de sucursal (ANASTACIO MARISQUERÍA / SUCURSAL / X) — ocupa demasiado real estate sin aportar acción.
- [ ] Reemplazar emojis 🛵🥡🍽️ de los 3 botones de modo por iconografía SVG consistente con la paleta de marca.
- [ ] Unificar colores de bordes de los 3 botones de modo (actualmente: verde / dorado / naranja). Usar paleta de marca dorado uniforme.
- [ ] Cambiar botón "PROMOS" de naranja brillante a dorado de marca para consistencia.
- [ ] Considerar reducir altura de urgency-bar y hero combinados a máx 30% del viewport para que el menú esté visible al instante.

## Otras mejoras

- Validar Schema.org en https://validator.schema.org/ tras el primer push
- Validar Open Graph en https://www.opengraph.xyz/ tras el primer push
- Submit `sitemap.xml` a Google Search Console y Bing Webmaster Tools
