#!/usr/bin/env node
// Fails if any tracked image carries location data (EXIF GPS or XMP GPS/location fields).
// Phones embed GPS by default, so a new desk or homelab photo could leak where I live.
// Fix a hit with: exiftool -all= -overwrite_original <file>  (or re-export without metadata).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const IMAGE = /\.(jpe?g|png|webp|avif|heic|heif|tiff?)$/i;
const XMP_LOCATION = /(exif:GPS(Latitude|Longitude)|photoshop:(City|State)|Iptc4xmpCore:Location|iptcExt:LocationShown)/;

/** Walks a TIFF block (EXIF payload) and reports whether its GPS IFD holds any coordinates. */
function tiffHasGps(buf, start) {
  if (start + 8 > buf.length) return false;
  const order = buf.toString('latin1', start, start + 2);
  if (order !== 'II' && order !== 'MM') return false;
  const le = order === 'II';
  const u16 = (o) => (le ? buf.readUInt16LE(start + o) : buf.readUInt16BE(start + o));
  const u32 = (o) => (le ? buf.readUInt32LE(start + o) : buf.readUInt32BE(start + o));
  const inRange = (o, n) => start + o + n <= buf.length;
  const entries = (ifd) => {
    if (!inRange(ifd, 2)) return [];
    const count = u16(ifd);
    const list = [];
    for (let i = 0; i < count && inRange(ifd + 2 + i * 12, 12); i++) {
      const e = ifd + 2 + i * 12;
      list.push({ tag: u16(e), value: u32(e + 8) });
    }
    return list;
  };
  const gpsPointer = entries(u32(4)).find((e) => e.tag === 0x8825);
  if (!gpsPointer) return false;
  // Tags 1–4 are latitude/longitude refs and values; tag 0 (version) alone isn't a location.
  return entries(gpsPointer.value).some((e) => e.tag >= 1 && e.tag <= 4);
}

/** Finds every embedded EXIF (TIFF) payload in JPEG APP1, PNG eXIf and RIFF/WebP EXIF chunks. */
function exifHasGps(buf) {
  const exifMarker = Buffer.from('Exif\0\0', 'latin1');
  for (let at = buf.indexOf(exifMarker); at !== -1; at = buf.indexOf(exifMarker, at + 1)) {
    if (tiffHasGps(buf, at + exifMarker.length)) return true;
  }
  for (const tag of ['eXIf', 'EXIF']) {
    for (let at = buf.indexOf(tag, 0, 'latin1'); at !== -1; at = buf.indexOf(tag, at + 1, 'latin1')) {
      const payload = at + 4 + (tag === 'EXIF' ? 4 : 0);
      if (tiffHasGps(buf, payload) || tiffHasGps(buf, payload + exifMarker.length)) return true;
    }
  }
  // HEIC/AVIF/TIFF: the file itself (or an Exif item) is a TIFF block.
  for (const sig of ['II*\0', 'MM\0*']) {
    for (let at = buf.indexOf(sig, 0, 'latin1'); at !== -1; at = buf.indexOf(sig, at + 1, 'latin1')) {
      if (tiffHasGps(buf, at)) return true;
    }
  }
  return false;
}

const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter((file) => IMAGE.test(file));

const leaks = [];
for (const file of files) {
  let buf;
  try {
    buf = readFileSync(file);
  } catch {
    continue; // deleted in the working tree
  }
  const reasons = [];
  if (exifHasGps(buf)) reasons.push('EXIF GPS');
  if (XMP_LOCATION.test(buf.toString('latin1'))) reasons.push('XMP location');
  if (reasons.length) leaks.push(`  ${file}: ${reasons.join(', ')}`);
}

if (leaks.length) {
  console.error(`Location data found in ${leaks.length} image(s):\n${leaks.join('\n')}`);
  console.error('Strip it before committing, e.g. exiftool -all= -overwrite_original <file>');
  process.exit(1);
}
console.log(`Image privacy check passed: ${files.length} images, no location data.`);
