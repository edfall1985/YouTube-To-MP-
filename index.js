const express = require("express");
const path = require("path");
const { YTDlpWrap } = require("yt-dlp-wrap");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = process.env.PORT || 3000;

const ytDlp = new YTDlpWrap("./yt-dlp");

app.use(express.static("public"));
app.use("/downloads", express.static("downloads"));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/download", (req, res) => {
  const url = req.body.url;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  const fileName = `${uuidv4()}.mp3`;
  const filePath = path.join(__dirname, "downloads", fileName);

  const subprocess = ytDlp.exec([
    url,
    "-x",
    "--audio-format",
    "mp3",
    "-o",
    filePath,
  ]);

  subprocess.once("close", () => {
    res.json({ success: true, file: `/downloads/${fileName}` });
  });

  subprocess.stderr.on("data", (data) => {
    console.error(data.toString());
  });

  subprocess.on("error", (err) => {
    console.error("yt-dlp error:", err);
    res.status(500).json({ error: "yt-dlp failed" });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
