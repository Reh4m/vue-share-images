<template>
  <v-container>
    <!-- user progress (shown if loading) -->
    <QueryProgress v-show="$apollo.queries.getUser.loading" />

    <div v-if="getUser && getUserPosts">
      <!-- user details card -->
      <v-card flat>
        <v-container>
          <v-list-item three-line>
            <v-list-item-avatar size="80" style="border: 10px">
              <v-img :src="getUser.avatar" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title
                class="
                    title
                    text-capitalize
                    darklighten--text
                  "
              >
                {{ getUser.name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                @{{ getUser.username }}
              </v-list-item-subtitle>
              <v-list-item-subtitle>
                Joined {{ formatDate(getUser.joinDate) }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-container>
        <v-card-actions class="pa-0 greylightenfive">
          <v-tabs background-color="transparent" centered>
            <v-tab link :to="`/profile/${userId}`">
              Posts {{ getUserPosts.length }}
            </v-tab>
          </v-tabs>
        </v-card-actions>
      </v-card>

      <router-view />
    </div>
  </v-container>
</template>

<script>
import moment from "moment";
import { GET_USER, GET_USER_POSTS } from '../../queries'
import NotFound from '../Errors/NotFound.vue';

export default {
  name: 'userProfile',
  props: {
    userId: String
  },
  apollo: {
    getUser: {
      query: GET_USER,
      variables() {
        return {
          userId: this.userId
        };
      },
      error(err) {
        this.$_error(NotFound, { message: err.message });
      }
    },
    getUserPosts: {
      query: GET_USER_POSTS,
      variables() {
        return {
          userId: this.userId
        }
      },
    }
  },
  methods: {
    formatDate: date => moment(date).format('ll')
  },
};
</script>

<style scoped>
  .v-btn:hover #onHover {
    color: #31353C;
  }
  .v-btn:hover #onHover {
    color: #31353C;
  }
</style>
