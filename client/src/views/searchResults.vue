<template lang="html">
  <v-container>
    <query-progress v-show="loading"/>

    <!-- if not match results -->
    <div v-if="!searchResults.length && !loading">
      <v-row>
        <v-col class="text-center">
          <span class="title primary--text">
            No search results
          </span>
          <p class="font-weight-light">
            Try again using more general keyword
          </p>
        </v-col>
      </v-row>
    </div>

    <!-- posts card -->
    <div v-else>
      <v-row>
        <v-col
          v-for="result in searchResults"
          :key="result._id"
          cols="12"
          sm="6"
          md="4"
        >
          <PostCard :post="result"/>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";

const pageSize = 6;

export default {
  name: 'searchResults',
  computed: {
    ...mapGetters(["user", "searchResults", "loading", "userFavorites"]),
  },
  methods: {
    goToSearchResult(resultId) {
      // go to desined result
      this.$router.push(`/posts/${resultId}`);
      // clear search result
      // this.$store.commit('clearSearchResults');
    },
    checkIfUserFavorite(resultId) {
      return (
        this.userFavorites &&
        this.userFavorites.some(fave => fave._id === resultId)
      );
    },
    getTimeFromNow: time => moment(time).format('LL'),
  }
}
</script>
