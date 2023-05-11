$(document).ready(() => {
  $.get("/api/chats")
    .done((data) => {
      outputChatList(data, $(".results-container"));
    })
    .fail(() => {
      alert("Could not get chat list.");
    });
});

function outputChatList(chats, container) {
  if (!chats.length) {
    container.append(`<span class="no-result">Nothing to show.</span>`);
    return;
  }

  chats.forEach((chat) => {
    let html = createChatHTML(chat);
    container.append(html);
  });
}

function createChatHTML(chat) {
  let chatName = getChatName(chat);
  let image = getChatImageElements(chat);
  let latestMessage = "This is the latest message.";

  return `<a href='/messages/${chat._id}' class="result-list-item">
                ${image}
              <div class="results-details-container ellipsis">
                  <span class="heading ellipsis">${chatName}</span>
                  <span class="sub-text ellipsis">${latestMessage}</span>
              </div>
          </a>`;
}

function getChatName(chat) {
  let chatName = chat.chatName;
  if (!chatName) {
    let otherChatUsers = getOtherChatUsers(chat.users);
    let namesArray = otherChatUsers.map(
      (user) => `${user.firstName} ${user.lastName}`
    );
    chatName = namesArray.join(",");
  }

  return chatName;
}

function getOtherChatUsers(users) {
  if (users.length == 1) {
    return users;
  }

  return users.filter((user) => {
    return user._id != userLoggedIn._id;
  });
}

function getChatImageElements(chat) {
  let otherChatUsers = getOtherChatUsers(chat.users);
  let groupChatClass = "";
  let chatImage = getUserChatImageElement(otherChatUsers[0]);

  if (otherChatUsers.length > 1) {
    groupChatClass = "group-chat-image";
    chatImage += getUserChatImageElement(otherChatUsers[1]);
  }

  return `<div class="results-image-container ${groupChatClass}">
                ${chatImage}
            </div>`;
}

function getUserChatImageElement(user) {
  if (!user && !user.profilePic) {
    return alert("Invalid User!");
  }
  return `<img src='${user.profilePic}' alt='User's profile pic.'>`;
}
