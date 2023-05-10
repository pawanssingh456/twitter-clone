$(document).ready(() => {
  $.get("/api/posts", (posts) => {
    output(posts, $(".postContainer"));
  }).fail((error) => {
    console.log(error);
    alert("Failed to load posts");
  });
});
