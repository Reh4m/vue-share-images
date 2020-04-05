const mongoose = require('mongoose');
const md5 = require('md5');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  banner: {
    type: String
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  favorites: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    ref: 'Post'
  }
});

// Create and add avatars to user
UserSchema.pre('save', function(next) {
  const imagesArray = [
    'WOiYafS',
    'km3nnnz',
    'gPkf0an',
    'WqylbTC',
    'apkdoXL',
    'TcVXsAe',
    'lMjVcfQ',
    'opI4dRv',
    'lOJzBOm',
    'jRskhGE'
  ];
  const num = Math.floor(Math.random() * 10);
  this.banner = `https://imgur.com/${imagesArray[num]}.jpg`
  this.avatar = `http://gravatar.com/avatar/${md5(this.username)}?d=identicon`;
  next();
});

// hash password so it can´t be seen w/ access to database
UserSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next();
  };
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);

      this.password = hash;
      next();
    });
  });
});

module.exports = mongoose.model('User', UserSchema);