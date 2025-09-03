export const initToggleNotifications = () => {
  const toggleNotifications = document.getElementById("toggle-notification-messages");

  let notificationsEnabled = localStorage.getItem("notificationsEnabled") !== "false";
  toggleNotifications.checked = notificationsEnabled;

  toggleNotifications.addEventListener("change", () => {
    notificationsEnabled = toggleNotifications.checked;
    localStorage.setItem("notificationsEnabled", notificationsEnabled);
  });

  return () => notificationsEnabled;
};