<template lang="html">
  <div>
    <!-- navbar -->
    <v-app-bar app dark color="#3a9679">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

      <router-link class="hidden-xs-only" to="/">
        <v-btn text large>
          Schooldevs
        </v-btn>
      </router-link>

      <v-spacer class="hidden-xs-only" />

      <!-- search input -->
      <v-text-field
        v-model="searchTerm"
        class="ma-3"
        flat
        filled
        dense
        hide-details
        placeholder="Search"
        clearable
        :append-icon="searchTerm && 'mdi-magnify'"
        @input="handleSearchPosts"
      ></v-text-field>

      <!-- search results card -->
      <v-card flat tile v-if="searchResults.length" id="search__card">
        <v-list light>
          <v-list-item
            @click="goToSearchResult(result._id)"
            v-for="result in searchResults"
            :key="result._id"
          >
            <v-list-item-subtitle>
              <span class="text--primary">
                {{ result.title }}
              </span>
              • {{ formatDescription(result.description) }}
            </v-list-item-subtitle>

            <!-- show icon if result favorited by user -->
            <v-list-item-action v-if="checkIfUserFavorite(result._id)">
              <v-icon small color="red">mdi-heart</v-icon>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card>

      <!-- horizontal navbar items -->
      <v-btn
        text
        large
        color="#105e62"
        class="hidden-xs-only"
        v-for="link in horizontalNavItems"
        :key="link.name"
        router
        :to="link.router"
      >
        <v-icon class="hidden-sm-only" left>{{ link.icon }}</v-icon>
        {{ link.name }}
      </v-btn>

      <!-- profile button -->
      <v-btn
        text
        large
        class="hidden-xs-only"
        color="#105e62"
        v-if="user"
        router
        to="/user"
      >
        <v-icon class="hidden-sm-only" left>mdi-account-outline</v-icon>
        <v-badge
          color="#8b4367"
          :class="{ bounce: badgeAnimated }"
          :content="userFavorites.length"
          :value="userFavorites.length"
        >
          Profile
        </v-badge>
      </v-btn>

      <!-- signout button -->
      <v-btn
        text
        large
        class="hidden-xs-only"
        color="#105e62"
        v-if="user"
        @click="handleSignoutUser"
      >
        <v-icon class="hidden-sm-only" left>mdi-logout-variant</v-icon>
        Signout
      </v-btn>

      <v-progress-linear
        :active="loading"
        :indeterminate="loading"
        absolute
        bottom
        color="#328168"
      ></v-progress-linear>
    </v-app-bar>

    <!-- sidenav -->
    <v-navigation-drawer v-model="drawer" app temporary>
      <v-toolbar dark color="#424242">
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <router-link class="white--text" to="/">
          <v-btn text large>
            Schooldevs
          </v-btn>
        </router-link>
      </v-toolbar>

      <!-- side nav items -->
      <v-list flat>
        <v-list-item
          color="#FF6B6B"
          active-class="list-item-active"
          v-for="item in sideNavItems"
          :key="item.name"
          link
          :to="item.router"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <v-list>
          <v-list-item v-if="user" @click="handleSignoutUser">
            <v-list-item-content class="redlighten--text list-item-active">
              <v-list-item-title>Sign Out</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Navbar",
  data: () => ({
    drawer: null,
    badgeAnimated: false,
    searchTerm: "",
  }),
  methods: {
    ...mapActions(["signoutUser"]),
    goToSearchResult(resultId) {
      // clear search term
      this.searchTerm = "";
      // go to desined result
      this.$router.push({ path: `/posts/${resultId}` });
      // clear search result
      this.$store.commit("clearSearchResults");
    },
    handleSearchPosts() {
      this.$store.dispatch("searchPosts", {
        searchTerm: this.searchTerm,
      });
    },
    formatDescription(desc) {
      return desc.length > 30 ? `${desc.slice(0, 30)}...` : desc;
    },
    checkIfUserFavorite(resultId) {
      return (
        this.userFavorites &&
        this.userFavorites.some(fave => fave._id === resultId)
      );
    },
    handleSignoutUser() {
      this.$store.dispatch("signoutUser");
    },
  },
  watch: {
    userFavorites(value) {
      // if user favorites value changed at all
      if (value) {
        this.badgeAnimated = true;
        setTimeout(() => (this.badgeAnimated = false), 1000);
      }
    },
  },
  computed: {
    ...mapGetters(["user", "searchResults", "loading", "userFavorites"]),
    horizontalNavItems() {
      let items = [
        {
          name: "Posts",
          router: "/posts",
          icon: "mdi-newspaper-variant-multiple-outline",
        },
        { name: "Sign in", router: "/signin", icon: "mdi-login-variant" },
        {
          name: "Sign up",
          router: "/signup",
          icon: "mdi-account-plus-outline",
        },
      ];

      if (this.user) {
        items = [
          {
            name: "Posts",
            router: "/posts",
            icon: "mdi-newspaper-variant-multiple-outline",
          },
        ];
      }
      return items;
    },
    sideNavItems() {
      let items = [
        { name: "Home", router: "/", icon: "mdi-home-outline" },
        {
          name: "Posts",
          router: "/posts",
          icon: "mdi-newspaper-variant-multiple-outline",
        },
        { name: "Sign in", router: "/signin", icon: "mdi-login-variant" },
        {
          name: "Sign up",
          router: "/signup",
          icon: "mdi-account-plus-outline",
        },
      ];

      if (this.user) {
        items = [
          { name: "Home", router: "/", icon: "mdi-home-outline" },
          {
            name: "Posts",
            router: "/posts",
            icon: "mdi-newspaper-variant-multiple-outline",
          },
          {
            name: "Create Post",
            router: "/post/add",
            icon: "mdi-card-text-outline",
          },
          { name: "Profile", router: "/user", icon: "mdi-account-outline" },
        ];
      }
      return items;
    },
  },
};
</script>

<style lang="css">
/* sidevar style */
.list-item-active {
  font-weight: 600;
}

/* search results card */
#search__card {
  position: absolute;
  width: 100vw;
  z-index: 8;
  top: 100%;
  left: 0%;
}

/* user favorite animation */
.bounce {
  animation: bounce 1s both;
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translate3d(0, 0, 0);
  }
  40%,
  43% {
    transform: translate3d(0, -20px, 0);
  }
  70% {
    transform: translate3d(0, -10px, 0);
  }
  90% {
    transform: translate3d(0, -5px, 0);
  }
}
</style>
