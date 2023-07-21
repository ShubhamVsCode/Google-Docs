const express = require("express");
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.get("/checkUser", authenticate, authController.checkUser);
router.get("/user", authenticate, authController.getUser);

module.exports = router;
