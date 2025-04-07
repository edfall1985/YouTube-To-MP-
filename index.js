const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const ytdlp = new YTDlpWrap('./yt-dlp');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use('/download', express.static(path.join(__dirname, 'download')));

app.get("/", (req, res) => {
  res.send("YT to MP3 API Bro Joe is LIVE!");
});

app.post("/convert", (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ status: "error", message: "No URL provided" });
  }

import fs from 'fs';
  if (!fs.existsSync('./download')) {
    fs.mkdirSync('./download');
  }
  
  const filename = `audio-${Date.now()}.mp3`;
  const outputPath = path.join(__dirname, "download", filename);

  execFile("./yt-dlp", [
    "-x", "--audio-format", "mp3",
    "-o", outputPath,
    url
  ], (err) => {
    if (err) {
      return res.status(500).json({ status: "error", message: "yt-dlp failed", detail: err.message });
    }
    res.json({ status: "success", url: `/download/${filename}` });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
