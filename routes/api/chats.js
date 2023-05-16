const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../../schemas/userSchema");
const Chat = require("../../schemas/chatSchema");
const Message = require("../../schemas/messageSchema");

app.use(bodyParser.urlencoded({ extended: false }));

router.post("/", createChat);
router.get("/", getChats);
router.get("/:chatId", getChat);
router.get("/:chatId/messages", getChatMessage);
router.put("/:chatId", updateChat);
router.put("/:chatId/messages/mark-as-read", markAsRead);

async function createChat(req, res, next) {
  try {
    const { users } = req.body;

    if (!users) {
      console.log("Users parameter not sent.");
      return res.sendStatus(400);
    }

    const parsedUsers = JSON.parse(users);

    if (!Array.isArray(parsedUsers) || !parsedUsers.length) {
      console.log("Users array is empty or invalid.");
      return res.sendStatus(400);
    }

    const loggedInUser = req.session.user;
    parsedUsers.push(loggedInUser);

    const chatData = {
      users: parsedUsers,
      isGroupChat: true,
    };

    const newChat = await Chat.create(chatData);
    return res.status(200).send(newChat);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

async function getChats(req, res, next) {
  try {
    const loggedInUser = req.session.user;
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: loggedInUser } },
    })
      .populate("users")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    if (req.query.unreadOnly !== undefined && req.query.unreadOnly == "true") {
      chats = chats.filter(
        (r) =>
          r.latestMessage &&
          !r.latestMessage.readBy.includes(req.session.user._id)
      );
    }

    chats = await User.populate(chats, { path: "latestMessage.sender" });

    return res.status(200).send(chats);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

async function getChat(req, res, next) {
  try {
    const loggedInUser = req.session.user;
    const chats = await Chat.findOne({
      _id: req.params.chatId,
      users: { $elemMatch: { $eq: loggedInUser } },
    }).populate("users");
    return res.status(200).send(chats);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

async function getChatMessage(req, res, next) {
  try {
    const loggedInUser = req.session.user;
    const messages = await Message.find({
      chat: req.params.chatId,
    }).populate("sender");
    return res.status(200).send(messages);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

async function updateChat(req, res, next) {
  try {
    const chats = await Chat.findByIdAndUpdate(req.params.chatId, req.body);
    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

async function markAsRead(req, res, next) {
  try {
    const chats = await Message.updateMany(
      { chat: req.params.chatId },
      { $addToSet: { readBy: req.session.user._id } }
    );
    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

module.exports = router;
