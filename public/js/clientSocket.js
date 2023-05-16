let connected = false;
let socket = io("http://localhost:3001");
socket.emit("setup", userLoggedIn);
socket.on("connected", () => {
  connected = true;
});
socket.on("message recieved", (newMessage) => {
  messageRecieved(newMessage);
});
socket.on("notification recieved", () => {
  $.get(`/api/notifications/latest`, (notificationData) => {
    showNotificationPopup(notificationData);
    refreshNotificationsBadge();
  });
});

function emitNotification(userID) {
  if (userID == userLoggedIn._id) return;
  socket.emit("notification recieved", userID);
}
