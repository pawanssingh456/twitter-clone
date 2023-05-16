const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const Chat = require("../../schemas/chatSchema");
const Message = require("../../schemas/messageSchema");
const User = require("../../schemas/userSchema");
const Notification = require("../../schemas/notificationSchema");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", getNotifications);
router.put("/:id/mark-as-opened", opened);
router.put("/mark-as-opened", markAllAsopened);

async function getNotifications(req, res, next) {
  let search = {
    userTo: req.session.user._id,
    notificationType: { $ne: "newMessage" },
  };

  if (req.query.unreadOnly !== undefined && req.query.unreadOnly == "true") {
    search.opened = false;
  }

  try {
    let notifications = await Notification.find(search)
      .populate("userTo")
      .populate("userFrom")
      .sort({ createdAt: -1 });
    res.status(200).send(notifications);
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
}

async function opened(req, res, next) {
  try {
    let notifications = await Notification.findByIdAndUpdate(req.params.id, {
      opened: true,
    });

    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
}

async function markAllAsopened(req, res, next) {
  try {
    let notifications = await Notification.updateMany(
      { userTo: req.session.user._id },
      {
        opened: true,
      }
    );

    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
}

module.exports = router;
