const express = require("express");

const {
  createCertificate,
  getCertificates,
  getCertificate,
  updateCertificate,
  deleteCertificate,
} = require("../controllers/certificateController");

const router = express.Router();

router.post("/", createCertificate);
router.get("/", getCertificates);
router.get("/:slug", getCertificate);
router.put("/:id", updateCertificate);
router.delete("/:id", deleteCertificate);

module.exports = router;