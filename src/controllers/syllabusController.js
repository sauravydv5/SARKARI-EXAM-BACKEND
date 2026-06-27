const Syllabus = require("../model/Syllabus");
const slugify = require("slugify");
const { normalizePayload } = require("../utils/normalizeRequest");

// Create
const createSyllabus = async (req, res) => {
  try {
    const body = normalizePayload(req.body);

    body.slug = body.slug || slugify(body.title, {
      lower: true,
      strict: true,
    });

    const syllabus = await Syllabus.create(body);

    res.status(201).json({
      success: true,
      data: syllabus,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get All
const getSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: syllabus,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Single
const getSingleSyllabus = async (req, res) => {
  try {
    const syllabus = await Syllabus.findOne({
      slug: req.params.slug,
    });

    if (!syllabus) {
      return res.status(404).json({
        success: false,
        message: "Syllabus not found",
      });
    }

    res.json({
      success: true,
      data: syllabus,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update
const updateSyllabus = async (req, res) => {
  try {
    const body = normalizePayload(req.body);
    const syllabus = await Syllabus.findByIdAndUpdate(
      req.params.id,
      body,
      {
        new: true,
      }
    );

    res.json({
      success: true,
      data: syllabus,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete
const deleteSyllabus = async (req, res) => {
  try {
    await Syllabus.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Syllabus Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createSyllabus,
  getSyllabus,
  getSingleSyllabus,
  updateSyllabus,
  deleteSyllabus,
};
