<template>
  <v-container>
    <!-- posts progress (shown if loading) -->
    <query-progress v-show="loading" />

    <template v-if="!userPosts.length && !loading">
      <v-row>
        <v-col class="text-center">
          <p class="font-weight-light">
            You haven’t uploaded any post yet
          </p>
          <v-btn depressed to="/post/add" color="info">
            Add new post
          </v-btn>
        </v-col>
      </v-row>
    </template>

    <template v-else>
      <v-row>
        <v-col
          cols="12"
          sm="6"
          md="4"
          v-for="post in userPosts"
          :key="post._id"
        >
          <v-card flat class="mt-3" hover>
            <v-card flat>
              <v-img
                height="30vh"
                v-ripple
                @click="goToPost(post._id)"
                :src="post.imageUrl"
              ></v-img>
              <v-btn
                color="info"
                fab
                left
                bottom
                absolute
                dark
                @click="loadPost(post)"
              >
                <v-icon>mdi-pencil-outline</v-icon>
              </v-btn>
              <v-btn
                color="error"
                dark
                right
                bottom
                absolute
                fab
                @click="handleDeleteUserPost(post._id)"
              >
                <v-icon>mdi-delete-outline</v-icon>
              </v-btn>
            </v-card>

            <v-card-title class="mt-5">
              <span class="caption darklighten--text font-weight-bold">
                {{ post.title }}
              </span>
            </v-card-title>
            <v-card-subtitle>
              <span class="caption greylighten--text font-weight-bold">
                {{ post.likes }} Likes •
                {{ post.messagesCount }} Messages
              </span>
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>

      <!-- edit post dialog -->
      <v-dialog v-model="editPostDialog" fullscreen>
        <v-card>
          <v-toolbar dark color="primary">
            <v-btn icon dark @click="editPostDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
            <v-toolbar-title>Update Post</v-toolbar-title>
            <v-spacer />
            <v-toolbar-items>
              <v-btn
                text
                dark
                :loading="loading"
                :disabled="loading || !isFormValid"
                @click="handleUpdatePost"
              >
                <v-icon left>mdi-update</v-icon>
                update
                <template v-slot:loader>
                  <span class="custom-loader">
                    <v-icon light>mdi-cached</v-icon>
                  </span>
                </template>
              </v-btn>
            </v-toolbar-items>
          </v-toolbar>

          <v-container fluid>
            <v-row justify="center">
              <v-col cols="12" sm="8" md="6">
                <v-form v-model="isFormValid" lazy-validation ref="form">
                  <!-- Image url input -->
                  <v-text-field
                    filled
                    label="Image Url"
                    required
                    clearable
                    v-model="imageUrl"
                    :rules="imageRules"
                  ></v-text-field>

                  <!-- Image preview -->
                  <v-row v-if="imageUrl">
                    <v-col class="text-center">
                      <img class="elevation-5 responsive" :src="imageUrl" />
                    </v-col>
                  </v-row>

                  <!-- Title input -->
                  <v-text-field
                    filled
                    label="Title"
                    required
                    v-model="title"
                    :rules="titleRules"
                  ></v-text-field>

                  <!-- Description text area -->
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
                    :items="items"
                    :rules="categoriesRules"
                  >
                    <template
                      v-slot:selection="{ attrs, item, parent, selected }"
                    >
                      <v-chip
                        label
                        small
                        v-ripple
                        color="black--text red lighten-2"
                      >
                        {{ item }}
                        <v-icon small right @click="parent.selectItem(item)"
                          >mdi-close</v-icon
                        >
                      </v-chip>
                    </template>
                  </v-combobox>
                </v-form>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-dialog>
    </template>
  </v-container>
</template>

<script>
import moment from "moment";
import { mapGetters } from "vuex";

export default {
  name: 'profile.userPosts',
  data: () => ({
    editPostDialog: false,
    title: "",
    postId: "",
    imageUrl: "",
    categories: [],
    description: "",
    isFormValid: true,
    items: [
      'art',
      'education',
      'food',
      'travel',
      'photography',
      'technology'
    ],
    titleRules: [
      title => !!title || "Title is required",
      title => title.length < 25 || "Title must have less than 20 characters"
    ],
    imageRules: [image => !!image || "Image url is required"],
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
    ...mapGetters(["user", "userPosts", "loading"])
  },
  created() {
    this.handleGetUserPost();
  },
  methods: {
    formatDate: date => moment(date).format("LLL"),
    goToPost(postId) {
      this.$router.push(`/posts/${postId}`)
    },
    handleGetUserPost() {
      this.$store.dispatch("getUserPosts", {
        userId: this.user._id
      });
    },
    handleUpdatePost() {
      // update user post action
      if (this.$refs.form.validate()) {
        // modify categories to lowercase
        this.categories = this.categories.map(
          v => v.toLowerCase()
        );
        this.$store.dispatch('updateUserPost', {
          postId: this.postId,
          userId: this.user._id,
          title: this.title,
          imageUrl: this.imageUrl,
          categories: this.categories,
          description: this.description
        });
        this.editPostDialog = false;
      }
    },
    handleDeleteUserPost(postId) {
      const deletePost = window.confirm(
        'Are you sure want to delete this post?'
      );
      if (deletePost) {
        this.$store.dispatch('deleteUserPost', { postId })
      };
    },
    loadPost(
      { _id, title, imageUrl, categories, description },
      editPostDialog = true
    ) {
      this.editPostDialog = editPostDialog;
      this.postId = _id;
      this.title = title;
      this.imageUrl = imageUrl;
      this.categories = categories;
      this.description = description;
    }
  }
};
</script>

<style lang="css" scoped>
  .responsive {
    width: 100%;
    height: 400px;
  }
</style>