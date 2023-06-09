let timer;
let selectedUsers = [];

$(document).ready(() => {
  refreshMessagesBadge();
  refreshNotificationsBadge();
});

$("#postTextarea, #replyTextarea").keyup((event) => {
  let textBox = $(event.target);
  let value = textBox.val().trim();

  let isModal = textBox.parents(".modal").length == 1;

  let submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton");

  if (submitButton.length == 0) return alert("No button found");

  if (value == "") {
    submitButton.prop("disabled", true);
    return;
  }

  submitButton.prop("disabled", false);
});

$("#chatNameTextBox").keyup((event) => {
  let textBox = $(event.target);
  let value = textBox.val().trim();

  let chatNameButton = $("#chatNameButton");

  // Disable or enable the chat name button
  chatNameButton.prop("disabled", value === "");
});

$("#submitPostButton, #submitReplyButton").click((event) => {
  let button = $(event.target);
  let isModal = button.parents(".modal").length == 1;
  let textBox = isModal ? $("#replyTextarea") : $("#postTextarea");

  let data = {
    content: textBox.val(),
  };

  if (isModal) {
    const id = button.data().id;
    if (id == null) return alert("Button id is null");
    data.replyTo = id;
  }

  $.post("/api/posts", data, (postData, status, xhr) => {
    if (postData.replyTo) {
      emitNotification(postData.replyTo.postedBy);
      location.reload();
    } else {
      let html = createPostHTML(postData);
      $(".postContainer").prepend(html);
      textBox.val("");
      button.prop("disabled", true);
    }
  });
});

$("#userSearchTextBox").keydown((event) => {
  clearTimeout(timer);
  let textBox = $(event.target);
  let value = textBox.val();

  if (value == "" && (event.which == 8 || event.keyCode == 8)) {
    //remove user from selection
    selectedUsers.pop();
    updateSelectedUserHTML();
    $(".results-container").empty();

    if (selectedUsers.length == 0) {
      $("#createChatButton").prop("disabled", true);
    }

    return;
  }

  timer = setTimeout(() => {
    value = textBox.val().trim();

    if (value == "") {
      $(".results-container").empty();
    } else {
      searchUsers(value);
    }
  }, 1000);
});

$("#createChatButton").click((event) => {
  let data = JSON.stringify(selectedUsers);
  $.post("/api/chats", { users: data }, (chat) => {
    if (!chat && !chat._id) return alert("Invalid response from server.");
    window.location.href = `/messages/${chat._id}`;
  });
});

$("#replyModal").on("show.bs.modal", (event) => {
  let button = $(event.relatedTarget);
  let postId = getPostIdFromElement(button);

  $("#submitReplyButton").data("id", postId);

  $.get(`/api/posts/${postId}`, (post) => {
    output(post.postData, $("#originalPostContainer"));
  });
});

$("#replyModal").on("hidden.bs.modal", () =>
  $("#originalPostContainer").html("")
);

$("#deletePostModal").on("show.bs.modal", (event) => {
  let button = $(event.relatedTarget);
  let postId = getPostIdFromElement(button);

  $("#deletePostButton").data("id", postId);
});

$("#deletePostButton").click((event) => {
  let postId = $(event.target).data("id");
  $.ajax({
    url: `/api/posts/${postId}`,
    type: "DELETE",
    success: () => {
      location.reload();
    },
  });
});

$(document).on("click", ".likeButton", (event) => {
  let button = $(event.target);
  let postId = getPostIdFromElement(button);
  if (postId === undefined) return;
  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: "PUT",
    success: (post) => {
      button.find("span").text(post.likes.length || "");

      if (post.likes.includes(userLoggedIn._id)) {
        button.addClass("active");
        emitNotification(post.postedBy);
      } else {
        button.removeClass("active");
      }
    },
  });
});

$(document).on("click", ".retweetButton", (event) => {
  let button = $(event.target);
  let postId = getPostIdFromElement(button);
  if (postId === undefined) return;
  $.ajax({
    url: `/api/posts/${postId}/retweet`,
    type: "POST",
    success: (post) => {
      button.find("span").text(post.retweetUsers.length || "");

      if (post.retweetUsers.includes(userLoggedIn._id)) {
        button.addClass("active");
        emitNotification(post.postedBy);
      } else {
        button.removeClass("active");
      }
    },
  });
});

$(document).on("click", ".post", (event) => {
  let element = $(event.target);
  let postId = getPostIdFromElement(element);

  if (postId !== undefined && !element.is("button")) {
    window.location.href = `/posts/${postId}`;
  }
});

$(document).on("click", ".notification.active", (event) => {
  let container = $(event.target);
  let notificationID = container.data().id;
  let href = container.attr("href");
  event.preventDefault();

  let callback = () => (window.location.href = href);

  markNotificationAsOpened(notificationID, callback);
});

function getPostIdFromElement(element) {
  let isRoot = element.hasClass("post");
  let rootElement = isRoot ? element : element.closest(".post");
  let postId = rootElement.data().id;
  return postId == undefined ? alert("post id undefined") : postId;
}

