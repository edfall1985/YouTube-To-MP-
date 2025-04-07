const express = require("express");
const cors = require("cors");
const YtDlpWrap = require("yt-dlp-wrap");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const ytDlpWrap = new YtDlpWrap("./yt-dlp");

app.get("/", (req, res) => {
  res.send("🔥 YT to MP3 API Bro Joe is LIVE!");
});

app.post("/download", async (req, res) => {
  const videoUrl = req.body.url;

  if (!videoUrl) {
    return res.status(400).json({ error: "No URL provided" });
  }

  const outputFile = `download/audio-${Date.now()}.mp3`;
  const downloader = ytDlpWrap.exec([
    videoUrl,
    "--extract-audio",
    "--audio-format", "mp3",
    "-o", outputFile
  ]);

  downloader.on("close", () => {
    res.json({
      status: "success",
      url: `/${outputFile}`
    });
  });

  downloader.on("error", (err) => {
    res.status(500).json({ error: "yt-dlp failed", detail: err.message });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
