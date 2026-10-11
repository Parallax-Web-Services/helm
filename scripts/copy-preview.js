import { mkdirSync, copyFileSync } from 'node:fs';

mkdirSync('public/browser/preview', { recursive: true });
copyFileSync('public/preview/preview.js', 'public/browser/preview/preview.js');

mkdirSync('public/browser/brand', { recursive: true });
copyFileSync('public/brand/zefram-symbol.png', 'public/browser/brand/zefram-symbol.png');
