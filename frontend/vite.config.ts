import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    // en dev, igual que vercel.json: /juego/ sirve el build estático del minijuego
    {
      name: 'juego-dev',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/juego/' || req.url === '/juego/equipo')
            req.url = '/juego/index.html';
          next();
        });
      },
    },
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL ?? 'http://localhost:3000',
        changeOrigin: true,
        // igual que el rewrite de vercel.json: /api/x → backend/x
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
});
