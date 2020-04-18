<template lang="html">
  <v-container v-if="user">
    <!-- user details card -->
    <v-card flat tile>
      <v-container>
        <v-list-item three-line>
          <v-list-item-avatar size="80">
            <v-img :src="user.avatar" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title
              class="
                  title 
                  text-capitalize
                "
            >
              {{ user.name }}
            </v-list-item-title>
            <v-list-item-subtitle> @{{ user.username }} </v-list-item-subtitle>
            <v-list-item-subtitle>
              Joined {{ formatDate(user.joinDate) }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-container>
      <v-card-actions class="pa-0 greylightenfive">
        <v-tabs v-model="activeTab" background-color="transparent" centered>
          <v-tab v-for="item in navItems" :key="item.title" :to="item.link">
            {{ item.title }} {{ item.count }}
          </v-tab>
        </v-tabs>
      </v-card-actions>
    </v-card>

    <!-- user components -->
    <router-view />
  </v-container>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";

export default {
  data: () => ({
    activeTab: '',
  }),
  computed: {
    ...mapGetters(["user", "userFavorites", "userPosts"]),
    navItems() {
      let posts = this.userPosts.length;
      let favorites = this.userFavorites.length;
      return [
        { title: 'Posts', link: '/user', count: posts },
        { title: 'Favorites', link: '/user/favorites', count: favorites }
      ]
    }
  },
  methods: {
    formatDate(date) {
      return moment(date).format("LL");
    },
  }
};
</script>