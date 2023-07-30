const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const loginRouter = require('express').Router()
const User = require('../models/user')
require('dotenv').config()

loginRouter.post('/', async (request, response) => {
    const { username, password } = request.body
    const user = await User.findOne({username})

    const passwordRight = user === null
        ?false
        :await bcrypt.compare(password, user.passwordHash)
    if (!(user && passwordRight)){
        return response.status(401).json({
            error: 'invalid password or username'
        })
    }

    const userToken = {
        username: user.username,
        id: user._id
    }

    const token = jwt.sign(userToken, process.env.SECRET)

    response    
        .status(200)
        .json({token, username: username, name: user.name})
})

module.exports = loginRouter