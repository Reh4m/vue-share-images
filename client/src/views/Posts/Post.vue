<template lang="html">
  <v-container>
    <!-- post progress (shown if loading) -->
    <query-progress v-show="$apollo.queries.getPost.loading" />

    <!-- post -->
    <v-row v-if="getPost">
      <v-col cols="12">
        <v-card flat>
          <v-list-item two-line>
            <v-list-item-avatar
              v-ripple
              @click="goToUser(getPost.createdBy._id)"
              style="cursor: pointer;"
            >
              <img :src="getPost.createdBy.avatar" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                <span class="body-2 font-weight-bold">
                  <router-link
                    class="info--text"
                    :to="`/profile/${getPost.createdBy._id}`"
                  >
                    {{ getPost.createdBy.name }}
                  </router-link>
                </span>
              </v-list-item-title>
              <v-list-item-subtitle>
                <span class="caption greylighten--text font-weight-bold">
                  @{{ getPost.createdBy.username }} •
                  {{ formatCreatedDate(getPost.createdDate) }}
                </span>
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-icon large color="info" @click="goToPreviousPage">
                mdi-arrow-left
              </v-icon>
            </v-list-item-action>
          </v-list-item>

          <!-- img -->
          <v-tooltip bottom transition="slide-y-transition">
            <template v-slot:activator="{ on }">
              <v-img
                max-height="50vh"
                v-on="on"
                :src="getPost.imageUrl"
                @click.stop="toggleImageDialog"
              />
            </template>
            <span>Click to enlarge image</span>
          </v-tooltip>

          <v-dialog v-model="imageDialog">
            <v-card>
              <v-img
                :src="getPost.imageUrl"
                height="80vh"
                @click.stop="toggleImageDialog"
              />
            </v-card>
          </v-dialog>

          <!-- description -->
          <v-card-title class="primary--text">
            {{ getPost.title }}
          </v-card-title>
          <v-card-text>
            {{ getPost.description }}
          </v-card-text>

          <!-- actions -->
          <v-list-item class="grey lighten-5">
            <v-list-item-title>
              <v-chip-group show-arrows>
                <v-chip
                  v-for="(category, index) in getPost.categories"
                  :key="index"
                  outlined
                  label
                  link
                  :ripple="{ class: 'redlighten--text' }"
                  :to="`/tags/${category}`"
                >
                  {{ category }}
                </v-chip>
              </v-chip-group>
            </v-list-item-title>
            <v-list-item-action>
              <template v-if="user">
                <v-btn
                  v-if="checkIfPostLiked(getPost._id)"
                  text
                  color="red lighten-1"
                  @click="handleUnlikePost()"
                  :loading="loadingLike"
                >
                  <v-icon left>mdi-heart</v-icon>
                  {{ getPost.likes }}
                </v-btn>
                <v-btn
                  v-else
                  text
                  color="#707070"
                  @click="handleLikePost()"
                  :loading="loadingLike"
                >
                  <v-icon left>mdi-heart-outline</v-icon>
                  {{ getPost.likes }}
                </v-btn>
              </template>
              <template v-else>
                <v-btn text color="#707070" @click="signinRequired = true">
                  <v-icon left>mdi-heart-outline</v-icon>
                  {{ getPost.likes }}
                </v-btn>
              </template>
            </v-list-item-action>
          </v-list-item>
        </v-card>
      </v-col>

      <!-- messages -->
      <v-col cols="12">
        <v-card flat :loading="loadingDeleteMessage">
          <v-container>
            <!-- message input -->
            <v-form
              v-if="user"
              v-model="isFormValid"
              lazy-validation
              ref="form"
              @submit.prevent="handleAddPostMessage"
            >
              <v-text-field
                v-model="messageBody"
                hide-details
                filled
                placeholder="Add message"
                :append-icon="messageBody && 'mdi-send'"
                @click:append="handleAddPostMessage"
                :rules="messageRules"
                :loading="loadingMessage"
              >
              </v-text-field>
            </v-form>
            <v-banner v-else single-line>
              Sign in to leave a message
              <template v-slot:actions>
                <v-btn
                  text
                  color="#ac5380"
                  to="/signin"
                >
                  Sign in
                </v-btn>
              </template>
            </v-banner>
            <!-- messages -->
            <v-list v-if="getPost.messages.length" three-line>
              <v-subheader class="caption darklighten--text font-weight-bold">
                {{ getPost.messages.length }}
                {{ getPost.messages.length === 1 ? "Message" : "Messages" }}
              </v-subheader>
              <template v-for="(message, index) in getPost.messages">
                <v-divider v-if="index != 0" :key="message._id"/>
                <v-list-item>
                  <v-list-item-avatar v-ripple>
                    <v-img :src="message.messageUser.avatar" />
                  </v-list-item-avatar>

                  <v-list-item-content>
                    <v-list-item-title class="caption">
                      <span class="font-weight-bold">
                        <router-link
                          :class="
                            checkIfOwnMessage(message)
                              ? 'indigo--text'
                              : 'primary--text'
                          "
                          :to="`/profile/${message.messageUser._id}`"
                        >
                          {{ message.messageUser.name }}
                        </router-link>
                      </span>
                    </v-list-item-title>
                    <v-list-item-subtitle class="caption darklighten--text">
                      {{ message.messageBody }}
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="caption">
                      {{ getTimeFromNow(message.messageDate) }}
                    </v-list-item-subtitle>
                  </v-list-item-content>

                  <v-list-item-action v-if="checkIfOwnMessage(message)">
                    <v-menu left transition="scroll-y-transition">
                      <template v-slot:activator="{ on }">
                        <v-btn icon color="primary" v-on="on">
                          <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                      </template>
                      <v-list>
                        <v-list-item
                          @click="handleDeleteUserMessage(message._id, index)"
                        >
                          <v-list-item-content>
                            <v-list-item-title>Delete</v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-list-item-action>
                </v-list-item>
              </template>
            </v-list>
          </v-container>
        </v-card>
      </v-col>

      <signin-required
        :dialog.sync="signinRequired"
        @closeDialog="closeDialog"
      ></signin-required>
    </v-row>
  </v-container>
