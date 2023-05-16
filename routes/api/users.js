const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../../schemas/userSchema");
const Notification = require("../../schemas/notificationSchema");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", async (req, res) => {
  let { search, isFollower, ...searchObject } = req.query;

  let users;

  if (search !== undefined) {
    searchObject = {
      $or: [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ],
    };

    users = await User.find(searchObject).exec();
  } else {
    users = await getUsers(searchObject, isFollower === "true");
  }

  res.status(200).send(users);
});

router.put("/:uid", async (req, res, next) => {
  let followingId = req.params.uid;
  let userId = req.session.user._id;

  let isFollower =
    req.session.user.following &&
    req.session.user.following.includes(followingId);

  let option = isFollower ? "$pull" : "$addToSet";

  try {
    req.session.user = await User.findByIdAndUpdate(
      userId,
      { [option]: { following: followingId } },
      { new: true }
    ).exec();

    let user = await User.findByIdAndUpdate(
      followingId,
      { [option]: { followers: userId } },
      { new: true }
    ).exec();

    if (!isFollower) {
      await Notification.insertNotification(
        followingId,
        userId,
        "follow",
        req.session.user._id
      );
    }

    res.status(200).send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error updating user");
  }
});

async function getUsers(filter, isFollower) {
  try {
    let users = await User.find(filter)
      .populate(isFollower ? "followers" : "following")
      .exec();

    if (isFollower) {
      return users.map((user) => user.followers).flat();
    } else {
      return users.map((user) => user.following).flat();
    }
  } catch (error) {
    throw new Error("Error fetching users");
  }
}

module.exports = router;
