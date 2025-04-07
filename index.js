const express = require("express");
const cors = require("cors");
const { default: YtDlpWrap } = require("yt-dlp-wrap"); // FIX DI SINI
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
  const videoUrl = req.body.youtube_url;

  if (!videoUrl) {
    return res.status(400).json({ error: "YouTube URL is required" });
  }

  try {
    const ytDlpWrap = new YtDlpWrap(); // Ini sekarang udah valid
    const filename = `audio_${Date.now()}.mp3`;
    const filepath = path.join(__dirname, filename);

    const subprocess = ytDlpWrap
      .exec([
        videoUrl,
        "-f",
        "bestaudio",
        "--extract-audio",
        "--audio-format",
        "mp3",
        "-o",
        filename,
      ])
      .on("close", () => {
        if (fs.existsSync(filepath)) {
          res.json({
            status: "success",
            message: "Download complete",
            url: `https://youtube-to-mp3-production.up.railway.app/files/${filename}`,
          });
        } else {
          res.status(500).json({ error: "Conversion failed." });
        }
      });
  } catch (err) {
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

app.use("/files", express.static(__dirname));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
