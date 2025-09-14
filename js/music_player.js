// 确保只在播放器存在时执行脚本
if (document.getElementById('musicPlayerContainer')) {
  document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const audio = document.getElementById('audioPlayer');
    const albumCover = document.getElementById('albumCover');
    const albumImage = document.getElementById('albumImage');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressHandle = document.getElementById('progressHandle');
    const volumeBtn = document.getElementById('volumeBtn');
    
    let isDraggingProgress = false;

    // 根据 audio 元素的真实状态更新UI
    function updatePlayPauseUI() {
      if (audio.paused) {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        albumImage.classList.remove('rotate');
      } else {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        albumImage.classList.add('rotate');
      }
    }

    // 切换播放/暂停
    function togglePlayPause() {
      if (audio.paused) {
        audio.play().catch(error => {
          console.error("播放失败:", error.name, error.message);
          updatePlayPauseUI(); // 确保UI同步
        });
      } else {
        audio.pause();
      }
    }

    // 绑定 audio 元素的事件
    audio.onplay = updatePlayPauseUI;
    audio.onpause = updatePlayPauseUI;
    audio.onended = () => { progressBar.style.width = '0%'; audio.currentTime = 0; };
    audio.ontimeupdate = function() {
      if (!isDraggingProgress) {
        // 使用 || 0 来防止 duration 为 NaN 时出错
        const percent = (audio.currentTime / audio.duration) * 100 || 0;
        progressBar.style.width = `${percent}%`;
      }
    };

    // 为页面元素绑定点击和拖拽事件
    albumCover.addEventListener('click', togglePlayPause);
    playPauseBtn.addEventListener('click', togglePlayPause);

    // 进度条处理
    progressContainer.addEventListener('click', function(e) {
      const rect = progressContainer.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pos * audio.duration;
    });
    progressHandle.addEventListener('mousedown', () => { isDraggingProgress = true; });
    document.addEventListener('mousemove', function(e) {
      if (isDraggingProgress) {
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audio.currentTime = Math.max(0, Math.min(pos, 1)) * audio.duration;
      }
    });
    document.addEventListener('mouseup', () => { isDraggingProgress = false; });
    
    // 静音按钮处理
    volumeBtn.addEventListener('click', function() {
      audio.muted = !audio.muted;
      volumeBtn.classList.toggle('muted', audio.muted);
    });
  });
}

