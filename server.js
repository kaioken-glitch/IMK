const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const DB_FILE = './db.json';

// Helper to read/write db.json
function readDB() {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// --- USERS ---
app.get('/users', (req, res) => {
    const db = readDB();
    res.json(db.users || []);
});
app.get('/users/:id', (req, res) => {
    const db = readDB();
    const user = (db.users || []).find(u => u.id == req.params.id);
    if (user) res.json(user);
    else res.status(404).json({ error: 'User not found' });
});
app.post('/users', (req, res) => {
    const db = readDB();
    const users = db.users || [];
    const newUser = { ...req.body, id: Date.now() };
    users.push(newUser);
    db.users = users;
    writeDB(db);
    res.json(newUser);
});
app.patch('/users/:id', (req, res) => {
    const db = readDB();
    let users = db.users || [];
    users = users.map(u => u.id == req.params.id ? { ...u, ...req.body } : u);
    db.users = users;
    writeDB(db);
    res.json(users.find(u => u.id == req.params.id));
});

// --- POSTS ---
app.get('/posts', (req, res) => {
    const db = readDB();
    res.json(db.posts || []);
});
app.get('/posts/:id', (req, res) => {
    const db = readDB();
    const post = (db.posts || []).find(p => p.id == req.params.id);
    if (post) res.json(post);
    else res.status(404).json({ error: 'Post not found' });
});
app.post('/posts', (req, res) => {
    const db = readDB();
    const posts = db.posts || [];
    const newPost = { ...req.body, id: Date.now() };
    posts.push(newPost);
    db.posts = posts;
    writeDB(db);
    res.json(newPost);
});
app.patch('/posts/:id', (req, res) => {
    const db = readDB();
    let posts = db.posts || [];
    posts = posts.map(p => p.id == req.params.id ? { ...p, ...req.body } : p);
    db.posts = posts;
    writeDB(db);
    res.json(posts.find(p => p.id == req.params.id));
});
app.delete('/posts/:id', (req, res) => {
    const db = readDB();
    let posts = db.posts || [];
    posts = posts.filter(p => p.id != req.params.id);
    db.posts = posts;
    writeDB(db);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});