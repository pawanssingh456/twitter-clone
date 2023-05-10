const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/:id", (req, res, next) => {
  const postId = req.params.id;

  // Check if postId is a valid ObjectId
  if (!/^[0-9a-fA-F]{24}$/.test(postId)) {
    return res.status(400).send("Invalid post ID");
  }

  const payload = {
    pageTitle: "View Post",
    user: req.session.user,
    userJS: JSON.stringify(req.session.user),
    postId,
  };

  res.status(200).render("postPage", payload);
});

module.exports = router;
