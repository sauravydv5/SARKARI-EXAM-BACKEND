const express = require("express");

const {
  createLatestJob,
  getLatestJobs,
  getLatestJobBySlug,
  updateLatestJob,
  deleteLatestJob,
} = require("../controllers/latestJobController");

const router = express.Router();

router.post("/", createLatestJob);
router.get("/", getLatestJobs);
router.get("/:slug", getLatestJobBySlug);
router.put("/:id", updateLatestJob);
router.delete("/:id", deleteLatestJob);

module.exports = router;