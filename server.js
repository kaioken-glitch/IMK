const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

const PORT = process.env.PORT || 3000;
const DB_FILE = './db.json';

app.use(cors());
app.use(bodyParser.json());

// --- In-memory cache ---
let dbCache = null;
let dbDirty = false;

// Load DB into memory on startup
function loadDB() {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], posts: [] }, null, 2));
    }
    dbCache = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}
function saveDB() {
    if (dbDirty && dbCache) {
        fs.writeFile(DB_FILE, JSON.stringify(dbCache, null, 2), () => {});
        dbDirty = false;
    }
}
loadDB();
setInterval(saveDB, 2000); // Save every 2 seconds

// --- USERS ---
app.get('/users', (req, res) => {
    res.json(dbCache.users || []);
});
app.get('/users/:id', (req, res) => {
    const user = (dbCache.users || []).find(u => String(u.id) === String(req.params.id));
    if (user) res.json(user);
    else res.status(404).json({ error: 'User not found' });
});
app.post('/users', (req, res) => {
    const users = dbCache.users || [];
    const newUser = { ...req.body, id: Date.now() };
    users.push(newUser);
    dbCache.users = users;
    dbDirty = true;
    res.json(newUser);
});
app.patch('/users/:id', (req, res) => {
    let users = dbCache.users || [];
    users = users.map(u => String(u.id) === String(req.params.id) ? { ...u, ...req.body } : u);
    dbCache.users = users;
    dbDirty = true;
    res.json(users.find(u => String(u.id) === String(req.params.id)));
});

// --- POSTS ---
app.get('/posts', (req, res) => {
    res.json(dbCache.posts || []);
});
app.get('/posts/:id', (req, res) => {
    const post = (dbCache.posts || []).find(p => String(p.id) === String(req.params.id));
    if (post) res.json(post);
    else res.status(404).json({ error: 'Post not found' });
});
app.post('/posts', (req, res) => {
    const posts = dbCache.posts || [];
    const newPost = { ...req.body, id: Date.now() };
    posts.push(newPost);
    dbCache.posts = posts;
    dbDirty = true;
    res.json(newPost);
});
app.patch('/posts/:id', (req, res) => {
    let posts = dbCache.posts || [];
    posts = posts.map(p => String(p.id) === String(req.params.id) ? { ...p, ...req.body } : p);
    dbCache.posts = posts;
    dbDirty = true;
    res.json(posts.find(p => String(p.id) === String(req.params.id)));
});
app.delete('/posts/:id', (req, res) => {
    let posts = dbCache.posts || [];
    posts = posts.filter(p => String(p.id) !== String(req.params.id));
    dbCache.posts = posts;
    dbDirty = true;
    res.json({ success: true });
});

app.use(express.static('public'));
app.get('/', (req, res) => {
    res.send('Informed Mkenya API is running.');
});

app.listen(PORT, () => {
    console.log(`API server running at http://localhost:${PORT}`);
});

