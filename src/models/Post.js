import mongoose from 'mongoose';

const CATEGORIES = [
  'latest-job',
  'result',
  'admit-card',
  'answer-key',
  'syllabus',
  'admission',
  'important',
  'certificate',
];

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: { type: String, required: true, enum: CATEGORIES, index: true },
    shortDescription: { type: String, default: '' },
    content: { type: String, default: '' },
    organization: { type: String, default: '', index: true },
    department: { type: String, default: '' },
    postName: { type: String, default: '' },
    totalVacancies: { type: Number, default: 0 },
    vacancyDetails: { type: String, default: '' },
    qualification: { type: String, default: '' },
    ageLimit: { type: String, default: '' },
    applicationFee: { type: String, default: '' },
    salary: { type: String, default: '' },
    selectionProcess: { type: String, default: '' },
    documentsRequired: { type: String, default: '' },
    howToApply: { type: String, default: '' },
    importantDates: {
      notificationDate: { type: String, default: '' },
      startDate: { type: String, default: '' },
      lastDate: { type: String, default: '' },
      examDate: { type: String, default: '' },
      resultDate: { type: String, default: '' },
      admitCardDate: { type: String, default: '' },
    },
    links: {
      applyOnline: { type: String, default: '' },
      officialNotification: { type: String, default: '' },
      officialWebsite: { type: String, default: '' },
      downloadAdmitCard: { type: String, default: '' },
      checkResult: { type: String, default: '' },
      answerKey: { type: String, default: '' },
    },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

postSchema.index({ title: 'text', shortDescription: 'text', organization: 'text', postName: 'text' });
postSchema.index({ category: 1, publishedAt: -1 });

export const POST_CATEGORIES = CATEGORIES;
export default mongoose.model('Post', postSchema);
