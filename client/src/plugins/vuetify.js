import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    options: {
      customProperties: true,
    },
    themes: {
      light: {
        primary: '#424242',
        secondary: '#ee44aa',
        accent: '#BF653F',
        error: '#722530',
        info: '#396893',
        success: '#4CAF50',
        warning: '#A37513',
        greylightentwo: 'E0E0E0',
        greylightenfive: '#FAFAFA',
        greylighten: '#6D6F70',
        darklighten: '#383E42',
        redlighten: '#FF6B6B',
        signinTheme: '#67324d',
        signupTheme: '#a1454e'
      },
      dark: {
        primary: '#2196F3',
        secondary: '#424242',
        accent: '#BF653F',
        error: '#FF5252',
        info: '#396893',
        success: '#4CAF50',
        warning: '#FB8C00',
        redlighten: '#FF6B6B',
        signinTheme: '#67324d',
        signupTheme: '#a1454e'
      }
    },
  },
});
