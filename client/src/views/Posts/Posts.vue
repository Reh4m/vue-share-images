<template lang="html">
  <div>
    <v-container v-scroll="onScroll">

      <!-- page up button -->
      <v-fab-transition>
        <v-btn
          color="info" dark
          class="elevation-5" fab
          right fixed bottom
          @click="goToPageTop"
          v-show="pageUpButton"
        >
          <v-icon>mdi-navigation</v-icon>
        </v-btn>
      </v-fab-transition>

      <!-- layout buttons -->
      <v-layout class="my-2">
        <v-menu transition="scroll-y-transition">
          <template v-slot:activator="{ on }">
            <v-btn text color="primary" v-on="on">
              <v-icon left>mdi-sort-variant</v-icon>
              Sort by
            </v-btn>
          </template>
          <v-list>
            <v-list-item-group color="#FF6B6B" mandatory v-model="sortBy">
              <v-list-item v-for="(item, i) in sortItems" :key="i">
                <v-list-item-content>
                  <v-list-item-title v-text="item.text"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-menu>
        <v-spacer/>
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
      </v-layout>

      <!-- post card -->
      <v-row v-if="infiniteScrollPosts">
        <v-col
          v-for="(post, index) in infiniteScrollPosts.posts"
          :key="post._id"
          cols="12"
          :sm="mozaicLayout && index % 3 === 0 ? 12 : 6"
        >
          <v-card hover flat>

            <v-img
              class="white--text"
              v-ripple="{ center: false }"
              height="30vh"
              @click.native="goToId('posts', post._id)"
              :src="post.imageUrl"
            ></v-img>

            <v-list-group
              :value="false"
              :ripple="false"
              mandatory
            >
              <template v-slot:activator>
                <v-list-item-content class="my-2">
                  <v-list-item-title>
                    <span class="caption darklighten--text font-weight-bold">
                      {{ post.title }}
                    </span>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <span class="caption greylighten--text font-weight-bold">
                      {{ post.likes }} Likes •
                      {{ post.messages.length }} Comments
                    </span>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </template>

              <v-list-item 
                class="grey lighten-5"
                @click="goToId('profile', post.createdBy._id)"
              >
                <v-list-item-avatar size="30">
                  <img :src="post.createdBy.avatar" />
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title>
                    <span class="
                      caption text-capitalize
                      darklighten--text font-weight-bold
                    ">
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
        </v-col>
      </v-row>

      <!-- post progress (shown if loading) -->
      <v-row justify="center" align="center">
        <v-progress-circular
          indeterminate
          color="primary"
          v-show="$apollo.loading"
        ></v-progress-circular>
      </v-row>

      <!-- text if no remaining posts -->
      <v-row v-if="!$apollo.loading && !showMoreEnabled">
        <v-col class="text-center mt-5 mb-5">
          <span class="error--text">
            You’ve reached the end of the list
          </span>
        </v-col>
      </v-row>

    </v-container>
  </div>
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
    amountScrolled: 0,
    isPageBottom: false,
    pageUpButton: false,
    mozaicLayout: false,
    sortItems: [
      { text: "Newest (default)" },
      { text: "Oldest" },
      { text: "Most likes" },
      { text: "Least likes" },
      { text: "Alphabetical (A-Z)" },
      { text: "Alphabetical (Z-A)" }
    ],
    sortBy: 0
  }),
  apollo: {
    infiniteScrollPosts: {
      query: INFINITE_SCROLL_POSTS,
      variables: {
        pageNum: 1,
        pageSize
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
      }
    },
    sortBy(value) {
      switch (value) {
        case 0: 
          return this.infiniteScrollPosts.posts.sort((a, b) =>
            new Date(a.createdDate) >
            new Date(b.createdDate)
            ? -1 : 1
          );
          break;
        case 1:
          return this.infiniteScrollPosts.posts.sort((a, b) =>
            new Date(a.createdDate) <
            new Date(b.createdDate)
            ? -1 : 1
          );
          break;
        case 2: this.sortByMost("likes");
          break;
        case 3: this.sortByLeast("likes");
          break;
        case 4: this.sortByLeast("title");
          break;
        case 5: this.sortByMost("title");
          break;
      }
    }
  },
  methods: {
    sortByMost(prop) {
      return this.infiniteScrollPosts.posts.sort((a, b) =>
        a[prop] > b[prop] ? -1 : 1
      );
    },
    sortByLeast(prop) {
      return this.infiniteScrollPosts.posts.sort((a, b) =>
        a[prop] < b[prop] ? -1 : 1
      );
    },
    goToId(route, id) {
      this.$router.push(`/${route}/${id}`);
    },
    formatCreatedDate(date) {
      return moment(date).format('LL');
    },
    onScroll() {
      this.checkIfPageBottom();
      this.showPageUpButton();
    },
    goToPageTop() {
      window.scroll({ top: 0, behavior: "smooth" });
    },
    showPageUpButton() {
      this.pageUpButton = this.amountScrolled > 250;
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
  beforeDestroy() {
    // change to default posts list
    if (this.sortBy != 0) {
      this.infiniteScrollPosts.posts.sort((a, b) =>
        new Date(a.createdDate) >
        new Date(b.createdDate)
        ? -1 : 1
      );
    }
  },
};
</script>

<style lang="css">
  .down-animation {
    animation: down 0.5s both;
  }
  @-moz-keyframes down {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(180deg);
    }
  }
  @-webkit-keyframes down {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(180deg);
    }
  }
  @-o-keyframes down {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(180deg);
    }
  }
  @keyframes down {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(180deg);
    }
  }
</style>
