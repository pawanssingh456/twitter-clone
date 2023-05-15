$(document).ready(() => {
  $.get(`/api/chats/${chatId}`, (chat) => {
    $("#chatName").text(getChatName(chat));
  });

  $.get(`/api/chats/${chatId}/messages`, (chats) => {
    const messages = [];
    let lastSenderID = "";
    chats.forEach((element, index) => {
      const html = createMessageHTML(element, chats[index + 1], lastSenderID);
      messages.push(html);

      lastSenderID = element.sender._id;
    });

    const messagesHTML = messages.join("");
    addMessageHTMLPage(messagesHTML);
    scrollToBotton(false);

    $(".loading-spinner-container").remove();
    $(".chat-container").css("visibility", "visible");
  });
});

$("#chatNameButton").click(() => {
  let chatName = $("#chatNameTextBox").val().trim();

  $.ajax({
    url: `/api/chats/${chatId}`,
    type: "PUT",
    data: { chatName },
    success: (data, status, xhr) => {
      if (xhr.status != 204) {
        alert("could not fupdate chat name");
      } else {
        location.reload();
      }
    },
  });
});

$(".send-message-button").click(() => {
  messageSubmitted();
});

$(".input-textbox").keydown((event) => {
  if (event.which === 13) {
    messageSubmitted();
    return false;
  }
});

function addMessageHTMLPage(html) {
  $(".chat-messages").append(html);
  // scrollToBotton(true);
}

function messageSubmitted() {
  let content = $(".input-textbox").val().trim();

  if (content != "") {
    $(".input-textbox").val("");
    sendMessage(content);
  }
}

function sendMessage(content) {
  $.post("/api/messages", { content, chatId }, (data, status, xhr) => {
    if (xhr.status != 201) {
      $(".input-textbox").val(content);
      return;
    }

    addChatMessageHTML(data);
  });
}

function addChatMessageHTML(message) {
  if (!message || !message._id) {
    console.log("Invalid message");
    return;
  }

  let messageDiv = createMessageHTML(message, null, "");

  addMessageHTMLPage(messageDiv);

  scrollToBotton(true);
}

function createMessageHTML(message, nextMessage, lastSenderID) {
  const sender = message.sender;
  const senderName = `${sender.firstName} ${sender.lastName}`;
  const currentSenderID = sender._id;
  const nextSenderID = nextMessage != null ? nextMessage.sender._id : "null";
  const isFirst = lastSenderID != currentSenderID;
  const isLast = nextSenderID != currentSenderID;
  const isMine = message.sender._id == userLoggedIn._id;
  let liClassName = isMine ? "mine" : "theirs";
  let nameElement = "";
  let imageContainer = "";
  let profileImage = "";

  if (isFirst) {
    liClassName += " first";
  }

  if (isLast) {
    liClassName += " last";
    profileImage = `<img src='${sender.profilePic}'>`;
  }

  if (!isMine) {
    nameElement = `<span class='sender-name'>${senderName}</span>`;
  }

  if (!isMine) {
    imageContainer = `<div class='image-container'>${profileImage}</></div>`;
  }

  return `<li class="message ${liClassName}">
              ${imageContainer}
              <div class="message-container">
                  ${nameElement}
                  <span class="message-body">
                    ${message.content}
                  </span>
              </div>
          </li>`;
}

function scrollToBotton(animated) {
  const contianer = $(".chat-messages");
  let scrollHeight = contianer[0].scrollHeight;

  if (animated) {
    contianer.animate({ scrollTop: scrollHeight }, "slow");
  } else {
    contianer.scrollTop(scrollHeight);
  }
}
