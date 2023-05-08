$(document).ready(() => {
  $.get("/api/posts", (posts) => {
    output(posts, $(".postContainer"));
  });
});

function output(posts, container) {
  container.html("");

  posts.forEach((post) => {
    let html = createPostHTML(post);
    container.append(html);
  });

  if (posts.length == 0) {
    container.append("<span>Create your first Post!</span>");
  }
}
