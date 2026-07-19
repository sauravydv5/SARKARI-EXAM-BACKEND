import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Post, { POST_CATEGORIES } from '../models/Post.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { slugify, uniqueSlug } from '../utils/slugify.js';
import {
  sanitizePostPayload,
  sanitizeText,
  sanitizeContent,
  sanitizeUrl,
} from '../utils/sanitize.js';

const router = express.Router();

function validate(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => e.msg),
    });
    return false;
  }
  return true;
}

// Public: list posts
router.get(
  '/',
  [
    query('category').optional().isIn(POST_CATEGORIES),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString().isLength({ max: 100 }),
  ],
  async (req, res, next) => {
    try {
      if (!validate(req, res)) return;

      const page = parseInt(req.query.page, 10) || 1;
      const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
      const skip = (page - 1) * limit;

      const filter = { isActive: true };

      if (req.query.category) filter.category = req.query.category;
      if (req.query.featured === 'true') filter.isFeatured = true;

      if (req.query.search) {
        const term = sanitizeText(req.query.search, 100);
        if (term) {
          filter.$text = { $search: term };
        }
      }

      const [posts, total] = await Promise.all([
        Post.find(filter)
          .sort({ publishedAt: -1 })
          .skip(skip)
          .limit(limit)
          .select('-content -howToApply')
          .lean(),
        Post.countDocuments(filter),
      ]);

      res.json({
        success: true,
        data: posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/stats/categories', async (_req, res, next) => {
  try {
    const counts = await Post.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    const map = Object.fromEntries(counts.map((c) => [c._id, c.count]));
    const result = POST_CATEGORIES.map((cat) => ({
      category: cat,
      count: map[cat] || 0,
    }));
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

router.get('/home/sections', async (_req, res, next) => {
  try {
    const limit = 12;
    const sections = {};
    await Promise.all(
      POST_CATEGORIES.map(async (category) => {
        sections[category] = await Post.find({ isActive: true, category })
          .sort({ publishedAt: -1 })
          .limit(limit)
          .select(
            'title slug category organization postName importantDates publishedAt isFeatured totalVacancies'
          )
          .lean();
      })
    );
    res.json({ success: true, data: sections });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/all', protect, adminOnly, async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.category && POST_CATEGORIES.includes(req.query.category)) {
      filter.category = req.query.category;
    }

    const [posts, total] = await Promise.all([
      Post.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    });
  } catch (err) {
    next(err);
  }
});

router.get(
  '/:slug',
  [param('slug').isString().trim().isLength({ min: 1, max: 160 })],
  async (req, res, next) => {
    try {
      if (!validate(req, res)) return;

      const post = await Post.findOneAndUpdate(
        { slug: req.params.slug, isActive: true },
        { $inc: { views: 1 } },
        { new: true }
      ).lean();

      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      const related = await Post.find({
        isActive: true,
        category: post.category,
        _id: { $ne: post._id },
      })
        .sort({ publishedAt: -1 })
        .limit(6)
        .select('title slug category organization publishedAt')
        .lean();

      res.json({ success: true, data: post, related });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/',
  protect,
  adminOnly,
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 300 }),
    body('category').isIn(POST_CATEGORIES).withMessage('Invalid category'),
  ],
  async (req, res, next) => {
    try {
      if (!validate(req, res)) return;

      const payload = sanitizePostPayload(req.body);
      if (!payload.title) {
        return res.status(400).json({ success: false, message: 'Title is required' });
      }
      if (!POST_CATEGORIES.includes(payload.category)) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }

      const base = slugify(payload.title);
      let slug = base || uniqueSlug('post');
      if (await Post.findOne({ slug })) slug = uniqueSlug(base || 'post');

      const post = await Post.create({
        ...payload,
        slug,
        createdBy: req.user.id,
        publishedAt: new Date(),
      });

      res.status(201).json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  }
);

router.put(
  '/:id',
  protect,
  adminOnly,
  [param('id').custom((v) => mongoose.Types.ObjectId.isValid(v))],
  async (req, res, next) => {
    try {
      if (!validate(req, res)) return;

      const updates = {};
      if (req.body.title !== undefined) updates.title = sanitizeText(req.body.title, 300);
      if (req.body.category !== undefined) updates.category = req.body.category;
      if (req.body.shortDescription !== undefined) updates.shortDescription = sanitizeText(req.body.shortDescription, 1000);
      if (req.body.content !== undefined) updates.content = sanitizeContent(req.body.content);
      if (req.body.organization !== undefined) updates.organization = sanitizeText(req.body.organization, 200);
      if (req.body.department !== undefined) updates.department = sanitizeText(req.body.department, 200);
      if (req.body.postName !== undefined) updates.postName = sanitizeText(req.body.postName, 300);
      if (req.body.totalVacancies !== undefined) updates.totalVacancies = Math.max(0, parseInt(req.body.totalVacancies, 10) || 0);
      if (req.body.vacancyDetails !== undefined) updates.vacancyDetails = sanitizeText(req.body.vacancyDetails, 2000);
      if (req.body.qualification !== undefined) updates.qualification = sanitizeText(req.body.qualification, 500);
      if (req.body.ageLimit !== undefined) updates.ageLimit = sanitizeText(req.body.ageLimit, 300);
      if (req.body.applicationFee !== undefined) updates.applicationFee = sanitizeText(req.body.applicationFee, 500);
      if (req.body.salary !== undefined) updates.salary = sanitizeText(req.body.salary, 500);
      if (req.body.selectionProcess !== undefined) updates.selectionProcess = sanitizeText(req.body.selectionProcess, 1000);
      if (req.body.documentsRequired !== undefined) updates.documentsRequired = sanitizeText(req.body.documentsRequired, 2000);
      if (req.body.howToApply !== undefined) updates.howToApply = sanitizeText(req.body.howToApply, 3000);
      if (req.body.importantDates !== undefined) {
        const dates = req.body.importantDates;
        updates.importantDates = {};
        if (dates.notificationDate !== undefined) updates.importantDates.notificationDate = sanitizeText(dates.notificationDate, 100);
        if (dates.startDate !== undefined) updates.importantDates.startDate = sanitizeText(dates.startDate, 100);
        if (dates.lastDate !== undefined) updates.importantDates.lastDate = sanitizeText(dates.lastDate, 100);
        if (dates.examDate !== undefined) updates.importantDates.examDate = sanitizeText(dates.examDate, 100);
        if (dates.resultDate !== undefined) updates.importantDates.resultDate = sanitizeText(dates.resultDate, 100);
        if (dates.admitCardDate !== undefined) updates.importantDates.admitCardDate = sanitizeText(dates.admitCardDate, 100);
      }
      if (req.body.links !== undefined) {
        const links = req.body.links;
        updates.links = {};
        if (links.applyOnline !== undefined) updates.links.applyOnline = sanitizeUrl(links.applyOnline);
        if (links.importantLink !== undefined) updates.links.importantLink = sanitizeUrl(links.importantLink);
        if (links.officialNotification !== undefined) updates.links.officialNotification = sanitizeUrl(links.officialNotification);
        if (links.officialWebsite !== undefined) updates.links.officialWebsite = sanitizeUrl(links.officialWebsite);
        if (links.downloadAdmitCard !== undefined) updates.links.downloadAdmitCard = sanitizeUrl(links.downloadAdmitCard);
        if (links.checkResult !== undefined) updates.links.checkResult = sanitizeUrl(links.checkResult);
        if (links.answerKey !== undefined) updates.links.answerKey = sanitizeUrl(links.answerKey);
      }
      if (req.body.tags !== undefined && Array.isArray(req.body.tags)) {
        updates.tags = req.body.tags.map((t) => sanitizeText(t, 40)).filter(Boolean).slice(0, 20);
      }
      if (req.body.isFeatured !== undefined) updates.isFeatured = Boolean(req.body.isFeatured);
      if (req.body.isNew !== undefined) updates.isNew = Boolean(req.body.isNew);
      if (req.body.isActive !== undefined) updates.isActive = Boolean(req.body.isActive);

      // category must remain valid if provided
      if (updates.category !== undefined && !POST_CATEGORIES.includes(updates.category)) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }

      const post = await Post.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      });

      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      res.json({ success: true, data: post });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  [param('id').custom((v) => mongoose.Types.ObjectId.isValid(v))],
  async (req, res, next) => {
    try {
      if (!validate(req, res)) return;

      const post = await Post.findByIdAndDelete(req.params.id);
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      res.json({ success: true, message: 'Post deleted successfully', data: { _id: post._id } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
