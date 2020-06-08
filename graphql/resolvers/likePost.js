module.exports = {
  Mutation: {
    likePost: async (_, { postId, username }, { Post, User }) => {
      // find post, add i to its 'like' value
      const post = await Post.findOneAndUpdate(
        { _id: postId },
        { $inc: { likes: 1 } },
        { new: true }
      );
      // find user, add id at post to its favorites array
      // (whitch will be populate as posts)
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
        // find user, remove id of post from its favorites array
        // (whitch will be populate as posts)
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
  }
};
