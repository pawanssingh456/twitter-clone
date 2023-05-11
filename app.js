// Import dependencies
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");

// Import middleware
const middleware = require("./middleware");

//Initialise database
require("./database");

// Import routes
const loginRoutes = require("./routes/loginRoutes");
const registerRoutes = require("./routes/registerRoutes");
const logoutRoutes = require("./routes/logoutRoutes");
const postRoutes = require("./routes/postRoutes");
const profileRoutes = require("./routes/profileRoutes");
const searchRoutes = require("./routes/searchRoutes");
const messageRoutes = require("./routes/messagesRoutes");
const postsAPIRoutes = require("./routes/api/posts");
const usersAPIRoutes = require("./routes/api/users");
const chatsAPIRoutes = require("./routes/api/chats");

// Initialize express app
const app = express();
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

// Configure routes
app.use("/login", loginRoutes);
app.use("/register", registerRoutes);
app.use("/logout", logoutRoutes);
app.use("/posts", middleware.requireLogin, postRoutes);
app.use("/profile", middleware.requireLogin, profileRoutes);
app.use("/search", middleware.requireLogin, searchRoutes);
app.use("/messages", middleware.requireLogin, messageRoutes);

const apiRoutes = {
  posts: postsAPIRoutes,
  users: usersAPIRoutes,
  chats: chatsAPIRoutes,
};
Object.entries(apiRoutes).forEach(([route, handler]) => {
  app.use(`/api/${route}`, handler);
});

// Initialize server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Define home route
app.get("/", middleware.requireLogin, (req, res, next) => {
  let payload = {
    pageTitle: "Home",
    user: req.session.user,
    userJS: JSON.stringify(req.session.user),
  };

  res.status(200).render("home", payload);
});
