const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async(request, response) => {
    const users = await User.find({})
        .find({})
        .populate('blogs',{url: 1, title:1 , author: 1, id:1})

    response.json(users)
})

usersRouter.post('/', async (request, response) =>{
    const { username, name, password, blogs } = request.body

    const isUser = await User.findOne({ username })
    if(isUser){
        return response.status(400).json({
            error:'username must be unique'
        })
    } else if (password === undefined || password.length<4){
        return response.status(400).json({
            error:'password needs to be atleast 3 characters long'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)  

    const user = new User({
        username,
        name,
        passwordHash,
        blogs
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
})

module.exports = usersRouter