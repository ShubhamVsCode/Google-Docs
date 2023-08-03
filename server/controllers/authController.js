const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const { createToken } = require("../utils/userAuthUtils");

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, Email and Password is required!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    console.log(user);
    const token = createToken(user);
    user.password = undefined;

    res.status(201).cookie("token", token, { httpOnly: true }).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to register user", error });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and Password is required!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken(user);
    user.password = undefined;

    res
      .status(200)
      .cookie("token", token, { httpOnly: true })
      .json({ message: "User logged in successfully", user, token });
  } catch (error) {
    res.status(500).json({ message: "Failed to login user", error });
  }
}

async function logout(req, res) {
  return res.clearCookie("token").json({ message: "Logged out successfully." });
}

async function checkUser(req, res) {
  if (!req.userId) {
    return res.status(403).json({ message: "User not logged in" });
  }

  return res.json({ message: "User logged in!", userId: req.userId });
}

async function getUser(req, res) {
  const { withDocument } = req.query;

  if (!req.userId) {
    return res.status(403).json({ message: "User not logged in" });
  }

  try {
    let user;

    if (withDocument) {
      user = await User.findById(req.userId)
        .select("-password")
        .populate("documents")
        .populate("sharedDocuments.document")
        .select("sharedDocuments.document.title");
    } else {
      user = await User.findById(req.userId).select("-password");
    }

    console.log(user);
    return res.json({ message: "User found!", user: user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get user", error });
  }
}

// getSharedDocuments
async function getSharedDocuments(req, res) {
  if (!req.userId) {
    return res.status(403).json({ message: "User not logged in" });
  }

  try {
    const user = await User.findById(req.userId).populate("sharedDocuments");
    const sharedDocuments = user.sharedDocuments;

    return res.json({ message: "Shared documents found!", sharedDocuments });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to get shared documents", error });
  }
}

module.exports = {
  register,
  login,
  logout,
  checkUser,
  getUser,
  getSharedDocuments,
};
