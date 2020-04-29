<template>
  <v-container>
    <v-row v-if="!userFavorites.length">
      <v-col class="text-center">
        <span class="title">
          Nothing here
        </span>
        <p class="font-weight-light">
          You have no favorited posts currently
        </p>
      </v-col>
    </v-row>

    <v-row v-else>
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
  </v-container>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";

export default {
  name: 'profile.userFavorites',
  computed: {
    ...mapGetters(["user", "loading", "userFavorites"])
  }
};
</script>
