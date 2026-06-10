/**
 * Download product photos from Wikimedia Commons to public/images/.
 *
 * Usage: node scripts/download-product-images.mjs
 */
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'public', 'images')
mkdirSync(outDir, { recursive: true })

const USER_AGENT = 'VirtualBytez/1.0 (https://github.com/geeko452100/Virtual-Bytez; local catalog image download)'

/** Product id → primary Commons filename, then search terms for fallback. */
const IMAGE_MAP = {
  c64: { file: 'Commodore-64-Computer-FL.jpg', search: 'Commodore 64 computer' },
  'mac-se': { file: 'Macintosh_SE_b.jpg', search: 'Macintosh SE computer' },
  'amiga-500': { file: 'Amiga500_system.jpg', search: 'Amiga 500' },
  'zx-spectrum-48k': { file: 'ZX_Spectrum_48K.jpg', search: 'ZX Spectrum 48K' },
  'apple-iie': { file: 'Apple_IIe.jpg', search: 'Apple IIe' },
  'ibm-5150': { file: 'IBM_PC_5150.jpg', search: 'IBM PC 5150' },
  'atari-800': { file: 'Atari-800-Computer.jpg', search: 'Atari 800 computer' },
  'trs-80-model-100': { file: 'TRS-80_Model_100.jpg', search: 'TRS-80 Model 100' },
  'commodore-pet': { file: 'Commodore_PET_2001.jpg', search: 'Commodore PET' },
  zx81: { file: 'ZX81_Personal_Computer.jpg', search: 'ZX81' },
  'apple-lisa': { file: 'Apple_Lisa.jpg', search: 'Apple Lisa computer' },
  'tandy-coco3': { file: 'Tandy_Color_Computer_3.jpg', search: 'Tandy Color Computer 3' },
  'bbc-micro': { file: 'BBC_Micro_Keyboard.jpg', search: 'BBC Micro' },
  nextstation: { file: 'NeXTstation.jpg', search: 'NeXTstation' },
  'msx-fs-a1': { file: 'Panasonic_FS-A1.jpg', search: 'Panasonic FS-A1 MSX' },
  'amiga-1200': { file: 'Amiga_1200.jpg', search: 'Amiga 1200' },
  'atari-st-1040': { file: 'Atari_ST.jpg', search: 'Atari ST 1040' },
  'walkman-wm2': { file: 'Sony_Walkman_WM-2.jpg', search: 'Sony Walkman WM-2' },
  'discman-d50': { file: 'Sony_Discman_D-50.jpg', search: 'Sony Discman D-50' },
  'technics-sl1200': { file: 'Technics-SL-1200MK2-Top-Ident.jpg', search: 'Technics SL-1200' },
  'nakamichi-bx300': { file: 'Nakamichi 600 cassette deck.jpg', search: 'Nakamichi cassette deck' },
  'pioneer-ct-f950': {
    file: 'Pioneer CT-900S - Cassette Deck with 3 Heads.jpg',
    search: 'Pioneer cassette deck',
  },
  'marantz-2245': { file: 'Marantz 2285B receiver.jpeg', search: 'Marantz receiver' },
  'jvc-rc-m70': { file: 'JVC boombox.jpg', search: 'JVC boombox' },
  'yamaha-ns10m': { file: 'Yamaha_NS-10M_STUDIO.jpg', search: 'Yamaha NS-10M' },
  'sony-tc-d5': { file: 'Sony_TC-D5.jpg', search: 'Sony TC-D5' },
  'akai-ap100c': { file: 'Akai AP 006.jpg', search: 'Akai turntable' },
  'bose-901': { file: 'Bose 901 on stand.jpg', search: 'Bose 901 speaker' },
  'revox-b710': { file: 'Revox B710 (lid closed) drawing.svg', search: 'Revox B710 cassette' },
  gameboy: { file: 'Game-Boy-FL.png', search: 'Game Boy DMG' },
  nes: { file: 'NES-Console-Set.png', search: 'Nintendo Entertainment System' },
  snes: { file: 'SNES-Console-Set.png', search: 'Super Nintendo' },
  'sega-genesis': { file: 'Sega-Mega-Drive-EU.jpg', search: 'Sega Genesis Mega Drive' },
  'atari-2600': { file: 'Atari-2600-Wood-4SwRSw.jpg', search: 'Atari 2600' },
  'nintendo-64': { file: 'Nintendo-64-Console-Set.png', search: 'Nintendo 64' },
  playstation: { file: 'PSX-Console-wController.jpg', search: 'PlayStation console' },
  dreamcast: { file: 'Dreamcast-Console-Set.png', search: 'Sega Dreamcast' },
  'sega-saturn': { file: 'Sega-Saturn-Console-Set-Mk1.png', search: 'Sega Saturn' },
  'sega-game-gear': { file: 'Sega-Game-Gear-WB.png', search: 'Sega Game Gear' },
  'neo-geo-aes': { file: 'Neo-Geo-AES-Console-Set.png', search: 'Neo Geo AES' },
  colecovision: { file: 'ColecoVision-Console-Set.png', search: 'ColecoVision' },
  vectrex: { file: 'Vectrex-Console-Set.png', search: 'Vectrex' },
  'virtual-boy': { file: 'Virtual-Boy-Set.png', search: 'Virtual Boy' },
  gamecube: { file: 'Nintendo-GameCube-Set.png', search: 'Nintendo GameCube' },
  'turbo-grafx-16': { file: 'TurboGrafx-16-Console-Set.png', search: 'TurboGrafx-16' },
  'model-m': {
    file: 'IBM_Model_M_Keyboard,_Keys_arranged_in_the_form_of_a_pangram-1174.jpg',
    search: 'IBM Model M keyboard',
  },
  'apple-extended-keyboard-ii': { file: 'Apple_Extended_Keyboard_II.jpg', search: 'Apple Extended Keyboard II' },
  'logitech-trackman-marble': { file: 'Logitech_Trackman_Marble.jpg', search: 'Logitech Trackman Marble' },
  'gravis-gamepad-pro': { file: 'Gravis Gamepad (cropped).jpg', search: 'Gravis gamepad' },
  'power-glove': { file: 'Nintendo_Power_Glove.jpg', search: 'Nintendo Power Glove' },
  'amiga-1351-mouse': { file: 'Amiga_mouse.jpg', search: 'Amiga mouse' },
  'wacom-artpad': { file: 'Wacom Intuos4 Pen Tablet.jpg', search: 'Wacom graphics tablet' },
  'alps-sck200': { file: 'Alps_SKCL_green.jpg', search: 'Alps keyboard SKCL' },
  'microsoft-intellimouse': { file: 'Microsoft_IntelliMouse.jpg', search: 'Microsoft IntelliMouse' },
  'commodore-1530': { file: 'Commodore_1530_Datasette.jpg', search: 'Commodore 1530 Datasette' },
  'polaroid-sx70': { file: 'Polaroid_SX-70.jpg', search: 'Polaroid SX-70' },
  'canon-ae1': { file: 'Canon_AE-1.jpg', search: 'Canon AE-1' },
  'nikon-f3': { file: 'Nikon_F3.jpg', search: 'Nikon F3' },
  'kodak-brownie': { file: 'Kodak_Brownie_Hawkeye_Flash_Model.jpg', search: 'Kodak Brownie Hawkeye' },
  'hasselblad-500cm': { file: 'Hasselblad_500C.jpg', search: 'Hasselblad 500C' },
  'olympus-om1': { file: 'Olympus_OM-1.jpg', search: 'Olympus OM-1' },
}

