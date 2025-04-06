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
  if (!url) return res.status(400).json({ error: "Masukkan link Youtube..." });

  ytDlpWrap.execPromise([
    url,
    "-x",
    "--audio-format",
    "mp3",
    "-o",
    "%(title)s.%(ext)s"
  ])
  .then(result => {
    res.json({ message: "Download berhasil", log: result });
  })
  .catch(err => {
    res.status(500).json({ error: "Download gagal", detail: err.toString() });
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
