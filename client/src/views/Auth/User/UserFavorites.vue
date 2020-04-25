<template>
  <v-container>
    <div v-if="!userFavorites.length">
      <v-row>
        <v-col class="text-center">
          <span class="title primary--text">
            Nothing here
          </span>
          <p class="font-weight-light">
            You have no favorited posts currently
          </p>
        </v-col>
      </v-row>
    </div>

    <div v-else>
      <v-row>
        <v-col
          cols="12"
          sm="6"
          md="4"
          v-for="favorite in userFavorites"
          :key="favorite._id"
        >
          <v-skeleton-loader type="card" :loading="loading">
            <PostCard :post="favorite"/>
          </v-skeleton-loader>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";

export default {
  name: 'profile.userFavorites',
  computed: {
    ...mapGetters(["user", "loading", "userFavorites"])
  },
  methods: {
    formatDate: date => moment(date).format("LL"),
    goToPost(postId) {
      this.$router.push(`/posts/${postId}`);
    },
    handleUnlikePost(postId) {
      this.$store.dispatch('likePost', {
        username: this.user.username,
        postId
      });
    }
  }
};
</script>
