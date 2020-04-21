<template>
  <v-col cols="12">
    <v-card flat :loading="loadingDeleteMessage">
      <v-subheader class="caption darklighten--text font-weight-bold">
        {{ messages.length }}
        {{ messages.length === 1 ? "Message" : "Messages" }}
      </v-subheader>
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
        <v-list v-if="messages.length" three-line>
          <template v-for="(message, index) in messages">
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
</template>

<script>
import moment from 'moment'
import {
  ADD_POST_MESSAGE,
  DELETE_USER_MESSAGE,
  GET_POST
} from '../queries'
import { mapGetters } from 'vuex'
import NotFound from '../views/Errors/NotFound.vue';

export default {
  name: 'PostMessages',
  props: {
    messages: Array,
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
  computed: {
    ...mapGetters(['user']),
  },
  methods: {
    getTimeFromNow: time => moment(time).fromNow(),
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
    checkIfOwnMessage(message) {
      return this.user && this.user._id === message.messageUser._id;
    }
  }
}
</script>