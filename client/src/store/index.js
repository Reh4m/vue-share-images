import Vue from 'vue'
import Vuex from 'vuex'
import router from '../router'
import { defaultClient as apolloClient } from '../main';
import {
  GET_CURRENT_USER,
  GET_POSTS,
  SIGNIN_USER,
  SIGNUP_USER,
  ADD_POST,
  SEARCH_POSTS,
  GET_USER_POSTS,
  UPDATE_USER_POST,
  DELETE_USER_POST,
  INFINITE_SCROLL_POSTS,
} from "../queries";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    user: null,
    posts: [],
    userPosts: [],
    searchResults: [],
    loading: false,
    error: null,
    authError: null
  },
  mutations: {
    setUser: (state, payload) => {
      state.user = payload;
    },
    setPosts: (state, payload) => {
      state.posts = payload;
    },
    setUserPosts: (state, payload) => {
      state.userPosts = payload;
    },
    setSearchResults: (state, payload) => {
      if (payload !== null) {
        state.searchResults = payload;
      }
    },
    setLoading: (state, payload) => {
      state.loading = payload;
    },
    setError: (state, payload) => {
      state.error = payload;
    },
    clearUser: state => (state.user = null),
    clearSearchResults: state => (state.searchResults = []),
    clearError: state => (state.error = null),
    setAuthError: (state, payload) => {
      state.authError = payload;
    }
  },
  actions: {
    searchPosts: ({ commit }, payload) => {
      commit('setLoading', true);
      apolloClient.query({
        query: SEARCH_POSTS,
        variables: payload
      }).then(({ data }) => {
        commit('setLoading', false);
        commit('setSearchResults', data.searchPosts);
      }).catch(err => {
        commit('setLoading', false);
        console.error(err)
      });
    },
    getCurrentUser: ({ commit }) => {
      commit('setLoading', true);
      apolloClient.query({
        query: GET_CURRENT_USER
      })
      .then(({ data }) => {
        commit('setLoading', false);
        // add user data to state
        commit('setUser', data.getCurrentUser);
      })
      .catch(err => {
        commit('setLoading', false);
        console.error(err);
      });
    },
    getPosts: ({ commit }) => {
      commit('setLoading', true);
      // use ApolloClient to fine getPosts query
      apolloClient
        .query({
          query: GET_POSTS
        }).then(({ data }) => {
          // get data from actions to state via mutations
          // commit passes data from actions along to mutations functions
          commit('setPosts', data.getPosts);
          commit('setLoading', false);
        })
        .catch(err => {
          commit('setLoading', false);
          console.error(err);
        });
    },
    getUserPosts: ({ commit }, payload) => {
      commit('setLoading', true);
      apolloClient.query({
        query: GET_USER_POSTS,
        variables: payload
      }).then(({ data }) => {
        commit('setLoading', false);
        commit('setUserPosts', data.getUserPosts);
      })
      .catch(err => {
        commit('setLoading', false);
        console.error(err)
      });
    },
    addPost: ({ state, commit }, payload) => {
      commit('setLoading', true);
      apolloClient
      .mutate({
        mutation: ADD_POST,
        variables: payload,
        update: (cache, { data: { addPost } }) => {
          // first read the query you want to update
          const data = cache.readQuery({ query: GET_POSTS });
          // create update data
          data.getPosts.unshift(addPost);
          // write updated data back to query
          cache.writeQuery({
            query: GET_POSTS,
            data
          });
        },
        // optimistic response ensures dara is added inmediately
        // as we specified for the update function
        optimisticResponse: {
          __typename: 'Mutation',
          addPost: {
            __typename: 'Post',
            _id: -1,
            ...payload
          }
        },
        // return specified queries after perfoming the mutation
        // in oder to get fresh data
        refetchQueries: [
          {
            query: INFINITE_SCROLL_POSTS,
            variables: {
              pageNum: 1,
              pageSize: 4,
              sort: {
                by: 'createdDate', order: 'desc'
              }
            }
          },
          {
            query: GET_USER_POSTS,
            variables: {
              userId: state.user._id
            }
          }
        ]
      })
      .then(() => {
        commit('setLoading', false);
        router.push('/');
      })
      .catch(err => {
        commit('setLoading', false);
        console.error(err);
      })
    },
    updateUserPost: ({ state, commit }, payload) => {
      apolloClient.mutate({
        mutation: UPDATE_USER_POST,
        variables: payload,
        refetchQueries: [{
          query: GET_USER_POSTS,
          variables: {
            userId: state.user._id
          }
        }]
      }).then(({ data }) => {
        const index = state.userPosts.findIndex(
          post => post._id === data.updateUserPost._id
        );
        const userPosts = [
          ...state.userPosts.slice(0, index),
          data.updateUserPost,
          ...state.userPosts.slice(index + 1)
        ];
        commit('setUserPosts', userPosts);
      }).catch(err => console.error(err));
    },
    deleteUserPost: ({ state, commit }, payload) => {
      apolloClient.mutate({
        mutation: DELETE_USER_POST,
        variables: payload,
        refetchQueries: [
          {
            query: INFINITE_SCROLL_POSTS,
            variables: {
              pageNum: 1,
              pageSize: 4,
              sort: {
                by: 'createdDate', order: 'desc'
              }
            }
          },{
            query: GET_USER_POSTS,
            variables: {
              userId: state.user._id
            }
          },{
            query: GET_POSTS
          }
        ]
      })
      .then(({ data }) => {
        const index = state.userPosts.findIndex(
          post => post._id === data.deleteUserPost._id
        );
        const userPosts = [
          ...state.userPosts.slice(0, index),
          ...state.userPosts.slice(index + 1)
        ];
        commit('setUserPosts', userPosts);
      })
      .catch(err => console.error(err));
    },
    signinUser: ({commit}, payload) => {
      commit('clearError');
      commit('setLoading', true);
      // clear token to prevent errors
      localStorage.setItem('token', '')
      apolloClient
        .mutate({
          mutation: SIGNIN_USER,
          variables: payload
        })
        .then(({ data }) => {
          commit('setLoading', false);
          localStorage.setItem('token', data.signinUser.token);
          // to make sure created methods is run in main.js
          // (we run getCurrentUser), reload the page
          router.go();
        })
        .catch(err => {
          commit('setLoading', false);
          commit('setError', err)
        });
    },
    signupUser: ({commit}, payload) => {
      commit('clearError');
      commit('setLoading', true);
      // clear token to prevent errors
      localStorage.setItem('token', '')
      apolloClient
        .mutate({
          mutation: SIGNUP_USER,
          variables: payload
        })
        .then(({ data }) => {
          commit('setLoading', true);
          localStorage.setItem('token', data.signupUser.token);
          // to make sure created methods is run in main.js
          // (we run getCurrentUser), reload the page
          router.go();
        })
        .catch(err => {
          commit('setLoading', false);
          commit('setError', err)
        });
    },
    signoutUser: async ({ commit }) => {
      // clear user in state
      commit('clearUser');
      // remove token in localStorage
      localStorage.setItem('token', '');
      // end session
      await apolloClient.resetStore();
      // redirect home - kick users out of private pages
      router.go();
    }
  },
  getters: {
    posts: state => state.posts,
    userPosts: state => state.userPosts,
    searchResults: state => state.searchResults,
    loading: state => state.loading,
    user: state => state.user,
    userFavorites: state => state.user && state.user.favorites,
    error: state => state.error,
    authError: state => state.authError
  }
})
