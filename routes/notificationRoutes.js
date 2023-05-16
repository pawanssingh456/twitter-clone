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
  const payload = createPayload("Notifications", req.session.user);
  res.status(200).render("notificationsPage", payload);
});

module.exports = router;
