$(document).ready(() => {
  if (selectedTab == "replies") {
    loadPosts(true);
  } else {
    loadPosts(false);
  }
});

$("#submitFollowButton").click((event) => {
  let followingId = $(event.target).data("user");

  $.ajax({
    url: `/api/users/${followingId}`,
    type: "PUT",
    success: () => {
      location.reload();
    },
  });
});

function loadPosts(isReply) {
  $.get(`/api/posts`, { postedBy: profileUserId, isReply }, (posts) => {
    output(posts, $(".postContainer"));
  });
}
