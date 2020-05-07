<template lang="html">
  <v-container v-scroll="onScroll">
    <v-row v-if="infiniteScrollPosts">
      <!-- layout buttons -->
      <v-col cols="12">
        <v-layout>
          <div class="hidden-xs-only">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn icon @click="mozaicLayout = false" v-on="on">
                  <v-icon :color="mozaicLayout ? 'grey' : 'primary'">
                    mdi-view-grid-outline
                  </v-icon>
                </v-btn>
              </template>
              <span>Mozaic Layout</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-btn icon @click="mozaicLayout = true" v-on="on">
                  <v-icon :color="mozaicLayout ? 'primary' : 'grey'">
                    mdi-view-agenda-outline
                  </v-icon>
                </v-btn>
              </template>
              <span>Row Layout</span>
            </v-tooltip>
          </div>
          <v-spacer />
          <v-menu transition="scroll-y-transition">
            <template v-slot:activator="{ on }">
              <v-btn text v-on="on">
                <v-icon left>mdi-sort-variant</v-icon>
                Sort by
              </v-btn>
            </template>
            <v-list>
              <v-list-item-group color="#FF6B6B" mandatory v-model="sortModel">
                <v-list-item
                  v-for="(item, index) in sortPostsItems"
                  :key="index"
                  @click="sortPosts(item.by, item.order)"
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ item.title }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-menu>
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
          <PostCard :post="post" />
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
    sortPostsItems: [
      { title: "Newest (default)", by: 'createdDate', order: 'desc'},
      { title: "Oldest", by: 'createdDate', order:  'asc' },
      { title: "Most likes", by: 'likes', order: 'desc' },
      { title: "Least likes", by: 'likes', order: 'asc' },
      { title: "Alphabetical (A-Z)", by: 'title', order: 'asc' },
      { title: "Alphabetical (Z-A)", by: 'title', order: 'desc' }
    ],
    sortModel: 0,
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
