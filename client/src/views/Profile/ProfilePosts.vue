<template>
  <v-container>
    <div v-if="!getUserPosts.length">
      <v-row>
        <v-col class="text-center">
          <span class="title primary--text">
            No posts here
          </span>
          <p class="font-weight-light">
            This user has not shared anything
            <v-spacer/>
            Check back soon!
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
          v-for="post in getUserPosts"
          :key="post._id"
        >
          <PostCard :post="post"/>
        </v-col>
      </v-row>
    </div>
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
    formatDate: date => moment(date).format("LL"),
    goToPost(postId) {
      this.$router.push(`/posts/${postId}`)
    },
  },
}
</script>
