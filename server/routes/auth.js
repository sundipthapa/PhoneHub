const express = require("express");
const router = express.Router();
const authController = require("../controller/auth");
const { loginCheck, isAuth, isAdmin } = require("../middleware/auth");
const csurf = require('csurf');

// CSRF Protection middleware
const csrfProtection = csurf({ cookie: true });

router.get('/get-csrf-token', csrfProtection,(req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

router.post("/isadmin",csrfProtection, authController.isAdmin);
router.post("/signup", csrfProtection, authController.postSignup);
router.post("/signin",csrfProtection, authController.postSignin);
router.post("/user", loginCheck, isAuth, isAdmin, authController.allUser);


router.post('/reset-password/request', authController.resetPasswordRequest);
router.post('/reset-password/reset/:id/:token',   authController.resetPassword);
module.exports = router;
