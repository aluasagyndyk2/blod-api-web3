const API_URL = 'http://localhost:3000';

const blogForm = document.getElementById('blog-form');
const blogsList = document.getElementById('blogs-list');
const formTitle = document.getElementById('form-title');
const cancelBtn = document.getElementById('cancel-btn');

let editingId = null;

document.addEventListener('DOMContentLoaded', loadBlogs);

blogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const blogData = {
        title: document.getElementById('title').value,
        body: document.getElementById('body').value,
        author: document.getElementById('author').value || 'Anonymous'
    };
    
    try {
        if (editingId) {
            await fetch(`${API_URL}/blogs/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(blogData)
            });
        } else {
        
            await fetch(`${API_URL}/blogs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(blogData)
            });
        }
        
        resetForm();
        loadBlogs();
        
    } catch (error) {
        alert('Error saving blog: ' + error.message);
    }
});

cancelBtn.addEventListener('click', resetForm);

async function loadBlogs() {
    try {
        blogsList.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading posts...</div>';
        
        const response = await fetch(`${API_URL}/blogs`);
        const blogs = await response.json();
        
        blogsList.innerHTML = '';
        
        if (blogs.length === 0) {
            blogsList.innerHTML = '<div class="no-blogs">No blog posts yet. Create the first one!</div>';
            return;
        }
        
        blogs.forEach(blog => {
            const blogElement = createBlogElement(blog);
            blogsList.appendChild(blogElement);
        });
        
    } catch (error) {
        blogsList.innerHTML = '<div class="error">Error loading blogs. Please try again.</div>';
    }
}

function createBlogElement(blog) {
    const div = document.createElement('div');
    div.className = 'blog-card';
    div.innerHTML = `
        <h3>${blog.title}</h3>
        <div class="blog-meta">
            <span><i class="fas fa-user"></i> ${blog.author}</span>
            <span><i class="far fa-clock"></i> ${new Date(blog.createdAt).toLocaleDateString()}</span>
        </div>
        <p>${blog.body.substring(0, 200)}${blog.body.length > 200 ? '...' : ''}</p>
        <div class="blog-actions">
            <button onclick="editBlog('${blog._id}')" class="btn btn-primary">
                <i class="fas fa-edit"></i> Edit
            </button>
            <button onclick="deleteBlog('${blog._id}')" class="btn btn-danger">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    return div;
}

async function editBlog(id) {
    try {
        const response = await fetch(`${API_URL}/blogs/${id}`);
        const blog = await response.json();
        
        document.getElementById('blog-id').value = blog._id;
        document.getElementById('title').value = blog.title;
        document.getElementById('author').value = blog.author;
        document.getElementById('body').value = blog.body;
        
        formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Blog Post';
        editingId = id;
        
        document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        alert('Error loading blog for editing: ' + error.message);
    }
}

async function deleteBlog(id) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    
    try {
        await fetch(`${API_URL}/blogs/${id}`, {
            method: 'DELETE'
        });
        
        loadBlogs();
    } catch (error) {
        alert('Error deleting blog: ' + error.message);
    }
}

function resetForm() {
    blogForm.reset();
    document.getElementById('blog-id').value = '';
    formTitle.innerHTML = '<i class="fas fa-plus"></i> Create New Blog Post';
    editingId = null;
}