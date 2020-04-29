<template>
  <v-card flat hover>
    <v-img
      height="30vh"
      :src="post.imageUrl"
      v-ripple
      @click="goToPost(post._id)"
    />
    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>
            <span class="caption darklighten--text font-weight-bold">
              {{ post.title }}
            </span>
          </v-list-item-title>
          <v-list-item-subtitle>
            <span class="caption greylighten--text font-weight-bold">
              {{ post.likeCount }} Likes • {{ post.messageCount }} Messages
            </span>
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action v-if="checkIfUserFavorite">
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn
                icon
                color="red lighten-2"
                v-on="on"
                @click="handleUnlikePost(post._id)"
              >
                <v-icon>mdi-heart</v-icon>
              </v-btn>
            </template>
            <span>Unlike post</span>
          </v-tooltip>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script>
import moment from "moment";
import { mapGetters } from 'vuex';

export default {
  name: 'PostCard',
  props: {
    post: Object
  },
  computed: {
    ...mapGetters(["user", "loading", "userFavorites"]),
    checkIfUserFavorite() {
      return (
        this.userFavorites &&
        this.userFavorites.some(fave => fave._id === this.post._id)
      );
    }
  },
  methods: {
    formatDate: date => moment(date).format('LL'),
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