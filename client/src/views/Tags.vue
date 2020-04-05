<template lang="html">
  <div>
    <!-- post progress (shown if loading) -->
    <v-row justify="center" align="center">
      <v-progress-circular
        indeterminate
        color="primary"
        v-show="$apollo.loading"
      ></v-progress-circular>
    </v-row>
    <v-container v-if="getPostsByTag" v-scroll="onScroll">

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

     

      <div class="mt-5 text-center">
        <p class="display-1 text-capitalize">
          {{ tag }} Tags
        </p>
      </div>

      <!-- layout buttons -->
       <v-layout>
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
        <v-spacer></v-spacer>
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
      <v-row>
        <v-col
          v-for="(post, index) in getPostsByTag"
          :key="post._id"
          cols="12"
          :sm="6"
          :md="mozaicLayout ? 6 : 4"
        >
          <v-card 
            hover flat 
            v-ripple="{ center: false }"
            @click.native="goToId('posts', post._id)"
          >

            <v-img
              class="white--text"
              height="30vh"
              :src="post.imageUrl"
            ></v-img>

            <!-- user info -->
            <v-list class="py-0">
              <v-list-item>
                <v-list-item-avatar size="30">
                  <img :src="post.createdBy.avatar" />
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title
                    
                  >
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

  </div>
</template>

<script>
import moment from "moment";
import { GET_POSTS_BY_TAG } from "../queries";
import { mapGetters } from "vuex";
import NotFound from './Errors/NotFound.vue';

export default {
  name: 'tags',
  props: {
    tag: String
  },
  data: () => ({
    page: 1,
    errors: false,
    show: false,
    amountScrolled: 0,
    isPageBottom: false,
    pageUpButton: false,
    mozaicLayout: false,
    sortItems: [
      { text: "Newest (default)" },
      { text: "Oldest" },
      { text: "Most likes" },
      { text: "Least likes" }
    ],
    sortBy: 0
  }),
  apollo: {
    getPostsByTag: {
      query: GET_POSTS_BY_TAG,
      variables() {
        return {
          tag: this.tag
        }
      },
      error(err) {
        this.$_error(NotFound, { message: err.message });
        this.errors = true;
      }
    }
  },
  watch: {
    sortBy(value) {
      switch (value) {
        case 0: 
          return this.getPostsByTag.sort((a, b) =>
            new Date(a.createdDate) >
            new Date(b.createdDate)
            ? -1 : 1
          );
          break;
        case 1:
          return this.getPostsByTag.sort((a, b) =>
            new Date(a.createdDate) <
            new Date(b.createdDate)
            ? -1 : 1
          );
          break;
        case 2: this.sortByMost("likes");
          break;
        case 3: this.sortByLeast("likes");
          break;
      }
    }
  },
  methods: {
    sortByMost(prop) {
      return this.getPostsByTag.sort((a, b) =>
        a[prop] > b[prop] ? -1 : 1
      );
    },
    sortByLeast(prop) {
      return this.getPostsByTag.sort((a, b) =>
        a[prop] < b[prop] ? -1 : 1
      );
    },
    goToId(route, id) {
      this.$router.push(`/${route}/${id}`);
    },
    getTimeFromNow(time) {
      return moment(time).fromNow();
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
    if (this.errors !== true) {
      this.getPostsByTag.sort((a, b) =>
        new Date(a.createdDate) >
        new Date(b.createdDate)
        ? -1 : 1
      );
    };
  },
}
</script>