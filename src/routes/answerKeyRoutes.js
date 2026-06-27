const express = require("express");

const {
  createAnswerKey,
  getAnswerKeys,
  getAnswerKey,
  updateAnswerKey,
  deleteAnswerKey,
} = require("../controllers/answerKeyController");

const router = express.Router();

router.post("/", createAnswerKey);
router.get("/", getAnswerKeys);
router.get("/:slug", getAnswerKey);
router.put("/:id", updateAnswerKey);
router.delete("/:id", deleteAnswerKey);

module.exports = router;