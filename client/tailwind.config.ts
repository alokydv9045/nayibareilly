// This file exists only to satisfy TypeScript project references.
// The actual Tailwind config used by the app is `tailwind.config.mjs` (ESM) where DaisyUI is configured.
// Keeping this minimal TS file prevents TS/lint errors when the repo scans for *.ts files.
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [],
  theme: { extend: {} },
  plugins: [],
}

export default config
