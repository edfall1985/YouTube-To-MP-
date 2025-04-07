const express = require("express");
const cors = require("cors");
const ytDlpWrap = require("yt-dlp-wrap");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const ytdlp = new ytDlpWrap(); // FIX di sini

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🔥 YT to MP3 API Bro Joe is LIVE!");
});

app.post("/download", async (req, res) => {
  const url = req.body.youtube_url;
  if (!url) {
    return res.status(400).json({ error: "youtube_url is required" });
  }

  const filename = `audio-${Date.now()}.mp3`;
  const outputPath = path.join(__dirname, filename);

  try {
    const subprocess = ytdlp.exec([
      url,
      "-x", "--audio-format", "mp3",
      "-o", outputPath,
    ]);

    subprocess.on("close", () => {
      res.json({
        message: "Success, downloaded file (simulasi)",
        url: "-"
      });

      // Auto-delete dalam 1 menit (opsional)
      setTimeout(() => {
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
      }, 60000);
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
