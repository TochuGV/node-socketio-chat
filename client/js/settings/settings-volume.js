
import { getVolume, setVolume } from "../notifications/notifications.js";

export const initVolumeSlider = () => {
  const volumeSlider = document.getElementById('volume-slider');
  if(!volumeSlider) return;
  
  volumeSlider.value = getVolume();
  volumeSlider.addEventListener('input', (e) => {
    setVolume(Number(e.target.value));
  });
};