const express = require("express");

const {
  createAdmission,
  getAdmissions,
  getAdmission,
  updateAdmission,
  deleteAdmission,
} = require("../controllers/admissionController");

const router = express.Router();

router.post("/", createAdmission);
router.get("/", getAdmissions);
router.get("/:slug", getAdmission);
router.put("/:id", updateAdmission);
router.delete("/:id", deleteAdmission);

module.exports = router;