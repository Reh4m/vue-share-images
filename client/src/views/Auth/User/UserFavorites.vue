<template>
  <div>

    <v-container v-if="!userFavorites.length">
      <v-row>
        <v-col class="text-center">
          <span class="darklighten--text">
            You have no favorited posts currently.
          </span>
        </v-col>
      </v-row>
    </v-container>

    <v-container v-else>
      <v-row>
        <v-col
          cols="12"
          sm="6"
          md="4"
          v-for="favorite in userFavorites"
          :key="favorite._id"
        >
          <v-card 
            class="mt-3" flat v-ripple hover
            @click="goToPost(favorite._id)"
          >
            <v-img height="30vh" :src="favorite.imageUrl"></v-img>
            <v-card-title>
              <span class="caption darklighten--text font-weight-bold">
                {{ favorite.title }} • {{ formatDate(favorite.createdDate) }}
              </span>
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

  </div>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";

export default {
  name: 'profile.userFavorites',
  computed: {
    ...mapGetters(["user", "userPosts", "userFavorites"])
  },
  methods: {
    formatDate(date) {
      return moment(date).format("ll");
    },
    goToPost(postId) {
      this.$router.push(`/posts/${postId}`)
    }
  }
};
</script>