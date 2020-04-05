<template lang="html">
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">

        <v-card flat class="transparent">
          <h1 class="darklighten--text text-center">Add Post</h1>
          <v-container>
            <v-form v-model="isFormValid" lazy-validation ref="form">

              <!-- image url input -->
              <v-text-field
                filled
                label="Image Url"
                required
                clearable
                v-model="imageUrl"
                :rules="imageRules"
              ></v-text-field>

              <!-- image preview -->
              <v-row v-if="imageUrl">
                <v-col class="text-center">
                  <img class="elevation-5 responsive" :src="imageUrl"/>
                </v-col>
              </v-row>

              <!-- title input -->
              <v-text-field
                filled
                label="Title"
                required
                v-model="title"
                :rules="titleRules"
              ></v-text-field>

              <!-- description text area -->
              <v-textarea
                filled
                label="Description"
                required
                v-model="description"
                :rules="descRules"
              ></v-textarea>

              <!-- categories select -->
              <v-combobox
                v-model="categories"
                filled
                placeholder="Categories"
                multiple
                chips
                clearable
                :items="itemsTags"
                :rules="categoriesRules"
              >
                <template v-slot:selection="{ item, parent }">
                  <v-chip
                    label
                    small
                    v-ripple
                    color="black--text red lighten-2"
                  >
                    {{ item }}
                    <v-icon
                      small
                      right
                      @click="parent.selectItem(item)"
                    >mdi-close</v-icon>
                  </v-chip>
                </template>
              </v-combobox>

              <!-- submit post -->
              <v-row justify="center">
                <v-btn
                  color="#45454d"
                  class="white--text"
                  :loading="loading"
                  :disabled="loading || !isFormValid"
                  @click="handleAddPost"
                >
                  Submit
                  <template v-slot:loader>
                    <span class="custom-loader">
                      <v-icon light>mdi-cached</v-icon>
                    </span>
                  </template>
                </v-btn>
              </v-row>

            </v-form>
          </v-container>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapState, mapGetters } from "vuex";

export default {
  name: "addPost",
  data: () => ({
    title: "",
    url: "",
    imagesNumber: 1,
    imageUrl: "",
    categories: [],
    description: "",
    isFormValid: true,
    itemsTags: [
      'art',
      'education',
      'food',
      'travel',
      'photography',
      'technology'
    ],
    titleRules: [
      title => !!title || "Title is required",
      title => title.length < 30 || "Title must have less than 30 characters"
    ],
    imageRules: [
      image => !!image || "Image url is required",
    ],
    categoriesRules: [
      categories =>
        categories.length >= 1 || "At leasted one category is required"
    ],
    descRules: [
      desc => !!desc || "Description is required",
      desc =>
        desc.length < 200 || "Description must have less than 200 characters"
    ]
  }),
  computed: {
    ...mapGetters(["user", "error", "loading"])
  },
  methods: {
    handleAddPost() {
      if (this.$refs.form.validate()) {
        // update categories to lowercase
        this.categories = this.categories.map(
          v => v.toLowerCase()
        );
        this.$store.dispatch("addPost", {
          title: this.title,
          imageUrl: this.imageUrl,
          categories: this.categories,
          description: this.description,
          creatorId: this.user._id
        });
      }
    }
  },
};
</script>

<style lang="css" scoped>
  .responsive {
    width: 100%;
    height: 400px;
  }
</style>
