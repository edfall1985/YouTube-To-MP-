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

// Otomatis unduh yt-dlp saat runtime jika belum ada
const ytDlpPath = path.join(__dirname, "yt-dlp");
if (!fs.existsSync(ytDlpPath)) {
  console.log("Mengunduh yt-dlp...");
  execSync(`curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o "${ytDlpPath}"`);
  execSync(`chmod +x "${ytDlpPath}"`);
  console.log("✅ yt-dlp siap digunakan.");
}

// Buat folder downloads jika belum ada
const downloadDir = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
  console.log("📁 Folder 'downloads' dibuat.");
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/convert", (req, res) => {
  const url = req.body.url;
  if (!url) return res.send("❌ URL tidak boleh kosong!");

  const filename = `audio_${Date.now()}.mp3`;
  const filepath = path.join("downloads", filename);
  const command = `${ytDlpPath} -x --audio-format mp3 -o "${filepath}" "${url}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("yt-dlp failed:", stderr);
      return res.send(`<p>❌ Gagal convert: ${stderr}</p>`);
    }

    console.log("✅ Convert sukses:", filename);
    res.send(`
      <h2>✅ Berhasil dikonversi!</h2>
      <a href="/downloads/${filename}" download>Download MP3</a>
    `);
  });
});

app.listen(port, () => {
  console.log(`🚀 Server aktif di http://localhost:${port}`);
});

