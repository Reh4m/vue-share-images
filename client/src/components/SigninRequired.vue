<template>
  <v-dialog
    width="500"
    :value="dialog"
    @input="$emit('update:dialog', false)"
    @keydown.esc="closeDialog"
  >
    <v-card>
      <v-container>
        <v-card-title>
          Sign in Required
        </v-card-title>
        <v-card-text>
          Liking, commenting and many other features are only possible after you
          sign in.
        </v-card-text>
      </v-container>
      <v-card-actions class="grey lighten-5">
        <v-spacer/>
        <v-btn text @click="closeDialog">
          Cancel
        </v-btn>
        <v-btn
          dark
          color="#ac5380"
          depressed
          to="/signin"
          @click="closeDialog"
        >
          Sign in
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: "SigninRequired",
  props: {
    dialog: Boolean,
  },
  methods: {
    closeDialog() {
      this.$emit("closeDialog");
    },
  },
};
</script>

<style></style>
