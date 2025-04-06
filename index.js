const express = require("express");
const cors = require("cors");
const { YtDlpWrap } = require("yt-dlp-wrap");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const ytdlpWrap = new YtDlpWrap();

app.get("/", (req, res) => {
  res.send("🔥 API YT to MP3 Bro Joe is LIVE!");
});

app.post("/download", async (req, res) => {
  const url = req.body.youtube_url;
  if (!url) return res.status(400).json({ error: "youtube_url is required" });

  const filename = `${uuidv4()}.mp3`;
  const outputPath = `/tmp/${filename}`;

  try {
    await new Promise((resolve, reject) => {
      ytdlpWrap
        .exec([
          url,
          "-x",
          "--audio-format",
          "mp3",
          "-o",
          outputPath,
        ])
        .on("error", reject)
        .on("close", resolve);
    });

    const file = fs.createReadStream(outputPath);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "audio/mpeg");
    file.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Download failed",
      detail: err.message || "Unknown error",
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
