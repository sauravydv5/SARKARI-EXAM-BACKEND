const Certificate = require("../model/Certificate");
const slugify = require("slugify");
const { normalizePayload } = require("../utils/normalizeRequest");

// Create
const createCertificate = async (req, res) => {
  try {
    const body = normalizePayload(req.body);

    body.slug = body.slug || slugify(body.title, {
      lower: true,
      strict: true,
    });

    const certificate = await Certificate.create(body);

    res.status(201).json({
      success: true,
      data: certificate,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get All
const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: certificates,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get One
const getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      slug: req.params.slug,
    });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found",
      });
    }

    res.json({
      success: true,
      data: certificate,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update
const updateCertificate = async (req, res) => {
  try {
    const body = normalizePayload(req.body);
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    );

    res.json({
      success: true,
      data: certificate,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete
const deleteCertificate = async (req, res) => {
  try {
    await Certificate.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Certificate Deleted Successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createCertificate,
  getCertificates,
  getCertificate,
  updateCertificate,
  deleteCertificate,
};
