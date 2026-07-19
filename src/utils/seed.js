/**
 * Import reference posts into MongoDB (permanent storage).
 *
 * Default: INSERT only missing posts (by slug). Never deletes existing data.
 * Admin-created posts are safe.
 *
 * Force full replace (DANGEROUS — wipes all posts):
 *   FORCE_SEED=true node src/utils/seed.js
 */
import env from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { buildSeedDocuments } from './sampleData.js';

async function seed() {
  await connectDB();

  const email = env.adminEmail.toLowerCase();
  const password = env.adminPassword;
  const force = process.env.FORCE_SEED === 'true';

  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({
      name: 'Admin',
      email,
      password,
      role: 'admin',
    });
    console.log(`Admin created: ${email}`);
  } else {
    console.log(`Admin already exists: ${email}`);
  }

  const docs = buildSeedDocuments(admin._id);

  if (force) {
    console.warn('FORCE_SEED=true — deleting ALL posts, then re-inserting reference data...');
    await Post.deleteMany({});
    await Post.insertMany(docs);
    console.log(`Replaced database with ${docs.length} posts`);
  } else {
    // Permanent import: only add posts that are not already in DB
    let inserted = 0;
    let skipped = 0;

    for (const doc of docs) {
      const exists = await Post.findOne({ slug: doc.slug });
      if (exists) {
        skipped += 1;
        continue;
      }
      await Post.create(doc);
      inserted += 1;
    }

    const total = await Post.countDocuments();
    console.log(`Import done: ${inserted} new posts added, ${skipped} already existed`);
    console.log(`Total posts in database now: ${total}`);
    console.log('Data is permanent in MongoDB until admin edits/deletes via Admin panel.');
  }

  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
