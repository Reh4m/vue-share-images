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
                class="align-end"
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
          <v-list-item class="py-0">
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
              <div v-if="user">
                <v-btn
                  text
                  :color="checkIfPostLiked ? '#EF5350' : '#707070'"
                  @click="handleLikePost()"
                  :loading="loading"
                >
                  <v-icon left>mdi-heart-outline</v-icon>
                  <span class="primary--text">
                    {{ getPost.likeCount }}
                  </span>
                </v-btn>
              </div>
              <div v-else>
                <v-btn text color="#707070" @click="signinRequired = true">
                  <v-icon left>mdi-heart-outline</v-icon>
                  <span class="primary--text">
                    {{ getPost.likeCount }}
                  </span>
                </v-btn>
              </div>
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
    imageDialog: false,
    messageBody: '',
    isFormValid: true,
    messageError: '',
    signinRequired: false,
    messageRules: [
      messageBody =>
        messageBody.length < 10 || 'Message must be less than 200 characters'
    ],
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
    ...mapGetters(['user', 'userFavorites', 'loading']),
    checkIfPostLiked() {
      // check if user favorites includes post with id of 'postId'
      const fave = this.userFavorites.some(fave => fave._id === this.postId);
      return this.userFavorites && fave;
    },
  },
  methods: {
    closeDialog(){
      this.signinRequired = false;
    },
    formatCreatedDate: date => moment(new Date(date)).format('LLL'),
    goToUser(userId) {
      this.$router.push(`/profile/${userId}`);
    },
    goToPreviousPage() {
      this.$router.go(-1);
    },
    toggleImageDialog() {
      if (window.innerWidth > 500) {
        this.imageDialog = !this.imageDialog;
      };
    },
    handleLikePost() {
      const variables = {
        postId: this.postId,
        username: this.user.username
      };
      this.$store.dispatch('likePost', variables);
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
