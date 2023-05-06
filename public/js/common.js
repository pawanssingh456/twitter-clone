$("#postTextarea").keyup((event) => {
  let textBox = $(event.target);
  let value = textBox.val().trim();

  let submitButton = $("#submitPostButton");

  if (submitButton.length == 0) return alert("No button found");

  if (value == "") {
    submitButton.prop("disabled", true);
    return;
  }

  submitButton.prop("disabled", false);
});

$("#submitPostButton").click((event) => {
  let button = $(event.target);
  let textBox = $("#postTextarea");

  let data = {
    content: textBox.val(),
  };

  $.post("/api/posts", data, (postData, status, xhr) => {});
});
