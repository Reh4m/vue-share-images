<template>
  <v-app>
    <v-content class="grey lighten-2">

      <Navbar></Navbar>

      <transition name="fade">
        <app-view></app-view>
      </transition>

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
    authErrorSnackbar: false
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
};
</script>

<style>
  .v-text-field>.v-input__control>.v-input__slot:before {
    border-color: none; 
    border-style: none !important;
    border-width: thin 0 0;
  }
  
  a{
    text-decoration: none;
  }

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