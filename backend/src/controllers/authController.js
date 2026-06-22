const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOtpEmail } = require("../utils/mail");
const OTP = require("../models/Otp");

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.toLowerCase();

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const isUser = await User.findOne({
      email: normalizedEmail,
    });

    if (isUser) {
      return res.status(400).json({
        message: "User Already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(password, salt);

    const allowedRoles = ["user", "admin"];

    const selectedRole = allowedRoles.includes(req.body.role)
      ? req.body.role
      : "user";

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashPassword,
      role: selectedRole,
      isVerified: false,
    });
    const otp = generateOtp();

    console.log(`Generated OTP For: ${user.email} is ${otp}`);

    await OTP.deleteMany({
      email: user.email,
      action: "account_verification",
    });

    await OTP.create({
      email: user.email,
      otp,
      action: "account_verification",
    });

    await sendOtpEmail(user.email, user.name, otp, "account_verification");

    return res.status(201).json({
      message: "User Registered Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Registration Error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(400).json({
        message: "User Not Found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    if (!user.isVerified && user.role === "user") {
      const otp = generateOtp();

      await OTP.deleteMany({
        email: user.email,
        action: "account_verification",
      });

      await OTP.create({
        email: user.email,
        otp,
        action: "account_verification",
      });

      await sendOtpEmail(user.email, user.name, otp, "account_verification");

      return res.status(400).json({
        message: "Account not verified. OTP sent to your email.",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      message: "Login Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Login Error",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase();

    const record = await OTP.findOne({
      email: normalizedEmail,
      otp,
      action: "account_verification",
    });

    if (!record) {
      return res.status(400).json({
        message: "Invalid or Expired OTP",
      });
    }

    const user = await User.findOneAndUpdate(
      {
        email: normalizedEmail,
      },
      {
        isVerified: true,
      },
      {
        new: true,
      },
    );

    await OTP.deleteMany({
      email: normalizedEmail,
      action: "account_verification",
    });

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      message: "Account Verified Successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "OTP Verification Error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
};
