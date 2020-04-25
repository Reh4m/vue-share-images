import { gql } from 'apollo-boost';
import { fragments } from './fragments';

// Post Queries
export const GET_POSTS = gql`
  query {
    getPosts {
      _id
      title
      description
      imageUrl
    }
  }
`;

export const GET_POST = gql`
  query($postId: ID!) {
    getPost(postId: $postId) {
      _id
      ...PostFields
      createdDate
      createdBy {
        _id
        username
        name
        avatar
      }
      messages {
        _id
        messageBody
        messageDate
        messageUser {
          _id
          username
          name
          avatar
        }
      }
    }
  }
  ${fragments.postFields}
`;

export const GET_POSTS_BY_TAG = gql`
  query($tag: String!, $orderBy: PostsOrderByInput) {
    getPostsByTag(tag: $tag, orderBy: $orderBy) {
      _id
      ...PostFields
      createdDate
      createdBy {
        _id
        username
        name
        avatar
      }
    }
  }
  ${fragments.postFields}
`;

export const SEARCH_POSTS = gql`
  query($searchTerm: String) {
    searchPosts(searchTerm: $searchTerm) {
      _id
      title
      description
      imageUrl
      createdDate
    }
  }
`;

// User Queries
export const GET_CURRENT_USER = gql`
  query {
    getCurrentUser {
      _id
      username
      name
      email
      password
      avatar
      joinDate
      favorites {
        _id
        title
        imageUrl
        createdDate
        messageCount
        likeCount
      }
    }
  }
`;

export const GET_USER = gql`
  query($userId: ID!) {
    getUser(userId: $userId) {
      _id
      username
      name
      email
      avatar
      joinDate
      favorites {
        _id
        title
        imageUrl
        createdDate
      }
    }
  }
`;

export const GET_USER_POSTS = gql`
  query($userId: ID!) {
    getUserPosts(userId: $userId) {
      _id
      ...PostFields
      createdDate
      messages {
        _id
      }
    }
  }
  ${fragments.postFields}
`;

export const INFINITE_SCROLL_POSTS = gql`
  query($pageNum: Int!, $pageSize: Int!, $orderBy: PostsOrderByInput) {
    infiniteScrollPosts(
      pageNum: $pageNum
      pageSize: $pageSize
      orderBy: $orderBy
    ) {
      hasMore
      posts {
        _id
        ...PostFields
        createdDate
        messages {
          _id
        }
        createdBy {
          _id
          username
          name
          avatar
        }
      }
    }
  }
  ${fragments.postFields}
`;

// Posts Mutations
export const ADD_POST = gql`
  mutation(
    $title: String!
    $imageUrl: String!
    $categories: [String]!
    $description: String!
    $creatorId: ID!
  ) {
    addPost(
      title: $title
      imageUrl: $imageUrl
      categories: $categories
      description: $description
      creatorId: $creatorId
    ) {
      ...PostFields
    }
  }
  ${fragments.postFields}
`;

export const UPDATE_USER_POST = gql`
  mutation(
    $postId: ID!
    $userId: ID!
    $title: String!
    $imageUrl: String!
    $categories: [String]!
    $description: String!
  ) {
    updateUserPost(
      postId: $postId
      userId: $userId
      title: $title
      imageUrl: $imageUrl
      categories: $categories
      description: $description
    ) {
      _id
      ...PostFields
      createdDate
      createdBy {
        _id
        avatar
      }
    }
  }
  ${fragments.postFields}
`;

export const DELETE_USER_POST = gql`
  mutation($postId: ID!) {
    deleteUserPost(postId: $postId) {
      _id
    }
  }
`;

export const ADD_POST_MESSAGE = gql`
  mutation($messageBody: String!, $userId: ID!, $postId: ID!) {
    addPostMessage(
      messageBody: $messageBody
      userId: $userId
      postId: $postId
    ) {
      _id
      messageBody
      messageDate
      messageUser {
        _id
        username
        name
        avatar
      }
    }
  }
`;

export const DELETE_USER_MESSAGE = gql`
  mutation($postId: ID!, $messageId: ID!) {
    deleteUserMessage(postId: $postId, messageId: $messageId) {
      _id
    }
  }
`;

export const LIKE_POST = gql`
  mutation($postId: ID!, $username: String!) {
    likePost(postId: $postId, username: $username) {
      post {
        _id
        likes {
          _id
          username
        }
        likeCount
      }
      favorites {
        _id
        title
        imageUrl
      }
    }
  }
`;

// user Mutations
export const SIGNIN_USER = gql`
  mutation($username: String!, $password: String!) {
    signinUser(username: $username, password: $password) {
      token
    }
  }
`;

export const SIGNUP_USER = gql`
  mutation(
    $username: String!
    $name: String!
    $email: String!
    $password: String!
  ) {
    signupUser(
      username: $username
      name: $name
      email: $email
      password: $password
    ) {
      token
    }
  }
`;