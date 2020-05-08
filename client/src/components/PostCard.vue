<template>
  <v-card flat hover>
    <v-img
      height="30vh"
      :src="post.imageUrl"
      v-ripple
      @click="goToPost(post._id)"
    />
    <v-card-title>
      <span class="caption font-weight-bold">
        {{ post.title }}
      </span>
    </v-card-title>
    <v-card-subtitle>
      <span class="caption font-weight-bold">
        {{ post.likes }} Likes • {{ post.messageCount }} Messages
      </span>
    </v-card-subtitle>
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
    ...mapGetters(["user", "loading", "userFavorites"])
  },
  methods: {
    formatDate: date => moment(date).format('LL'),
    goToPost(postId) {
      this.$router.push(`/posts/${postId}`);
    },
  }
};
</script>
