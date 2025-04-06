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
  res.send("🔥 YT to MP3 API Bro Joe is LIVE!");
});

app.post("/download", async (req, res) => {
  const url = req.body.youtube_url;
  if (!url) return res.status(400).json({ error: "youtube_url is required" });

  const ytDlpWrap = new YtDlpWrap();
  const outputFile = `audio-${Date.now()}.mp3`;
  const outputPath = path.join(__dirname, outputFile);

  try {
    await ytDlpWrap.execPromise([
      url,
      "-x",
      "--audio-format",
      "mp3",
      "-o",
      outputPath,
    ]);

    res.download(outputPath, outputFile, () => {
      fs.unlinkSync(outputPath); // hapus file setelah download
    });
  } catch (err) {
    console.error("❌ Download error:", err);
    res.status(500).json({ error: "Download failed", detail: err.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
