import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    assetsInlineLimit: (filePath) =>
      // Never inline fonts. Manrope's cyrillic-ext subset is under Vite's 4 KB
      // default, so it was being base64'd into the render-blocking stylesheet —
      // paid for by every visitor, including the ones whose unicode-range means
      // the browser would never have fetched that file at all.
      // `undefined` leaves Vite's default threshold in charge of everything else.
      /\.(woff2?|ttf|otf|eot)$/i.test(filePath) ? false : undefined,
  },
})
