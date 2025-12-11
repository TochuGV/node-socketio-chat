import { startRecording, stopRecording } from "../audio/audio.js";
import { sendAudioMessage } from "../sockets/socket.js";

const MAX_RECORDING_TIME_MS = 5 * 60 * 1000; // 5 Minutos

const setupAudioHandler = (socket, userId, username) => {
  const sendAudioButton = document.getElementById('send-audio');
  let isRecording = false;
  let recordingTimeout = null;

  sendAudioButton.addEventListener('click', () => {
    if (!isRecording) {
      isRecording = true;
      sendAudioButton.classList.add('recording');
      sendAudioButton.innerHTML = '<i class="fa-solid fa-microphone fa-spin"></i>';
      
      recordingTimeout = setTimeout(() => {
        if (isRecording) {
          stopRecording();
          alert("Tiempo máximo de grabación alcanzado (5 minutos).");
        }
      }, MAX_RECORDING_TIME_MS);

      startRecording((base64Audio, audioBlob, error) => {
        isRecording = false;
        if (recordingTimeout) clearTimeout(recordingTimeout);
        sendAudioButton.classList.remove('recording');
        sendAudioButton.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        if (error) {
          alert('No se pudo grabar el audio. ' + error.message);
          return;
        }
        if (base64Audio && audioBlob) sendAudioMessage(socket, null, null, base64Audio, audioBlob.type);
      });
    } else {
      stopRecording();
    }
  });
};

export default setupAudioHandler;