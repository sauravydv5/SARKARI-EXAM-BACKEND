const LatestJob = require("../model/latestjob");
const slugify = require("slugify");

// ===============================
// Create Latest Job
// POST /api/jobs
// ===============================
const createLatestJob = async (req, res) => {
  try {
    const body = { ...req.body };

    body.slug = slugify(body.title, {
      lower: true,
      strict: true,
      trim: true,
    });

    const existing = await LatestJob.findOne({ slug: body.slug });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Job already exists.",
      });
    }

    const job = await LatestJob.create(body);

    res.status(201).json({
      success: true,
      message: "Job created successfully.",
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Get All Jobs
// GET /api/jobs
// ===============================
const getLatestJobs = async (req, res) => {
  try {
    const jobs = await LatestJob.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: jobs.length,
      data: jobs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Get Single Job
// GET /api/jobs/:slug
// ===============================
const getLatestJobBySlug = async (req, res) => {
  try {
    const job = await LatestJob.findOne({
      slug: req.params.slug,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Update Job
// PUT /api/jobs/:id
// ===============================
const updateLatestJob = async (req, res) => {
  try {
    const body = { ...req.body };

    if (body.title) {
      body.slug = slugify(body.title, {
        lower: true,
        strict: true,
        trim: true,
      });
    }

    const job = await LatestJob.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job updated successfully.",
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Delete Job
// DELETE /api/jobs/:id
// ===============================
const deleteLatestJob = async (req, res) => {
  try {
    const job = await LatestJob.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createLatestJob,
  getLatestJobs,
  getLatestJobBySlug,
  updateLatestJob,
  deleteLatestJob,
};