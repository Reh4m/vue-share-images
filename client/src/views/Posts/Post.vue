<template lang="html">
  <v-container>
    <!-- post progress (shown if loading) -->
    <QueryProgress v-show="$apollo.queries.getPost.loading" />

    <!-- post -->
    <v-row v-if="getPost && !$apollo.loading">
      <v-col cols="12">
        <v-card flat>
          <v-list-item two-line>
            <v-list-item-avatar
              v-ripple
              @click="goToUserProfile(getPost.createdBy._id)"
              style="cursor: pointer;"
            >
              <img :src="getPost.createdBy.avatar" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                <span class="body-2 darklighten--text font-weight-bold">
                    {{ getPost.createdBy.name }}
                </span>
              </v-list-item-title>
              <v-list-item-subtitle>
                <span class="caption font-weight-bold">
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
          <v-card-title>
            {{ getPost.title }}
          </v-card-title>
          <v-card-text>
            {{ getPost.description }}
          </v-card-text>

          <v-list-item class="py-0 greylightenfive">
            <v-list-item-title>
              <!-- tags -->
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
              <!-- like button component -->
            <v-list-item-action>
              <LikeButton :postId="getPost._id" :likes="getPost.likes" />
            </v-list-item-action>
          </v-list-item>
        </v-card>
      </v-col>

      <!-- messages component -->
      <PostMessages :messages="getPost.messages" :postId="postId" />
    </v-row>
  </v-container>
</template>

<script>
import moment from 'moment'
import { GET_POST } from '../../queries'
import { mapGetters } from 'vuex'
import NotFound from '../Errors/NotFound.vue';
import PostMessages from '../../components/PostMessages.vue';
import LikeButton from '../../components/LikeButton.vue';

export default {
  name: 'Post',
  props: {
    postId: String
  },
  components: {
    PostMessages,
    LikeButton
  },
  data: () => ({
    imageDialog: false,
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
    ...mapGetters(['user', 'userFavorites', 'loading'])
  },
  methods: {
    formatCreatedDate: date => moment(new Date(date)).format('LLL'),
    goToUserProfile(userId) {
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
      if (this.checkIfPostLiked) this.handleUnlikePost();
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
        const updatedUser = { ...this.user, favorites: data.likePost.favorites };
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
        const updatedUser = { ...this.user, favorites: data.unlikePost.favorites };
        this.$store.commit('setUser', updatedUser);
      }).catch(err => {
        this.loadingLike = false;
        console.error(err);
      });
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
