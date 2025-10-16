const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

export const initCustomAudioPlayer = (messageElement) => {
  const audioEl = messageElement.querySelector('audio');
  const playButton = messageElement.querySelector('.audio-control-button i');
  const timeDisplay = messageElement.querySelector('.audio-time-display');
  const progressBar = messageElement.querySelector('.audio-progress-bar');

  if (!audioEl || !playButton || !timeDisplay) return;

  audioEl.addEventListener('loadedmetadata', () => {
    timeDisplay.textContent = formatTime(audioEl.duration);
  });

  playButton.parentElement.addEventListener('click', () => {
    if (audioEl.paused) {
      audioEl.play().catch(error => console.error("Error playing audio:", error));
      playButton.classList.remove('fa-play');
      playButton.classList.add('fa-pause');
    } else {
      audioEl.pause();
      playButton.classList.remove('fa-pause');
      playButton.classList.add('fa-play');
    };
  });

  audioEl.addEventListener('timeupdate', () => {
    const elapsed = audioEl.currentTime;
    const duration = audioEl.duration;

    // Mostrar el tiempo transcurrido (sumando desde 0:00)
    timeDisplay.textContent = formatTime(elapsed); 

    // Actualizar la barra de progreso (relleno)
    if (isFinite(duration) && duration > 0) {
      const progressPercent = (elapsed / duration) * 100;
      progressBar.style.setProperty('--audio-progress', `${progressPercent}%`);
    };
  });

  progressBar.addEventListener('click', (e) => {
      // Asegúrate de que la duración esté disponible y sea válida
      if (!isFinite(audioEl.duration) || audioEl.duration <= 0) return;

      // Calcula la posición del clic como porcentaje del ancho de la barra
      const clickPosition = e.offsetX;
      const totalWidth = progressBar.offsetWidth;
      const clickPercent = clickPosition / totalWidth;

      // Calcula el nuevo tiempo y lo establece en el elemento de audio
      audioEl.currentTime = audioEl.duration * clickPercent;
      
      // No es necesario actualizar el display ni el progreso manualmente, 
      // el evento 'timeupdate' se dispara automáticamente al cambiar currentTime.
  });

  audioEl.addEventListener('ended', () => {
    playButton.classList.remove('fa-pause');
    playButton.classList.add('fa-play');
    audioEl.currentTime = 0;
    timeDisplay.textContent = formatTime(audioEl.duration);
    progressBar.style.setProperty('--audio-progress', `0%`);
  });
};