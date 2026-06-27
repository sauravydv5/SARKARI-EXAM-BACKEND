const AnswerKey = require("../model/AnswerKey");
const slugify = require("slugify");
const { normalizePayload } = require("../utils/normalizeRequest");

// Create
const createAnswerKey = async (req, res) => {
  try {
    const body = normalizePayload(req.body);

    body.slug = body.slug || slugify(body.title, {
      lower: true,
      strict: true,
    });

    const answerKey = await AnswerKey.create(body);

    res.status(201).json({
      success: true,
      data: answerKey,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get All
const getAnswerKeys = async (req, res) => {
  try {
    const answerKeys = await AnswerKey.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: answerKeys,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get Single
const getAnswerKey = async (req, res) => {
  try {
    const answerKey = await AnswerKey.findOne({
      slug: req.params.slug,
    });

    if (!answerKey) {
      return res.status(404).json({
        success: false,
        message: "Answer Key not found",
      });
    }

    res.json({
      success: true,
      data: answerKey,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update
const updateAnswerKey = async (req, res) => {
  try {
    const body = normalizePayload(req.body);
    const answerKey = await AnswerKey.findByIdAndUpdate(
      req.params.id,
      body,
      {
        new: true,
      }
    );

    res.json({
      success: true,
      data: answerKey,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete
const deleteAnswerKey = async (req, res) => {
  try {
    await AnswerKey.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Answer Key Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createAnswerKey,
  getAnswerKeys,
  getAnswerKey,
  updateAnswerKey,
  deleteAnswerKey,
};
