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
      location.reload();
    } else {
      let html = createPostHTML(postData);
      $(".postContainer").prepend(html);
      textBox.val("");
      button.prop("disabled", true);
    }
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
            <div class = "mainContentContainer">
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
