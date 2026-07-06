const { connectToDatabase } = require('../../lib/mongodb');

module.exports = async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method not allowed' });
    }

    try {
        const { username, email, password, role } = req.body;

        // Validation
        if (!username || !username.trim() || !email || !email.trim() || !password || !password.trim()) {
            return res.status(400).json({ status: 'error', message: 'All fields are required.' });
        }

        const { db } = await connectToDatabase();
        const users = db.collection('users');

        // Check if email already exists
        const existing = await users.findOne({ email: email.trim() });
        if (existing) {
            return res.status(400).json({ status: 'error', message: 'Email is already registered.' });
        }

        // Save user
        const newUser = {
            username: username.trim(),
            email: email.trim(),
            password: password,
            role: role || 'junior',
            createdAt: new Date()
        };

        const result = await users.insertOne(newUser);
        newUser._id = result.insertedId;

        return res.status(200).json({
            status: 'success',
            message: 'Registration successful!',
            user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role }
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};
