$(document).ready(() => {
  if (selectedTab == "followers") {
    loadUsers(true);
  } else {
    loadUsers(false);
  }
});

function loadUsers(isFollower) {
  // console.log({ isFollower });
  $.get(`/api/users`, { id: profileUserId, isFollower }, (users) => {
    console.log(users);
  });
}
