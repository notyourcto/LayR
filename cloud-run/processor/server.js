import express from 'express';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 32 * 1024 * 1024 } }); // 32MB

app.get('/healthz', (_req, res) => res.status(200).send('ok'));

app.post('/process', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Missing 'file' field" });

    const { removeBackground } = await import('@imgly/background-removal-node');

    // Determine MIME
    const buf = req.file.buffer;
    const mime = req.file.mimetype || detectMime(buf) || 'image/png';
    const blob = new Blob([buf], { type: mime });

    const out = await removeBackground(blob);

    let body;
    if (out instanceof Uint8Array) body = out;
    else if (out instanceof ArrayBuffer) body = new Uint8Array(out);
    else if (out && typeof out.arrayBuffer === 'function') body = new Uint8Array(await out.arrayBuffer());
    else return res.status(500).json({ error: 'Unexpected output type from removeBackground' });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).end(Buffer.from(body));
  } catch (e) {
    console.error('/process error:', e);
    return res.status(500).json({ error: 'Processing failed', details: String(e?.message || e) });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`processor listening on ${port}`));

function detectMime(buf) {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 && buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a) return 'image/png';
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length >= 12 && buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp';
  return undefined;
}
