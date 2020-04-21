<template lang="html">
  <v-container>
    <!-- post progress (shown if loading) -->
    <query-progress v-show="$apollo.queries.getPost.loading" />

    <!-- post -->
    <v-row v-if="getPost && !$apollo.loading">
      <v-col cols="12">
        <v-card flat>
          <v-list-item two-line>
            <v-list-item-avatar
              v-ripple
              @click="goToUser(getPost.createdBy._id)"
              style="cursor: pointer;"
            >
              <img :src="getPost.createdBy.avatar" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                <span class="body-2 font-weight-bold">
                  <router-link
                    class="info--text"
                    :to="`/profile/${getPost.createdBy._id}`"
                  >
                    {{ getPost.createdBy.name }}
                  </router-link>
                </span>
              </v-list-item-title>
              <v-list-item-subtitle>
                <span class="caption greylighten--text font-weight-bold">
                  @{{ getPost.createdBy.username }} •
                  {{ formatCreatedDate(getPost.createdDate) }}
                </span>
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon large color="info" @click="goToPreviousPage">
                mdi-arrow-left
              </v-icon>
            </v-list-item-action>
          </v-list-item>

          <!-- img -->
          <v-tooltip bottom transition="slide-y-transition">
            <template v-slot:activator="{ on }">
              <v-img
                id="toggle__image"
                max-height="50vh"
                v-on="on"
                :src="getPost.imageUrl"
                @click.stop="toggleImageDialog"
              />
            </template>
            <span>Click to enlarge image</span>
          </v-tooltip>

          <v-dialog v-model="imageDialog">
            <v-card>
              <v-img
                :src="getPost.imageUrl"
                height="80vh"
                @click.stop="toggleImageDialog"
              />
            </v-card>
          </v-dialog>

          <!-- description -->
          <v-card-title class="primary--text">
            {{ getPost.title }}
          </v-card-title>
          <v-card-text>
            {{ getPost.description }}
          </v-card-text>

          <!-- actions -->
          <v-list-item class="greylightenfive">
            <v-list-item-title>
              <v-chip-group show-arrows>
                <v-chip
                  v-for="(category, index) in getPost.categories"
                  :key="index"
                  outlined
                  label
                  link
                  :ripple="{ class: 'redlighten--text' }"
                  :to="`/tags/${category}`"
                >
                  {{ category }}
                </v-chip>
              </v-chip-group>
            </v-list-item-title>
            <v-list-item-action>
              <template v-if="user">
                <v-btn
                  v-if="checkIfPostLiked(getPost._id)"
                  text
                  color="red lighten-1"
                  @click="handleUnlikePost()"
                  :loading="loadingLike"
                >
                  <v-icon left>mdi-heart</v-icon>
                  {{ getPost.likes }}
                </v-btn>
                <v-btn
                  v-else
                  text
                  color="#707070"
                  @click="handleLikePost()"
                  :loading="loadingLike"
                >
                  <v-icon left>mdi-heart-outline</v-icon>
                  {{ getPost.likes }}
                </v-btn>
              </template>
              <template v-else>
                <v-btn text color="#707070" @click="signinRequired = true">
                  <v-icon left>mdi-heart-outline</v-icon>
                  {{ getPost.likes }}
                </v-btn>
              </template>
            </v-list-item-action>
          </v-list-item>
        </v-card>
      </v-col>

      <!-- messages component -->
      <PostMessages :messages="getPost.messages" :postId="postId" />

      <signin-required
        :dialog.sync="signinRequired"
        @closeDialog="closeDialog"
      />
    </v-row>
  </v-container>
</template>

<script>
import moment from 'moment'
import {
  GET_POST,
  LIKE_POST,
  UNLIKE_POST,
} from '../../queries'
import { mapGetters } from 'vuex'
import NotFound from '../Errors/NotFound.vue';
import PostMessages from '../../components/PostMessages.vue';

export default {
  name: 'Post',
  props: {
    postId: String
  },
  components: {
    PostMessages
  },
  data: () => ({
    postLiked: false,
    imageDialog: false,
    messageBody: '',
    isFormValid: true,
    messageError: '',
    signinRequired: false,
    messageRules: [
      messageBody => 
        messageBody.length < 10 || 'Message must be less than 200 characters'
    ],
    loadingLike: false,
    loadingMessage: false,
    loadingDeleteMessage: false
  }),
  apollo: {
    getPost: {
      query: GET_POST,
      variables() {
        return {
          postId: this.postId
        }
      },
      error(err) {
        this.$_error(NotFound, { message: err.message });
      }
    }
  },
  computed: {
    ...mapGetters(['user', 'userFavorites']),
  },
  methods: {
    closeDialog(){
      this.signinRequired = false;
    },
    formatCreatedDate: date => moment(new Date(date)).format('LLL'),
    goToUser(userId) {
      this.$router.push(`/profile/${userId}`);
    },
    checkIfPostLiked(postId) {
      // check if user favorites includes post with id of 'postId'
      const fave = this.userFavorites.some(fave => fave._id === postId);
      if (this.userFavorites && fave) {
        this.postLiked = true;
        return true;
      } else {
        this.postLiked = false;
        return false;
      }
    },
    handleToggleLikes() {
      if (this.postLiked) this.handleUnlikePost();
      else this.handleLikePost();
    },
    handleLikePost() {
      this.loadingLike = true;
      const variables = {
        postId: this.postId,
        username: this.user.username
      };
      this.$apollo.mutate({
        mutation: LIKE_POST,
        variables,
        update: (cache, { data: { likePost }}) => {
          const data = cache.readQuery({
            query: GET_POST,
            variables: { postId: this.postId }
          });
          data.getPost.likes += 1;
          cache.writeQuery({
            query: GET_POST,
            variables: { postId: this.postId },
            data
          });
        }
      }).then(({ data }) => {
        this.loadingLike = false;
        const updatedUser = { 
          ...this.user, favorites: 
          data.likePost.favorites 
        };
        this.$store.commit('setUser', updatedUser);
      }).catch(err => {
        this.loadingLike = false;
        console.error(err)
      });
    },
    handleUnlikePost() {
      this.loadingLike = true
      const variables = {
        postId: this.postId,
        username: this.user.username
      };
      this.$apollo.mutate({
        mutation: UNLIKE_POST,
        variables,
        update: (cache, { data: { unlikePost }}) => {
          const data = cache.readQuery({
            query: GET_POST,
            variables: { postId: this.postId }
          });
          data.getPost.likes -= 1;
          cache.writeQuery({
            query: GET_POST,
            variables: { postId: this.postId },
            data
          });
        }
      }).then(({ data }) => {
        this.loadingLike = false;
        const updatedUser = { 
          ...this.user, 
          favorites: data.unlikePost.favorites 
        };
        this.$store.commit('setUser', updatedUser);
      }).catch(err => {
        this.loadingLike = false;
        console.error(err);
      });
    },
    goToPreviousPage() {
      this.$router.go(-1);
    },
    toggleImageDialog() {
      if (window.innerWidth > 500) {
        this.imageDialog = !this.imageDialog;
      }
    },
  },
}
</script>

<style lang="css">
  #toggle__image {
    cursor: -moz-zoom-in; 
    cursor: -webkit-zoom-in; 
    cursor: zoom-in;
  }
</style>