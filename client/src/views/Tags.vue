<template lang="html">
  <v-container v-scroll="onScroll">
    <!-- page up button -->
    <v-fab-transition>
      <v-btn
        color="info"
        dark
        class="elevation-5"
        fab
        right
        fixed
        bottom
        @click="goToPageTop"
        v-show="pageUpButton"
      >
        <v-icon>mdi-navigation</v-icon>
      </v-btn>
    </v-fab-transition>

    <!-- post progress (shown if loading) -->
    <query-progress v-show="$apollo.queries.getPostsByTag.loading"/>

    <v-row v-if="getPostsByTag">
      <v-col cols="12" class="display-1 text-center">
        <span class=" text-capitalize"> {{ tag }} Tags </span>
      </v-col>

      <!-- sorting posts -->
      <v-col cols="12">
        <v-layout>
          <v-spacer />
          <v-menu transition="scroll-y-transition">
            <template v-slot:activator="{ on }">
              <v-btn text color="primary" v-on="on">
                <v-icon left>mdi-sort-variant</v-icon>
                Sort by
              </v-btn>
            </template>
            <v-list>
              <v-list-item-group color="#FF6B6B" mandatory v-model="sortBy">
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

      <!-- posts card -->
      <v-col
        v-for="(post, index) in getPostsByTag"
        :key="post._id"
        cols="12"
        :sm="6"
        :md="mozaicLayout ? 6 : 4"
      >
        <v-card
          hover
          flat
          v-ripple="{ center: false }"
          @click.native="goToId('posts', post._id)"
        >
          <v-img class="white--text" height="30vh" :src="post.imageUrl" />

          <!-- user info -->
          <v-list class="py-0">
            <v-list-item>
              <v-list-item-avatar size="30">
                <img :src="post.createdBy.avatar" />
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>
                  <span class=" caption darklighten--text font-weight-bold">
                    {{ post.title }}
                    <span class="text-capitalize indigo--text">
                      • {{ tag }}
                    </span>
                  </span>
                </v-list-item-title>
                <v-list-item-subtitle>
                  <span class="caption font-weight-bold">
                    {{ getTimeFromNow(post.createdDate) }}
                  </span>
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
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
    getTag: '',
    pageNum: 1,
    isPageBottom: false,
    amountScrolled: 0,
    isPageBottom: false,
    pageUpButton: false,
    mozaicLayout: false,
    sortItems: [
      { title: "Newest (default)", sortBy: 'createdDate', prop: 'desc'},
      { title: "Oldest", sortBy: 'createdDate', prop:  'asc' },
      { title: "Most likes", sortBy: 'likes', prop: 'desc' },
      { title: "Least likes", sortBy: 'likes', prop: 'asc' }
    ],
    sortBy: 0
  }),
  apollo: {
    getPostsByTag: {
      query: GET_POSTS_BY_TAG,
      variables() {
        return {
          tag: this.tag,
        }
      },
      error(err) {
        this.$_error(NotFound, { message: err.message });
      }
    }
  },
  methods: {
    // sorting posts list by value
    sortPostsBy(prop, value) {
      this.getPostsByTag.sort((a, b) => {
        switch (value) {
          case 'desc':
            return a[prop] > b[prop] ? -1 : 1;
            break;
          case 'asc':
            return a[prop] < b[prop] ? -1 : 1;
            break;
        }
      });
    },
    goToId(route, id) {
      this.$router.push(`/${route}/${id}`);
    },
    getTimeFromNow(time) {
      return moment(time).format('LL');
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
  },
  beforeDestroy() {
    // change to default posts list
    if (this.sortBy !== 0) {
      this.sortPostsBy('createdDate', 'desc');
    };
  },
}
</script>