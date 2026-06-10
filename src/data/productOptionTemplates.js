/** Reusable customization schemas for catalog entries. */

export function engraving(placeholder = 'e.g. VIRTUAL BYTEZ #042', maxLength = 24, price = 15) {
  return {
    id: 'engraving',
    label: 'Custom engraving',
    type: 'text',
    placeholder,
    maxLength,
    priceModifier: price,
  }
}

export const OPTION_SETS = {
  computer: [
    {
      id: 'finish',
      label: 'Case finish',
      type: 'select',
      defaultValue: 'original',
      choices: [
        { value: 'original', label: 'Original / period-correct', priceModifier: 0 },
        { value: 'retrobright', label: 'RetroBright restored', priceModifier: 85 },
        { value: 'custom', label: 'Custom finish', priceModifier: 120 },
      ],
    },
    {
      id: 'storage',
      label: 'Storage / media',
      type: 'select',
      defaultValue: 'stock',
      choices: [
        { value: 'stock', label: 'Original media setup', priceModifier: 0 },
        { value: 'modern', label: 'Modern flash / SD adapter', priceModifier: 75 },
      ],
    },
    {
      id: 'mods',
      label: 'Modifications',
      type: 'checkbox',
      choices: [
        { value: 'cap-refresh', label: 'Capacitor refresh', priceModifier: 45 },
        { value: 'video-out', label: 'Modern video output', priceModifier: 65 },
      ],
    },
    engraving(),
  ],
  audio: [
    {
      id: 'service',
      label: 'Service package',
      type: 'select',
      defaultValue: 'basic',
      choices: [
        { value: 'basic', label: 'Basic service & test', priceModifier: 0 },
        { value: 'full', label: 'Full rebuild + calibration', priceModifier: 55 },
        { value: 'audiophile', label: 'Audiophile parts upgrade', priceModifier: 95 },
      ],
    },
    {
      id: 'extras',
      label: 'Extras',
      type: 'checkbox',
      choices: [
        { value: 'cables', label: 'Period-correct cable set', priceModifier: 28 },
        { value: 'case', label: 'Carry case or dust cover', priceModifier: 35 },
      ],
    },
  ],
  audioPortable: [
    {
      id: 'service',
      label: 'Service package',
      type: 'select',
      defaultValue: 'basic',
      choices: [
        { value: 'basic', label: 'Basic belt & cap replace', priceModifier: 0 },
        { value: 'full', label: 'Full rebuild + calibration', priceModifier: 45 },
        { value: 'audiophile', label: 'Audiophile cap upgrade', priceModifier: 85 },
      ],
    },
    {
      id: 'headphones',
      label: 'Headphone bundle',
      type: 'select',
      defaultValue: 'none',
      choices: [
        { value: 'none', label: 'Unit only', priceModifier: 0 },
        { value: 'period', label: 'Period-correct headphones', priceModifier: 55 },
        { value: 'modern', label: 'Modern retro-style cans', priceModifier: 79 },
      ],
    },
    {
      id: 'extras',
      label: 'Extras',
      type: 'checkbox',
      choices: [
        { value: 'case', label: 'Leather or repro carry case', priceModifier: 32 },
        { value: 'battery', label: 'Fresh battery pack', priceModifier: 18 },
      ],
    },
  ],
  gamingHandheld: [
    {
      id: 'shell',
      label: 'Shell color',
      type: 'select',
      defaultValue: 'original',
      choices: [
        { value: 'original', label: 'Original factory color', priceModifier: 0 },
        { value: 'clear', label: 'Clear / smoke shell', priceModifier: 30 },
        { value: 'custom', label: 'Custom color shell', priceModifier: 45 },
      ],
    },
    {
      id: 'screen',
      label: 'Display mod',
      type: 'select',
      defaultValue: 'stock',
      choices: [
        { value: 'stock', label: 'Stock display', priceModifier: 0 },
        { value: 'backlight', label: 'Backlight / IPS mod', priceModifier: 85 },
        { value: 'oled', label: 'OLED drop-in kit', priceModifier: 135 },
      ],
    },
    {
      id: 'power',
      label: 'Power options',
      type: 'checkbox',
      choices: [
        { value: 'rechargeable', label: 'USB-C rechargeable mod', priceModifier: 40 },
        { value: 'audio', label: 'Clean power / audio amp mod', priceModifier: 35 },
      ],
    },
  ],
  gamingConsole: [
    {
      id: 'region',
      label: 'Region / model',
      type: 'select',
      defaultValue: 'ntsc',
      choices: [
        { value: 'ntsc', label: 'NTSC (US/Japan)', priceModifier: 0 },
        { value: 'pal', label: 'PAL (EU)', priceModifier: 0 },
        { value: 'dual', label: 'Dual-frequency / region-free mod', priceModifier: 45 },
      ],
    },
    {
      id: 'controllers',
      label: 'Controller bundle',
      type: 'select',
      defaultValue: 'one',
      choices: [
        { value: 'one', label: 'One original controller', priceModifier: 0 },
        { value: 'two', label: 'Two controllers', priceModifier: 35 },
        { value: 'four', label: 'Four-player pack', priceModifier: 75 },
      ],
    },
    {
      id: 'mods',
      label: 'Modifications',
      type: 'checkbox',
      choices: [
        { value: 'hdmi', label: 'HDMI video output', priceModifier: 85 },
        { value: 'ssd', label: 'Flash cart / ODE install', priceModifier: 110 },
      ],
    },
  ],
  peripheral: [
    {
      id: 'connection',
      label: 'Connection',
      type: 'select',
      defaultValue: 'original',
      choices: [
        { value: 'original', label: 'Original connector / cable', priceModifier: 0 },
        { value: 'usb', label: 'USB adapter + new cable', priceModifier: 38 },
        { value: 'wireless', label: 'Bluetooth / wireless mod', priceModifier: 55 },
      ],
    },
    {
      id: 'service',
      label: 'Restoration',
      type: 'select',
      defaultValue: 'standard',
      choices: [
        { value: 'standard', label: 'Standard deep clean', priceModifier: 0 },
        { value: 'full', label: 'Full disassembly service', priceModifier: 65 },
      ],
    },
    engraving('Up to 12 characters', 12, 12),
  ],
  camera: [
    {
      id: 'lens',
      label: 'Lens / optics',
      type: 'select',
      defaultValue: 'body-only',
      choices: [
        { value: 'body-only', label: 'Body only (no lens)', priceModifier: 0 },
        { value: 'kit', label: 'Period kit lens included', priceModifier: 85 },
        { value: 'premium', label: 'Premium restored lens', priceModifier: 165 },
      ],
    },
    {
      id: 'service',
      label: 'Service level',
      type: 'select',
      defaultValue: 'basic',
      choices: [
        { value: 'basic', label: 'Clean, test, light seal check', priceModifier: 0 },
        { value: 'full', label: 'Full shutter service + seals', priceModifier: 75 },
        { value: 'museum', label: 'Museum-grade restoration', priceModifier: 180 },
      ],
    },
    {
      id: 'extras',
      label: 'Extras',
      type: 'checkbox',
      choices: [
        { value: 'strap', label: 'Leather neck strap', priceModifier: 25 },
        { value: 'case', label: 'Hard case or bag', priceModifier: 40 },
      ],
    },
  ],
}
