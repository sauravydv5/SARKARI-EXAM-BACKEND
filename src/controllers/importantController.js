const Important = require("../model/Important");
const slugify = require("slugify");
const { normalizePayload } = require("../utils/normalizeRequest");

// Create
const createImportant = async (req, res) => {
  try {
    const body = normalizePayload(req.body);

    body.slug = body.slug || slugify(body.title, {
      lower: true,
      strict: true,
    });

    const important = await Important.create(body);

    res.status(201).json({
      success: true,
      data: important,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get All
const getImportant = async (req, res) => {
  try {
    const important = await Important.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: important,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get One
const getSingleImportant = async (req, res) => {
  try {
    const important = await Important.findOne({
      slug: req.params.slug,
    });

    if (!important) {
      return res.status(404).json({
        success: false,
        message: "Important notice not found",
      });
    }

    res.json({
      success: true,
      data: important,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update
const updateImportant = async (req, res) => {
  try {
    const body = normalizePayload(req.body);
    const important = await Important.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );

    res.json({
      success: true,
      data: important,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete
const deleteImportant = async (req, res) => {
  try {
    await Important.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Important Notice Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createImportant,
  getImportant,
  getSingleImportant,
  updateImportant,
  deleteImportant,
};
