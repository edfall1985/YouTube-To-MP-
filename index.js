const express = require("express");
const cors = require("cors");
const { YtDlpWrap } = require("yt-dlp-wrap");
const app = express();
const port = process.env.PORT || 3000;

const ytDlpWrap = new YtDlpWrap();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🔥 API YT to MP3 Bro Joe is LIVE!");
});

app.post("/download", async (req, res) => {
  const url = req.body.youtube_url;
  if (!url) return res.status(400).json({ error: "youtube_url is required" });

  try {
    const output = await ytDlpWrap.execPromise([
      url,
      "-x",
      "--audio-format", "mp3",
      "-o", "%(title)s.%(ext)s"
    ]);

    res.json({ message: "Download succeeded", log: output });
  } catch (err) {
    res.status(500).json({ error: "Download failed", detail: err.toString() });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
