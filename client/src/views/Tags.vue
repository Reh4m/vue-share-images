<template lang="html">
  <v-container>
    <!-- post progress (shown if loading) -->
    <QueryProgress v-show="$apollo.queries.getPostsByTag.loading"/>

    <v-row v-if="getPostsByTag">
      <v-col cols="12" class="display-1 text-center">
        <span class="text-capitalize"> {{ tag }} Tags </span>
      </v-col>

      <!-- sorting posts -->
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

      <!-- posts card -->
      <v-col
        v-for="post in getPostsByTag"
        :key="post._id"
        cols="12"
        :sm="mozaicLayout && index % 3 === 0 ? 12 : 6"
        :md="mozaicLayout ? 6 : 4"
      >
        <v-skeleton-loader :loading="refetchPosts" type="card-avatar">
          <PostCard :post="post"/>
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
    getTag: '',
    pageNum: 1,
    mozaicLayout: false,
    sortItems: [
      { title: "Newest (default)", sortBy: 'createdDate', prop: 'desc'},
      { title: "Oldest", sortBy: 'createdDate', prop:  'asc' },
      { title: "Most likes", sortBy: 'likes', prop: 'desc' },
      { title: "Least likes", sortBy: 'likes', prop: 'asc' }
    ],
    orderBy: 0,
    refetchPosts: false
  }),
  apollo: {
    getPostsByTag: {
      query: GET_POSTS_BY_TAG,
      variables() {
        return {
          tag: this.tag,
          orderBy: 'createdDate_desc'
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
      this.refetchPosts = true;
      this.$apollo.queries.getPostsByTag.refetch({
        tag: this.tag,
        orderBy: `${prop}_${value}`
      })
      .then(data => {
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
