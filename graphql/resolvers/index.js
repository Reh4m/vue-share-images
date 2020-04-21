const usersResolvers = require('./users');
const postsResolvers = require('./posts');
const postsMessagesResolvers = require('./messages');
const scalarDate = require('../scalarDate');

module.exports = {
  Post: {
    messageCount: parent => parent.messages.length,
    likeCount: parent => parent.likes.length
  },
  Query: {
    ...usersResolvers.Query,
    ...postsResolvers.Query
  },
  // scalar type Date
  Date: scalarDate,
  Mutation: {
    ...usersResolvers.Mutation,
    ...postsResolvers.Mutation,
    ...postsMessagesResolvers.Mutation
  }
};
