const userModel = require("../models/users");
const bcrypt = require("bcryptjs");
const passwordValidator = require('password-validator');
const schema = new passwordValidator();


// Define your password schema
schema
  .is().min(8)                                    // Minimum length 8
  .is().max(12)                                   // Maximum length 12
  .has().uppercase()                             // Must have uppercase letters
  .has().lowercase()                             // Must have lowercase letters
  .has().digits()                                // Must have digits
  .has().symbols()                               // Must have special characters
  // .withMessage('Password must be between 8 and 12 characters long and include uppercase, lowercase, numbers, and symbols.')

class User {
  async getAllUser(req, res) {
    try {
      let Users = await userModel
        .find({})
        .populate("allProduct.id", "pName pImages pPrice")
        .populate("user", "name email")
        .sort({ _id: -1 });
      if (Users) {
        return res.json({ Users });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getSingleUser(req, res) {
    let { uId } = req.body;
    if (!uId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let User = await userModel
          .findById(uId)
          .select("name email phoneNumber userImage updatedAt createdAt");
        if (User) {
          return res.json({ User });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async postAddUser(req, res) {
    let { allProduct, user, amount, transactionId, address, phone } = req.body;
    if (
      !allProduct ||
      !user ||
      !amount ||
      !transactionId ||
      !address ||
      !phone
    ) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        let newUser = new userModel({
          allProduct,
          user,
          amount,
          transactionId,
          address,
          phone,
        });
        let save = await newUser.save();
        if (save) {
          return res.json({ success: "User created successfully" });
        }
      } catch (err) {
        return res.json({ error: error });
      }
    }
  }

  async postEditUser(req, res) {
    let { uId, name, phoneNumber } = req.body;
    if (!uId || !name || !phoneNumber) {
      return res.json({ message: "All filled must be required" });
    } else {
      let currentUser = userModel.findByIdAndUpdate(uId, {
        name: name,
        phoneNumber: phoneNumber,
        updatedAt: Date.now(),
      });
      currentUser.exec((err, result) => {
        if (err) console.log(err);
        return res.json({ success: "User updated successfully" });
      });
    }
  }

  async getDeleteUser(req, res) {
    let { oId, status } = req.body;
    if (!oId || !status) {
      return res.json({ message: "All filled must be required" });
    } else {
      let currentUser = userModel.findByIdAndUpdate(oId, {
        status: status,
        updatedAt: Date.now(),
      });
      currentUser.exec((err, result) => {
        if (err) console.log(err);
        return res.json({ success: "User updated successfully" });
      });
    }
  }




  async changePassword(req, res) {
    let { uId, oldPassword, newPassword } = req.body;

    if (!uId || !oldPassword || !newPassword) {
      return res.json({ message: "All fields are required" });
    }

    const user = await userModel.findOne({ _id: uId });
    if (!user) {
      return res.json({ error: "Invalid user" });
    }

    const oldPassCheck = await bcrypt.compare(oldPassword, user.password);
    if (!oldPassCheck) {
      return res.json({ error: "Old password is incorrect" });
    }

    // Validate new password
    const validationErrors = schema.validate(newPassword, { list: true });
    if (validationErrors.length > 0) {
      return res.json({ error: validationErrors.join(', ') });
    }

    // Check if new password is in history
    if (user.history && user.history.includes(newPassword)) {
      return res.json({ error: "New password cannot be one of the last 5 used passwords" });
    }

    // Update password and history
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    user.history = [hashedPassword, ...user.history.slice(0, 4)]; // Keep last 5 passwords
    user.password = hashedPassword;
    user.lastPasswordChange = new Date();

    try {
      await user.save();
      return res.json({ success: "Password updated successfully" });
    } catch (err) {
      console.log(err);
      return res.json({ error: "An error occurred" });
    }
  }

}
const ordersController = new User();
module.exports = ordersController;
