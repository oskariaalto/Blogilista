const blogsRouter = require('express').Router()
require('dotenv').config()

const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .find({})
    .populate('user',{username: 1, name: 1, id: 1})
  
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) =>{
  const blog = await Blog.findById(request.params.id)
  if (blog){
    response.json(blog)
  }else{
    response.status(404).end
  }
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const user = request.user 
  if(!user) {
    return response.status(401).json({error: 'token missing or invalid'})
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    user: user,
    url: body.url,
    likes: body.likes || 0
  })
  
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)

  await user.save()

  response.json(savedBlog.toJSON())
})

blogsRouter.delete('/:id', async (request, response) =>{
  const blog = await Blog.findById(request.params.id)
  const user = request.user 
  if ( !blog ) {
    response.status(400).json({error: 'invalid id'})
  }else if (blog.user.toString() === user.id){
    await Blog.findByIdAndRemove(request.params.id)

    user.blogs = user.blogs.filter(b => b.id !== request.params.id)
    await user.save()
    
    response.status(204).end()
  }
})

blogsRouter.put('/:id', async (request,response) =>{
  const body = request.body
  const user = request.user

  const blog ={
    title: body.title,
    author: body.author,
    user: user,
    url: body.url,
    likes: body.likes 
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {new: true, runValidators: true, context: 'query'})
  response.json(updatedBlog)
})



module.exports = blogsRouter