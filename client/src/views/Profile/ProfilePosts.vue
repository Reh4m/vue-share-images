<template>
  <v-container>
    <!-- posts created by user -->
    <template v-if="!getUserPosts.length">
      <v-row>
        <v-col class="text-center">
          <span class="primary--text">
            This user has not shared anything
          </span>
        </v-col>
      </v-row>
    </template>

    <template v-else>
      <v-row>
        <v-col
          cols="12"
          sm="6"
          md="4"
          v-for="post in getUserPosts"
          :key="post._id"
        >
          <v-card class="mt-3" flat v-ripple hover @click="goToPost(post._id)">
            <v-img height="30vh" :src="post.imageUrl"></v-img>

            <v-card-title>
              <span class="caption darklighten--text font-weight-bold">
                {{ post.title }}
              </span>
            </v-card-title>
            <v-card-subtitle>
              <span class="caption greylighten--text font-weight-bold">
                {{ post.likes }} Likes • {{ post.messages.length }} Messages
              </span>
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import moment from "moment";
import { GET_USER, GET_USER_POSTS } from '../../queries'

export default {
  name: 'profile.profilePosts',
  apollo: {
    getUserPosts: {
      query: GET_USER_POSTS,
      variables() {
        return {
          userId: this.$route.params.userId
        }
      }
    }
  },
  methods: {
    formatDate(date) {
      return moment(new Date(date)).format("ll");
    },
    goToPost(postId) {
      this.$router.push(`/posts/${postId}`)
    },
  },
}
</script>