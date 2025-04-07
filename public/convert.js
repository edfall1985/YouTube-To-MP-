
document.addEventListener("DOMContentLoaded", () => {
  console.log("convert.js loaded!");

  const urlInput = document.getElementById("url");
  const convertBtn = document.getElementById("convert-btn");
  const ytPlayer = document.getElementById("yt-player");
  const previewDiv = document.getElementById("preview");

  function extractYouTubeID(url) {
    const regex = /(?:youtube\.com.*(?:v=|\/embed\/)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  function startDownload() {
    const url = urlInput.value.trim();
    if (!url || (!url.includes("youtube.com") && !url.includes("youtu.be"))) {
      alert("Masukkan URL YouTube.");
      return;
    }

    console.log("Mulai convert:", url);

    const progress = document.querySelector(".progress");
    const progressBar = document.getElementById("progress-bar");
    const statusIcon = document.getElementById("status-icon");

    progress.style.display = "block";
    progressBar.style.width = "0%";
    statusIcon.style.display = "none";

    const id = extractYouTubeID(url);
    if (id) {
      ytPlayer.src = "https://www.youtube.com/embed/" + id;
      previewDiv.style.display = "block";
    }

    const eventSource = new EventSource("/convert?url=" + encodeURIComponent(url));
    eventSource.onmessage = function (event) {
      const data = JSON.parse(event.data);
      if (data.progress) {
        progressBar.style.width = data.progress + "%";
      }
      if (data.status === "done") {
        progressBar.style.width = "100%";
        statusIcon.style.display = "block";
        eventSource.close();
      }
    };
  }

  convertBtn.addEventListener("click", startDownload);
});
