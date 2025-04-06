const express = require("express");
const cors = require("cors");
const { YtDlpWrap } = require("yt-dlp-wrap");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🔥 API YT to MP3 Bro Joe is LIVE using yt-dlp-wrap!");
});

app.post("/download", async (req, res) => {
  const url = req.body.youtube_url;
  if (!url) return res.status(400).json({ error: "youtube_url is required" });

  const fileName = `audio_${Date.now()}.mp3`;
  const filePath = path.join(__dirname, fileName);
  const ytdlp = new YtDlpWrap();

  try {
    await ytdlp.execPromise([
      url,
      "-x",
      "--audio-format",
      "mp3",
      "-o",
      filePath,
    ]);

    res.download(filePath, fileName, () => {
      fs.unlinkSync(filePath); // delete after download
    });
  } catch (err) {
    res.status(500).json({ error: "Download failed", detail: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
