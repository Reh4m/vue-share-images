<template lang="html">
  <v-container>
    <!-- post progress (shown if loading) -->
    <QueryProgress v-show="$apollo.queries.getPostsByTag.loading"/>

    <v-row v-if="getPostsByTag">
      <v-col cols="12" class="display-1 text-center">
        <span class="text-capitalize"> {{ tag }} Tags </span>
      </v-col>

      <!-- posts order settings -->
      <v-col cols="12">
        <v-layout>
          <div class="hidden-xs-only">
            <LayoutButtons
              :mozaicLayout="mozaicLayout"
              @toggleLayoutMozaic="toggleLayoutMozaic"
            />
          </div>
          <v-spacer />
          <PostsOrderMenu
            @sortPosts="sortPosts"
          />
        </v-layout>
      </v-col>

      <!-- posts card -->
      <v-col
        v-for="(post, index) in getPostsByTag"
        :key="post._id"
        cols="12"
        :sm="mozaicLayout && index % 3 === 0 ? 12 : 6"
      >
        <v-skeleton-loader :loading="refetchPosts" type="card-avatar">
          <PostCard :post="post" />
        </v-skeleton-loader>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import moment from "moment";
import { GET_POSTS_BY_TAG } from "../queries";
import { mapGetters } from "vuex";
import NotFound from './Errors/NotFound.vue';

const pageSize = 6;

export default {
  name: 'tags',
  props: {
    tag: String
  },
  data: () => ({
    pageNum: 1,
    mozaicLayout: false,
    refetchPosts: false
  }),
  apollo: {
    getPostsByTag: {
      query: GET_POSTS_BY_TAG,
      variables() {
        return {
          tag: this.tag,
          sort: {by: 'createdDate', order: 'desc'}
        }
      },
      error(err) {
        this.$_error(NotFound, { message: err.message });
      }
    }
  },
  methods: {
    toggleLayoutMozaic() {
      this.mozaicLayout = !this.mozaicLayout;
    },
    // sorting posts list by value
    sortPosts(by, order) {
      this.refetchPosts = true;
      this.$apollo.queries.getPostsByTag.refetch({
        tag: this.tag,
        sort: {by, order}
      })
      .then(() => {
        this.refetchPosts = false;
      })
      .catch(err => {
        this.refetchPosts = false;
        console.error(err)
      });
    }
  }
};
</script>
