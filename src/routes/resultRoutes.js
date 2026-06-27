const express = require("express");

const router = express.Router();

const {
  createResult,
  getResults,
  getResult,
  updateResult,
  deleteResult,
} = require("../controllers/resultController");

router.post("/", createResult);

router.get("/", getResults);

router.get("/:slug", getResult);

router.put("/:id", updateResult);

router.delete("/:id", deleteResult);

module.exports = router;