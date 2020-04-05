const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const createToken = ( user, secret, expiresIn ) => {
  const { username, email } = user;
  return jwt.sign({ username, email }, secret, { expiresIn });
};

// Resolvers define the technique for fetching the types defined in the
// schema.
module.exports = {
  Query: {
    getCurrentUser: async (_, args, { User, currentUser }) => {
      if (!currentUser) {
        return null;
      };
      const user = await User.findOne({
        username: currentUser.username
      }).populate({
        path: "favorites",
        model: "Post"
      });
      return user;
    },
    getUser: async (_, { userId }, { User }) => {
      try {
        const user = await User.findOne({ _id: userId })
        .populate({
          path: "favorites",
          model: "Post"
        });
        if (user) return user;
      } catch(err) {
        throw new Error('User not found.');
      }
    },
    getPosts: async (_, args, { Post }) => {
      const posts = await Post.find({})
        .sort({ createdDate: "desc" })
        .populate({
          path: "createdBy",
          model: "User"
        })
        .limit(5);
      return posts;
    },
    getUserPosts: async (_, { userId }, { Post }) => {
      const posts = await Post.find({
        createdBy: userId
      })
      .sort({ createdDate: "desc" });
      return posts;
    },
    infiniteScrollPosts: async (_, { pageNum, pageSize }, { Post }) => {
      let posts;
      if (pageNum === 1) {
        posts = await Post.find({})
          .sort({ createdDate: "desc" })
          .populate({
            path: "createdBy",
            model: "User"
          })
          .limit(pageSize);
      } else {
        // if page number is greater than one, figure out how many documents to skip
        const skips = pageSize * (pageNum - 1);
        posts = await Post.find({})
          .sort({ createdDate: "desc" })
          .populate({
            path: "createdBy",
            model: "User"
          })
          .skip(skips)
          .limit(pageSize);
      }
      const totalDocs = await Post.countDocuments();
      const hasMore = totalDocs > pageSize * pageNum;
      return { posts, hasMore };
    },
    getPost: async (_, { postId }, { Post }) => {
      try {
        const post = await Post.findOne({ _id: postId })
        .populate({
          path: "messages.messageUser createdBy",
          model: "User"
        });
        if (post) return post;
      } catch(err) {
        throw new Error('Post not found.');
      }
    },
    getPostsByTag: async (_, { tag }, { Post }) => {
      const posts = await Post.find(
        { categories: tag }
      )
      .sort({ createdDate: "desc" })
      .populate({
        path: "messages.messageUser createdBy",
        model: "User"
      })
      if (posts.length === 0 ) throw new Error('Tag not found.');
      else return posts;
    },
    searchPosts: async (_, { searchTerm }, { Post }) => {
      const searchResults = await Post.find(
        // perform text search for search value of 'searchTerm
        { $text: { $search: searchTerm } },
        // assign 'searchTerm' a text score to provide best match
        { score: { $meta: "textScore" } }
        // sort results acconding to that textScore (as well as by likes in descending order)
      )
      .sort({
        score: { $meta: "textScore" },
        likes: "desc"
      })
      .limit(5);
      return searchResults;
    }
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      // value from the client
      return new Date(value);
    },
    serialize(value) {
      // value sent to the client
      return value.getTime();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        // ast value is always in string format
        return new Date(ast.value)
      }
      return null;
    },
  }),
  Mutation: {
    addPostMessage: async (_, { messageBody, userId, postId }, { Post }) => {
      const newMessage = {
        messageBody,
        messageUser: userId
      };
      const post = await Post.findOneAndUpdate(
        // find post by id
        { _id: postId },
        // prepend new message to beginning of messages array
        { $push: { messages: { $each: [newMessage], $position: 0 } } },
        // return fresh document after update
        { new: true }
      ).populate({
        path: "messages.messageUser",
        model: "User"
      });
      return post.messages[0];
    },
    deleteUserMessage: async (_, { postId, messageId }, { Post }) => {
      const message = await Post.findOneAndUpdate(
        { _id: postId },
        { $pull: { messages: { _id: messageId } } }
      );
      return message.messages[0];
    },
    updateUserPost: async (
      _,
      { postId, userId, title, imageUrl, categories, description },
      { Post }
    ) => {
      const post = await Post.findOneAndUpdate(
        // find post by postId and createdBy
        { _id: postId, createdBy: userId },
        {
          $set: {
            title,
            imageUrl,
            categories,
            description
          }
        },
        { new: true }
      );
      return post;
    },
    updateUserBanner: async (_, { userId, banner }, { User }) => {
      const user = await User.findOneAndUpdate(
        { _id: userId },
        { 
          $set: {
            banner
          }
        },
        { new: true }
      );
      return user
    },
    deleteUserPost: async (_, { postId }, { Post }) => {
      const post = await Post.findOneAndRemove({ _id: postId });
      return post;
    },
    likePost: async (_, { postId, username }, { Post, User }) => {
      // find post, add i to its 'like' value
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        { $inc: { likes: 1 } },
        { new: true }
      );
      // find user, add id at post to its favorites array (whitch will be populate as posts)
      const user = await User.findOneAndUpdate(
        { username },
        { $addToSet: { favorites: postId } },
        { new: true }
      ).populate({
        path: "favorites",
        model: "Post"
      });
      // return only likes from 'post' and favorites from 'user'
      return { likes: post.likes, favorites: user.favorites };
    },
    unlikePost: async (_, { postId, username }, { Post, User }) => {
      // find post, add -i to its 'like' value
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        { $inc: { likes: -1 } },
        { new: true }
      );
      // find user, remove id of post from its favorites array (whitch will be populate as posts)
      const user = await User.findOneAndUpdate(
        { username },
        { $pull: { favorites: postId } },
        { new: true }
      ).populate({
        path: "favorites",
        model: "Post"
      });
      // return only likes from 'post' and favorites from 'user'
      return { likes: post.likes, favorites: user.favorites };
    },
    addPost: async (
      _,
      { title, imageUrl, categories, description, creatorId },
      { Post }
    ) => {
      const newPost = await new Post({
        title,
        imageUrl,
        categories,
        description,
        createdBy: creatorId
      }).save();

      return newPost;
    },
    signinUser: async (_, { username, password }, { User }) => {
      const user = await User.findOne({ username });
      if (!user) throw new Error("User not found");

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) throw new Error("Invalid password");

      return { token: createToken(user, process.env.SECRET, "48hr") };
    },
    signupUser: async (_, { username, name, email, password }, { User }) => {
      const findUser = await User.findOne({ username });
      if (findUser) throw new Error("User already exist");

      const findEmail = await User.findOne({ email });
      if (findEmail) throw new Error("Email already exist");

      const newUser = await new User({
        username,
        name,
        email,
        password
      }).save();

      return { token: createToken(newUser, process.env.SECRET, "48hr") };
    }
  }
};