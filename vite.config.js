import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

// The folders these write into are not watched (a new file there would reload every open page, the recorder
// too); instead the module that lists them is marked stale, so the game picks the new files up when it next loads.
const stale = (server, file) => { for (const m of server.moduleGraph.getModulesByFile(path.resolve(__dirname, file)) || []) server.moduleGraph.invalidateModule(m); };

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
        fs.writeFileSync(path.join(dir, id + '.jpg'), Buffer.from(m[1], 'base64')); stale(server, 'src/main.js');
        res.end('ok');
      });
    });
  },
};

// Dev only: record.html saves a native speaker's recording of each word into assets/audio/words/<slug>.wav,
// where the game picks it up instead of the browser voice (see pronounce() in src/audio.js).
const saveWords = {
  name: 'save-words',
  configureServer(server) {
    server.middlewares.use('/__word', (req, res) => {
      const id = new URL(req.url, 'http://x').searchParams.get('id') || '';
      if (!/^[a-z0-9 -]{1,40}$/.test(id) || !['POST', 'DELETE'].includes(req.method)) { res.statusCode = 400; return res.end('bad request'); }
      const dir = path.resolve(__dirname, 'assets/audio/words'), file = path.join(dir, id + '.wav');
      if (req.method === 'DELETE') { fs.rmSync(file, { force: true }); stale(server, 'src/audio.js'); return res.end('ok'); }
      const chunks = [];
      req.on('data', (c) => chunks.push(c));
      req.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (buf.length < 44 || buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE' || buf.length > 3e6) { res.statusCode = 400; return res.end('not a wav'); }
        fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(file, buf); stale(server, 'src/audio.js'); res.end('ok');
      });
    });
  },
};

// base './': the built game uses relative paths, so it runs from any folder (itch.io serves it from a sub-folder)
export default defineConfig({ base: './', plugins: [savePhotos, saveWords], server: { watch: { ignored: ['**/assets/audio/words/**', '**/assets/photos/**'] } } });
