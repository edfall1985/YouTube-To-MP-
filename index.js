const express = require("express");
const cors = require("cors");
const { YtDlpWrap } = require("yt-dlp-wrap");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve HTML

// Serve HTML utama
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Endpoint download
app.post("/download", async (req, res) => {
  const { youtube_url } = req.body;
  if (!youtube_url) return res.status(400).json({ error: "URL not provided" });

  const ytDlpWrap = new YtDlpWrap();
  const outputFilePath = `audio_${Date.now()}.mp3`;
  const fileStream = fs.createWriteStream(outputFilePath);

  try {
    await new Promise((resolve, reject) => {
      ytDlpWrap
        .execStream([
          youtube_url,
          "--extract-audio",
          "--audio-format", "mp3",
          "-o", outputFilePath,
        ])
        .stdout.pipe(fileStream)
        .on("finish", resolve)
        .on("error", reject);
    });

    res.json({ log: `Downloaded to ${outputFilePath}` });
  } catch (err) {
    res.status(500).json({ error: "Download failed", detail: err.message });
  }
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server aktif di port ${port}`);
});
