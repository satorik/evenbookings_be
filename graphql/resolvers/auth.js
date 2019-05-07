const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const User = require("../../models/user");

module.exports = {
  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({email: args.userInput.email});
      if (existingUser) {
        throw new Error("User already exists");
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
      const user = await new User({
        email: args.userInput.email,
        password: hashedPassword
      }).save();
      return {...user._doc, _id: user.id, password: null};

    } catch (err) {
      throw err;
    }
  },
  login: async ({email, password}) => {
    try {
      const user = await User.findOne({email: email});
      if (!user) {
        throw new Error('User does not exist!');
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        throw new Error('Password is incorrect');
      }
     
      const token = jwt.sign({userId: user.id, email: email}, 'superdupersercretkey', {expiresIn: '1h'});
      console.log(token);
      return {
        userId: user.id,
        token: token,
        tokenExpiration: 1
      }
    }
    catch (err) {
      throw err;
    }
  }
}