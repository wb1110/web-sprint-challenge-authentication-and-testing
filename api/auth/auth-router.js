const router = require('express').Router();
const bcrypt = require('bcrypt');
const Users = require('./auth-model');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../secrets/index')
const { requiredFields, checkUsernameFree, checkUsernameExists } = require('./auth-middleware');

router.post(
  '/register',
  requiredFields,
  checkUsernameFree,
  async (req, res, next) => {
      try {
        const { username, password } = req.body
        const hash = bcrypt.hashSync(password, 8)
        const newUser = { username, password: hash }
        const inserted = await Users.add(newUser)
        res.json(inserted)
      } catch (err) {
        next(err)
      }
});

router.post('/login', requiredFields, checkUsernameExists, (req, res, next) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }


    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
      const { password } = req.body
      if (bcrypt.compareSync(password, req.user.password)) {
        const token = generateToken(req.user)
        res.json({ message: "welcome, Captain Marvel", token })
      } else {
        next({ status: 401, message: "invalid credentials" })
      }
});

function generateToken(user) {
  const payload = {
    subject: user.user_id,
    username: user.username,
    role_name: user.role_name,
  };
  const options = {
    expiresIn: '1d',
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

module.exports = router;
