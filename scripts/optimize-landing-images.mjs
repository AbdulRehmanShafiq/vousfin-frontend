/**
 * optimize-landing-images.mjs — shrink oversized landing images in place.
 * Resizes to a sane max width and recompresses (same format → no code changes).
 * Run from vousfin-frontend-main:  node scripts/optimize-landing-images.mjs
 */
import sharp from 'sharp'
import { readdirSync, statSync, renameSync } from 'node:fs'
import path from 'node:path'

const DIR = path.resolve(process.cwd(), 'public/landing')
const MAX_W = 1600

const files = readdirSync(DIR).filter((f) => /\.(png|jpe?g)$/i.test(f))
let before = 0
let after = 0

for (const f of files) {
  const src = path.join(DIR, f)
  const ext = path.extname(f).toLowerCase()
  const tmp = path.join(DIR, `__opt__${f}`)
  const sizeBefore = statSync(src).size
  before += sizeBefore

  let pipe = sharp(src).resize({ width: MAX_W, withoutEnlargement: true })
  if (ext === '.png') pipe = pipe.png({ compressionLevel: 9, palette: true, quality: 80, effort: 8 })
  else pipe = pipe.jpeg({ quality: 80, mozjpeg: true })

  await pipe.toFile(tmp)
  const sizeAfter = statSync(tmp).size

  // Only keep the optimized version if it is actually smaller.
  if (sizeAfter < sizeBefore) {
    renameSync(tmp, src)
    after += sizeAfter
    console.log(`${f}: ${(sizeBefore / 1024).toFixed(0)}KB -> ${(sizeAfter / 1024).toFixed(0)}KB`)
  } else {
    const { unlinkSync } = await import('node:fs')
    unlinkSync(tmp)
    after += sizeBefore
    console.log(`${f}: ${(sizeBefore / 1024).toFixed(0)}KB (kept original — already optimal)`)
  }
}

console.log(`\nTotal: ${(before / 1024 / 1024).toFixed(1)}MB -> ${(after / 1024 / 1024).toFixed(1)}MB`)
