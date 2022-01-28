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
        res.status(201).json(inserted)
      } catch (err) {
        next(err)
      }
});

router.post(
  '/login',
  requiredFields,
  checkUsernameExists,
  (req, res, next) => {
      const { password } = req.body
      if (bcrypt.compareSync(password, req.user.password)) {
        const token = generateToken(req.user)
        res.status(200).json({ message: "welcome, Captain Marvel", token })
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
