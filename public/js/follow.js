$(document).ready(() => {
  loadUsers(selectedTab === "followers");
});

function loadUsers(isFollower) {
  $.get("/api/users", { _id: profileUserId, isFollower }, (users) => {
    outputUsers(users, $(".followContentContainer"));
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
