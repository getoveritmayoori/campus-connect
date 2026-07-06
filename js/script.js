// Campus Connect - Frontend Logic

document.addEventListener('DOMContentLoaded', () => {
    // -----------------------------------------------------------------
    // 1. Constellation Network Canvas Background (Register Page)
    // -----------------------------------------------------------------
    const canvas = document.getElementById('network-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const properties = {
            bgColor: '#080512',
            particleColor: 'rgba(255, 42, 133, 0.5)',
            lineColor: 'rgba(255, 42, 133, 0.08)',
            particleRadius: 2.5,
            particleCount: 80,
            maxVelocity: 0.6,
            lineLength: 140,
            mouseRadius: 160
        };

        let mouse = { x: null, y: null };

        window.addEventListener('mousemove', (e) => {
            mouse.x = e.x;
            mouse.y = e.y;
        });

        window.addEventListener('mouseout', () => {
            mouse.x = null;
            mouse.y = null;
        });

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (canvas.width < 768) {
                properties.particleCount = 40;
            } else {
                properties.particleCount = 80;
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.velocityX = (Math.random() * 2 - 1) * properties.maxVelocity;
                this.velocityY = (Math.random() * 2 - 1) * properties.maxVelocity;
            }

            position() {
                if (this.x + this.velocityX > canvas.width || this.x + this.velocityX < 0) {
                    this.velocityX = -this.velocityX;
                }
                if (this.y + this.velocityY > canvas.height || this.y + this.velocityY < 0) {
                    this.velocityY = -this.velocityY;
                }
                this.x += this.velocityX;
                this.y += this.velocityY;
            }

            reDraw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, properties.particleRadius, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fillStyle = properties.particleColor;
                ctx.fill();
            }
        }

        const drawLines = () => {
            let x1, y1, x2, y2, distance;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    x1 = particles[i].x;
                    y1 = particles[i].y;
                    x2 = particles[j].x;
                    y2 = particles[j].y;
                    distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

                    if (distance < properties.lineLength) {
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.closePath();
                        ctx.strokeStyle = `rgba(255, 42, 133, ${1 - distance / properties.lineLength})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }

                // Mouse interaction
                if (mouse.x !== null && mouse.y !== null) {
                    let mDistance = Math.sqrt(Math.pow(mouse.x - particles[i].x, 2) + Math.pow(mouse.y - particles[i].y, 2));
                    if (mDistance < properties.mouseRadius) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.closePath();
                        ctx.strokeStyle = `rgba(255, 42, 133, ${(1 - mDistance / properties.mouseRadius) * 0.25})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }
        };

        const initParticles = () => {
            particles = [];
            for (let i = 0; i < properties.particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawLines();
            for (let i = 0; i < particles.length; i++) {
                particles[i].position();
                particles[i].reDraw();
            }
            requestAnimationFrame(loop);
        };

        initParticles();
        loop();
    }

    // -----------------------------------------------------------------
    // 2. Forum Logic (Forum Page connected to Backend API)
    // -----------------------------------------------------------------
    const postsList = document.getElementById('postsList');
    if (postsList) {
        // Retrieve current logged in user
        const currentUser = JSON.parse(sessionStorage.getItem('cc_user')) || { username: 'You', role: 'Student' };

        const fetchAndRenderPosts = () => {
            fetch('/api/forum/posts.js')
                .then(res => res.json())
                .then(posts => {
                    renderPosts(posts);
                })
                .catch(err => {
                    console.error('Failed to fetch posts from backend:', err);
                    postsList.innerHTML = `<p style="color: #ff7e40; text-align: center; margin-top: 2rem;">Unable to connect to the backend server. Make sure the Spring Boot application is running on port 8080.</p>`;
                });
        };

        const renderPosts = (posts) => {
            postsList.innerHTML = '';
            
            posts.forEach(post => {
                const postCard = document.createElement('div');
                postCard.className = 'post-card';
                
                // Build replies HTML
                let repliesHtml = '';
                if (post.replies && post.replies.length > 0) {
                    const repliesListHtml = post.replies.map(reply => `
                        <div class="reply-item ${reply.you ? 'you-reply' : ''}">
                            <span class="reply-author">${reply.author}:</span>
                            <span class="reply-body">${reply.body}</span>
                        </div>
                    `).join('');
                    
                    repliesHtml = `
                        <div class="replies-section">
                            <div class="replies-title">Replies (${post.replies.length})</div>
                            <div class="replies-list">${repliesListHtml}</div>
                            <div class="reply-input-group">
                                <input type="text" class="reply-input" placeholder="Write a reply..." data-post-id="${post.id}">
                                <button class="btn-blue btn-reply" data-post-id="${post.id}">Reply</button>
                            </div>
                        </div>
                    `;
                } else {
                    repliesHtml = `
                        <div class="replies-section">
                            <div class="replies-title">Replies (0)</div>
                            <div class="reply-input-group">
                                <input type="text" class="reply-input" placeholder="Write a reply..." data-post-id="${post.id}">
                                <button class="btn-blue btn-reply" data-post-id="${post.id}">Reply</button>
                            </div>
                        </div>
                    `;
                }

                postCard.innerHTML = `
                    <h3 class="post-title">${escapeHTML(post.title)}</h3>
                    <p class="post-body">${escapeHTML(post.body)}</p>
                    <div class="post-meta">
                        <span>👤 ${escapeHTML(post.author)}</span>
                        <span>⏰ ${escapeHTML(post.time)}</span>
                    </div>
                    ${repliesHtml}
                `;
                
                postsList.appendChild(postCard);
            });

            setupReplyEventListeners();
        };

        const escapeHTML = (str) => {
            if (!str) return '';
            return str.replace(/[&<>'"]/g, 
                tag => ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                }[tag] || tag)
            );
        };

        // Create new post
        const btnPost = document.getElementById('btnPost');
        const postTitleInput = document.getElementById('postTitle');
        const postBodyInput = document.getElementById('postBody');

        if (btnPost && postTitleInput && postBodyInput) {
            btnPost.addEventListener('click', () => {
                const title = postTitleInput.value.trim();
                const body = postBodyInput.value.trim();

                if (!title || !body) {
                    alert('Please enter both a title and details for your post.');
                    return;
                }

                const postData = {
                    title: title,
                    body: body,
                    author: currentUser.username,
                    time: 'Just now'
                };

                fetch('/api/forum/posts.js', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(postData)
                })
                .then(res => {
                    if (!res.ok) throw new Error('Failed to create post');
                    return res.json();
                })
                .then(() => {
                    postTitleInput.value = '';
                    postBodyInput.value = '';
                    fetchAndRenderPosts();
                })
                .catch(err => {
                    alert(err.message);
                });
            });
        }

        const setupReplyEventListeners = () => {
            const replyBtns = document.querySelectorAll('.btn-reply');
            replyBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const postId = e.target.getAttribute('data-post-id');
                    const inputField = document.querySelector(`.reply-input[data-post-id="${postId}"]`);
                    submitReply(postId, inputField);
                });
            });

            const replyInputs = document.querySelectorAll('.reply-input');
            replyInputs.forEach(input => {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const postId = e.target.getAttribute('data-post-id');
                        submitReply(postId, e.target);
                    }
                });
            });
        };

        const submitReply = (postId, inputField) => {
            const replyText = inputField.value.trim();
            if (!replyText) return;

            const replyData = {
                author: currentUser.username,
                body: replyText,
                you: true
            };

            fetch(`/api/forum/posts/replies.js?postId=${postId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(replyData)
            })
            .then(res => {
                if (!res.ok) throw new Error('Failed to submit reply');
                return res.json();
            })
            .then(() => {
                fetchAndRenderPosts();
            })
            .catch(err => {
                alert(err.message);
            });
        };

        fetchAndRenderPosts();
    }

    // -----------------------------------------------------------------
    // 3. Register Page Submission to Backend
    // -----------------------------------------------------------------
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const role = document.querySelector('input[name="role"]:checked').value;

            const userData = { username, email, password, role };

            fetch('/api/auth/register.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(err => { throw new Error(err.message || 'Registration failed'); });
                }
                return res.json();
            })
            .then(data => {
                // Save user info in sessionStorage for the forum session
                sessionStorage.setItem('cc_user', JSON.stringify({ username, role }));
                alert(`Registration Successful!\nWelcome to Campus Connect, ${username}!`);
                window.location.href = 'forum.html';
            })
            .catch(err => {
                alert(`Error: ${err.message}`);
            });
        });
    }
});
