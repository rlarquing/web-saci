// Rasterizes public/images/logo.png into the PNG icons declared by app/manifest.json,
// plus the app/favicon.ico consumed by Next's /favicon.ico route.
// Run with: node scripts/generate-pwa-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const PUBLIC_DIR = join(process.cwd(), 'public');
const SOURCE = join(PUBLIC_DIR, 'images', 'logo.png');
const FAVICON_ICO = join(process.cwd(), 'app', 'favicon.ico');
const MASKABLE_SAFE_RATIO = 0.8; // maskable icons get cropped to a circle
const MASKABLE_BACKGROUND = '#ffffff'; // matches background_color in app/manifest.json

// Palette compression keeps the 512 icon around 64KB instead of 330KB.
const encode = (pipeline) => pipeline.png({ compressionLevel: 9, palette: true, quality: 90 });

const base = readFileSync(SOURCE);

const plain = [
    { name: 'icon-512x512.png', size: 512 },
    { name: 'icon-192x192.png', size: 192 },
    { name: 'icon-180x180.png', size: 180 },
    { name: 'favicon-32x32.png', size: 32 },
];

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

for (const { name, size } of plain) {
    await encode(sharp(base).resize(size, size, { fit: 'contain', background: transparent })).toFile(
        join(PUBLIC_DIR, name),
    );
}

const maskableSize = 512;
const inner = Math.round(maskableSize * MASKABLE_SAFE_RATIO);
await encode(
    sharp({
        create: {
            width: maskableSize,
            height: maskableSize,
            channels: 4,
            background: MASKABLE_BACKGROUND,
        },
    }).composite([
        {
            input: await sharp(base).resize(inner, inner, { fit: 'contain', background: transparent }).toBuffer(),
            gravity: 'centre',
        },
    ]),
).toFile(join(PUBLIC_DIR, 'icon-maskable-512x512.png'));

// sharp cannot emit ICO, but an ICO is just a 22-byte header around a PNG
// (the PNG-in-ICO form every browser since Vista understands).
const png32 = await encode(sharp(base).resize(32, 32, { fit: 'contain', background: transparent })).toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // image count
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt16LE(1, 10); // color planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png32.length, 14);
header.writeUInt32LE(header.length, 18); // pixel data offset
writeFileSync(FAVICON_ICO, Buffer.concat([header, png32]));

// Self-check: a malformed icon is worse than a missing one, because the
// manifest still advertises it and installation fails silently.
const expected = [...plain, { name: 'icon-maskable-512x512.png', size: maskableSize }];
for (const { name, size } of expected) {
    const meta = await sharp(join(PUBLIC_DIR, name)).metadata();
    if (meta.format !== 'png' || meta.width !== size || meta.height !== size) {
        throw new Error(`${name}: expected png ${size}x${size}, got ${meta.format} ${meta.width}x${meta.height}`);
    }
    console.log(`ok ${name} ${meta.width}x${meta.height}`);
}

const ico = readFileSync(FAVICON_ICO);
if (ico.readUInt16LE(2) !== 1 || ico.readUInt16LE(4) !== 1 || ico.subarray(22, 26).toString('hex') !== '89504e47') {
    throw new Error('app/favicon.ico: malformed ICO container');
}
console.log(`ok app/favicon.ico 32x32 (${ico.length} bytes)`);
