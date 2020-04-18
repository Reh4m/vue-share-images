<template lang="html">
  <v-container>
    <query-progress v-show="loading"/>

    <!-- if not match results -->
    <template v-if="!searchResults.length && !loading">
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
    </template>

    <!-- posts card -->
    <template v-else>
      <v-row>
        <v-col
          v-for="(result, index) in searchResults"
          :key="result._id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            hover
            flat
            v-ripple="{ center: false }"
            @click="goToSearchResult(result._id)"
          >
            <v-img height="30vh" :src="result.imageUrl" />

            <!-- user info -->
            <v-list class="py-0">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    <span class=" caption darklighten--text font-weight-bold">
                      {{ result.title }}
                    </span>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <span class="caption font-weight-bold">
                      {{ getTimeFromNow(result.createdDate) }}
                    </span>
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action v-if="checkIfUserFavorite(result._id)">
                  <v-icon small color="red">mdi-heart</v-icon>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";

const pageSize = 6;

export default {
  name: 'searchPostsResults',
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
    getTimeFromNow(time) {
      return moment(time).format('LL');
    }
  }
}
</script>