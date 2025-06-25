document.addEventListener('DOMContentLoaded', () => {
    const accessGrant = document.querySelector('.accessGrant');
    const mainDiv = document.querySelector('.main');
    const holder = document.querySelector('.holder');

    // Get references to forms/divs
    const loginForm = holder.querySelector('.loginForm');
    const signupForm = holder.querySelector('.signupForm');
    const setupAliasDiv = holder.querySelector('.setupAlias');

    // Shows only login form
    function showLogin() {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        setupAliasDiv.style.display = 'none';
        cleanUrl();
    }
    // Shows only signup form
    function showSignup() {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        setupAliasDiv.style.display = 'none';
        cleanUrl();
    }
    // Shows only setupAlias
    function showSetupAlias() {
        loginForm.style.display = 'none';
        signupForm.style.display = 'none';
        setupAliasDiv.style.display = 'block';
        cleanUrl();
    }

    // Remove query params from URL without reload
    function cleanUrl() {
        if (window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // Initial state
    showLogin();

    // Switch links
    holder.querySelector('#signupSwitch').addEventListener('click', (e) => {
        e.preventDefault();
        showSignup();
    });
    holder.querySelector('#loginSwitch').addEventListener('click', (e) => {
        e.preventDefault();
        showLogin();
    });

    // Session check
    function isSessionValid() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return false;
        const now = Date.now();
        const expiry = 1000 * 60 * 60 * 24 * 30 * 2; // 2 months
        return now - user.loginTime < expiry;
    }

    function updateUI() {
        if (isSessionValid()) {
            accessGrant.style.display = 'none';
            mainDiv.style.display = 'block';
        
            // Get user from localStorage
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                // Fetch full user data (to get alias and imageProfile)
                fetch(`https://imk-production.up.railway.app/users/${user.id}`)
                    .then(res => res.json())
                    .then(fullUser => {
                        // Set alias
                        document.getElementById('userAlias').textContent = fullUser.alias || fullUser.username || '';
                        // Set profile image if available
                        const img = document.querySelector('.userPfp img');
                        if (fullUser.imageProfile) {
                            img.src = fullUser.imageProfile;
                        } else {
                            img.src = './assets/default-profile.png'; // fallback image
                        }
                    });
            }
        } else {
            accessGrant.style.display = 'block';
            mainDiv.style.display = 'none';
            showLogin();
        }
    }

    // Logout functionality
    const profileControl = document.querySelector('.userPf');
    const logoutBtn = document.createElement('button');
    logoutBtn.innerHTML = `<i class="fa-solid fa-door-open"></i>`;
    logoutBtn.id = 'logoutBtn';
    profileControl.appendChild(logoutBtn);

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        updateUI();
    });

    // LOGIN
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        cleanUrl();
        const email = loginForm.querySelector('input[name="email"]').value.trim();
        const password = loginForm.querySelector('input[name="password"]').value;

        try {
            const response = await fetch('https://imk-production.up.railway.app/users');
            const users = await response.json();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                localStorage.setItem('user', JSON.stringify({
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    loginTime: Date.now()
                }));
                updateUI(); // This will hide accessGrant and show mainDiv
            } else {
                alert('Invalid email or password!');
            }
        } catch (error) {
            alert('Error connecting to server!');
        }
    });

    updateUI();

    // SIGNUP
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        cleanUrl();
        const email = signupForm.querySelector('input[name="email"]').value.trim();
        const username = signupForm.querySelector('input[name="username"]').value.trim();
        const password = signupForm.querySelector('input[name="password"]').value;
        const confirmPassword = signupForm.querySelector('input[name="confirmPassword"]').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            const response = await fetch('https://imk-production.up.railway.app/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, username, password })
            });
            const newUser = await response.json();

            // Store newUser id for setupAlias
            setupAliasDiv.dataset.userid = newUser.id;
            showSetupAlias();
        } catch (error) {
            alert('Signup failed!');
        }
    });

    // SETUP ALIAS
    setupAliasDiv.querySelector('#pfSetup').addEventListener('click', async function(e) {
        e.preventDefault();
        cleanUrl();
        const alias = setupAliasDiv.querySelector('#internetName').value.trim();
        const fileInput = setupAliasDiv.querySelector('#pfpUser');
        const userId = setupAliasDiv.dataset.userid;
        let imageProfile = "";

        if (!userId) {
            alert('User not found for profile setup!');
            return;
        }

        // Helper to finish and show login
        const finishSetup = async (patchObj) => {
            await fetch(`https://imk-production.up.railway.app/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patchObj)
            });
            showLogin();
        };

        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = async function(e) {
                imageProfile = e.target.result;
                await finishSetup({ alias, imageProfile });
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            await finishSetup({ alias });
        }
    });

    const createArticleBtn = document.getElementById('createArticle');
    const articlePostDiv = document.querySelector('.articlePost');

    // Form HTML as a string
    const authorFormHTML = `
        <div class="authorFormSection">
            <h2>Create News Article</h2>
            <form id="newsForm">
                <input type="text" id="articleTitle" required placeholder="Enter article headline...">
                <input type="text" id="articleAuthor" required placeholder="Enter author name...">
                <input type="url" id="articleImageURL" placeholder="Enter image URL...">
                <input type="text" id="articleImageCaption" placeholder="Describe the image...">
                <textarea id="articleContent" rows="8" required placeholder="Write your article using Markdown..."></textarea>
                <h3>Preview</h3>
                <div id="articlePreview" class="previewArea"></div>
                <button type="submit" class="submitBtn">Publish Article</button>
            </form>
        </div>
    `;

    createArticleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        articlePostDiv.innerHTML = authorFormHTML;

        const newsForm = document.getElementById('newsForm');
        newsForm.addEventListener('submit', async function(ev) {
            ev.preventDefault();

            // Collect form data
            const title = document.getElementById('articleTitle').value.trim();
            const author = document.getElementById('articleAuthor').value.trim();
            const imageURL = document.getElementById('articleImageURL').value.trim();
            const imageCaption = document.getElementById('articleImageCaption').value.trim();
            const content = document.getElementById('articleContent').value.trim();

            // POST to backend with interaction arrays
            try {
                const userId = getCurrentUserId();
                const postData = {
                    title,
                    author,
                    imageURL,
                    imageCaption,
                    content,
                    viewedBy: [],
                    likedBy: [],
                    sharedBy: [],
                    savedBy: [],
                    comments: [],
                    authorId: userId // <-- Add this line
                };

                await fetch('https://imk-production.up.railway.app/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(postData)
                });
                renderPosts();
            } catch (error) {
                alert('Failed to publish article!');
            }
        });
    });

    async function renderPosts() {
    articlePostDiv.innerHTML = "";

        try {
            const response = await fetch('https://imk-production.up.railway.app/posts');
            const posts = await response.json();

            for (const post of posts) {
                // Ensure arrays exist
                post.viewedBy = post.viewedBy || [];
                post.likedBy = post.likedBy || [];
                post.sharedBy = post.sharedBy || [];
                post.savedBy = post.savedBy || [];
                post.comments = post.comments || [];

                const postDiv = document.createElement('div');
                postDiv.className = 'createdPost';
                postDiv.dataset.postId = post.id;

                // Build comments HTML (user info will be filled in after rendering)
                let commentsHtml = '';
                for (const comment of post.comments) {
                    commentsHtml += `
                        <div class="commentDiv" data-user-id="${comment.userId}">
                            <div class="profile">
                                <div class="profileImage">
                                    <img src="./assets/default-profile.png" alt=""/>
                                </div>
                                <div class="userProfileName">
                                    <p>Loading...</p>
                                </div>
                            </div>
                            <p class="commentContent">${comment.content}</p>
                        </div>
                    `;
                }

                postDiv.innerHTML = `
                    <div class="postHeader">
                        <h1>${post.title}</h1>
                        <h3>${post.author}</h3>
                        <p><i class="fa-regular fa-clock"></i> ${post.readTime || estimateReadTime(post.content)}</p>
                    </div>
                    <div class="postImage">
                        <img src="${post.imageURL || './assets/default-image.jpg'}" alt="article-image">
                    </div>
                    <div class="postImageContext">
                        <p id="imageContext">${post.imageCaption || ''}</p>
                    </div>
                    <div class="postContent">
                        ${marked.parse(post.content || '')}
                    </div>
                    <div class="postManipulation">
                        <div class="accessLock">
                            <i class="fa-solid fa-user-lock"></i>
                            Access Denied
                        </div>
                        <div class="postChanges">
                            <button type="button" class=editPost>
                                <i class="fa-solid fa-file-pen"></i>
                                Edit
                            </button>
                            <button type="button" class="saveChanges">
                                <i class="fa-solid fa-circle-check"></i>
                                Save
                            </button>
                            <button type="button" class="deletePost">
                                <i class="fa-solid fa-trash-can"></i>
                                Delete
                            </button>
                            <button type="button" class="cancelEdit">
                                <i class="fa-solid fa-circle-xmark"></i>
                                Cancel
                            </button>
                        </div>
                    </div>
                    <div class="postInteractions">
                        <div class="views">
                            <button class="viewLogger"><i class="fa-solid fa-eye"></i>${post.viewedBy.length}</button>
                        </div>
                        <div class="common">
                            <button type="button" class="likeBtn"><i class="fa-solid fa-thumbs-up"></i>${post.likedBy.length}</button>
                            <button type="button" class="commentsBtn"><i class="fa-solid fa-comments"></i>${post.comments.length}</button>
                            <button type="button" class="shareBtn"><i class="fa-solid fa-share-nodes"></i>${post.sharedBy.length}</button>
                            <button type="button" class="saveBtn"><i class="fa-solid fa-bookmark"></i>${post.savedBy.length}</button>
                        </div>
                    </div>
                    <div class="commentsSection" style="display:none;">
                        <h2>Comments</h2>
                        <div class="postedComments">
                            ${commentsHtml}
                        </div>
                        <div class="commentor">
                            <input type="text" name="postedCommentsInput" class="commentsInput"/>
                            <i class="fa-solid fa-paper-plane commentButton"></i>
                        </div>
                    </div>
                `;

                const currentUserId = getCurrentUserId();
                const isOwner = post.authorId == currentUserId;

                // Show/hide controls based on ownership
                const accessLockDiv = postDiv.querySelector('.accessLock');
                const postChangesDiv = postDiv.querySelector('.postChanges');
                const editBtn = postDiv.querySelector('.editPost');
                const deleteBtn = postDiv.querySelector('.deletePost');
                const saveBtn = postDiv.querySelector('.saveChanges');
                const cancelBtn = postDiv.querySelector('.cancelEdit');

                // Initial state
                if (isOwner) {
                    accessLockDiv.style.display = 'none';
                    postChangesDiv.style.display = 'flex';
                    editBtn.style.display = '';
                    deleteBtn.style.display = '';
                    saveBtn.style.display = 'none';
                    cancelBtn.style.display = 'none';
                } else {
                    accessLockDiv.style.display = 'flex';
                    postChangesDiv.style.display = 'none';
                }

                if (isOwner) {
                    // Elements to edit
                    const titleEl = postDiv.querySelector('.postHeader h1');
                    const authorEl = postDiv.querySelector('.postHeader h3');
                    const contentEl = postDiv.querySelector('.postContent');
                
                    // Store original values for cancel
                    let originalTitle, originalAuthor, originalContent;
                
                    editBtn.addEventListener('click', () => {
                        // Save originals
                        originalTitle = titleEl.textContent;
                        originalAuthor = authorEl.textContent;
                        originalContent = contentEl.innerHTML;
                    
                        // Make editable
                        titleEl.setAttribute('contenteditable', 'true');
                        authorEl.setAttribute('contenteditable', 'true');
                        contentEl.setAttribute('contenteditable', 'true');
                    
                        // Switch buttons
                        editBtn.style.display = 'none';
                        deleteBtn.style.display = 'none';
                        saveBtn.style.display = '';
                        cancelBtn.style.display = '';
                    });
                
                    deleteBtn.addEventListener('click', async function(e) {
                        e.preventDefault();
                        if (confirm('Are you sure you want to delete this post?')) {
                            await fetch(`https://imk-production.up.railway.app/posts/${post.id}`, {
                                method: 'DELETE'
                            });
                            renderPosts();
                        }
                    });

                    saveBtn.addEventListener('click', async () => {
                        // Get new values
                        const newTitle = titleEl.textContent.trim();
                        const newAuthor = authorEl.textContent.trim();
                        const newContent = contentEl.innerHTML.trim();
                    
                        // PATCH to backend
                        await fetch(`https://imk-production.up.railway.app/posts/${post.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                title: newTitle,
                                author: newAuthor,
                                content: newContent
                            })
                        });
                    
                        // Remove editable
                        titleEl.removeAttribute('contenteditable');
                        authorEl.removeAttribute('contenteditable');
                        contentEl.removeAttribute('contenteditable');
                    
                        // Switch buttons back
                        editBtn.style.display = '';
                        deleteBtn.style.display = '';
                        saveBtn.style.display = 'none';
                        cancelBtn.style.display = 'none';
                    });
                
                    cancelBtn.addEventListener('click', () => {
                        // Restore original values
                        titleEl.textContent = originalTitle;
                        authorEl.textContent = originalAuthor;
                        contentEl.innerHTML = originalContent;
                    
                        // Remove editable
                        titleEl.removeAttribute('contenteditable');
                        authorEl.removeAttribute('contenteditable');
                        contentEl.removeAttribute('contenteditable');
                    
                        // Switch buttons back
                        editBtn.style.display = '';
                        deleteBtn.style.display = '';
                        saveBtn.style.display = 'none';
                        cancelBtn.style.display = 'none';
                    });
                }

                articlePostDiv.appendChild(postDiv);

                // Fill in user info for each comment
                const postedCommentsDiv = postDiv.querySelector('.postedComments');
                for (const comment of post.comments) {
                    const commentDiv = postedCommentsDiv.querySelector(`.commentDiv[data-user-id="${comment.userId}"]`);
                    if (commentDiv) {
                        fetch(`https://imk-production.up.railway.app/users/${comment.userId}`)
                            .then(res => res.json())
                            .then(user => {
                                const img = commentDiv.querySelector('.profileImage img');
                                const name = commentDiv.querySelector('.userProfileName p');
                                if (img) img.src = user.imageProfile || './assets/default-profile.png';
                                if (name) name.textContent = user.alias || user.username || 'User';
                            });
                    }
                }

                // Comments toggle logic
                const commentsBtn = postDiv.querySelector('.commentsBtn');
                const commentsSection = postDiv.querySelector('.commentsSection');
                if (commentsBtn && commentsSection) {
                    commentsBtn.addEventListener('click', () => {
                        commentsSection.style.display = commentsSection.style.display === 'block' ? 'none' : 'block';
                    });
                }

                //comment logic
                const commentInput = postDiv.querySelector('.commentsInput');
                const commentButton = postDiv.querySelector('.commentButton');
                if (commentButton && commentInput && postedCommentsDiv) {
                    commentButton.addEventListener('click', async () => {
                        const content = commentInput.value.trim();
                        if (!content) return;
                        const userId = getCurrentUserId();
                        if (!userId) return;

                        // Fetch user info for display
                        const userRes = await fetch(`https://imk-production.up.railway.app/users/${userId}`);
                        const user = await userRes.json();

                        // Create new comment object
                        const newComment = { userId, content };

                        // Fetch post, add comment, and PATCH
                        const res = await fetch(`https://imk-production.up.railway.app/posts/${post.id}`);
                        const freshPost = await res.json();
                        freshPost.comments = freshPost.comments || [];
                        freshPost.comments.push(newComment);

                        await fetch(`https://imk-production.up.railway.app/posts/${post.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ comments: freshPost.comments })
                        });

                        // Add comment to DOM
                        const newCommentDiv = document.createElement('div');
                        newComment = { 
                            userId, 
                            content, 
                            createdAt: new Date().toISOString() // Add timestamp
                        };

                        const canDelete = (userId === post.authorId) || (userId === newComment.userId);

                        newCommentDiv.className = 'commentDiv';
                        newCommentDiv.innerHTML = `
                            <div class="profile">
                                <div class="profileImage">
                                    <img src="${user.imageProfile || './assets/default-profile.png'}" alt=""/>
                                </div>
                                <div class="userProfileName">
                                    <p>${user.alias || user.username || 'User'}</p>
                                    <span class="commentTime">${new Date(newComment.createdAt).toLocaleString()}</span>
                                    ${
                                        canDelete
                                        ? `<button class="deleteCommentBtn" style="margin-left:10px;font-size:0.9em;">Delete</button>`
                                        : ''
                                    }
                                </div>
                            </div>
                            <p class="commentContent">${content}</p>
                        `;

                        if (canDelete) {
                            const deleteBtn = newCommentDiv.querySelector('.deleteCommentBtn');
                            if (deleteBtn) {
                                deleteBtn.addEventListener('click', async () => {
                                    // Remove comment from post.comments array
                                    const res = await fetch(`https://imk-production.up.railway.app/posts/${post.id}`);
                                    const freshPost = await res.json();
                                    freshPost.comments = (freshPost.comments || []).filter(
                                        c => !(c.userId === newComment.userId && c.content === newComment.content && c.createdAt === newComment.createdAt)
                                    );
                                    await fetch(`https://imk-production.up.railway.app/posts/${post.id}`, {
                                        method: 'PATCH',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ comments: freshPost.comments })
                                    });
                                    // Remove from DOM
                                    newCommentDiv.remove();
                                    // Optionally update comment count
                                    commentsBtn.innerHTML = `<i class="fa-solid fa-comments"></i>${freshPost.comments.length}`;
                                });
                            }
                        }

                        postedCommentsDiv.appendChild(newCommentDiv);

                        // Update comment count on button
                        commentsBtn.innerHTML = `<i class="fa-solid fa-comments"></i>${freshPost.comments.length}`;

                        // Clear input
                        commentInput.value = '';
                    });
                }
            }

        } catch (error) {
            console.error('Failed to load posts:', error);
        }

        attachPostInteractionHandlers();
    }

    function estimateReadTime(content) {
        if (!content) return '1 minute read';
        const words = content.trim().split(/\s+/).length;
        const minutes = Math.max(1, Math.round(words / 200));
        return `${minutes} minute${minutes > 1 ? 's' : ''} read`;
    }
    // Call renderPosts on page load
    renderPosts();

    function getCurrentUserId() {
        const user = JSON.parse(localStorage.getItem('user'));
        return user ? user.id : null;
    }

    function attachPostInteractionHandlers() {
        document.querySelectorAll('.createdPost').forEach(postDiv => {
            const postId = postDiv.dataset.postId;

            // View Logger (simulate "view" on render)
            incrementView(postId);

            // Like
            postDiv.querySelector('.likeBtn').addEventListener('click', () => incrementLike(postId));

            // Share
            postDiv.querySelector('.shareBtn').addEventListener('click', () => sharePost(postId));

            // Save
            postDiv.querySelector('.saveBtn').addEventListener('click', () => savePost(postId));
            
        });
    }


    async function incrementView(postId) {
        const userId = getCurrentUserId();
        if (!userId) return;

        // Fetch post
        const res = await fetch(`https://imk-production.up.railway.app/posts/${postId}`);
        const post = await res.json();

        // Ensure viewedBy is always an array
        post.viewedBy = post.viewedBy || [];

        if (!post.viewedBy.includes(userId)) {
            post.viewedBy.push(userId);
            await fetch(`https://imk-production.up.railway.app/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ viewedBy: post.viewedBy })
            });
            // Optionally update only the view button UI here
            // updateViewButtonUI(postId, post.viewedBy.length);
        }
    }

    async function incrementLike(postId) {
        const userId = getCurrentUserId();
        if (!userId) return;

        const res = await fetch(`https://imk-production.up.railway.app/posts/${postId}`);
        const post = await res.json();

        let likedBy = post.likedBy || [];
        const index = likedBy.indexOf(userId);

        let liked = false;
        if (index === -1) {
            likedBy.push(userId);
            liked = true;
        } else {
            likedBy.splice(index, 1);
            liked = false;
        }

        await fetch(`https://imk-production.up.railway.app/posts/${postId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ likedBy })
        });

        // Update only the like button UI
        updateLikeButtonUI(postId, likedBy.length, liked);
    }

    function updateLikeButtonUI(postId, likeCount, liked) {
        const postDiv = document.querySelector(`.createdPost[data-post-id="${postId}"]`);
        if (postDiv) {
            const btn = postDiv.querySelector('.likeBtn');
            if (btn) {
                btn.innerHTML = `<i class="fa-solid fa-thumbs-up"></i>${likeCount}`;
                btn.classList.toggle('liked', liked);
            }
        }
    }

    function updateSaveButtonUI(postId, saved) {
        const postDiv = document.querySelector(`.createdPost[data-post-id="${postId}"]`);
        if (postDiv) {
            const btn = postDiv.querySelector('.saveBtn');
            if (btn) {
                btn.classList.toggle('saved', saved);
            }
        }
    }

    async function sharePost(postId) {
        const userId = getCurrentUserId();
        if (!userId) return;

        const res = await fetch(`https://imk-production.up.railway.app/posts/${postId}`);
        const post = await res.json();

        // Ensure sharedBy is always an array
        post.sharedBy = post.sharedBy || [];

        if (!post.sharedBy.includes(userId)) {
            post.sharedBy.push(userId);
            await fetch(`https://imk-production.up.railway.app/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sharedBy: post.sharedBy })
            });
        }
        // Generate share link (adjust if you have a different post page)
        const shareUrl = `${window.location.origin}/post.html?id=${postId}`;
        navigator.clipboard.writeText(shareUrl);
        alert('Direct post link copied to clipboard!');
    }   

    async function savePost(postId) {
        const userId = getCurrentUserId();
        if (!userId) return;

        // Update post
        const res = await fetch(`https://imk-production.up.railway.app/posts/${postId}`);
        const post = await res.json();

        // Ensure savedBy is always an array
        post.savedBy = post.savedBy || [];

        let changed = false;
        if (!post.savedBy.includes(userId)) {
            post.savedBy.push(userId);
            changed = true;
            await fetch(`https://imk-production.up.railway.app/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ savedBy: post.savedBy })
            });
        }

        // Update user
        const userRes = await fetch(`https://imk-production.up.railway.app/users/${userId}`);
        const user = await userRes.json();
        const saved = user.saved || [];
        if (!saved.includes(postId)) {
            saved.push(postId);
            changed = true;
            await fetch(`https://imk-production.up.railway.app/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ saved })
            });
        }

        if (changed) {
            updateSaveButtonUI(postId, true);
        }
    }

    const hamburger = document.querySelector('.hamburger');
    const mobileNavOverlay = document.querySelector('.mobileNavOverlay');
    const closeMenu = document.querySelector('.closeMenu');

    if (hamburger && mobileNavOverlay) {
        hamburger.addEventListener('click', () => {
            mobileNavOverlay.classList.add('show');
        });
    }
    if (closeMenu && mobileNavOverlay) {
        closeMenu.addEventListener('click', () => {
            mobileNavOverlay.classList.remove('show');
        });
    }

});
