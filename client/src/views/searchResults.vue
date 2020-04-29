<template lang="html">
  <v-container>
    <QueryProgress v-show="loading"/>

    <!-- if not match results -->
    <v-row v-if="!searchResults.length && !loading">
      <v-col class="text-center">
        <span class="title primary--text">
          No search results
        </span>
        <p class="font-weight-light">
          Try again using more general keyword
        </p>
      </v-col>
    </v-row>

    <!-- posts card -->
    <v-row v-else>
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
  </v-container>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";

const pageSize = 6;

export default {
  name: 'searchResults',
  computed: {
    ...mapGetters(["searchResults", "loading"]),
  }
}
</script>
