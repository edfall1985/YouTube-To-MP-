const express = require("express");
const cors = require("cors");
const fs = require("fs");
const ytdlp = require("yt-dlp-exec");
const { v4: uuidv4 } = require("uuid");
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/download", express.static("download"));

const PORT = process.env.PORT || 8080;

app.post("/api/convert", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  const id = uuidv4();
  const output = `download/${id}.mp3`;

  try {
    await ytdlp(url, {
      output: output,
      extractAudio: true,
      audioFormat: "mp3",
      audioQuality: 0
    });

    return res.json({ success: true, download: `/download/${id}.mp3` });
  } catch (err) {
    console.error("yt-dlp failed:", err);
    return res.status(500).json({ error: "yt-dlp failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
