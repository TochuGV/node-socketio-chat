import { generateWaveform, renderWaveform } from "./audio-waveform.js";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
};

let currentlyPlayingAudio = null;

export const initCustomAudioPlayer = (messageElement) => {
  const audioElement = messageElement.querySelector('audio');
  const playButton = messageElement.querySelector('.audio-control-button i');
  const timeDisplay = messageElement.querySelector('.audio-time-display');
  const waveformElement = messageElement.querySelector('.audio-waveform');

  if (!audioElement || !playButton || !timeDisplay) return;

  audioElement.addEventListener('loadedmetadata', () => {
    timeDisplay.textContent = formatTime(audioElement.duration);
  });

  if (waveformElement) {
    const waveformWidth = waveformElement.offsetWidth;
    const barWidth = 5;
    const bars = Math.floor(waveformWidth / barWidth);

    generateWaveform(audioElement, bars).then(amplitudes => {
      renderWaveform(waveformElement, amplitudes);
    }).catch(error => {
      console.error("Error generating waveform:", error);
    });
  };

  playButton.parentElement.addEventListener('click', () => {
    if (audioElement.paused) {
      if (currentlyPlayingAudio && currentlyPlayingAudio !== audioElement) {
        currentlyPlayingAudio.pause();
        currentlyPlayingAudio.currentTime = 0;

        const otherButton = currentlyPlayingAudio.parentElement.querySelector('.audio-control-button i');
        if (otherButton) {
          otherButton.classList.remove('fa-pause');
          otherButton.classList.add('fa-play');
        };
      };
      audioElement.play().catch(error => console.error("Error playing audio:", error));
      playButton.classList.remove('fa-play');
      playButton.classList.add('fa-pause');
      currentlyPlayingAudio = audioElement;
    } else {
      audioElement.pause();
      playButton.classList.remove('fa-pause');
      playButton.classList.add('fa-play');
      currentlyPlayingAudio = null;
    };
  });

  audioElement.addEventListener('timeupdate', () => {
    const elapsed = audioElement.currentTime;
    const duration = audioElement.duration;
    timeDisplay.textContent = formatTime(elapsed); 

    if (isFinite(duration) && duration > 0) {
      const progress = elapsed / duration;
      if (waveformElement) {
        const bars = waveformElement.children.length;
        const playedBars = Math.floor(progress * bars);
        [...waveformElement.children].forEach((bar, index) => {
          bar.classList.toggle('played', index < playedBars);
        });
      };
    };
  });

  audioElement.addEventListener('ended', () => {
    playButton.classList.remove('fa-pause');
    playButton.classList.add('fa-play');
    audioElement.currentTime = 0;
    timeDisplay.textContent = formatTime(audioElement.duration);
    currentlyPlayingAudio = null;
  });
};