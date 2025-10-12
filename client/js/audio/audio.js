let mediaRecorder = null;
let audioChunks = [];
let stream = null;

// Inicia la grabación de audio. Recibe un callback que se ejecuta al detenerse la grabación.
export const startRecording = async (onStop) => {
	try {
		stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		mediaRecorder = new MediaRecorder(stream);
		audioChunks = [];

		mediaRecorder.ondataavailable = (event) => {
			if (event.data.size > 0) audioChunks.push(event.data);
		};

		mediaRecorder.onstop = async () => {
			try {
				const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
				const base64Audio = await blobToBase64(audioBlob);
				if (typeof onStop === 'function') onStop(base64Audio, audioBlob);
			} catch (error) {
				console.error('Error processing audio:', error);
			}
			cleanupStream();
		};

		mediaRecorder.start();
	} catch (error) {
		console.error('Error starting audio recording:', error);
		cleanupStream();
		if (typeof onStop === 'function') onStop(null, null, error);
	};
};

export const stopRecording = () => {
	if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
};

// Convierte un Blob a base64 (async)
const blobToBase64 = (blob) => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result.split(',')[1]);
		reader.onerror = reject;
		reader.readAsDataURL(blob);
	});
};

const cleanupStream = () => {
	if (stream) {
		stream.getTracks().forEach(track => track.stop());
		stream = null;
	};
	mediaRecorder = null;
	audioChunks = [];
};