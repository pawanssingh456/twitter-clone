$("#searchBox").keydown((event) => {
  clearTimeout(timer);
  let textBox = $(event.target);
  let value = textBox.val();
  let searchType = textBox.data().search;

  timer = setTimeout(() => {
    value = textBox.val().trim();

    if (value == "") {
      $(".results-container").empty();
    } else {
      search(value, searchType);
    }
  }, 1000);
});

function search(term, type) {
  let url = type == "users" ? "/api/users" : "/api/posts";

  $.get(url, { search: term }, (results) => {
    console.log(results);
    if (type == "users") {
      outputUsers(results, $(".results-container"));
    } else {
      output(results, $(".results-container"));
    }
  });
}
