import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { existsSync, createReadStream } from 'fs';
import { extname } from 'path';

// MIME types for media files
const mimeTypes = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.json': 'application/json'
};

// Dev plugin to serve projects folder
function serveProjectsPlugin() {
  return {
    name: 'serve-projects',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/projects/')) {
          const filePath = resolve(__dirname, '.' + req.url.split('?')[0]);
          if (existsSync(filePath)) {
            const ext = extname(filePath).toLowerCase();
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            createReadStream(filePath).pipe(res);
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig(({ command }) => ({
  // Keep root as current directory (index.html is here)
  root: '.',

  // Base path for GitHub Pages deployment
  // Set to repo name for production, '/' for development
  base: command === 'build' ? '/storybuilder-v1-static/' : '/',

  // Don't use publicDir - we handle static files with plugin
  publicDir: false,

  plugins: [
    // Serve projects folder in dev mode
    serveProjectsPlugin(),
    // Copy static folders to dist on build
    viteStaticCopy({
      targets: [
        {
          src: 'projects/*',
          dest: 'projects',
          globOptions: {
            ignore: ['**/.git/**', '**/.DS_Store', '**/.gitattributes']
          }
        },
        { src: 'styles/*', dest: 'styles' }
      ]
    })
  ],

  server: {
    port: 3000,
    open: true,
    // Serve static files from projects folder in dev mode
    fs: {
      allow: ['.']
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: true,

    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app.html'),
        guide: resolve(__dirname, 'guide.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },

  // Resolve aliases for cleaner imports (optional, for future use)
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@blocks': resolve(__dirname, 'src/blocks')
    }
  }
}));
