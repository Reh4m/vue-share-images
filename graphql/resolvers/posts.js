module.exports = {
  Query: {
    getPosts: async (_, args, { Post }) => {
      const posts = await Post.find()
        .sort({ createdDate: 'desc' })
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
        .sort({ createdDate: 'desc' });
      return posts;
    },
    infiniteScrollPosts: async (
      _, { pageNum, pageSize, sort }, { Post }
    ) => {
      let posts;
      if (pageNum === 1) {
        posts = await Post.find({})
          // dynamic posts sorting by different values
        .sort({ [sort.by]: sort.order })
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
          .sort({ [sort.by]: sort.order })
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
        return post;
      } catch(err) {
        throw new Error('Post not found');
      }
    },
    getPostsByTag: async (_, { tag, sort }, { Post }) => {
      const posts = await Post.find({
        categories: tag
      })
        // dynamic posts sorting by different values
        .sort({ [sort.by]: sort.order })
        .populate({
          path: "createdBy",
          model: "User"
        });
      if (posts.length === 0 ) {
        throw new Error('Tag not found')
      } else {
        return posts;
      };
    },
    searchPosts: async (_, { searchTerm }, { Post }) => {
      const searchResults = await Post.find(
        // perform text search for search value of 'searchTerm'
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
