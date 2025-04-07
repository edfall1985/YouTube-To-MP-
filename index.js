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

// === WAJIB: chmod agar yt-dlp bisa dijalankan di Railway ===
try {
  execSync("chmod +x ./yt-dlp");
  console.log("✅ yt-dlp sudah diberi izin eksekusi.");
} catch (e) {
  console.warn("⚠️ chmod gagal, mungkin tidak dibutuhkan di Windows:", e.message);
}

// Buat folder download jika belum ada
const downloadFolder = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadFolder)) {
  fs.mkdirSync(downloadFolder);
  console.log("📁 Folder /downloads dibuat.");
}

// Route utama
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Endpoint Convert
app.post("/convert", (req, res) => {
  const url = req.body.url;
  if (!url) return res.send("❌ URL tidak boleh kosong!");

  const filename = `audio_${Date.now()}.mp3`;
  const filepath = path.join("downloads", filename);
  const command = `./yt-dlp -x --audio-format mp3 -o "${filepath}" "${url}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ yt-dlp error:", stderr);
      return res.send(`
        <p>❌ Gagal convert:</p>
        <pre>${stderr}</pre>
      `);
    }

    console.log("✅ Convert sukses:", filename);
    res.send(`
      <h2>✅ Sukses convert!</h2>
      <a href="/downloads/${filename}" download>Download MP3</a>
    `);
  });
});

app.listen(port, () => {
  console.log(`🚀 Server aktif di http://localhost:${port}`);
});
