const { connectToDatabase } = require('../../../../lib/mongodb');
const { ObjectId } = require('mongodb');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method not allowed' });
    }

    try {
        const { postId } = req.query;
        const { author, body } = req.body;

        if (!author || !author.trim() || !body || !body.trim()) {
            return res.status(400).json({ status: 'error', message: 'Reply author and body are required.' });
        }

        const { db } = await connectToDatabase();
        const posts = db.collection('posts');

        // Find the post
        let filter;
        try {
            filter = { _id: new ObjectId(postId) };
        } catch (e) {
            return res.status(404).json({ status: 'error', message: 'Post not found.' });
        }

        const post = await posts.findOne(filter);
        if (!post) {
            return res.status(404).json({ status: 'error', message: 'Post not found.' });
        }

        // Add reply
        const reply = { author: author.trim(), body: body.trim(), isYou: req.body.you || false };
        await posts.updateOne(filter, { $push: { replies: reply } });

        // Return updated post
        const updatedPost = await posts.findOne(filter);
        updatedPost.id = updatedPost._id.toString();
        return res.status(200).json(updatedPost);
    } catch (error) {
        console.error('Reply error:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};
