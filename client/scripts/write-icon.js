#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// A tiny valid 32x32 transparent PNG (1x1 pixel scaled) base64
const b64 = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAAFklEQVR42mP8z8AARMAgFANAaBABBgAATVgB1r8nYO0AAAAASUVORK5CYII=';
const buf = Buffer.from(b64, 'base64');
const out = path.join(__dirname, '..', 'src', 'app', 'icon.png');
fs.writeFileSync(out, buf);
console.log('Wrote valid icon.png (' + buf.length + ' bytes)');