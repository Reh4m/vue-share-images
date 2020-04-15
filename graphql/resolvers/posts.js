
const handleSortPostsBy = orderBy => {
  let sortBy;
  const prop = orderBy.includes('desc') ? 'desc' : 'asc'
  switch (prop) {
    case 'desc':
      sortBy = orderBy.replace('_desc', '');
      break;
    case 'asc':
      sortBy = orderBy.replace('_asc', '');
      break;
  }
  return {
    sortBy, prop
  }
};

module.exports = {
  Query: {
    getPosts: async (_, args, { Post }) => {
      const posts = await Post.find({})
        .sort({ createdDate: 'desc' })
        .populate({
          path: "createdBy",
          model: "User"
        })
        .limit(5)
      return posts;
    },
    getUserPosts: async (_, { userId }, { Post }) => {
      const posts = await Post.find({
        createdBy: userId
      })
      .sort({ createdDate: "desc" });
      return posts;
    },
    infiniteScrollPosts: async (_, { pageNum, pageSize, orderBy }, { Post }) => {
      // get sort value by the user
      const sortPostsBy = handleSortPostsBy(orderBy);
      let posts;
      if (pageNum === 1) {
        posts = await Post.find({})
          // dynamic posts sorting by different values
        .sort({ [sortPostsBy.sortBy]: sortPostsBy.prop })
          .populate({
            path: "createdBy",
            model: "User"
          })
          .limit(pageSize);
      } else {
        // if page number is greater than one,
        // figure out how many documents to skip
        const skips = pageSize * (pageNum - 1);
        posts = await Post.find({})
          .sort({ [sortPostsBy.sortBy]: sortPostsBy.prop })
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
    getPostsByTag: async (_, { tag, orderBy }, { Post }) => {
      // get sort value by the user
      const sortPostsBy = handleSortPostsBy(orderBy);
      const posts = await Post.find({
        categories: tag
      })
        // dynamic posts sorting by different values
        .sort({ [sortPostsBy.sortBy]: sortPostsBy.prop })
        .populate({
          path: "createdBy",
          model: "User"
        });
      if (posts.length === 0 ) throw new Error('Tag not found.');
      else return posts;
    },
    searchPosts: async (_, { searchTerm }, { Post }) => {
      const searchResults = await Post.find(
        // perform text search for search value of 'searchTerm
        { $text: { $search: searchTerm } },
        // assign 'searchTerm' a text score to provide best match
        { score: { $meta: "textScore" } }
        // sort results acconding to that textScore
        // (as well as by likes in descending order)
      )
      .sort({
        score: { $meta: "textScore" },
        likes: "desc"
      })
      .limit(5);
      return searchResults;
    }
  },
  Mutation: {
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
    }
  }
};