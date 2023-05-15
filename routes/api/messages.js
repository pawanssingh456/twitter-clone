const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const Chat = require("../../schemas/chatSchema");
const Message = require("../../schemas/messageSchema");
const User = require("../../schemas/userSchema");

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

    Chat.findByIdAndUpdate(chatId, { latestMessage: createdMessage }).catch(
      (error) => {
        console.error(error);
      }
    );

    res.status(201).send(createdMessage);
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
}

module.exports = router;
