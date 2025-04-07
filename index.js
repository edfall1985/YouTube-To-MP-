const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { YTDlpWrap } = require("yt-dlp-wrap");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Set permission untuk yt-dlp agar bisa dijalankan
try {
  fs.chmodSync("./yt-dlp", 0o755);
  console.log("yt-dlp permission set to executable.");
} catch (err) {
  console.error("Failed to set chmod on yt-dlp:", err);
}

// Instance yt-dlp
const ytDlp = new YTDlpWrap("./yt-dlp");

// Endpoint root
app.get("/", (req, res) => {
  res.send("🔥 YT to MP3 API Bro Joe is LIVE!");
});

// Endpoint untuk download MP3
app.post("/download", async (req, res) => {
  const youtubeUrl = req.body.youtube_url;
  if (!youtubeUrl) {
    return res.status(400).json({ error: "youtube_url missing" });
  }

  try {
    let output = "";
    ytDlp
      .exec([
        youtubeUrl,
        "-f",
        "bestaudio",
        "-x",
        "--audio-format",
        "mp3",
        "-o",
        "downloads/%(title)s.%(ext)s",
      ])
      .on("progress", (progress) => {
        console.log("Progress:", progress.percent);
      })
      .on("error", (err) => {
        console.error("yt-dlp failed:", err);
        res.status(500).json({ error: "yt-dlp failed" });
      })
      .on("close", () => {
        console.log("Download completed!");
        res.json({
          status: "success",
          message: "Download complete!",
          url: "MP3 saved on server (no direct download here)",
        });
      });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({
      error: "Server error",
      detail: err.message || err.toString(),
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
