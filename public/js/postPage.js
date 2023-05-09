$(document).ready(() => {
  $.get(`/api/posts/${postId}`, (posts) => {
    outputPostWithReplies(posts, $(".postContainer"));
  });
});
