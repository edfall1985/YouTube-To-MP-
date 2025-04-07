const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { YtDlpWrap } = require("yt-dlp-wrap");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve frontend

const ytdlp = new YtDlpWrap();

app.post("/download", async (req, res) => {
  const url = req.body.youtube_url;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const output = `./output/${Date.now()}.mp3`;
    let log = "";

    await new Promise((resolve, reject) => {
      ytdlp
        .exec([
          url,
          "-f", "bestaudio",
          "--extract-audio",
          "--audio-format", "mp3",
          "-o", output
        ])
        .on("progress", p => {
          log += `[${p.percent}] ${p.eta}\n`;
        })
        .on("error", reject)
        .on("close", () => {
          resolve();
        });
    });

    res.json({
      status: "success",
      message: "Download complete",
      url: output,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Server error",
      detail: err.toString(),
    });
  }
});

app.listen(port, () => {
  console.log(`Server ready on port ${port}`);
});
