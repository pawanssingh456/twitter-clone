const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../schemas/userSchema");
const bcrypt = require("bcrypt");

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

router
  .route("/")
  .get((req, res) => {
    res.status(200).render("register");
  })
  .post(async (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;
    const payload = req.body;

    if (firstName && lastName && username && email && password) {
      try {
        const user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
          if (user.email === email) {
            payload.errorMessage = "Email Already Exists!";
          } else {
            payload.errorMessage = "Username Already Exists!";
          }
          res.status(200).render("register", payload);
        } else {
          const data = req.body;
          data.password = await bcrypt.hash(password, 10);
          await User.create(data);
          res.redirect("/login");
        }
      } catch (err) {
        console.log(err);
        payload.errorMessage = "Something Went Wrong!";
        res.status(200).render("register", payload);
      }
    } else {
      payload.errorMessage = "Please check all the fields have valid input.";
      res.status(200).render("register", payload);
    }
  });

module.exports = router;
