require("dotenv").config();

const express = require("express");
const app = express();
const port = 3001;
const middleware = require("./middleware");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("./database");
const session = require("express-session");

const server = app.listen(process.env.PORT || 3001, () =>
  console.log("Server listening on port " + port)
);

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "sessionsecret",
    resave: true,
    saveUninitialized: false,
  })
);

//Routes
const loginRoutes = require("./routes/loginRoutes");
const registerRoutes = require("./routes/registerRoutes");
const logoutRoutes = require("./routes/logoutRoutes");
const postRoutes = require("./routes/postRoutes");
const profileRoutes = require("./routes/profileRoutes");

//API Routes
const postsAPIRoutes = require("./routes/api/posts");
const usersAPIRoutes = require("./routes/api/users");

app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/logout", logoutRoutes);
app.use("/posts", middleware.requireLogin, postRoutes);
app.use("/profile", middleware.requireLogin, profileRoutes);

app.use("/api/posts", postsAPIRoutes);
app.use("/api/users", usersAPIRoutes);

app.get("/", middleware.requireLogin, (req, res, next) => {
  let payload = {
    pageTitle: "Home",
    user: req.session.user,
    userJS: JSON.stringify(req.session.user),
  };

  res.status(200).render("home", payload);
});
