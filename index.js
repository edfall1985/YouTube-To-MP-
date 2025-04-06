const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🔥 YT to MP3 API by Bro Joe is LIVE!");
});

app.post("/download", (req, res) => {
  const url = req.body.youtube_url;
  if (!url) {
    return res.status(400).json({ error: "youtube_url is required" });
  }

  // Maksimalkan efisiensi dan batasi file besar
  const command = `yt-dlp -x --audio-format mp3 --max-filesize 20M -o "%(title)s.%(ext)s" ${url}`;

  exec(command, { timeout: 60_000 }, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Error:", stderr);
      return res.status(500).json({ error: "Download failed", detail: stderr });
    }

    console.log("✅ Success:", stdout);
    res.json({ message: "Download succeeded", output: stdout });
  });
});

app.listen(port, () => {
  console.log(`🚀 Server ready on port ${port}`);
});
