const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../schemas/userSchema");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
  res.status(200).render("profilePage", {
    pageTitle: req.session.user.username,
    user: req.session.user,
    userJS: JSON.stringify(req.session.user),
    profileUser: req.session.user,
  });
});

router.get("/:username", async (req, res, next) => {
  const { username } = req.params;
  const user = req.session.user;
  const payload = await getPayload(username, user);
  res.status(200).render("profilePage", payload);
});

router.get("/:username/replies", async (req, res, next) => {
  let payload = await getPayload(req.params.username, req.session.user);
  payload.selectedTab = "replies";
  res.status(200).render("profilePage", payload);
});

router.get("/:username/following", async (req, res, next) => {
  try {
    let payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "following";
    res.status(200).render("follow", payload);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/:username/followers", async (req, res, next) => {
  try {
    let payload = await getPayload(req.params.username, req.session.user);
    payload.selectedTab = "followers";
    res.status(200).render("follow", payload);
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

async function getPayload(username, userLoggedIn) {
  const user =
    (await User.findOne({ username: username })) ||
    (await User.findById(username));

  if (!user) {
    return {
      pageTitle: "User Not Found.",
      user: userLoggedIn,
      userJS: JSON.stringify(userLoggedIn),
    };
  }

  return {
    pageTitle: user.username,
    user: userLoggedIn,
    userJS: JSON.stringify(userLoggedIn),
    profileUser: user,
  };
}

module.exports = router;
