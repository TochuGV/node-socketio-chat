let unreadMessageCount = 0;
const originalTitle = document.title;

export const getUnreadMessageCount = () => unreadMessageCount;

export const incrementCounter = () => {
  unreadMessageCount++;
  updateTitle();
};

export const resetCounter = () => {
  unreadMessageCount = 0;
  updateTitle();
};

const updateTitle = () => {
  unreadMessageCount > 0 ? 
  document.title = `(${unreadMessageCount}) ${originalTitle}` : 
  document.title = originalTitle;
};
