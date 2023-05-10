const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const User = require("../schemas/userSchema");
const bcrypt = require("bcrypt");
const router = express.Router();

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res) => {
  res.render("login");
});

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const payload = { errorMessage: "Please fill all fields." };
    return res.status(400).render("login", payload);
  }

  try {
    const user = await User.findOne({
      $or: [{ email }, { username: email }],
    });
    if (!user) {
      const payload = { errorMessage: "Incorrect login credentials!" };
      return res.status(401).render("login", payload);
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      const payload = { errorMessage: "Incorrect login credentials!" };
      return res.status(401).render("login", payload);
    }

    req.session.user = user;
    res.redirect("/");
  } catch (error) {
    console.log(error);
    const payload = { errorMessage: "Something went wrong!" };
    res.status(500).render("login", payload);
  }
});

module.exports = router;
