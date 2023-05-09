const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const Post = require("../schemas/postSchema");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/:id", (req, res, next) => {
  let payload = {
    pageTitle: "View Post",
    user: req.session.user,
    userJS: JSON.stringify(req.session.user),
    postId: req.params.id,
  };
  res.status(200).render("postPage", payload);
});

module.exports = router;
