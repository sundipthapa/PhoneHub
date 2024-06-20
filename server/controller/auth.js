

const { toTitleCase, validateEmail } = require("../config/function");
const bcrypt = require("bcryptjs");
const userModel = require("../models/users");
const { generateToken } = require('../utils/token'); // Corrected import
const {transporter} =require('../utils/email')
const MAX_FAILED_ATTEMPTS = 3;
const LOCK_TIME = 10 * 60 * 1000; // 30 minutes

// Utility function to check if the account is locked
const isAccountLocked = (user) => {
  return user.lockUntil && user.lockUntil > Date.now();
};

// Utility function to check if the password has expired
const isPasswordExpired = (user) => {
  const PASSWORD_EXPIRY_DAYS = 1; //90days
  const passwordExpiryTime = new Date(user.lastPasswordChange).getTime() + PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() > passwordExpiryTime;
};
const logoutUser = (req, res) => {
  res.clearCookie('jwt', { httpOnly: true });

  res.status(200).json({ message: 'Logout successful' });
};

class Auth {
  async isAdmin(req, res) {
    let { loggedInUserId } = req.body;
    try {
      let loggedInUserRole = await userModel.findById(loggedInUserId);
      res.json({ role: loggedInUserRole.userRole });
    } catch {
      res.status(404);
    }
  }

  async allUser(req, res) {
    try {
      let allUser = await userModel.find({});
      res.json({ users: allUser });
    } catch {
      res.status(404);
    }
  }
 
  /* User Registration/Signup controller  */

  async  postSignup(req, res) {
    let { name, email, password, cPassword } = req.body;
    let error = {};

    if (!name || !email || !password || !cPassword) {
        error = {
            ...error,
            name: "Field must not be empty",
            email: "Field must not be empty",
            password: "Field must not be empty",
            cPassword: "Field must not be empty",
        };
        return res.json({ error });
    }

    if (name.length < 3 || name.length > 25) {
        error = { ...error, name: "Name must be 3-25 characters" };
        return res.json({ error });
    }

    if (!validateEmail(email)) {
        error = { ...error, email: "Email is not valid" };
        return res.json({ error });
    }

    if (password.length < 8 || password.length > 12) {
        error = { ...error, password: "Password must be 8-12 characters" };
        return res.json({ error });
    }

    // Password complexity regex
    const passwordComplexity = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/;
    if (!passwordComplexity.test(password)) {
        error = { ...error, password: "Password must include uppercase, lowercase, number, and special character" };
        return res.json({ error });
    }

    if (password !== cPassword) {
        error = { ...error, cPassword: "Passwords do not match" };
        return res.json({ error });
    }

    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            error = { ...error, email: "Email already exists" };
            return res.json({ error });
        }

        password = bcrypt.hashSync(password, 10);
        const newUser = new userModel({
            name: toTitleCase(name),
            email,
            password,
            userRole: 0, // 0 for customer
            lastPasswordChange: new Date(),
        });

        await newUser.save();
        generateToken(req, res, newUser._id);
        // Create a session for the new user
        req.session.userId = newUser._id;

        // return res.json({ success: "Account created successfully. Please login" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
  /* User Login/Signin controller  */
  async postSignin(req, res) {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        error: "Fields must not be empty",
      });
    }

    try {
      const user = await userModel.findOne({ email: email });
      if (!user) {
        return res.json({
          error: "Invalid email or password",
        });
      }

      if (isAccountLocked(user)) {
        return res.json({
          error: "Account is locked. Please try again later.",
        });
      }

      if (isPasswordExpired(user)) {
        return res.json({
          error: "Password has expired. Please change your password.",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();
        // Create a session for the logged-in user
        req.session.userId = user._id;
        generateToken(req, res, user);
      } else {
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
          user.lockUntil = Date.now() + LOCK_TIME;
        }
        await user.save();
        return res.json({
          error: "Invalid email or password",
        });
      }
    } catch (err) {
      console.log(err);
      return res.json({
        error: "An error occurred. Please try again later.",
      });
    }
  }


  

  resetPasswordRequest = async (req, res, next) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        res.statusCode = 404;
        throw new Error('User not found!');
      }
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '15m'
      });
      const passwordResetLink = `http://localhost:3000/reset-password/${user._id}/${token}`;
      console.log(passwordResetLink);
      await transporter.sendMail({
        from: `"MERN Shop" ${process.env.EMAIL_FROM}`, // sender address
        to: user.email, // list of receivers
        subject: 'Password Reset', // Subject line
        html: `<p>Hi ${user.name},</p>
  
              <p>We received a password reset request for your account. Click the link below to set a new password:</p>
  
              <p><a href=${passwordResetLink} target="_blank">${passwordResetLink}</a></p>
  
              <p>If you didn't request this, you can ignore this email.</p>
  
              <p>Thanks,<br>
              MERN Shop Team</p>` // html body
      });
  
      res
        .status(200)
        .json({ message: 'Password reset email sent, please check your email.' });
    } catch (error) {
      next(error);
    }
  };
  

  resetPassword = async (req, res, next) => {
    try {
      const { password } = req.body;
      const { id: userId, token } = req.params;
      const user = await User.findById(userId);
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  
      if (!decodedToken) {
        res.statusCode = 401;
        throw new Error('Invalid or expired token');
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: 'Password successfully reset' });
    } catch (error) {
      next(error);
    }
  };
  
  
}

const authController = new Auth();
module.exports = authController;

