const express = require("express");
const { exec } = require("child_process");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/download", (req, res) => {
  const url = req.body.youtube_url;
  if (!url) return res.status(400).json({ error: "youtube_url is required" });

  const command = `yt-dlp -x --audio-format mp3 ${url}`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Error:", stderr);
      return res.status(500).json({ error: "Download failed" });
    }
    console.log("✅ Success:", stdout);
    res.json({ message: "Download succeeded", log: stdout });
  });
});





