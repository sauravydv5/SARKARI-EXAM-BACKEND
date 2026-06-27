const express = require("express");

const {
  createAdmitCard,
  getAdmitCards,
  getAdmitCard,
  updateAdmitCard,
  deleteAdmitCard,
} = require("../controllers/admitCardController");

const router = express.Router();

router.post("/", createAdmitCard);

router.get("/", getAdmitCards);

router.get("/:slug", getAdmitCard);

router.put("/:id", updateAdmitCard);

router.delete("/:id", deleteAdmitCard);

module.exports = router;