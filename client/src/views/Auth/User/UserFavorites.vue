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
            <v-card flat>
              <v-img
                height="30vh"
                :src="favorite.imageUrl"
                v-ripple
                @click="goToPost(favorite._id)"
              />
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    <span class="caption darklighten--text font-weight-bold">
                      {{ favorite.title }}
                    </span>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <span class="caption greylighten--text font-weight-bold">
                      Added {{ formatDate(favorite.createdDate) }}
                    </span>
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        color="red lighten-2"
                        v-on="on"
                        @click="handleUnlikePost(favorite._id)"
                      >
                        <v-icon>mdi-heart</v-icon>
                      </v-btn>
                    </template>
                    <span>Unlike post</span>
                  </v-tooltip>
                </v-list-item-action>
              </v-list-item>
            </v-card>
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
