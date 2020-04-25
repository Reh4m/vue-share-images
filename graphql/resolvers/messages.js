module.exports = {
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
      const post = await Post.findOneAndUpdate(
        // find post id and refresh document
        { _id: postId },
        { $pull: { messages: { _id: messageId } } }
      );
      return post.messages[0];
    },
  }
}