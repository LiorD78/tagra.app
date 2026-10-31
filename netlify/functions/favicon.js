// TAGRA favicon in TRUCKMALL green (#6E9B12), rendered in code (no binary files in the repo).
// Routed from netlify.toml: /favicon.ico, /apple-touch-icon.png, /icon-192.png
const zlib = require("zlib");

const GREEN = [0x6e, 0x9b, 0x12];

// Geometry in the TAGRA logo viewBox (circle centre 46.8/47.8, r 45.8).
function inMark(x, y) {
  // vertical bar
  if (x >= 50.8 && x <= 60.3 && y >= 40.8 && y <= 71.2) return true;
  // horizontal bar
  if (x >= 29.9 && x <= 45.1 && y >= 25.6 && y <= 35.1) return true;
  // rounded corner: ring between r 5.7 and 15.2 around (45.1, 40.8), top-right quadrant
  if (x >= 45.1 && y <= 40.8) {
    const d = Math.hypot(x - 45.1, y - 40.8);
    if (d >= 5.7 && d <= 15.2) return true;
  }
  return false;
}

function render(size, whiteBg) {
  const ss = 4; // supersampling
  const px = Buffer.alloc(size * size * 4);
  const scale = 91.6 / size;
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      let g = 0, w = 0;
      for (let sy = 0; sy < ss; sy++) {
        for (let sx = 0; sx < ss; sx++) {
          const x = 1 + (i + (sx + 0.5) / ss) * scale;
          const y = 2 + (j + (sy + 0.5) / ss) * scale;
          if (Math.hypot(x - 46.8, y - 47.8) <= 45.8) {
            if (inMark(x, y)) w++; else g++;
          }
        }
      }
      const n = ss * ss;
      const a = (g + w) / n;
      const o = (j * size + i) * 4;
      if (whiteBg) {
        const fg = g / n, wh = 1 - fg;
        px[o] = Math.round(GREEN[0] * fg + 255 * wh);
        px[o + 1] = Math.round(GREEN[1] * fg + 255 * wh);
        px[o + 2] = Math.round(GREEN[2] * fg + 255 * wh);
        px[o + 3] = 255;
      } else if (a > 0) {
        const wr = w / (g + w);
        px[o] = Math.round(GREEN[0] * (1 - wr) + 255 * wr);
        px[o + 1] = Math.round(GREEN[1] * (1 - wr) + 255 * wr);
        px[o + 2] = Math.round(GREEN[2] * (1 - wr) + 255 * wr);
        px[o + 3] = Math.round(a * 255);
      }
    }
  }
  return png(size, px);
}

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}
function ico(sizes) {
  const imgs = sizes.map((s) => render(s, false));
  const head = Buffer.alloc(6 + 16 * imgs.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(imgs.length, 4);
  let off = head.length;
  imgs.forEach((im, k) => {
    const s = sizes[k], e = 6 + 16 * k;
    head[e] = s >= 256 ? 0 : s; head[e + 1] = s >= 256 ? 0 : s;
    head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(im.length, e + 8); head.writeUInt32LE(off, e + 12);
    off += im.length;
  });
  return Buffer.concat([head, ...imgs]);
}

const cache = {};
function build(f) {
  if (cache[f]) return cache[f];
  let out;
  if (f === "apple") out = { type: "image/png", buf: render(180, true) };
  else if (f === "i192") out = { type: "image/png", buf: render(192, false) };
  else out = { type: "image/x-icon", buf: ico([16, 32, 48]) };
  return (cache[f] = out);
}

exports.handler = async (event) => {
  const f = (event.queryStringParameters || {}).f || "ico";
  const icon = build(f);
  return {
    statusCode: 200,
    headers: { "Content-Type": icon.type, "Cache-Control": "public, max-age=604800" },
    body: icon.buf.toString("base64"),
    isBase64Encoded: true,
  };
};

module.exports._build = build;
