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

  let user = await getUsers(searchObject, isFollower);
  res.status(200).send(user);
});

router.put("/:uid", async (req, res, next) => {
  let followingId = req.params.uid;
  let userId = req.session.user._id;

  let isFollower =
    req.session.user.following &&
    req.session.user.following.includes(followingId);

  let option = isFollower ? "$pull" : "$addToSet";

  req.session.user = await User.findByIdAndUpdate(
    userId,
    { [option]: { following: followingId } },
    { new: true }
  ).catch((error) => {
    return res.sendStatus(400);
  });

  let user = await User.findByIdAndUpdate(
    followingId,
    { [option]: { followers: userId } },
    { new: true }
  ).catch((error) => {
    return res.sendStatus(400);
  });

  res.status(200).send(user);
});

async function getUsers(filter, isFollower) {
  let user = await User.find(filter).catch((error) => {
    return res.sendStatus(400);
  });

  user = await User.populate(user, {
    path: isFollower ? "followers" : "following",
  });

  if (isFollower) {
    user = user[0].followers;
  } else {
    user = user[0].following;
  }

  return user;
}

module.exports = router;
