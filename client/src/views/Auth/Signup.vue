<template lang="html">
  <v-container fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card flat color="#b5525c" dark :disabled="loading">
          <v-toolbar dark color="#424242">
            <v-toolbar-title>
              Create account
            </v-toolbar-title>
          </v-toolbar>

          <v-card-text>
            <v-form
              v-model="isFormValid"
              lazy-validation
              ref="form"
              @submit.prevent="handleSignupUser"
            >
              <v-row>
                <v-col cols="6" class="py-0">
                  <v-text-field
                    filled
                    label="Name"
                    required
                    v-model="name"
                    :rules="nameRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="6" class="py-0">
                  <v-text-field
                    filled
                    label="Username"
                    required
                    v-model="username"
                    :rules="usernameRules"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-text-field
                filled
                label="Email"
                required
                v-model="email"
                :rules="emailRules"
              ></v-text-field>

              <v-text-field
                filled
                label="Password"
                :type="show1 ? 'text' : 'password'"
                :append-icon="show1 ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                @click:append="show1 = !show1"
                v-model="password"
                required
                :rules="passwordRules"
              ></v-text-field>

              <v-text-field
                filled
                label="Confirm password"
                :type="show2 ? 'text' : 'password'"
                :append-icon="show2 ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                :rules="[
                  () => !!passConfirm || 'Confirmation password is required',
                ]"
                @click:append="show2 = !show2"
                v-model="passConfirm"
                required
                :messages="passConfirmRules"
              ></v-text-field>

              <v-btn
                block
                color="#45454d"
                :loading="loading"
                :disabled="loading || !isFormValid"
                @click="handleSignupUser"
              >
                Sign up
                <template v-slot:loader>
                  <span class="custom-loader">
                    <v-icon light>mdi-cached</v-icon>
                  </span>
                </template>
              </v-btn>
            </v-form>
          </v-card-text>
          <v-card-actions class="signupTheme">
            <v-btn block text class="text-capitalize" to="/signin">
              Already have an account? Sign In
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- form error message -->
        <v-slide-x-reverse-transition>
          <div v-if="error" class="mt-5">
            <form-alert :message="error.message"></form-alert>
          </div>
        </v-slide-x-reverse-transition>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'

export default {
  name: 'login',
  data: () => ({
    username: '',
    name: '',
    email: '',
    password: '',
    passConfirm: '',
    show1: false,
    show2: false,
    isFormValid: true,
    usernameRules: [
      username => !!username ||  'Username is required',
      username => username.length < 10 || 'Username must be less than 10 characters'
    ],
    nameRules: [
      name => !!name || 'Name is required',
      name => name.length < 50 || 'name not must be very long'
    ],
    emailRules: [
      email => !!email || 'Email is required',
      email => /.+@.+\..+/.test(email) || 'Email must be valid'
    ],
    passwordRules: [
      password => !!password || 'Password is required',
      password => password.length >= 6 || 'Password must be less than 6 characters',
    ],
    countErrors: [],
    passConfirmRules: ''
  }),
  computed: {
    ...mapGetters(['user', 'error', 'loading'])
  },
  watch: {
    user(value) {
      // if user value chancges from null to object, redirect to home page
      if (value) this.$router.push('/');
    }
  },
  methods: {
    ...mapActions(['signupUser']),
    handleSignupUser() {
      if (this.$refs.form.validate()) {
        if (this.password === this.passConfirm) {
          this.$store.dispatch('signupUser', {
            username: this.username,
            name: this.name,
            email: this.email,
            password: this.password
          })
        } else {
          this.passConfirmRules = `Password not match #${this.countErrors++}`
        }
      }
    }
  },
}
</script>

<style lang="css">
</style>
