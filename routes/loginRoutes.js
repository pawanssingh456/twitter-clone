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
  res.status(200).render("login");
});

router.post("/", async (req, res, next) => {
  let payload = req.body;
  if (req.body.email && req.body.password) {
    let user = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.email }],
    }).catch((err) => {
      console.log(err);
      payload.errorMessage = "Something Went Wrong!";
      res.status(200).render("login", payload);
    });

    if (user) {
      const result = await bcrypt.compare(req.body.password, user.password);

      if (result === true) {
        req.session.user = user;
        return res.redirect("/");
      }
    }

    payload.errorMessage = "Incorrect Login Credentials!";
    return res.status(200).render("login", payload);
  }

  payload.errorMessage = "Please fill all the fields.";
  res.status(200).render("login");
});

module.exports = router;
