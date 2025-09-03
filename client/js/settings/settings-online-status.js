import { toggleOnlineVisibility } from "../sockets/socket.js";

export const initToggleOnlineStatus = (socket) => {
  const toggleOnlineStatus = document.getElementById("toggle-online-status");
  
  let showOnline = localStorage.getItem("showOnline") !== "false";
  toggleOnlineStatus.checked = showOnline;
  
  toggleOnlineVisibility(socket, showOnline);
  
  toggleOnlineStatus.addEventListener("change", () => {
    showOnline = toggleOnlineStatus.checked;
    localStorage.setItem("showOnline", showOnline);
    toggleOnlineVisibility(socket, showOnline);
  });
};