async function wikiApi(params) {
  const url = `https://commons.wikimedia.org/w/api.php?${new URLSearchParams({
    ...params,
    format: 'json',
    origin: '*',
  })}`
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

async function getFileThumbUrl(fileName, width = 480) {
  const data = await wikiApi({
    action: 'query',
    titles: `File:${fileName}`,
    prop: 'imageinfo',
    iiprop: 'url',
    iiurlwidth: String(width),
  })
  const pages = data.query?.pages ?? {}
  const page = pages[Object.keys(pages)[0]]
  if (!page || page.missing) return null
  const info = page.imageinfo?.[0]
  return info?.thumburl ?? info?.url ?? null
}

const PHOTO_EXT = /\.(jpe?g|png|webp)$/i

function isPhotoFileName(fileName) {
  return PHOTO_EXT.test(fileName)
}

async function searchCommonsImage(searchTerm) {
  const data = await wikiApi({
    action: 'query',
    list: 'search',
    srsearch: searchTerm,
    srnamespace: '6',
    srlimit: '12',
  })
  const hits = (data.query?.search ?? []).filter((h) => isPhotoFileName(h.title))
  for (const hit of hits) {
    const title = hit.title.replace(/^File:/, '')
    const url = await getFileThumbUrl(title)
    if (url) return { fileName: title, url }
  }
  return null
}

async function downloadUrl(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!res.ok) return null
  const type = res.headers.get('content-type') ?? ''
  if (!type.startsWith('image/')) return null
  return {
    buffer: Buffer.from(await res.arrayBuffer()),
    type,
  }
}

