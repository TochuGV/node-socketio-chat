export const initToggleUnreadMessagesCounter = () => {
  const toggleUnreadMessagesCounter = document.getElementById("toggle-number-unread-messages");

  let showUnreadMessagesCount = localStorage.getItem("showUnreadMessagesCount") !== "false";
  toggleUnreadMessagesCounter.checked = showUnreadMessagesCount;

  toggleUnreadMessagesCounter.addEventListener("change", () => {
    showUnreadMessagesCount = toggleUnreadMessagesCounter.checked;
    localStorage.setItem("showUnreadMessagesCount", showUnreadMessagesCount);
  });

  return () => showUnreadMessagesCount;
};