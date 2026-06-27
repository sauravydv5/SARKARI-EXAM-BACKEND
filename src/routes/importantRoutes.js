const express = require("express");

const {
  createImportant,
  getImportant,
  getSingleImportant,
  updateImportant,
  deleteImportant,
} = require("../controllers/importantController");

const router = express.Router();

router.post("/", createImportant);
router.get("/", getImportant);
router.get("/:slug", getSingleImportant);
router.put("/:id", updateImportant);
router.delete("/:id", deleteImportant);

module.exports = router;