const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../../schemas/userSchema");
const Post = require("../../schemas/postSchema");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", (req, res, next) => {
  Post.find()
    .populate("postedBy")
    .populate("retweetData")
    .sort({ createdAt: -1 })
    .then(async (posts) => {
      posts = await User.populate(posts, { path: "retweetData.postedBy" });
      res.status(200).send(posts);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

router.post("/", async (req, res, next) => {
  if (!req.body.content) {
    return res.sendStatus(400);
  }

  let data = {
    content: req.body.content,
    postedBy: req.session.user,
  };

  Post.create(data)
    .then(async (post) => {
      post = await User.populate(post, { path: "postedBy" });
      res.status(201).send(post);
    })
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });
});

router.put("/:id/like", async (req, res, next) => {
  let postId = req.params.id;
  let userId = req.session.user._id;

  let isLiked =
    req.session.user.likes && req.session.user.likes.includes(postId);

  let option = isLiked ? "$pull" : "$addToSet";

  req.session.user = await User.findByIdAndUpdate(
    userId,
    { [option]: { likes: postId } },
    { new: true }
  ).catch((error) => {
    return res.sendStatus(400);
  });

  let post = await Post.findByIdAndUpdate(
    postId,
    { [option]: { likes: userId } },
    { new: true }
  ).catch((error) => {
    return res.sendStatus(400);
  });

  res.status(200).send(post);
});

router.post("/:id/retweet", async (req, res, next) => {
  let postId = req.params.id;
  let userId = req.session.user._id;

  let deletedPost = await Post.findOneAndDelete({
    postedBy: userId,
    retweetData: postId,
  }).catch((error) => {
    console.log("h1" + error);
    return res.sendStatus(400);
  });

  let option = deletedPost ? "$pull" : "$addToSet";

  let repost = deletedPost;

  if (repost == null) {
    repost = await Post.create({ postedBy: userId, retweetData: postId }).catch(
      (error) => {
        console.log("h2" + error);
        return res.sendStatus(400);
      }
    );
  }

  req.session.user = await User.findByIdAndUpdate(
    userId,
    { [option]: { retweets: repost._id } },
    { new: true }
  ).catch((error) => {
    return res.sendStatus(400);
  });

  let post = await Post.findByIdAndUpdate(
    postId,
    { [option]: { retweetUsers: userId } },
    { new: true }
  ).catch((error) => {
    console.log("h4" + error);
    return res.sendStatus(400);
  });

  res.status(200).send(post);
});

module.exports = router;
