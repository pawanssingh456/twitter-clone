$(document).ready(() => {
  $.get("/api/notifications", (notificaitions) => {
    outputNotificationList(notificaitions, $(".results-container"));
  });
});

$("#markNotificationsAsRead").click(() => markNotificationAsOpened());
