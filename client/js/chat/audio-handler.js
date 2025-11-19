import { startRecording, stopRecording } from "../audio/audio.js";
import { sendAudioMessage } from "../sockets/socket.js";

const setupAudioHandler = (socket, username) => {
  const sendAudioButton = document.getElementById('send-audio');
  let isRecording = false;

  sendAudioButton.addEventListener('click', () => {
    if (!isRecording) {
      isRecording = true;
      sendAudioButton.classList.add('recording');
      sendAudioButton.innerHTML = '<i class="fa-solid fa-microphone fa-spin"></i>';
      
      startRecording((base64Audio, audioBlob, error) => {
        isRecording = false;
        sendAudioButton.classList.remove('recording');
        sendAudioButton.innerHTML = '<i class="fa-solid fa-microphone"></i>';
        if (error) {
          alert('No se pudo grabar el audio. ' + error.message);
          return;
        }
        if (base64Audio && audioBlob) sendAudioMessage(socket, username, base64Audio, audioBlob.type);
      });
    } else {
      stopRecording();
    }
  });
};

export default setupAudioHandler;