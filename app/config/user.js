const jwt = require('jsonwebtoken');
const User = require('../models/user');
const UserConnection = require('../models/userConnection');
const sharp = require('sharp');
const encryptor = require('../helper/encryptor');

exports.createUser = async (req, res) => {
  console.log(req.body);
  const { fullname, email, password } = req.body;

  const isNewUser = await User.isThisEmailInUse(email);
  if (!isNewUser)
    return res.json({
      success: false,
      message: 'This email is already in use, try sign-in',
    });
  
  const user = await User({
    fullname,
    email,
    password,
  });
  await user.save();

  const newUserConnection = {
    email: user.email
  };

  const userConnection = await UserConnection(newUserConnection);
  await userConnection.save();

  res.json({ success: true, user });
};

exports.jwtSignIn = async (req, res) => {

  if (!req.user)
    return res.json({
      success: false,
      message: 'user not found, with the given email!',
  });

  const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  let oldTokens = req.user.tokens || [];

  if (oldTokens.length) {
    oldTokens = oldTokens.filter(t => {
      const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
      if (timeDiff < 86400) {
        return t;
      }
    });
  }

  await User.findByIdAndUpdate(req.user._id, {
    tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
  });

  const userInfo = {
    fullname: req.user.fullname,
    email: req.user.email,
    avatar: req.user.avatar ? req.user.avatar : '',
  };

  res.json({ success: true, user: userInfo, token });
}

exports.userSignIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user)
    return res.json({
      success: false,
      message: 'user not found, with the given email!',
    });

  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return res.json({
      success: false,
      message: 'email / password does not match!',
    });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  let oldTokens = user.tokens || [];

  if (oldTokens.length) {
    oldTokens = oldTokens.filter(t => {
      const timeDiff = (Date.now() - parseInt(t.signedAt)) / 1000;
      if (timeDiff < 86400) {
        return t;
      }
    });
  }

  await User.findByIdAndUpdate(user._id, {
    tokens: [...oldTokens, { token, signedAt: Date.now().toString() }],
  });

  const userInfo = {
    fullname: user.fullname,
    email: user.email,
    avatar: user.avatar ? user.avatar : '',
  };

  res.json({ success: true, user: userInfo, token });
};


exports.signOut = async (req, res) => {
  if (req.headers && req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Authorization fail!' });
    }

    const tokens = req.user.tokens;

    const newTokens = tokens.filter(t => t.token !== token);

    await User.findByIdAndUpdate(req.user._id, { tokens: newTokens });
    res.json({ success: true, message: 'Sign out successfully!' });
  }
};

exports.addConnection = async (req, res) => {
  try {

    const { email } = req.body;

    const secretEncryption = encryptor.encrypt(req.body.AuthClientSecret);

    formData = {
      D365ResourceURL: req.body.D365ResourceURL,
      AuthHostURL: req.body.AuthHostURL,
      AuthClientId: req.body.AuthClientId,
      AuthClientSecret: secretEncryption,
      AuthToken: "",
      AuthTokenExp: ""
    };

    const addUserConnection = await UserConnection.findOneAndUpdate(
      {"email": email},
      formData
    );

    formData.AuthClientSecret = req.body.AuthClientSecret;

    res
      .status(201)
      .json({ success: true, message: 'Your connection has updated!' , formData: formData});
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'server error, try after some time' });
    console.log('Error while adding connection information ', error.message);
  }
};

exports.getConnectionInfo = async (req, res) => {
  try {

    const { email } = req.body;

    const addUserConnection = await UserConnection.findOne(
      {"email": email}
    );

    addUserConnection.AuthClientSecret = encryptor.decrypt(addUserConnection.AuthClientSecret);

    res
      .status(201)
      .json({ success: true, formData: addUserConnection});
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'server error, try after some time' });
    console.log('Error while fetching connection information ', error.message);
  }
};


exports.updateUserConnectionToken = async (req, res) => {
  try {

    const { email } = req.body;

    updateData = {
      AuthTokenExp: req.body.AuthTokenExp,
      AuthToken: req.body.AuthToken
    };

    const addUserConnection = await UserConnection.findOneAndUpdate(
      {"email": email},
      updateData
    );

    res
      .status(201)
      .json({ success: true, message: 'Your connection has updated!'});
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'server error, try after some time' });
    console.log('Error while adding connection information ', error.message);
  }
};

exports.deleteAccount = async (req, res) => {
  try {

    const { email } = req.body;

    const deleteUserConnection = await UserConnection.deleteOne(
      {"email": email}
    );

    const deleteUser = await User.deleteOne(
      {"email": email}
    );

    res
      .status(201)
      .json({ success: true, message: 'Your account has deleted!'});
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'server error, try after some time' });
    console.log('Error while deleting account ', error.message);
  }
};


