const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createToken = ( user, secret, expiresIn ) => {
  const { username, email } = user;
  return jwt.sign({ username, email }, secret, { expiresIn });
};

module.exports = {
  Query: {
    getCurrentUser: async (_, args, { User, currentUser }) => {
      if (!currentUser) {
        return null;
      };
      const user = await User.findOne({
        username: currentUser.username
      }).populate({
        path: "favorites",
        model: "Post"
      });
      return user;
    },
    getUser: async (_, { userId }, { User }) => {
      try {
        const user = await User.findOne({ _id: userId })
        .populate({
          path: "favorites",
          model: "Post"
        });
        if (user) return user;
      } catch(err) {
        throw new Error('User not found.');
      }
    },
  },
  Mutation: {
    signinUser: async (_, { username, password }, { User }) => {
      const user = await User.findOne({ username });
      if (!user) throw new Error("User not found");

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) throw new Error("Invalid password");

      return { token: createToken(user, process.env.SECRET, "48hr") };
    },
    signupUser: async (_, { username, name, email, password }, { User }) => {
      const findUser = await User.findOne({ username });
      if (findUser) throw new Error("User already exist");

      const findEmail = await User.findOne({ email });
      if (findEmail) throw new Error("Email already exist");

      const newUser = await new User({
        username,
        name,
        email,
        password
      }).save();

      return { token: createToken(newUser, process.env.SECRET, "48hr") };
    }
  }
};