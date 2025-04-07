const express = require("express");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

const { execSync } = require("child_process");
execSync("chmod +x ./yt-dlp");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("<h2>🔥 YT to MP3 API Bro Joe is LIVE!</h2>");
});

app.post("/api/download", async (req, res) => {
  const url = req.body.url;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  const filename = `audio_${Date.now()}.mp3`;
  const filepath = path.join(__dirname, "download", filename);

  try {
    // Jalankan yt-dlp sebagai executable
    execFile(
      path.join(__dirname, "yt-dlp"),
      [
        "-x",
        "--audio-format",
        "mp3",
        "-o",
        filepath,
        url
      ],
      (error, stdout, stderr) => {
        if (error) {
          console.error("yt-dlp failed:", stderr);
          return res.status(500).json({ error: "yt-dlp failed", detail: stderr });
        }

        console.log("yt-dlp finished:", stdout);
        res.json({ success: true, message: "Download complete", url: `/download/${filename}` });
      }
    );
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error", detail: err.message });
  }
});

app.use("/download", express.static(path.join(__dirname, "download")));

app.listen(port, () => {
  console.log(`YT to MP3 server running on port ${port}`);
});
