$(document).ready(function () {
  $.get(`/api/posts/${postId}`, function (posts) {
    outputPostWithReplies(posts, $(".postContainer"));
  }).fail(function () {
    console.log("Error: failed to retrieve post.");
  });
});
