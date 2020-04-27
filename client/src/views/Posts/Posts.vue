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
              <v-list-item-group color="#FF6B6B" mandatory v-model="orderBy">
                <v-list-item
                  v-for="(item, index) in sortItems"
                  :key="index"
                  @click="sortPostsBy(item.sortBy, item.prop)"
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
          <v-card hover flat>
            <v-img
              v-ripple="{ center: false }"
              height="30vh"
              @click="goToId('posts', post._id)"
              :src="post.imageUrl"
            ></v-img>

            <v-list-group :value="false" :ripple="false">
              <template v-slot:activator>
                <v-list-item-content class="my-2">
                  <v-list-item-title>
                    <span class="caption darklighten--text font-weight-bold">
                      {{ post.title }}
                    </span>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <span class="caption greylighten--text font-weight-bold">
                      {{ post.likeCount }} Likes • {{ post.messageCount }} Comments
                    </span>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </template>

              <v-list-item
                class="greylightenfive"
                @click="goToId('profile', post.createdBy._id)"
              >
                <v-list-item-avatar size="30">
                  <img :src="post.createdBy.avatar" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    <span
                      class="
                      caption text-capitalize
                      darklighten--text font-weight-bold
                    "
                    >
                      By {{ post.createdBy.name }}
                    </span>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <span class="caption font-weight-bold">
                      Added {{ formatCreatedDate(post.createdDate) }}
                    </span>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list-group>
          </v-card>
        </v-skeleton-loader>
      </v-col>
    </v-row>

    <!-- post progress (shown if loading) -->
    <query-progress v-show="$apollo.loading" />

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
    sortItems: [
      { title: "Newest (default)", sortBy: 'createdDate', prop: 'desc'},
      { title: "Oldest", sortBy: 'createdDate', prop:  'asc' },
      { title: "Most likes", sortBy: 'likes', prop: 'desc' },
      { title: "Least likes", sortBy: 'likes', prop: 'asc' },
      { title: "Alphabetical (A-Z)", sortBy: 'title', prop: 'asc' },
      { title: "Alphabetical (Z-A)", sortBy: 'title', prop: 'desc' }
    ],
    orderBy: 0,
    refetchPosts: false
  }),
  apollo: {
    infiniteScrollPosts: {
      query: INFINITE_SCROLL_POSTS,
      variables: {
        pageNum: 1,
        pageSize,
        orderBy: 'createdDate_desc'
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
    sortPostsBy(value, prop) {
      this.refetchPosts = true;
      this.$apollo.queries.infiniteScrollPosts.refetch({
        pageNum: 1,
        pageSize,
        orderBy: `${value}_${prop}`
      })
      .then(data => {
        this.refetchPosts = false;
      })
      .catch(err => {
        this.refetchPosts = false;
        console.error(err);
      });
    },
    goToId(route, id) {
      this.$router.push(`/${route}/${id}`);
    },
    formatCreatedDate: date => moment(date).format('LL'),
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
