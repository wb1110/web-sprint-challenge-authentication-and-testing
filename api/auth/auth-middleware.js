const Users = require("./auth-model");

function requiredFields(req, res, next) {
  if (!req.body.username || !req.body.password) {
    res.status(401).json({ message: "username and password required" })
  } else {
    next()
  }
}


async function checkUsernameFree(req, res, next) {
  try {
  const userExists = await Users.findBy({ username: req.body.username })
  if (userExists.length) {
    next({ status: 422, message: "username taken" })
  } else {
    next()
  }
  } catch (err) {
  next(err)
  }
}

async function checkUsernameExists(req, res, next) {
  try {
    const userExists = await Users.findBy({ username: req.body.username })
    if (!userExists.length) {
      next({ status: 401, message: "Invalid credentials" })
    } else {
      req.user = userExists[0]
      next()
    }
  } catch (err) {
      next(err)
  }
}

function checkPasswordLength(req, res, next) {
  !req.body.password || req.body.password.length < 4 ?
  res.status(422).json({ message: "Password must be longer than 3 chars"}) :
  next()
}

module.exports = {
  requiredFields,
  checkUsernameFree,
  checkUsernameExists,
  checkPasswordLength
}