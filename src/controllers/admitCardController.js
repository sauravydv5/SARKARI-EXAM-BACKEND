const AdmitCard = require("../model/AdmitCard");
const slugify = require("slugify");
const { normalizePayload } = require("../utils/normalizeRequest");

// Create
const createAdmitCard = async (req, res) => {
  try {
    const body = normalizePayload(req.body);

    body.slug = body.slug || slugify(body.title, {
      lower: true,
      strict: true,
    });

    const admitCard = await AdmitCard.create(body);

    res.status(201).json({
      success: true,
      data: admitCard,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get All
const getAdmitCards = async (req, res) => {
  try {
    const admitCards = await AdmitCard.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: admitCards,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get One
const getAdmitCard = async (req, res) => {
  try {
    const admitCard = await AdmitCard.findOne({
      slug: req.params.slug,
    });

    if (!admitCard) {
      return res.status(404).json({
        success: false,
        message: "Admit Card not found",
      });
    }

    res.json({
      success: true,
      data: admitCard,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update
const updateAdmitCard = async (req, res) => {
  try {
    const body = normalizePayload(req.body);
    const admitCard = await AdmitCard.findByIdAndUpdate(
      req.params.id,
      body,
      {
        new: true,
      }
    );

    res.json({
      success: true,
      data: admitCard,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete
const deleteAdmitCard = async (req, res) => {
  try {
    await AdmitCard.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Admit Card Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createAdmitCard,
  getAdmitCards,
  getAdmitCard,
  updateAdmitCard,
  deleteAdmitCard,
};
