const Admission = require("../model/Admission");
const slugify = require("slugify");
const { normalizePayload } = require("../utils/normalizeRequest");

// Create
const createAdmission = async (req, res) => {
  try {
    const body = normalizePayload(req.body);

    body.slug = body.slug || slugify(body.title, {
      lower: true,
      strict: true,
    });

    const admission = await Admission.create(body);

    res.status(201).json({
      success: true,
      data: admission,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get All
const getAdmissions = async (req, res) => {
  try {
    const admissions = await Admission.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: admissions,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Single
const getAdmission = async (req, res) => {
  try {
    const admission = await Admission.findOne({
      slug: req.params.slug,
    });

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: "Admission not found",
      });
    }

    res.json({
      success: true,
      data: admission,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update
const updateAdmission = async (req, res) => {
  try {
    const body = normalizePayload(req.body);
    const admission = await Admission.findByIdAndUpdate(
      req.params.id,
      body,
      {
        new: true,
      }
    );

    res.json({
      success: true,
      data: admission,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete
const deleteAdmission = async (req, res) => {
  try {
    await Admission.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Admission Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createAdmission,
  getAdmissions,
  getAdmission,
  updateAdmission,
  deleteAdmission,
};
