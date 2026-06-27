const Result = require("../model/Result");
const slugify = require("slugify");
const { normalizePayload } = require("../utils/normalizeRequest");

// Create Result
const createResult = async (req, res) => {
  try {
    const body = normalizePayload(req.body);

    body.slug = body.slug || slugify(body.title || "", {
      lower: true,
      strict: true,
    });

    const result = await Result.create(body);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Create Result Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Results
const getResults = async (req, res) => {
  try {
    const results = await Result.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Result
const getResult = async (req, res) => {
  try {
    const result = await Result.findOne({
      slug: req.params.slug,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Result
const updateResult = async (req, res) => {
  try {
    const body = normalizePayload(req.body);
    const result = await Result.findByIdAndUpdate(
      req.params.id,
      body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Result
const deleteResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Result deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createResult,
  getResults,
  getResult,
  updateResult,
  deleteResult,
};
