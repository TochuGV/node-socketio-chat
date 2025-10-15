import { getVolume, setVolume } from "../notifications/notifications.js";

export const initVolumeSlider = () => {
  const volumeSlider = document.getElementById('volume-slider');
  if(!volumeSlider) return;
  
  const savedVolume = localStorage.getItem('notificationVolume');
  const initialVolume = savedVolume ? Number(savedVolume) : getVolume();
  volumeSlider.value = initialVolume;

  const updateGradient = (value) => {
    const percentage = (value / volumeSlider.max) * 100;
    volumeSlider.style.setProperty('--slider-fill-percent', `${percentage}%`);
  };

  updateGradient(initialVolume);

  volumeSlider.addEventListener('input', (e) => {
    const value = Number(e.target.value);
    setVolume(value);
    updateGradient(value);
  });
};