<template>
  <v-app>
    <v-content v-scroll="onScroll" class="grey lighten-2">

      <Navbar></Navbar>

      <transition name="fade">
        <app-view></app-view>
      </transition>

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

      <!-- Auth Snackbar -->
      <v-snackbar
        color="blue-grey" bottom left
        v-model="authSnackbar"
      >
        <v-icon left>mdi-check-circle</v-icon>
        You are signed in!
        <v-btn dark text @click="authSnackbar = false">
          Close
        </v-btn>
      </v-snackbar>

      <!-- Auth error snackbar -->
      <v-snackbar
        color="info" bottom left
        v-model="authErrorSnackbar" v-if="authError"
      >
        <v-icon left>mdi-cancel</v-icon>
        {{ authError.message }}
        <v-btn dark text to="/signin">Signin</v-btn>
      </v-snackbar>

    </v-content>
  </v-app>
</template>

<script>
import Navbar from './components/Navbar';
import {mapGetters, mapActions} from 'vuex'

export default {
  name: 'App',
  components: {
    Navbar,
  },
  data: () => ({
    authSnackbar: false,
    authErrorSnackbar: false,
    isPageBottom: false,
    amountScrolled: 0,
    pageUpButton: false,
  }),
  computed: {
    ...mapGetters(['authError','user'])
  },
  watch: {
    user(newValue, oldValue) {
      // if we had no value for user before, show snackbar
      if (oldValue === null) {
        this.authSnackbar = true;
      }
    },
    authError(value) {
      // of auth error is not null, show auth error snackbar
      if (value !== null) {
        this.authErrorSnackbar = true
      }
    }
  },
  methods: {
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
    }
  }
};
</script>

<style>
  .v-text-field>.v-input__control>.v-input__slot:before {
    border-color: none; 
    border-style: none !important;
    border-width: thin 0 0;
  }

  a {
    text-decoration: none;
  }

  /* router transition */
  .fade-enter-active,
  .fade-leave-active {
    transition-property: opacity;
    transition-duration: 0.25s;
  }

  .fade-enter-active {
    transition-delay: 0.25s;
  }

  .fade-enter,
  .fade-leave-active {
    opacity: 0;
    transform: translateY(-25px);
  }
</style>