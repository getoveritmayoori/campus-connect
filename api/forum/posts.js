const { connectToDatabase } = require('../../lib/mongodb');

// Default seed posts when the collection is empty
const DEFAULT_POSTS = [
    {
        title: "How to prepare for coding interviews?",
        body: "I'm in 2nd year and want to start preparing for placements. Any tips for a beginner?",
        author: "Aarav Sharma",
        time: "2h ago",
        replies: [
            { author: "Neha Patel", body: "Try LeetCode & CS50 to start!", isYou: false }
        ]
    },
    {
        title: "Best tools for project collaboration?",
        body: "What tools do you all use for team projects — GitHub, Notion, or something else?",
        author: "Riya Singh",
        time: "5h ago",
        replies: []
    }
];

module.exports = async function handler(req, res) {
    try {
        const { db } = await connectToDatabase();
        const posts = db.collection('posts');

        if (req.method === 'GET') {
            // Seed default posts if collection is empty
            const count = await posts.countDocuments();
            if (count === 0) {
                await posts.insertMany(DEFAULT_POSTS.map(p => ({ ...p, createdAt: new Date() })));
            }

            const allPosts = await posts.find({}).sort({ _id: -1 }).toArray();

            // Map _id to id for frontend compatibility
            const mapped = allPosts.map(p => ({ ...p, id: p._id.toString() }));
            return res.status(200).json(mapped);

        } else if (req.method === 'POST') {
            const { title, body, author, time } = req.body;

            if (!title || !title.trim() || !body || !body.trim() || !author || !author.trim()) {
                return res.status(400).json({ status: 'error', message: 'Title, body, and author are required.' });
            }

            const newPost = {
                title: title.trim(),
                body: body.trim(),
                author: author.trim(),
                time: time || 'Just now',
                replies: [],
                createdAt: new Date()
            };

            const result = await posts.insertOne(newPost);
            newPost._id = result.insertedId;
            newPost.id = result.insertedId.toString();

            return res.status(200).json(newPost);
        } else {
            return res.status(405).json({ status: 'error', message: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Posts error:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};
