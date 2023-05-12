const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../../schemas/userSchema");
const Chat = require("../../schemas/chatSchema");

app.use(bodyParser.urlencoded({ extended: false }));

router.post("/", createChat);
router.get("/", getChats);

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
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: loggedInUser } },
    })
      .populate("users")
      .sort({ updatedAt: -1 });
    return res.status(200).send(chats);
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
}

module.exports = router;
