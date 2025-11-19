export const getOrCreateUserId = () => {
  let userId = localStorage.getItem('chat_user_id');
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem('chat_user_id', userId);
  };
  return userId;
};

export const clearUserSession = () => {
  localStorage.removeItem('chat_user_id');
};