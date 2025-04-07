const express = require("express");
const cors = require("cors");
const { YtDlpWrap } = require("yt-dlp-wrap");
const fs = require("fs");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Folder untuk hasil download
const downloadFolder = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadFolder)) fs.mkdirSync(downloadFolder);

// API Status
app.get("/", (req, res) => {
  res.send("YT to MP3 API Bro Joe is LIVE!");
});

// API Download
app.post("/download", async (req, res) => {
  const { youtube_url } = req.body;
  if (!youtube_url) return res.status(400).json({ error: "youtube_url required" });

  const filename = `yt-${Date.now()}.mp3`;
  const filepath = path.join(downloadFolder, filename);

  const ytDlpWrap = new YtDlpWrap();

  try {
    await ytDlpWrap.execPromise([
      youtube_url,
      "-x",
      "--audio-format", "mp3",
      "-o", filepath
    ]);

    const publicUrl = `/downloads/${filename}`;
    res.json({
      status: "ok",
      message: "Download complete",
      url: publicUrl
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

// Buat file hasil download bisa diakses publik
app.use("/downloads", express.static(downloadFolder));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
