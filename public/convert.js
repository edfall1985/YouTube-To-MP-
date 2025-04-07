
document.addEventListener("DOMContentLoaded", () => {
  const urlInput = document.getElementById('url');
  const ytPlayer = document.getElementById('yt-player');
  const previewDiv = document.getElementById('preview');
  const convertBtn = document.getElementById('convert-btn');

  function extractYouTubeID(url) {
    const regex = /(?:youtube\.com.*(?:v=|\/embed\/)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  async function loadRecommendations() {
    const container = document.getElementById('recommend-list');
    try {
      const res = await fetch('recommend.json');
      const urls = await res.json();
      container.innerHTML = '';

      for (let url of urls.slice(0, 19)) {
        const data = await fetch(`https://noembed.com/embed?url=${url}`).then(r => r.json());
        const div = document.createElement('div');
        div.className = 'recommend-thumb';
        div.innerHTML = `
          <img src="${data.thumbnail_url}" alt="${data.title}" />
          <div class="small">${data.title}</div>
        `;
        div.onclick = () => {
          urlInput.value = url;
          const id = extractYouTubeID(url);
          if (id) {
            ytPlayer.src = "https://www.youtube.com/embed/" + id;
            previewDiv.style.display = 'block';
          }
        };
        container.appendChild(div);
      }
    } catch (e) {
      console.error("Gagal load rekomendasi:", e);
      container.innerHTML = "<p class='text-danger'>Gagal memuat rekomendasi.</p>";
    }
  }

  function startDownload() {
    const url = urlInput.value;
    if (!url || (!url.includes("youtube.com") && !url.includes("youtu.be"))) {
      alert("Masukkan URL YouTube.");
      return;
    }

    const progress = document.querySelector('.progress');
    const progressBar = document.getElementById('progress-bar');
    const statusIcon = document.getElementById('status-icon');

    progress.style.display = 'block';
    progressBar.style.width = '0%';
    statusIcon.style.display = 'none';

    const eventSource = new EventSource('/convert?url=' + encodeURIComponent(url));
    eventSource.onmessage = function(event) {
      const data = JSON.parse(event.data);
      if (data.progress) {
        progressBar.style.width = data.progress + '%';
      }
      if (data.status === 'done') {
        progressBar.style.width = '100%';
        statusIcon.style.display = 'block';
        eventSource.close();
      }
    };
  }

  convertBtn.addEventListener("click", startDownload);
  loadRecommendations();
});
