const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

// Buat folder download kalau belum ada
const downloadDir = path.join(__dirname, "download");
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}

app.use(express.static("public"));
app.use(express.json());

app.post("/mp3", (req, res) => {
  const url = req.body.url;
  if (!url) {
    return res.status(400).json({ error: "No URL provided" });
  }

  const filename = `audio_${Date.now()}.mp3`;
  const filepath = path.join(downloadDir, filename);
  const command = `./yt-dlp -x --audio-format mp3 -o "${filepath}" "${url}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`yt-dlp failed: ${stderr}`);
      return res.status(500).json({ error: "yt-dlp failed" });
    }

    res.json({ success: true, file: `/download/${filename}` });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
