const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");

try {
  execSync("chmod +x ./yt-dlp");
  console.log("✅ yt-dlp permission set");
} catch (e) {
  console.error("❌ chmod failed", e.message);
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // frontend

app.get("/", (req, res) => {
  res.send("🔥 YT to MP3 API Bro Joe is LIVE!");
});

app.post("/download", async (req, res) => {
  const url = req.body.youtube_url;
  if (!url) return res.status(400).json({ error: "youtube_url is required" });

  const filename = `audio_${Date.now()}.mp3`;
  const filepath = path.join(__dirname, filename);

  const ytDlp = spawn("./yt-dlp", [
    "-x",
    "--audio-format",
    "mp3",
    "-o",
    filepath,
    url,
  ]);

  ytDlp.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  ytDlp.on("close", (code) => {
    if (code === 0) {
      res.json({
        status: "success",
        file: filename,
        message: "Download complete",
      });
    } else {
      res.status(500).json({ error: "yt-dlp failed", code });
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
