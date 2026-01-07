// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Please authenticate' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({
            _id: decoded._id,
            'tokens.token': token
        });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).json({ 
            error: 'Please authenticate',
            solution: 'Ensure you are logged in and your token is valid'
        });
    }
};

const admin = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ 
            error: 'Admin access required',
            requiredRole: 'Administrator'
        });
    }
    next();
};

module.exports = { auth, admin };