import express from "express";
import { exec, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/downloads", express.static("downloads"));

// Buat folder jika belum ada
if (!fs.existsSync("downloads")) fs.mkdirSync("downloads");

// Ubah permission untuk yt-dlp, ffmpeg, ffprobe
["yt-dlp", "ffmpeg", "ffprobe"].forEach(tool => {
  try {
    execSync(`chmod +x ./${tool}`);
    console.log(`✅ ${tool} executable`);
  } catch {
    console.warn(`⚠️ ${tool} chmod gagal`);
  }
});

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/convert", (req, res) => {
  const url = req.body.url;
  if (!url) return res.send("❌ URL tidak boleh kosong!");

  const filename = `audio_${Date.now()}.mp3`;
  const filepath = `downloads/${filename}`;
  const command = `./yt-dlp -x --audio-format mp3 --ffmpeg-location ./ -o "${filepath}" "${url}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ yt-dlp error:", stderr);
      return res.send(`<p>❌ Gagal convert: ${stderr}</p>`);
    }

    console.log("✅ Convert sukses:", filename);
    res.send(`
      <h2>✅ Convert sukses</h2>
      <a href="/${filepath}" download>Download MP3</a>
    `);
  });
});

app.listen(port, () => {
  console.log(`🚀 Server aktif di http://localhost:${port}`);
});
