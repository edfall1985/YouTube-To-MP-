const express = require("express");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🔥 YT to MP3 API Bro Joe is LIVE!");
});

app.post("/download", async (req, res) => {
  const { youtube_url } = req.body;
  if (!youtube_url) {
    return res.status(400).json({ status: "error", message: "youtube_url is required" });
  }

  // Dummy response dulu, belum download
  return res.json({
    status: "success",
    message: "Pretending to download...",
    url: youtube_url
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
