const notificationSound = new Audio('/js/notifications/notification.mp3');
notificationSound.volume = 0.5;

export const playNotification = () => {
  notificationSound.currentTime = 0;
  notificationSound.play().catch(error => {
    console.warn('Could not play sound', error);
  });
};

export const getVolume = () => {
  return notificationSound.volume * 100;
};

export const setVolume = (value) => {
  const volume = Math.min(Math.max(value, 0), 100) / 100;
  notificationSound.volume = volume;
  localStorage.setItem('notificationVolume', value);
};