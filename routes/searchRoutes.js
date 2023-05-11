const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
  const payload = createPayload(req.session.user);
  payload.selectedTab = "posts";
  res.status(200).render("searchPage", payload);
});

router.get("/:selectedTab", (req, res, next) => {
  const payload = createPayload(req.session.user);
  payload.selectedTab = req.params.selectedTab;
  res.status(200).render("searchPage", payload);
});

function createPayload(userLoggedIn) {
  return {
    pageTitle: "Search",
    user: userLoggedIn,
    userJS: JSON.stringify(userLoggedIn),
  };
}

module.exports = router;
