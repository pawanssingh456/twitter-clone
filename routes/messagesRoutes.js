const express = require("express");
const bodyParser = require("body-parser");
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

module.exports = router;
