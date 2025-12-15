import socketService from "../sockets/socket.js";

export const initToggleOnlineStatus = (socket) => {
  const toggleOnlineStatus = document.getElementById("toggle-online-status");
  
  let showOnline = localStorage.getItem("showOnline") !== "false";
  toggleOnlineStatus.checked = showOnline;
  
  socketService.emitters.toggleOnlineVisibility(showOnline);
  
  toggleOnlineStatus.addEventListener("change", () => {
    showOnline = toggleOnlineStatus.checked;
    localStorage.setItem("showOnline", showOnline);
    socketService.emitters.toggleOnlineVisibility(showOnline);
  });
};