$(document).ready(() => {
  $.get("/api/notifications", (notificaitions) => {
    outputNotificationList(notificaitions, $(".results-container"));
  });
});

$("#markNotificationsAsRead").click(() => markNotificationAsOpened());

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
