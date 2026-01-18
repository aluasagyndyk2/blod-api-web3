const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Blog = require('./models/Blog');
const app = express();

app.use(cors());
app.use(express.json()); 
app.use(express.static('public')); 

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));


app.post('/blogs', async (req, res) => {
    try {
        const { title, body, author } = req.body;
        
        if (!title || !body) {
            return res.status(400).json({
                error: 'Title and body are required'
            });
        }
        
        const blog = new Blog({
            title,
            body,
            author: author || 'Anonymous'
        });
        
        const savedBlog = await blog.save();
        res.status(201).json(savedBlog);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/blogs', async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        res.json(blog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/blogs/:id', async (req, res) => {
    try {
        const { title, body, author } = req.body;
        
        if (!title || !body) {
            return res.status(400).json({
                error: 'Title and body are required'
            });
        }
        
        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            { title, body, author },
            { new: true, runValidators: true }
        );
        
        if (!updatedBlog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        res.json(updatedBlog);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/blogs/:id', async (req, res) => {
    try {
        const deletedBlog = await Blog.findByIdAndDelete(req.params.id);
        
        if (!deletedBlog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

module.exports = app;