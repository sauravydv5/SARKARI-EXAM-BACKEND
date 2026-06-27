const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
    },

    downloadUrl: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Draft", "Live", "Closed"],
      default: "Draft",
    },

    isLatest: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Certificate ||
  mongoose.model("Certificate", certificateSchema);
