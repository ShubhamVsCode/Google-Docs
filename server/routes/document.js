const express = require("express");
const documentController = require("../controllers/documentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware.authenticate, documentController.create);
router.get("/:id", authMiddleware.authenticate, documentController.getById);
router.put("/:id", authMiddleware.authenticate, documentController.update);
router.delete("/:id", authMiddleware.authenticate, documentController.remove);

module.exports = router;
