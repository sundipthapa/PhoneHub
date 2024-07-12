const jwt = require('jsonwebtoken');

const generateToken = (req, res, user) => {
    const userId = user._id;
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: req.body.remember ? '365d' : '24h' // Corrected the expiration format
    });

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: req.body.remember ? 365 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    };

    // Store user session ID
    req.session.userId = userId;

    res.status(200).cookie('jwt', token, options).json({
        success: true,
        token: token,
        user: user
    });
};

module.exports = { generateToken };
