import { agent as supertest } from 'supertest'
const mongoose = require('mongoose')
const app = require('../app')
const bcrypt = require('bcryptjs')

const api = supertest(app)

const Blog = require('../models/blog')
const helper = require('./test_helper')
const User = require('../models/user')

agent = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(helper.initialBlogs)
})
beforeEach(async () =>{
    await User.deleteMany({})
    await User.insertMany(helper.initialUser)
})

const token = api.post('/api/login', { username: helper.initialUser.username , password: helper.initialUser.passwordHash})
agent.auth(token.accessToken, {type: 'bearer'})

describe('loading blog data', () => {
    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
    
    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
     
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })
    
    test('includes field id', async () =>{
        const response = await api.get('/api/blogs')
    
        expect(response.body[0].id).toBeDefined()
    })
});


describe('adding blog works', () => {
    test('valid adition works', async () => {
        const newBlog = {
            title: 'Awsome',
            author: 'Mato Matala',
            url: 'heipparallaa.fi',
            likes: 10
        }
    
        await agent
            .post('/api/blogs')
            .send(newBlog)
            .expect(200)
        
        const blogsInEnd = await helper.blogsInDB()
        expect(blogsInEnd).toHaveLength(helper.initialBlogs.length+1)
    
        const titles = blogsInEnd.map(b => b.title)
        expect(titles).toContainEqual('Awsome')
    })
    
    test('if likes empty returns 0', async () => {
        const newBlog = {
            title: 'Awsome',
            author: 'Mato Matala',
            url: 'heipparallaa.fi'
        }
        
        await api
            .post('/api/blogs')
            .set('Authorization', `bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    
        const blogsInEnd = await helper.blogsInDB()
        return expect(blogsInEnd[helper.initialBlogs.length].likes).toBe(0)
    })
    
    test('title and url missing error', async () => {
        const newBlog = {
            author: 'Mato Matala',
        }
    
        await api
            .post('/api/blogs')
            .send(newBlog)
            .set('Authorization', token)
            .expect(400)
    })

    test ('cant add without token', async () =>{
        const newBlog = {
            title: 'Awsome',
            author: 'Mato Matala',
            url: 'heipparallaa.fi',
            likes: 10
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
    })
    
});

describe('Deleting blogs', () => {
    test('is succesfull', async () =>{
        const blogsAtStart = await helper.blogsInDB()
        const blogToDelete = blogsAtStart[0]
    
        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(204)
        
        const blogsAfter = await helper.blogsInDB()
        expect(blogsAfter).toHaveLength(helper.initialBlogs.length-1)
        expect(blogsAfter).not.toContainEqual(blogToDelete)
    
    }) 
});


describe('updating a blog', () =>{
    test('update works', async () => {
        const blogsAtStart = await helper.blogsInDB()
        const blogToUpdate = blogsAtStart[0]
        const upBlog = {
            id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 10,
    
        }
    
        await api   
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(upBlog)
            .expect(200)
        
        const blogsAfter = await helper.blogsInDB()
        expect(blogsAfter).toHaveLength(helper.initialBlogs.length)
        expect(blogsAfter).toContainEqual(upBlog)
    })
})

describe('one user in database', () => {
    beforeEach(async () =>{
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('secret', 10)
        const user = new User({ username: 'tere', name: 'Mato Mäki', passwordHash})

        await user.save()

    })

    test('can add a new user', async () =>{
        const usersStart = await helper.usersInDb()

        const newUser = {
            username: 'oskaria',
            name: 'Oskari Aalto',
            password: 'selkeä'
        }

        await api  
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        const usersEnd = await helper.usersInDb()
        expect(usersEnd).toHaveLength(usersStart.length+1)

        const usernames = usersEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test('password missing', async () => {
        const usersStart = await helper.usersInDb()

        const newUser = {
            username: 'oskaria',
            name: 'Oskari Aalto',
            password:'mo'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
        
        const usersEnd = await helper.usersInDb()
        expect(usersEnd).toHaveLength(usersStart.length)

        const usernames  = usersEnd.map(u=>u.username)
        expect(usernames).not.toContain(newUser.username)
    })

    test('username missing', async () => {
        const usersStart = await helper.usersInDb()

        const newUser = {
            name: 'Oskari Aalto',
            password: 'selkeä'
        } 

        await api   
            .post('/api/users')
            .send(newUser)
            .expect(400)
        
        const usersEnd = await helper.usersInDb()
        expect(usersEnd).toHaveLength(usersStart.length)
    })
});


afterAll(() =>{
    mongoose.connection.close()
})