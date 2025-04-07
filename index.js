const express = require("express");
const cors = require("cors");
const { YTDlpWrap } = require("yt-dlp-wrap");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const ytdlp = new YTDlpWrap();

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
  const filepath = path.join(__dirname, filename);

  try {
    const subprocess = ytdlp.exec([
      url,
      "-x",
      "--audio-format", "mp3",
      "-o", filepath
    ]);

    subprocess.on("close", () => {
      res.json({
        message: "Download complete",
        url: `https://YOUR_CDN_OR_DRIVE_URL/${filename}` // ganti kalau ingin tampilkan link hasil
      });

      // Hapus file lokal setelah beberapa waktu (opsional)
      setTimeout(() => fs.unlinkSync(filepath), 60000);
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
      detail: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
