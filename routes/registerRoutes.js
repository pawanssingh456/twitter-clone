const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../schemas/userSchema");
const bcrypt = require("bcrypt");

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
  res.status(200).render("register");
});

router.post("/", async (req, res, next) => {
  const firstName = req.body.firstName.trim();
  const lastName = req.body.lastName.trim();
  const username = req.body.username.trim();
  const email = req.body.email.trim();
  const password = req.body.password;

  let payload = req.body;

  if (firstName && lastName && username && email && password) {
    let user = await User.findOne({
      $or: [{ email: email }, { username: username }],
    }).catch((err) => {
      console.log(err);
      payload.errorMessage = "Something Went Wrong!";
      res.status(200).render("register", payload);
    });

    if (user) {
      if (user.email == email) {
        payload.errorMessage = "Email Already Exists!";
      } else {
        payload.errorMessage = "Username Already Exists!";
      }

      res.status(200).render("register", payload);
    } else {
      let data = req.body;
      data.password = await bcrypt.hash(password, 10);
      User.create(data)
        .then(() => {
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          payload.errorMessage = "Something Went Wrong!";
          res.status(200).render("register", payload);
        });
    }
  } else {
    payload.errorMessage = "Please check all the fiels have valid input.";
    res.status(200).render("register", payload);
  }
});

module.exports = router;
