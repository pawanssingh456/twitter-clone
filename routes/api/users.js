const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../../schemas/userSchema");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", async (req, res, next) => {
  let searchObject = req.query;
  let isFollower;

  if (searchObject.isFollower !== undefined) {
    isFollower = searchObject.isFollower == "true";
    delete searchObject.isFollower;
  }

  let user = await getPosts(searchObject, isFollower);
  res.status(200).send(user);
});

async function getPosts(filter, isFollower) {
  let user = await User.find(filter).catch((error) => {
    return res.sendStatus(400);
  });

  user = await User.populate(user, {
    path: isFollower ? "followers" : "following",
  });

  return user;
}

module.exports = router;
