import Post from '../models/Post.js';
import { buildSeedDocuments } from './sampleData.js';

export default async function runInlineSeed(adminId) {
  const docs = buildSeedDocuments(adminId);
  await Post.insertMany(docs);
  console.log(`Seeded ${docs.length} demo posts`);
}
