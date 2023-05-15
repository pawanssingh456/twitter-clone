const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const Chat = require("../../schemas/chatSchema");
const Message = require("../../schemas/messageSchema");

app.use(bodyParser.urlencoded({ extended: false }));

router.post("/", createMessage);

async function createMessage(req, res, next) {
  // if (!req.body.content || !req.body.chatId) {
  //   console.log("Invalid data passed into request");
  //   return res.sendStatus(400);
  // }

  // let message = {
  //   sender: req.session.user._id,
  //   content: req.body.content,
  //   chat: req.body.chatId,
  // };

  // Message.create(message)
  //   .then((results) => {
  //     res.status(201).send(results);
  //   })
  //   .catch((error) => {
  //     console.log(error);
  //     res.sendStatus(401);
  //   });

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

    // Message.create(message)
    //   .then(async (result) => {
    //     result = await result.populate("sender");
    //     result = await result.populate("chat");
    //     return res.status(201).send(result);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //     return res.sendStatus(400);
    //   });

    let createdMessage = await Message.create(message);
    createdMessage = await createdMessage.populate("sender");
    createdMessage = await createdMessage.populate("chat");

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
