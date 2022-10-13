const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
require('dotenv').config()

const errorHandler = (error, request, response, next) =>{
    logger.error(error.message)

    if (error.name === 'CastError'){
        return response.status(400).send({error: 'invalid id'})
    }else if(error.name ==='ValidationError'){
        return response.status(400).json({error: error.message})
    }else if (error.name === 'JsonWebTokenError') {
        return response.status(401).json({  error: 'invalid token'})
    }

    logger.error(error.message)

    next(error)
}

const tokenExtractor = (request, response, next) =>{
    const auth = request.get('authorization')
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
        request.token = auth.substring(7)
    }
    next()
}

const userExtractor = async (request, response, next) => {
    const auth = request.get('authorization')
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
        const dectoken = jwt.verify(auth.substring(7), process.env.SECRET)
        request.user = await User.findById(dectoken.id)
    }
    next()
}

module.exports = {
    errorHandler,
    tokenExtractor,
    userExtractor
}