const express = require("express");
const cors = require("cors");
const { execSync } = require("child_process");
const { YtDlpWrap } = require("yt-dlp-wrap"); // FIX di sini
const fs = require("fs");
const path = require("path");

try {
  execSync("curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp && chmod +x yt-dlp");
  console.log("yt-dlp downloaded");
} catch (e) {
  console.error("Failed to download yt-dlp", e.message);
}

const app = express();
const port = process.env.PORT || 3000;
const ytdlp = new YtDlpWrap("./yt-dlp"); // FIX constructor-nya

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🔥 YT to MP3 API Bro Joe is LIVE!");
});

app.post("/download", async (req, res) => {
  const url = req.body.youtube_url;
  if (!url) return res.status(400).json({ error: "youtube_url is required" });

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
        message: "Downloaded (simulasi)",
        url: "-"
      });

      setTimeout(() => {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      }, 60000);
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
