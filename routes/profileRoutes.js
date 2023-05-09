const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../schemas/userSchema");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", async (req, res, next) => {
  let payload = {
    pageTitle: req.session.user.username,
    user: req.session.user,
    userJS: JSON.stringify(req.session.user),
    profileUser: req.session.user,
  };
  res.status(200).render("profilePage", payload);
});

router.get("/:username", async (req, res, next) => {
  let payload = await getPayload(req.params.username, req.session.user);
  res.status(200).render("profilePage", payload);
});

router.get("/:username/replies", async (req, res, next) => {
  let payload = await getPayload(req.params.username, req.session.user);
  payload.selectedTab = "replies";
  res.status(200).render("profilePage", payload);
});

async function getPayload(username, userLoggedIn) {
  let user = await User.findOne({ username: username });

  if (user == null) {
    user = await User.findById(username);

    if (user == null) {
      return {
        pageTitle: "User Not Found.",
        user: userLoggedIn,
        userJS: JSON.stringify(userLoggedIn),
      };
    }
  }

  return {
    pageTitle: user.username,
    user: userLoggedIn,
    userJS: JSON.stringify(userLoggedIn),
    profileUser: user,
  };
}

module.exports = router;
