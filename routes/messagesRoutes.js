const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Chat = require("../schemas/chatSchema");
const User = require("../schemas/userSchema");

const router = express.Router();
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

const createPayload = (title, loggedInUser) => ({
  pageTitle: title,
  user: loggedInUser,
  userJS: JSON.stringify(loggedInUser),
});

router.get("/", (req, res) => {
  const payload = createPayload("Inbox", req.session.user);
  res.status(200).render("inboxPage", payload);
});

router.get("/new", (req, res) => {
  const payload = createPayload("New Message", req.session.user);
  res.status(200).render("newMessage", payload);
});

router.get("/:chatId", async (req, res) => {
  let userID = req.session.user._id;
  let chatId = req.params.chatId;

  let isValidID = mongoose.isValidObjectId(chatId);

  const payload = createPayload("Chat", req.session.user);

  if (!isValidID) {
    payload.errorMessage = "Chat does not exists and not valid id!";
    return res.status(200).render("chatPage", payload);
  }

  let chat = await Chat.findOne({
    _id: chatId,
    users: { $elemMatch: { $eq: userID } },
  }).populate("users");

  if (chat == null) {
    let userFound = User.findById(chatId);
    if (!userFound) {
      //get chat using user id
      chat = await getChatByUserId(userFound._id, userID);
      console.log(chat);
    }
  }

  if (chat == null) {
    payload.errorMessage = "Chat does not exists!";
  } else {
    payload.chat = chat;
  }

  res.status(200).render("chatPage", payload);
});

async function getChatByUserId(userLoggedInId, otherUserId) {
  const chatQuery = {
    isGroupChat: false,
    users: {
      $size: 2,
      $all: [
        { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) } },
        { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) } },
      ],
    },
  };
  const chatUpdate = {
    $setOnInsert: {
      users: [userLoggedInId, otherUserId],
    },
  };
  const chatOptions = {
    new: true,
    upsert: true,
    populate: "users",
  };
  try {
    const chat = await Chat.findOneAndUpdate(
      chatQuery,
      chatUpdate,
      chatOptions
    );
    return chat;
  } catch (error) {
    console.error(error);
    throw new Error("Could not get chat");
  }
}

module.exports = router;
