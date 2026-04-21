// Generate iOS splash screens for apple-touch-startup-image.
// Source: /public/images/jinki-logo-512.png
// Output: /public/images/splash/splash-<w>x<h>.png
// Design: brand dark-bg with centered logo at 30% of the shorter edge.

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SRC_LOGO = 'public/images/jinki-logo-512.png';
const OUT_DIR = 'public/images/splash';
const BG = { r: 0x12, g: 0x14, b: 0x16, alpha: 1 }; // #121416 brand dark

// Six canonical sizes covering the most common modern iPhone + iPad classes.
// Format: [width, height, label]. All portrait.
const SIZES = [
  [ 750, 1334, 'iphone-se'        ],   // iPhone SE 2nd/3rd gen, iPhone 6/7/8
  [1170, 2532, 'iphone-standard'  ],   // iPhone 12/13/14 / Pro, iPhone 15 / Pro
  [1290, 2796, 'iphone-promax'    ],   // iPhone 14/15/16 Pro Max
  [1488, 2266, 'ipad-mini'        ],   // iPad Mini 6
  [1668, 2388, 'ipad-pro11'       ],   // iPad Pro 11 / iPad Air
  [2048, 2732, 'ipad-pro129'      ],   // iPad Pro 12.9
];

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

(async () => {
  for (const [w, h, label] of SIZES) {
    // Logo sized to ~30% of the shorter edge
    const logoDim = Math.round(Math.min(w, h) * 0.30);
    const logoBuf = await sharp(SRC_LOGO)
      .resize(logoDim, logoDim, { fit: 'contain', background: BG })
      .png()
      .toBuffer();

    const outPath = path.join(OUT_DIR, `splash-${w}x${h}.png`);
    await sharp({
      create: { width: w, height: h, channels: 4, background: BG },
    })
      .composite([{ input: logoBuf, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toFile(outPath);

    const bytes = fs.statSync(outPath).size;
    console.log(`${label.padEnd(18)}  ${w}x${h}  ${(bytes/1024).toFixed(0)} KB  -> ${outPath}`);
  }
})();