function extFromType(type, fileName) {
  if (type.includes('png')) return 'png'
  if (type.includes('webp')) return 'webp'
  if (type.includes('svg')) return 'svg'
  if (type.includes('jpeg') || type.includes('jpg')) return 'jpg'
  const fromName = fileName.split('.').pop()?.toLowerCase()
  if (fromName === 'png') return 'png'
  if (fromName === 'svg') return 'svg'
  if (fromName === 'jpg' || fromName === 'jpeg') return 'jpg'
  return 'jpg'
}

async function downloadProduct(id, { file, search }) {
  let fileName = file
  let thumbUrl = await getFileThumbUrl(file)

  if (!thumbUrl) {
    const found = await searchCommonsImage(search)
    if (found) {
      fileName = found.fileName
      thumbUrl = found.url
    }
  }

  if (!thumbUrl) {
    console.error(`✗ ${id}`)
    return null
  }

  const result = await downloadUrl(thumbUrl)
  if (!result) {
    console.error(`✗ ${id} (download failed)`)
    return null
  }

  const ext = extFromType(result.type, fileName)
  const outPath = join(outDir, `${id}.${ext}`)
  writeFileSync(outPath, result.buffer)
  console.log(`✓ ${id} ← ${fileName}`)
  return ext
}

const results = {}
for (const [id, spec] of Object.entries(IMAGE_MAP)) {
  results[id] = await downloadProduct(id, spec)
  await new Promise((r) => setTimeout(r, 150))
}

writeFileSync(join(outDir, 'manifest.json'), JSON.stringify(results, null, 2))

const imageEntries = Object.entries(results)
  .filter(([, ext]) => ext)
  .map(([id, ext]) => `  '${id}': '/images/${id}.${ext}',`)
  .join('\n')

const productImagesPath = join(__dirname, '..', 'src', 'data', 'productImages.js')
writeFileSync(
  productImagesPath,
  `/** Local product photos (Wikimedia Commons). Regenerate: node scripts/download-product-images.mjs */\nexport const PRODUCT_IMAGES = {\n${imageEntries}\n}\n`,
)

const failed = Object.entries(results).filter(([, ext]) => !ext)
if (failed.length) {
  console.error(`\nFailed (${failed.length}): ${failed.map(([id]) => id).join(', ')}`)
  process.exit(1)
}
console.log(`\nDone — ${Object.keys(results).length} images in public/images/`)
