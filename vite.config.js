import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

// Dev only: lets the game save the journal photos of a full play-through into assets/photos/,
// where they become the default photos for words a player skipped (see BUNDLED in src/main.js).
const savePhotos = {
  name: 'save-photos',
  configureServer(server) {
    server.middlewares.use('/__photo', (req, res) => {
      const id = new URL(req.url, 'http://x').searchParams.get('id') || '';
      if (req.method !== 'POST' || !/^[a-z0-9]+$/.test(id)) { res.statusCode = 400; return res.end('bad request'); }
      let body = '';
      req.on('data', (c) => { body += c; });
      req.on('end', () => {
        const m = /^data:image\/jpeg;base64,(.+)$/.exec(body);
        if (!m) { res.statusCode = 400; return res.end('not a jpeg'); }
        const dir = path.resolve(__dirname, 'assets/photos');
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, id + '.jpg'), Buffer.from(m[1], 'base64'));
        res.end('ok');
      });
    });
  },
};

export default defineConfig({ plugins: [savePhotos] });
