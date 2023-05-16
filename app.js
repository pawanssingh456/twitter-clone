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
const notificationRoutes = require("./routes/notificationRoutes");
const postsAPIRoutes = require("./routes/api/posts");
const usersAPIRoutes = require("./routes/api/users");
const chatsAPIRoutes = require("./routes/api/chats");
const messagesAPIRoutes = require("./routes/api/messages");
const notificationsAPIRoutes = require("./routes/api/notifications");

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
app.use("/notifications", middleware.requireLogin, notificationRoutes);

const apiRoutes = {
  posts: postsAPIRoutes,
  users: usersAPIRoutes,
  chats: chatsAPIRoutes,
  messages: messagesAPIRoutes,
  notifications: notificationsAPIRoutes,
};
Object.entries(apiRoutes).forEach(([route, handler]) => {
  app.use(`/api/${route}`, handler);
});

// Initialize server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const io = require("socket.io")(server, { pingTimeout: 60000 });

// Define home route
app.get("/", middleware.requireLogin, (req, res, next) => {
  let payload = {
    pageTitle: "Home",
    user: req.session.user,
    userJS: JSON.stringify(req.session.user),
  };

  res.status(200).render("home", payload);
});

io.on("connection", (socket) => {
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join room", (room) => {
    socket.join(room);
  });

  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });

  socket.on("notification recieved", (room) => {
    socket.in(room).emit("notification recieved");
  });

  socket.on("new message", (newMessage) => {
    let chat = newMessage.chat;
    if (!chat.users) return console.log("chat users not defined");
    chat.users.forEach((user) => {
      if (user._id == newMessage.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessage);
    });
  });
});
