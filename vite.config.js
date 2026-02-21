import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ command }) => ({
  // Keep root as current directory (index.html is here)
  root: '.',

  // Base path for GitHub Pages deployment
  // Set to repo name for production, '/' for development
  base: command === 'build' ? '/storybuilder-v1-static/' : '/',

  // Don't use publicDir - we handle static files with plugin
  publicDir: false,

  plugins: [
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
    open: true
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
