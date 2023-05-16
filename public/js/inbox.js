$(document).ready(() => {
  $.get("/api/chats")
    .done((data) => {
      outputChatList(data, $(".results-container"));
    })
    .fail(() => {
      alert("Could not get chat list.");
    });
});
