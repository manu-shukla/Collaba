import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import type { Connect, Plugin, ViteDevServer, PreviewServer } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Absolute path to a file beside this config. `__dirname` is the usual spelling
 * here, but package.json sets "type": "module" and this config is loaded as ESM,
 * where it does not exist.
 */
const here = (file: string) => fileURLToPath(new URL(file, import.meta.url))

/**
 * Extensionless paths that are really directories holding an index.html.
 *
 * One entry per page other than the home page. Keep it in step with
 * `build.rollupOptions.input` below.
 */
const CLEAN_PATHS = ['/creators']

/**
 * Makes `npm run dev` and `npm run preview` resolve /creators the way the host
 * does in production.
 *
 * Without this the local servers are quietly misleading rather than broken, which
 * is worse: Vite's single-page fallback answers an unmatched path with
 * index.html, so /creators returned the *home* page with a 200 and the only way
 * to see the creators page locally was to remember the trailing slash. Every
 * local check of the banner link would have been testing the wrong page.
 *
 * Only a rewrite, and only for paths we name. Vite already resolves /creators/
 * to /creators/index.html, so adding the slash is the whole job.
 */
function cleanUrls(): Plugin {
  const middleware: Connect.NextHandleFunction = (req, _res, next) => {
    // Query and hash are not part of the path being matched, and req.url carries
    // both. Nothing is written back except the path, so they survive untouched.
    const [path, rest] = (req.url ?? '').split(/(?=[?#])/, 2)
    if (CLEAN_PATHS.includes(path)) req.url = `${path}/${rest ?? ''}`
    next()
  }

  const use = (server: ViteDevServer | PreviewServer) => {
    server.middlewares.use(middleware)
  }

  return {
    name: 'collaba-clean-urls',
    configureServer: use,
    configurePreviewServer: use,
  }
}

export default defineConfig({
  plugins: [react(), cleanUrls()],
  server: {
    port: 5173,
    open: false,
  },
  build: {
    /**
     * Two pages, two entry points. Declaring `input` at all replaces Vite's
     * implicit "build index.html" default, so index.html has to be listed here
     * too — leaving it out silently ships a site whose home page is gone.
     *
     * The creators page's source is `creators/index.html`, not `creators.html`,
     * and Vite keeps that folder in the output: dist/creators/index.html. That is
     * what makes the URL `/creators` — a directory path, which every static host
     * resolves to the index file inside it, rather than something that depends on
     * a rewrite rule to hide an extension. See CREATORS_PATH in
     * src/components/CreatorBanner.tsx, and vercel.json for the redirects that
     * keep /creators the only form of the URL in production.
     */
    rollupOptions: {
      input: {
        index: here('index.html'),
        creators: here('creators/index.html'),
      },
    },
    assetsInlineLimit: (filePath) =>
      // Never inline fonts. Manrope's cyrillic-ext subset is under Vite's 4 KB
      // default, so it was being base64'd into the render-blocking stylesheet —
      // paid for by every visitor, including the ones whose unicode-range means
      // the browser would never have fetched that file at all.
      // `undefined` leaves Vite's default threshold in charge of everything else.
      /\.(woff2?|ttf|otf|eot)$/i.test(filePath) ? false : undefined,
  },
})
