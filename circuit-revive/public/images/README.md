# Product images

All catalog photos are stored locally in this folder (61 files). Sources are [Wikimedia Commons](https://commons.wikimedia.org/) (Creative Commons / public domain).

## Regenerate

```bash
node scripts/download-product-images.mjs
```

This downloads 480px thumbnails from Wikimedia, writes `manifest.json`, and updates `src/data/productImages.js`.

After updating images, re-upload the seed catalog from `/admin` if your Supabase database still has old image URLs.
