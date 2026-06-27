const mongoose = require("mongoose");

const latestJobSchema = new mongoose.Schema(
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

    organization: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      default: "All India",
    },

    postDate: {
      type: Date,
      required: true,
    },

    lastDate: {
      type: Date,
      required: true,
    },

    examDate: {
      type: String,
      default: "",
    },

    vacancy: {
      type: String,
      default: "",
    },

    qualification: {
      type: String,
      default: "",
    },

    ageLimit: {
      type: String,
      default: "",
    },

    salary: {
      type: String,
      default: "",
    },

    // ✅ Application Fee
    applicationFee: {
      general: {
        type: String,
        default: "",
      },
      obc: {
        type: String,
        default: "",
      },
      ews: {
        type: String,
        default: "",
      },
      sc: {
        type: String,
        default: "",
      },
      st: {
        type: String,
        default: "",
      },
      female: {
        type: String,
        default: "",
      },
      ph: {
        type: String,
        default: "",
      },
      paymentMode: {
        type: String,
        default: "",
      },
    },

    officialWebsite: {
      type: String,
      default: "",
    },

    notificationPdf: {
      type: String,
      default: "",
    },

    applyLink: {
      type: String,
      default: "",
    },

    featured: {
      type: Boolean,
      default: false,
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
  mongoose.models.LatestJob ||
  mongoose.model("LatestJob", latestJobSchema);