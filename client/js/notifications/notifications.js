const notificationSound = new Audio('/js/notifications/notification.mp3');
notificationSound.volume = 0.5;

export function playNotification(){
  notificationSound.currentTime = 0;
  notificationSound.play().catch(error => {
    console.warn('Could not play sound', error);
  });
};

export function getVolume(){
  return notificationSound.volume;
};

export function setVolume(value){
  const volume = Math.min(Math.max(value, 0), 1);
  notificationSound.volume = volume;
  localStorage.setItem('notificationVolume', volume);
};