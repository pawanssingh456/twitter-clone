$(document).ready(() => {
  if (selectedTab == "replies") {
    loadPosts(true);
  } else {
    loadPosts(false);
  }
});

function loadPosts(isReply) {
  $.get(`/api/posts`, { postedBy: profileUserId, isReply }, (posts) => {
    output(posts, $(".postContainer"));
  });
}
