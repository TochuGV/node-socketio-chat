export const generateWaveform = async (audioElement, bars = 60) => {
  const base64 = audioElement.src.split(',')[1];
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  
  for (let i = 0; i < binary.length; i++) {
    buffer[i] = binary.charCodeAt(i);
  };
  
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(buffer.buffer);

  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / bars);
  const amplitudes = [];

  for (let i = 0; i < bars; i++) {
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(channelData[i * blockSize + j]);
    };
    amplitudes.push(sum / blockSize);
  };

  const max = Math.max(...amplitudes);
  return amplitudes.map(a => a / max);
};

export const renderWaveform = (container, amplitudes) => {
  container.innerHTML = '';
  amplitudes.forEach(value => {
    const bar = document.createElement('div');
    bar.classList.add('audio-wave');
    const scale = Math.max(value, 0.1);
    bar.style.transform = `scaleY(${scale})`;
    container.appendChild(bar);
  });
};