</template>

<script>
import moment from 'moment'
import {
  GET_POST, 
  ADD_POST_MESSAGE, 
  LIKE_POST, 
  UNLIKE_POST,
  DELETE_USER_MESSAGE
} from '../../queries'
import { mapGetters } from 'vuex'
import NotFound from '../Errors/NotFound.vue';

export default {
  name: 'Post',
  props: {
    postId: String
  },
  data: () => ({
    postLiked: false,
    imageDialog: false,
    messageBody: '',
    isFormValid: true,
    messageError: '',
    signinRequired: false,
    messageRules: [
      messageBody => 
        messageBody.length < 10 || 'Message must be less than 200 characters'
    ],
    loadingLike: false,
    loadingMessage: false,
    loadingDeleteMessage: false
  }),
  apollo: {
    getPost: {
      query: GET_POST,
      variables() {
        return {
          postId: this.postId
        }
      },
      error(err) {
        this.$_error(NotFound, { message: err.message });
      }
    }
  },
  computed: {
    ...mapGetters(['user', 'userFavorites']),
  },
  methods: {
    closeDialog(){
      this.signinRequired = false;
    },
    getTimeFromNow(time) {
      return moment(time).fromNow();
    },
    formatCreatedDate(date) {
      return moment(new Date(date)).format('LLL');
    },
    goToUser(userId) {
      this.$router.push(`/profile/${userId}`);
    },
    checkIfPostLiked(postId) {
      // check if user favorites includes post with id of 'postId'
      const fave = this.userFavorites.some(fave => fave._id === postId);
      if (this.userFavorites && fave) {
        this.postLiked = true;
        return true;
      } else {
        this.postLiked = false;
        return false;
      }
    },
    handleToggleLikes() {
      if (this.postLiked) this.handleUnlikePost();
      else this.handleLikePost();
    },
    handleLikePost() {
      this.loadingLike = true;
      const variables = {
        postId: this.postId,
        username: this.user.username
      };
      this.$apollo.mutate({
        mutation: LIKE_POST,
        variables,
        update: (cache, { data: { likePost }}) => {
          const data = cache.readQuery({
            query: GET_POST,
            variables: { postId: this.postId }
          });
          data.getPost.likes += 1;
          cache.writeQuery({
            query: GET_POST,
            variables: { postId: this.postId },
            data
          });
        }
      }).then(({ data }) => {
        this.loadingLike = false;
        const updatedUser = { 
          ...this.user, favorites: 
          data.likePost.favorites 
        };
        this.$store.commit('setUser', updatedUser);
      }).catch(err => {
        this.loadingLike = false;
        console.error(err)
      });
    },
    handleUnlikePost() {
      this.loadingLike = true
      const variables = {
        postId: this.postId,
        username: this.user.username
      };
      this.$apollo.mutate({
        mutation: UNLIKE_POST,
        variables,
        update: (cache, { data: { unlikePost }}) => {
          const data = cache.readQuery({
            query: GET_POST,
            variables: { postId: this.postId }
          });
          data.getPost.likes -= 1;
          cache.writeQuery({
            query: GET_POST,
            variables: { postId: this.postId },
            data
          });
        }
      }).then(({ data }) => {
        this.loadingLike = false;
        const updatedUser = { 
          ...this.user, 
          favorites: data.unlikePost.favorites 
        };
        this.$store.commit('setUser', updatedUser);
      }).catch(err => {
        this.loadingLike = false;
        console.error(err);
      });
    },
    handleAddPostMessage() {
      if (
          this.$data.messageBody.length !== 0 && this.$refs.form.validate()
      ) {
        this.loadingMessage = true;
        const variables = {
          messageBody: this.messageBody,
          userId: this.user._id,
          postId: this.postId
        }
        this.$apollo.mutate({
          mutation: ADD_POST_MESSAGE,
          variables,
          update: (cache, { data: { addPostMessage } }) => {
            const data = cache.readQuery({
              query: GET_POST,
              variables: { postId: this.postId }
            });
            data.getPost.messages.unshift(addPostMessage);
            cache.writeQuery({
              query: GET_POST,
              variables: { postId: this.postId },
              data
            });
          }
        })
        .then(({ data }) => {
          this.loadingMessage = false;
          this.$refs.form.reset();
          this.$data.messageBody = '';
        })
        .catch(err => {
          this.loadingMessage = false;
          console.error(err);
        });
      }
    },
    deleteUserMessage(messageId, index) {
      const variables = {
        messageId,
        postId: this.postId
      };
      this.loadingDeleteMessage = true;
      this.$apollo.mutate({
        mutation: DELETE_USER_MESSAGE,
        variables,
        update: (cache, { data: { deleteUserMessage } }) => {
          const data = cache.readQuery({
            query: GET_POST,
            variables: { postId: this.postId }
          });
          // remove message of post
          data.getPost.messages.splice(index, 1)
          cache.writeQuery({
            query: GET_POST,
            variables: { postId: this.postId },
            data
          });
        }
      })
      .then(({ data }) => {
        this.loadingDeleteMessage = false;
      })
      .catch(err => {
        this.loadingDeleteMessage = false;
        console.error(err);
      });
    },
    handleDeleteUserMessage(messageId, index) {
      const deleteMessage = 
        window.confirm('Are you sure want to delete this message?');
      if (deleteMessage) {
        this.deleteUserMessage(messageId, index);
      }
    },
    goToPreviousPage() {
      this.$router.go(-1);
    },
    toggleImageDialog() {
      if (window.innerWidth > 500) {
        this.imageDialog = !this.imageDialog;
      }
    },
    checkIfOwnMessage(message) {
      return this.user && this.user._id === message.messageUser._id;
    }
  },
}
</script>
