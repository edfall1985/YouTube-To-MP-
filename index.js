import express from "express";
import { exec, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/downloads", express.static("downloads"));

try {
  execSync("chmod +x ./yt-dlp");
  console.log("✅ yt-dlp marked as executable.");
} catch (e) {
  console.warn("⚠️ chmod failed. Mungkin tidak dibutuhkan (Windows).");
}

const downloadFolder = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadFolder)) {
  fs.mkdirSync(downloadFolder);
  console.log("📁 Folder /downloads dibuat.");
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/convert", (req, res) => {
  const url = req.body.url;
  if (!url) return res.send("❌ URL tidak boleh kosong!");

  const filename = `audio_${Date.now()}.mp3`;
  const filepath = path.join("downloads", filename);
  const command = `./yt-dlp -x --audio-format mp3 -o "${filepath}" "${url}"`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ yt-dlp failed:", stderr);
      return res.send(`<p>Error: yt-dlp failed<br><pre>${stderr}</pre></p>`);
    }

    console.log("✅ Convert berhasil:", filename);
    res.send(`
      <h2>✅ Convert sukses</h2>
      <a href="/downloads/${filename}" download>Download MP3</a>
    `);
  });
});

app.listen(port, () => {
  console.log(`🚀 Server aktif di http://localhost:${port}`);
});
