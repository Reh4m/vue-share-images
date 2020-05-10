<template lang="html">
  <v-container v-scroll="onScroll">
    <v-row v-if="infiniteScrollPosts">
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

      <!-- post card -->
      <v-col
        v-for="(post, index) in infiniteScrollPosts.posts"
        :key="post._id"
        cols="12"
        :sm="mozaicLayout && index % 3 === 0 ? 12 : 6"
      >
        <v-skeleton-loader type="card" :loading="refetchPosts">
          <PostCard :post="post">
            <v-img :src="post.createdBy.avatar" />
          </PostCard>
        </v-skeleton-loader>
      </v-col>
    </v-row>

    <!-- post progress (shown if loading) -->
    <QueryProgress v-show="$apollo.loading" />

    <!-- text if no remaining posts -->
    <v-row v-if="!$apollo.loading && !showMoreEnabled">
      <v-col class="text-center my-5">
        <span class="error--text">
          You’ve reached the end of the list
        </span>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import moment from "moment";
import { INFINITE_SCROLL_POSTS } from "../../queries";
import { mapGetters } from "vuex";

const pageSize = 4;

export default {
  name: "posts",
  data: () => ({
    pageNum: 1,
    isPageBottom: false,
    mozaicLayout: false,
    refetchPosts: false
  }),
  apollo: {
    infiniteScrollPosts: {
      query: INFINITE_SCROLL_POSTS,
      variables: {
        pageNum: 1,
        pageSize,
        sort: {by: 'createdDate', order: 'desc'}
      }
    }
  },
  computed: {
    showMoreEnabled() {
      return this.infiniteScrollPosts && this.infiniteScrollPosts.hasMore;
    }
  },
  watch: {
    isPageBottom(value) {
      // if this.isPageBottom evaluates to true, show more posts
      if (value === true && this.showMoreEnabled) {
        this.showMorePosts();
      };
    }
  },
  methods: {
    toggleLayoutMozaic() {
      this.mozaicLayout = !this.mozaicLayout;
    },
    // sorting posts list by value
    sortPosts(by, order) {
      this.refetchPosts = true;
      this.$apollo.queries.infiniteScrollPosts.refetch({
        pageNum: 1,
        pageSize,
        sort: {by, order}
      })
      .then(() => {
        this.refetchPosts = false;
      })
      .catch(err => {
        this.refetchPosts = false;
        console.error(err);
      });
    },
    onScroll() {
      this.checkIfPageBottom();
    },
    checkIfPageBottom() {
      const browserHeight = document.documentElement.clientHeight;
      const pageHeight = document.documentElement.scrollHeight;
      this.amountScrolled = window.scrollY;
      const scrolledToBottom =
        browserHeight + this.amountScrolled >= pageHeight;
      this.isPageBottom = scrolledToBottom;
    },
    showMorePosts() {
      this.pageNum += 1;
      // fetch more data and transform original result
      this.$apollo.queries.infiniteScrollPosts.fetchMore({
        variables: {
          // pageNum incremented by 1
          pageNum: this.pageNum,
          pageSize
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          const newPosts = fetchMoreResult.infiniteScrollPosts.posts;
          const hasMore = fetchMoreResult.infiniteScrollPosts.hasMore;
          return {
            infiniteScrollPosts: {
              __typename: prevResult.infiniteScrollPosts.__typename,
              // Merge previous posts with new posts
              posts: [...prevResult.infiniteScrollPosts.posts, ...newPosts],
              hasMore
            }
          };
        }
      });
    }
  },
};
</script>
