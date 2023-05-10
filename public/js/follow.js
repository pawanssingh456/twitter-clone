$(document).ready(() => {
  if (selectedTab == "followers") {
    loadUsers(true);
  } else {
    loadUsers(false);
  }
});

function loadUsers(isFollower) {
  $.get(`/api/users`, { _id: profileUserId, isFollower }, (users) => {
    outputUser(users, $(".followContentContainer"));
  });
}

function createUserHTML(user, largeFont = false) {
  const displayName = `${user.firstName} ${user.lastName}`;
  return `<div class = "user">
            <div class = "followContentContainer">
              <div class = "userImageContainer">
                <img src = ${user.profilePic}>
              </div>
              <div class = "followUserContentContainer">
                <div class = "header">
                  <a href='/profile/${user.username}' class = "displayName">${displayName}</a>
                  <span class='username'>@${user.username}</span>
                </div>
              </div>
            </div>
          </div>`;
}

function outputUser(posts, container) {
  container.html("");

  if (!Array.isArray(posts)) {
    posts = [posts];
  }

  posts.forEach((post) => {
    let html = createUserHTML(post);
    container.append(html);
  });

  if (posts.length == 0) {
    container.append("<span></span>");
  }
}
