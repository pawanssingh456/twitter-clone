const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const Chat = require("../../schemas/chatSchema");
const Message = require("../../schemas/messageSchema");
const User = require("../../schemas/userSchema");
const Notification = require("../../schemas/notificationSchema");

app.use(bodyParser.urlencoded({ extended: false }));

router.post("/", createMessage);

async function createMessage(req, res, next) {
  try {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
      console.error("Invalid data passed into request");
      return res.sendStatus(400);
    }

    const message = {
      sender: req.session.user._id,
      content,
      chat: chatId,
    };

    let createdMessage = await Message.create(message);
    createdMessage = await createdMessage.populate("sender");
    createdMessage = await createdMessage.populate("chat");
    createdMessage = await User.populate(createdMessage, {
      path: "chat.users",
    });

    let chat = await Chat.findByIdAndUpdate(chatId, {
      latestMessage: createdMessage,
    }).catch((error) => {
      console.error(error);
    });

    insertNotification(chat, message);

    res.status(201).send(createdMessage);
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
}

function insertNotification(chat, message) {
  chat.users.forEach((userId) => {
    if (userId == message.sender._id.toString()) return;
    Notification.insertNotification(
      userId,
      message.sender._id,
      "newMessage",
      message.chat._id
    );
  });
}

module.exports = router;
