const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Use process.env.PORT for Glitch/Render/Heroku compatibility
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const DB_FILE = './db.json';

// Helper to read/write db.json
function readDB() {
    if (!fs.existsSync(DB_FILE)) {
        // Initialize db.json if missing
        fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], posts: [] }, null, 2));
    }
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
    const user = (db.users || []).find(u => String(u.id) === String(req.params.id));
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
    users = users.map(u => String(u.id) === String(req.params.id) ? { ...u, ...req.body } : u);
    db.users = users;
    writeDB(db);
    res.json(users.find(u => String(u.id) === String(req.params.id)));
});

// --- POSTS ---
app.get('/posts', (req, res) => {
    const db = readDB();
    res.json(db.posts || []);
});
app.get('/posts/:id', (req, res) => {
    const db = readDB();
    const post = (db.posts || []).find(p => String(p.id) === String(req.params.id));
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
    posts = posts.map(p => String(p.id) === String(req.params.id) ? { ...p, ...req.body } : p);
    db.posts = posts;
    writeDB(db);
    res.json(posts.find(p => String(p.id) === String(req.params.id)));
});
app.delete('/posts/:id', (req, res) => {
    const db = readDB();
    let posts = db.posts || [];
    posts = posts.filter(p => String(p.id) !== String(req.params.id));
    db.posts = posts;
    writeDB(db);
    res.json({ success: true });
});

// For Glitch/Render: serve static files if needed
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Informed Mkenya API is running.');
});

app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});