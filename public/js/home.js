$(document).ready(() => {
  $.get("/api/posts", (posts) => {
    output(posts, $(".postContainer"));
  });
});
