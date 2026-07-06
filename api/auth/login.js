const { connectToDatabase } = require('../../lib/mongodb');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ status: 'error', message: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: 'error', message: 'Email and password are required.' });
        }

        const { db } = await connectToDatabase();
        const users = db.collection('users');

        const user = await users.findOne({ email: email.trim() });
        if (!user || user.password !== password) {
            return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
        }

        return res.status(200).json({
            status: 'success',
            message: 'Login successful!',
            user: { id: user._id, username: user.username, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
};
