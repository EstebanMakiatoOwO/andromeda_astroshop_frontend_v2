// Genera sitemap.xml a partir de las rutas públicas + la API (guías y, si el
// ecommerce está activo, productos). Corre en `postbuild`; también se puede
// ejecutar suelto para regenerarlo sin rebuild:
//   node scripts/generate-sitemap.mjs [directorio-de-salida]
// Si la API falla, NO escribe nada (mejor un sitemap viejo que uno incompleto).
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE = 'https://andromedaastroshop.com';
const API = process.env.SITEMAP_API ?? 'https://api.andromedaastroshop.com/api/v1';
const outDir = process.argv[2] ?? 'dist/andromeda_astroshop_v2/browser';

// Rutas públicas indexables (app.routes.ts). Carrito, checkout y login van en
// robots.txt como Disallow, así que no se listan aquí.
const STATIC = [
  { path: '/',             priority: '1.0', changefreq: 'weekly'  },
  { path: '/conocenos',    priority: '0.8', changefreq: 'monthly' },
  { path: '/astroshop',    priority: '0.8', changefreq: 'monthly' },
  { path: '/astroturismo', priority: '0.8', changefreq: 'monthly' },
  { path: '/astrodome',    priority: '0.8', changefreq: 'monthly' },
  { path: '/rancho',       priority: '0.8', changefreq: 'monthly' },
  { path: '/guias',        priority: '0.7', changefreq: 'weekly'  },
  { path: '/galeria',      priority: '0.6', changefreq: 'daily'   },
  { path: '/contacto',     priority: '0.5', changefreq: 'yearly'  },
  { path: '/terminos',     priority: '0.2', changefreq: 'yearly'  },
  { path: '/privacidad',   priority: '0.2', changefreq: 'yearly'  },
];
// Solo existen con el ecommerce activo: si no, el guard o HomeComponent redirigen.
const ECOMMERCE = [
  { path: '/tienda',   priority: '0.9', changefreq: 'daily' },
  { path: '/catalogo', priority: '0.8', changefreq: 'daily' },
];

async function getJson(path) {
  const res = await fetch(`${API}/${path}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

// "2026-09-15 20:44:27" → "2026-09-15"
const day = s => (typeof s === 'string' && /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : null);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

try {
  const [config, articles] = await Promise.all([getJson('config'), getJson('articles')]);
  const ecommerceEnabled = config?.[0] ?? true; // mismo default que StoreConfigService

  const urls = [...STATIC, ...(ecommerceEnabled ? ECOMMERCE : [])];

  for (const a of articles.data ?? []) {
    if (a.slug) urls.push({ path: `/guias/${encodeURIComponent(a.slug)}`, priority: '0.7', changefreq: 'monthly', lastmod: day(a.published_at) });
  }

  let products = 0;
  if (ecommerceEnabled) {
    const { data } = await getJson('products');
    for (const p of data ?? []) {
      if (!p.slug || p.is_active === false) continue;
      urls.push({ path: `/productos/${encodeURIComponent(p.slug)}`, priority: '0.6', changefreq: 'weekly', lastmod: day(p.updated_at) });
      products++;
    }
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(u =>
      `  <url><loc>${esc(SITE + u.path)}</loc>` +
      (u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : '') +
      `<changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`,
    ).join('\n') +
    '\n</urlset>\n';

  writeFileSync(join(outDir, 'sitemap.xml'), xml);
  console.log(`sitemap: ${urls.length} URLs (ecommerce ${ecommerceEnabled ? 'activo' : 'apagado'}, ${(articles.data ?? []).length} guías, ${products} productos)`);
} catch (err) {
  console.warn(`sitemap: NO generado — ${err.message}`);
}
