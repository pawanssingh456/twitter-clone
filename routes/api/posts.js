const express = require("express");
const app = express();
const router = express.Router();
const bodyParser = require("body-parser");
const User = require("../../schemas/userSchema");
const Post = require("../../schemas/postSchema");

app.use(bodyParser.urlencoded({ extended: false }));

router.get("/", async (req, res, next) => {
  try {
    const { isReply, ...searchObject } = req.query;
    if (isReply !== undefined) {
      searchObject.replyTo = { $exists: isReply === "true" };
    }

    const posts = await getPosts(searchObject);
    res.status(200).send(posts);
  } catch (error) {
    next(error);
  }
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
});

router.post("/", async (req, res) => {
  try {
    const { content, replyTo } = req.body;

    if (!content) {
      return res.status(400).send("Content is required.");
    }

    const postData = {
      content,
      postedBy: req.session.user,
    };

    if (replyTo) {
      postData.replyTo = replyTo;
    }

    const post = await Post.create(postData);
    const populatedPost = await Post.findById(post._id).populate("postedBy");

    res.status(201).send(populatedPost);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
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
  const postId = req.params.id;
  const userId = req.session.user._id;

  const previouslyRetweetedPost = await Post.findOneAndDelete({
    postedBy: userId,
    retweetData: postId,
  }).catch((error) => {
    console.log(error);
    return res.sendStatus(400);
  });

  const option = previouslyRetweetedPost ? "$pull" : "$addToSet";

  let retweetPost = previouslyRetweetedPost;

  if (retweetPost == null) {
    retweetPost = await Post.create({
      postedBy: userId,
      retweetData: postId,
    }).catch((error) => {
      console.log(error);
      return res.sendStatus(400);
    });
  }

  req.session.user = await User.findByIdAndUpdate(
    userId,
    { [option]: { retweets: retweetPost._id } },
    { new: true }
  ).catch((error) => {
    return res.sendStatus(400);
  });

  const post = await Post.findByIdAndUpdate(
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
  try {
    let posts = await Post.find(filter)
      .populate("postedBy retweetData replyTo")
      .sort({ createdAt: -1 });

    posts = await User.populate(posts, {
      path: "replyTo.postedBy retweetData.postedBy",
    });
    return posts;
  } catch (error) {
    console.log(error);
    return [];
  }
}

module.exports = router;
