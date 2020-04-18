import Vue from 'vue'
import VueRouter from 'vue-router'
import authGuard from './authGuard.js'

Vue.use(VueRouter)

const routes = [
  {
    path: '*',
    component: () => import('../views/Errors/NotFound.vue')
  },{
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue')
  },{
    path: '/signin',
    name: 'signin',
    component: () => import('../views/Auth/Signin.vue')
  },{
    path: '/signup',
    name: 'signup',
    component: () => import('../views/Auth/Signup.vue')
  },{
    path: '/user',
    component: () => import('../views/Auth/User/User.vue'),
    beforeEnter: authGuard,
    children: [{
      path: '',
      name: 'userPosts',
      component: () => import('../views/Auth/User/UserPosts.vue')
    },{
      path: 'favorites',
      name: 'userFavorites',
      component: () => import('../views/Auth/User/UserFavorites.vue')
    }]
  },{
    path: '/profile/:userId',
    component: () => import('../views/Profile/Profile.vue'),
    props: true,
    children: [{
      path: '',
      name: 'profilePosts',
      component: () => import('../views/Profile/ProfilePosts.vue')
    }]
  },{
    path: '/post/add',
    name: 'addPost',
    component: () => import('../views/Posts/AddPost.vue'),
    beforeEnter: authGuard
  },{
    path: '/posts',
    name: 'posts',
    component: () => import('../views/Posts/Posts.vue')
  },{
    path: '/posts/:postId',
    name: 'post',
    component: () => import('../views/Posts/Post.vue'),
    props: true
  },{
    path: '/search',
    name: 'searchPostsResults',
    component: () => import('../views/SearchPostsResults.vue')
  },{
    path: '/tags/:tag',
    name: 'tags',
    component: () => import('../views/Tags.vue'),
    props: true
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