function createPostHTML(postData, largeFont = false) {
  if (postData == null) return alert("No Post Data");

  let isRetweet = postData.retweetData !== undefined;
  let retweetedBy = isRetweet ? postData.postedBy.username : null;
  postData = isRetweet ? postData.retweetData : postData;

  let { content, postedBy } = postData;

  if (!postedBy || postedBy._id === undefined) {
    return console.log("User posts not found.");
  }

  const displayName = `${postedBy.firstName} ${postedBy.lastName}`;
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  let largeFontClass = largeFont ? "largeFont" : "";

  let likeButtonIsActive = postData.likes.includes(userLoggedIn._id)
    ? "active"
    : "";

  let retweetButtonIsActive = postData.retweetUsers.includes(userLoggedIn._id)
    ? "active"
    : "";

  let retweetText = "";
  if (isRetweet) {
    retweetText = `<span>
                    <i class = "fas fa-retweet"></i>
                    Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
                  </span>`;
  }

  let replyFlag = "";
  if (postData.replyTo && postData.replyTo._id) {
    if (!postData.replyTo._id) {
      return alert("Reply to is not populated");
    } else if (!postData.replyTo.postedBy._id) {
      return alert("Posted By is not populated");
    }
    let replyTousername = postData.replyTo.postedBy.username;
    replyFlag = `<div class="replyFlag">
                    Replying to <a href='/profile/${replyTousername}'>@${replyTousername}</a>
                  </div>`;
  }

  let buttons = "";
  if (postData.postedBy._id == userLoggedIn._id) {
    buttons = `<button data-id="${postData._id}" data-bs-toggle="modal" data-bs-target="#deletePostModal"><i class="fas fa-times"></i></button>`;
  }

  return `<div class = "post ${largeFontClass}" data-id=${postData._id}>
            <div class="postActionContainer">
              ${retweetText}
            </div>
            <div class = "main-content-container">
              <div class = "userImageContainer">
                <img src = ${postedBy.profilePic}>
              </div>
              <div class = "postContentContainer">
                <div class = "header">
                  <a href='/profile/${
                    postedBy.username
                  }' class = "displayName">${displayName}</a>
                  <span class='username'>@${postedBy.username}</span>
                  <span class='date'>${timestamp}</span>
                  ${buttons}
                </div>
                ${replyFlag}
                <div class = "postBody">
                  <span>${content}</span>
                </div>
                <div class = "postFooter">
                  <div class="postButtonContainer">
                      <button data-bs-toggle="modal" data-bs-target="#replyModal">
                        <i class = "far fa-comment"></i>
                      </button>
                  </div>
                  <div class="postButtonContainer green">
                      <button class="retweetButton ${retweetButtonIsActive}">
                        <i class = "fas fa-retweet"></i>
                        <span>${postData.retweetUsers.length || ""}</span>
                      </button>
                  </div>
                  <div class="postButtonContainer red">
                      <button class="likeButton ${likeButtonIsActive}">
                        <i class = "far fa-heart"></i>
                        <span>${postData.likes.length || ""}</span>
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
}

function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return "Just Now";
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}

function output(posts, container) {
  container.html("");

  if (!Array.isArray(posts)) {
    posts = [posts];
  }

  posts.forEach((post) => {
    let html = createPostHTML(post);
    container.append(html);
  });

  if (posts.length == 0) {
    container.append("<span>Create your first Post!</span>");
  }
}

function outputPostWithReplies(results, container) {
  container.html("");

  if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
    let html = createPostHTML(results.replyTo);
    container.append(html);
  }

  let namePosthtml = createPostHTML(results.postData, true);
  container.append(namePosthtml);

  results.replies.forEach((post) => {
    let html = createPostHTML(post);
    container.append(html);
  });
}

function createUserHTML(user, largeFont = false) {
  const displayName = `${user.firstName} ${user.lastName}`;
  return `
    <div class="user">
      <div class="followContentContainer">
        <div class="userImageContainer">
          <img src="${user.profilePic}">
        </div>
        <div class="followUserContentContainer">
          <div class="header">
            <a href="/profile/${user.username}" class="displayName">${displayName}</a>
            <span class="username">@${user.username}</span>
          </div>
        </div>
      </div>
    </div>`;
}

function outputUsers(users, container) {
  container.empty();

  if (!Array.isArray(users)) {
    users = [users];
  }

  users.forEach((user) => {
    const html = createUserHTML(user);
    container.append(html);
  });

  if (users.length === 0) {
    container.append("<span></span>");
  }
}

function outputSelectableUsers(users, container) {
  container.empty();

  if (!Array.isArray(users)) {
    users = [users];
  }

  users.forEach((user) => {
    if (
      user._id == userLoggedIn._id ||
      selectedUsers.some((u) => u._id == user._id)
    ) {
      return;
    }

    const html = createUserHTML(user);
    let element = $(html);
    element.click(() => userSelected(user));
    container.append(element);
  });

  if (users.length === 0) {
    container.append("<span></span>");
  }
}

function searchUsers(term) {
  $.get("/api/users", { search: term }, (results) => {
    outputSelectableUsers(results, $(".results-container"));
  });
}

function userSelected(user) {
  selectedUsers.push(user);
  updateSelectedUserHTML();
  $("#userSearchTextBox").val("").focus();
  $(".results-container").empty();
  $("#createChatButton").prop("disabled", false);
}

function updateSelectedUserHTML() {
  let elements = [];
  selectedUsers.forEach((user) => {
    const name = `${user.firstName} ${user.lastName}`;
    const userElement = $(`<span class='selectedUser'>${name}</span>`);
    elements.push(userElement);
  });

  $(".selectedUser").remove();

  $("#selectedUsers").prepend(elements);
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

function messageRecieved(newMessage) {
  if ($(`[data-room="${newMessage.chat._id}"]`).length == 0) {
    //pop up notification
    showMessagePopup(newMessage);
  } else {
    addChatMessageHTML(newMessage);
  }

  refreshMessagesBadge();
}

function markNotificationAsOpened(notitificationID = null, callback = null) {
  if (callback == null) callback = () => location.reload();
  let url =
    notitificationID != null
      ? `/api/notifications/${notitificationID}/mark-as-opened`
      : `/api/notifications/mark-as-opened`;

  $.ajax({
    url,
    type: "PUT",
    success: callback,
  });
}

function refreshMessagesBadge() {
  $.get("/api/chats", { unreadOnly: true }, (data) => {
    let numResults = data.length;
    if (numResults > 0) {
      $("#messageBadge").text(numResults).addClass("active");
    } else {
      $("#messageBadge").text("").removeClass("active");
    }
  });
}

function refreshNotificationsBadge() {
  $.get("/api/notifications", { unreadOnly: true }, (data) => {
    let numResults = data.length;
    if (numResults > 0) {
      $("#notificationBadge").text(numResults).addClass("active");
    } else {
      $("#notificationBadge").text("").addClass("");
    }
  });
}

function outputNotificationList(notificaitions, container) {
  notificaitions.forEach((notification) => {
    const html = createNotificationHTML(notification);
    container.append(html);
  });

  if (notificaitions.length == 0) {
    container.append(`<span class="no-result">Nothing to show.</span>`);
  }
}

function createNotificationHTML(notification) {
  let userFrom = notification.userFrom;
  const url = getNotificationURL(notification);
  const openedClassName = notification.opened ? "" : "active";
  return `<a href="${url}" class="result-list-item notification ${openedClassName}" data-id=${
    notification._id
  }>
                <div class="results-image-container">
                    <img src="${userFrom.profilePic}">
                </div>
                <div class="results-details-container ellipsis">
                    <span class="ellipsis">
                        ${getNotificationText(notification)}
                    </span>
                </div>
            </a>`;
}

function getNotificationText(notification) {
  const { userFrom, notificationType } = notification;
  if (!userFrom.firstName || !userFrom.lastName) {
    console.log("user from data not populated");
    return;
  }

  const userFromName = `${userFrom.firstName} ${userFrom.lastName}`;
  let text;

  if (notificationType == "retweet") {
    text = `${userFromName} retweeted one of your posts.`;
  } else if (notificationType == "like") {
    text = `${userFromName} liked one of your posts.`;
  } else if (notificationType == "reply") {
    text = `${userFromName} replied one of your posts.`;
  } else if (notificationType == "follow") {
    text = `${userFromName} followed you.`;
  }

  return `<span class="ellipsis">
            ${text}
        </span>`;
}

function getNotificationURL(notification) {
  const { notificationType } = notification;

  let url = "#";

  if (
    notificationType == "retweet" ||
    notificationType == "like" ||
    notificationType == "reply"
  ) {
    url = `/posts/${notification.entityID}`;
  } else if (notificationType == "follow") {
    url = `/profile/${notification.entityID}`;
  }

  return url;
}

function showNotificationPopup(data) {
  const html = createNotificationHTML(data);
  let element = $(html);
  element.hide().prependTo("#notificationList").slideDown("fast ");

  setTimeout(() => element.fadeOut(800), 5000);
}

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
  let latestMessage = getLatestMessage(chat.latestMessage);

  let activeClass =
    !chat.latestMessage || chat.latestMessage.readBy.includes(userLoggedIn._id)
      ? ""
      : "active";

  return `<a href='/messages/${chat._id}' class="result-list-item ${activeClass}">
                ${image}
              <div class="results-details-container ellipsis">
                  <span class="heading ellipsis">${chatName}</span>
                  <span class="sub-text ellipsis">${latestMessage}</span>
              </div>
          </a>`;
}

function getLatestMessage(latestMessage) {
  if (latestMessage != null) {
    const sender = latestMessage.sender;
    return `${sender.firstName} ${sender.lastName}: ${latestMessage.content}`;
  }

  return "New Chat";
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

function showMessagePopup(data) {
  if (!data.chat.latestMessage._id) {
    data.chat.latestMessage = data;
  }

  const html = createChatHTML(data.chat);
  let element = $(html);
  element.hide().prependTo("#notificationList").slideDown("fast ");

  setTimeout(() => element.fadeOut(800), 5000);
}
