import Vue from 'vue'
import App from './App.vue'
import '@babel/polyfill'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify';
import ErrorPage from 'vue-error-page';
import ApolloClient from 'apollo-boost';
import VueApollo from 'vue-apollo';

// global components
import SigninRequiredCard from './components/SigninRequiredCard';
Vue.component('SigninRequiredCard', SigninRequiredCard);

import QueryProgress from './components/QueryProgress';
Vue.component('QueryProgress', QueryProgress);

import PostCard from './components/PostCard';
Vue.component('PostCard', PostCard);

// layout settings
import LayoutButtons from './components/LayoutButtons';
Vue.component('LayoutButtons', LayoutButtons);

import PostsOrderMenu from './components/PostsOrderMenu';
Vue.component('PostsOrderMenu', PostsOrderMenu);

// errors page
window.eventBus = new Vue();
Vue.use(ErrorPage);

// setup apollo client
Vue.use(VueApollo);

export const defaultClient = new ApolloClient({
  uri: 'https://share-images-reh4m.herokuapp.com/graphql',
  // include auth token with request made to backend
  fetchOptions: {
    credentials: 'include'
  },
  request: operation => {
    // if no token with key of "token" in localStorage, add it
    if (!localStorage.token) {
      localStorage.setItem('token', '')
    };
    // operation adds the token to an auth header, which is sent to backend
    operation.setContext({
      headers: {
        authorization: localStorage.getItem('token')
      }
    });
  },
  onError: ({ graphQLErrors, networkError }) => {
    if (networkError) {
      console.log('[networkError]', networkError);
    };
    if (graphQLErrors) {
      for (let err of graphQLErrors) {
        console.dir(err);
        if (err.name === 'AuthenticationError') {
          // set auth error in state (to show in snackbar)
          store.commit('setAuthError', err);
          // signout user (to clear token)
          store.dispatch('signoutUser');
        };
      };
    };
  }
});

const apolloProvider = new VueApollo({ defaultClient });

Vue.config.productionTip = false;

new Vue({
  apolloProvider,
  router,
  store,
  vuetify,
  render: h => h(App),
  created() {
    // execute getCurrentUser query
    this.$store.dispatch('getCurrentUser')
  }
}).$mount('#app')
