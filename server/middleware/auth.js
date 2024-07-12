// const jwt = require("jsonwebtoken");
// const { JWT_SECRET } = require("../config/keys");
// const userModel = require("../models/users");

// exports.loginCheck = (req, res, next) => {
//   try {
//     let token = req.headers.token;
//     token = token.replace("Bearer ", "");
//     decode = jwt.verify(token, JWT_SECRET);
//     req.userDetails = decode;
//     next();
//   } catch (err) {
//     res.json({
//       error: "You must be logged in",
//     });
//   }
// };

// exports.isAuth = (req, res, next) => {
//   let { loggedInUserId } = req.body;
//   if (
//     !loggedInUserId ||
//     !req.userDetails._id ||
//     loggedInUserId != req.userDetails._id
//   ) {
//     res.status(403).json({ error: "You are not authenticate" });
//   }
//   next();
// };

// exports.isAdmin = async (req, res, next) => {
//   try {
//     let reqUser = await userModel.findById(req.body.loggedInUserId);
//     // If user role 0 that's mean not admin it's customer
//     if (reqUser.userRole === 0) {
//       res.status(403).json({ error: "Access denied" });
//     }
//     next();
//   } catch {
//     res.status(404);
//   }
// };


const jwt = require('jsonwebtoken');
const userModel = require('../models/users');

exports.loginCheck = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ error: 'You must be logged in' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userDetails = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

exports.isAuth = (req, res, next) => {
    const { userId } = req.session; // Check session userId
    if (!userId || userId !== req.userDetails.userId) {
        return res.status(403).json({ error: 'You are not authenticated' });
    }
    next();
};

exports.isAdmin = async (req, res, next) => {
    try {
        const reqUser = await userModel.findById(req.session.userId);
        if (reqUser.userRole === 0) {
            return res.status(403).json({ error: 'Access denied' });
        }
        next();
    } catch {
        res.status(404).json({ error: 'User not found' });
    }
};
