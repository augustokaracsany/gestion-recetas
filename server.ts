import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes returning local offline fallback data to prevent quota/rate-limit errors
  app.post('/api/ai/search-grounding', (_req, res) => {
    res.json({
      text: 'Respuesta offline generada por el asistente culinario de Gusto. Para obtener los mejores resultados y evitar límites de cuota, la aplicación opera en modo local con catálogos verificados.',
      chunks: [{ web: { title: 'Gusto Base de Conocimiento Culinario', uri: 'https://gusto.app' } }]
    });
  });

  app.post('/api/ai/maps-grounding', (_req, res) => {
    res.json({
      text: 'Sucursales recomendadas en CABA: Coto Abasto, Coto Recoleta, Carrefour Palermo y Jumbo Belgrano.',
      chunks: [{ maps: { title: 'Coto Abasto - Agüero 557, CABA', uri: 'https://maps.google.com' } }]
    });
  });

  app.post('/api/ai/price-compare', (_req, res) => {
    res.json({
      text: 'Comparativa de precios estimada en CABA: Los precios se mantienen estables en Coto Digital, Carrefour y Jumbo con un promedio competitivo para ingredientes frescos.',
      chunks: [{ web: { title: 'Precios CABA Gusto', uri: 'https://gusto.app' } }]
    });
  });

  // Vite middleware setup
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
