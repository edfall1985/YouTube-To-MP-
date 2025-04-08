const express = require('express');
const path = require('path');
const fs = require('fs');
const ytdlp = require('yt-dlp-exec');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;
const downloadDir = path.join(__dirname, 'downloads');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create download directory if not exist
if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

// Auto cleanup: keep max 10 mp3
function autoCleanup() {
  const files = fs.readdirSync(downloadDir)
    .filter(f => f.endsWith('.mp3'))
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(downloadDir, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  const toDelete = files.slice(10);
  toDelete.forEach(file => {
    fs.unlinkSync(path.join(downloadDir, file.name));
    console.log('Auto deleted:', file.name);
  });
}

// Main convert endpoint
app.get('/convert', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).send('Missing URL');

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  const outputTemplate = path.join(downloadDir, '%(title)s.%(ext)s');

  const proc = ytdlp.exec(url, {
    extractAudio: true,
    audioFormat: 'mp3',
    output: outputTemplate,
    progress: true,
    noCheckCertificate: true,
    noWarnings: true
  });

  proc.stdout.on('data', (data) => {
    const match = data.toString().match(/(\d{1,3}\.\d)%/);
    if (match) {
      const progress = parseFloat(match[1]);
      send({ progress });
    }
  });

  proc.on('exit', () => {
    send({ status: 'done' });
    autoCleanup();
    res.end();
  });

  proc.on('error', (err) => {
    console.error(err);
    send({ error: 'Failed to download' });
    res.end();
  });
});

// Download file
app.get('/download/:filename', (req, res) => {
  const file = path.join(downloadDir, req.params.filename);
  if (fs.existsSync(file)) {
    res.download(file);
  } else {
    res.status(404).send('File not found');
  }
});

// File listing
app.get('/list-files', (req, res) => {
  const files = fs.existsSync(downloadDir)
    ? fs.readdirSync(downloadDir).filter(f => f.endsWith('.mp3'))
    : [];
  res.json(files);
});

app.post('/delete-files', (req, res) => {
  const files = req.body.files || [];
  files.forEach(file => {
    const full = path.join(downloadDir, file);
    if (fs.existsSync(full)) fs.unlinkSync(full);
  });
  res.sendStatus(200);
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  autoCleanup();
});
