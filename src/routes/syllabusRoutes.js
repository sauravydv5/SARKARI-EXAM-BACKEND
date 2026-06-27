const express = require("express");

const {
  createSyllabus,
  getSyllabus,
  getSingleSyllabus,
  updateSyllabus,
  deleteSyllabus,
} = require("../controllers/syllabusController");

const router = express.Router();

router.post("/", createSyllabus);
router.get("/", getSyllabus);
router.get("/:slug", getSingleSyllabus);
router.put("/:id", updateSyllabus);
router.delete("/:id", deleteSyllabus);

module.exports = router;