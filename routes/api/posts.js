const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../../schemas/userSchema");
const Post = require("../../schemas/postSchema");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", async (req, res, next) => {
  let searchObject = req.query;

  if (searchObject.isReply !== undefined) {
    let isReply = searchObject.isReply == "true";
    searchObject.replyTo = { $exists: isReply };
    delete searchObject.isReply;
  }

  let posts = await getPosts(searchObject);
  res.status(200).send(posts);
});

router.get("/:id", async (req, res, next) => {
  let postData = await getPosts({ _id: req.params.id });
  postData = postData[0];

  let result = {
    postData: postData,
  };

  if (postData.replyTo !== undefined) {
    result.replyTo = postData.replyTo;
  }

  result.replies = await getPosts({ replyTo: req.params.id });

  res.status(200).send(result);
});

router.delete("/:id", async (req, res, next) => {
  Post.findByIdAndDelete(req.params.id)
    .then(() => res.sendStatus(202))
    .catch((error) => {
      console.log(error);
      res.sendStatus(400);
    });

  result.replies = await getPosts({ replyTo: req.params.id });

  res.status(200).send(result);
});

router.post("/", async (req, res, next) => {
  if (!req.body.content) {
    return res.sendStatus(400);
  }

  let data = {
    content: req.body.content,
    postedBy: req.session.user,
  };

  if (req.body.replyTo) {
    data.replyTo = req.body.replyTo;
  }

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
    console.log(error);
    return res.sendStatus(400);
  });

  let option = deletedPost ? "$pull" : "$addToSet";

  let repost = deletedPost;

  if (repost == null) {
    repost = await Post.create({ postedBy: userId, retweetData: postId }).catch(
      (error) => {
        console.log(error);
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
    console.log(error);
    return res.sendStatus(400);
  });

  res.status(200).send(post);
});

async function getPosts(filter) {
  let posts = await Post.find(filter)
    .populate("postedBy")
    .populate("retweetData")
    .populate("replyTo")
    .sort({ createdAt: -1 })
    .catch((error) => {
      return res.sendStatus(400);
    });

  posts = await User.populate(posts, { path: "replyTo.postedBy" });
  return await User.populate(posts, { path: "retweetData.postedBy" });
}

module.exports = router;
