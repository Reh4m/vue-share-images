<template>
  <div>

    <!-- loading spinner -->
    <v-overlay v-model="loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <v-container class="text-center">

      <!-- explore posts button -->
      <v-row justify="center" align="center" v-if="!loading">
        <v-btn 
          color="primary"
          to="/posts"
          large
          dark
        >Explore Posts</v-btn>
      </v-row>

      <!-- posts carousel -->
      <v-col xs="12">
        <v-carousel
          cycle
          delimiter-icon="mdi-minus"
          v-if="!loading && posts.length > 0"
          :show-arrows="posts.length > 0 ? true : false "
        >
          <v-carousel-item
            v-for="post in posts"
            :key="post._id" :src="post.imageUrl"
            @click.native="goToPost(post._id)"
          >
            <span class="display-1" id="carousel__title">{{post.title}}</span>
          </v-carousel-item>
        </v-carousel>
      </v-col>

    </v-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'home',
  data: () => ({
    show: false
  }),
  created() {
    this.handleGetCorouselPosts();
  },
  computed: {
    ...mapGetters(['loading', 'posts', 'user'])
  },
  methods: {
    handleGetCorouselPosts() {
      // reach out to Vuex store, fine action that gets post for carousel
      this.$store.dispatch('getPosts');
    },
    goToPost(postId) {
      this.$router.push(`/posts/${postId}`)
    },
  }
};
</script>

<style scoped>
  #carousel__title {
    position: absolute;
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.3);
    color: white;
    border-radius: 5px 5px 0 0;
    padding: 0.5em;
    margin: 0 auto;
    bottom: 50px;
    left: 0;
    right: 0;
  }
</style>