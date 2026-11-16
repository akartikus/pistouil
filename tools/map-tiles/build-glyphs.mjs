// Build the glyph files (.pbf) MapLibre needs from a font file (see README.md).
// Usage, from a folder where `npm install fontnik` was run:
//   node build-glyphs.mjs <font file> <output dir>
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const fontnik = createRequire(process.cwd() + '/')('fontnik');
const [fontFile, outDir] = process.argv.slice(2);
if (!fontFile || !outDir) throw new Error('usage: node build-glyphs.mjs <font file> <output dir>');

// Basic Latin and Latin-1, Latin Extended-A, general punctuation (’ “ ” … –) and the euro sign.
const RANGES = [
	[0, 255],
	[256, 511],
	[8192, 8447]
];

const font = readFileSync(fontFile);
mkdirSync(outDir, { recursive: true });
for (const [start, end] of RANGES) {
	const data = await new Promise((resolve, reject) =>
		fontnik.range({ font, start, end }, (error, result) =>
			error ? reject(error) : resolve(result)
		)
	);
	writeFileSync(`${outDir}/${start}-${end}.pbf`, data);
}
