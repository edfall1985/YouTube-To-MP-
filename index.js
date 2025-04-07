
import express from "express";
import cors from "cors";
import fs from "fs";
import YTDlpWrap from "yt-dlp-wrap";
const app = express();
const port = process.env.PORT || 8080;
const ytdlp = YTDlpWrap("./yt-dlp");

if (!fs.existsSync("./download")) {
  fs.mkdirSync("./download");
}

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("🔥 YT to MP3 API Bro Joe is LIVE!");
});

app.post("/convert", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  const timestamp = Date.now();
  const outputPath = `./download/${timestamp}.mp3`;

  try {
    await ytdlp.execPromise([
      url,
      "-x",
      "--audio-format",
      "mp3",
      "-o",
      outputPath,
    ]);
    return res.json({ success: true, file: outputPath });
  } catch (error) {
    return res.status(500).json({ error: "yt-dlp failed", detail: error.message });
  }
});

app.listen(port, () => {
  console.log("YT to MP3 running on " + port);
});
