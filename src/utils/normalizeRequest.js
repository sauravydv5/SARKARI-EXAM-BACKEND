const slugify = require("slugify");

const normalizePayload = (payload) => {
  const body = { ...payload };

  body.isLatest = body.isLatest ?? body.isNew ?? false;

  if (!body.slug && body.title) {
    body.slug = slugify(body.title, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

  body.downloadUrl =
    body.downloadUrl ||
    body.downloadLink ||
    body.notificationPdf ||
    body.link ||
    body.verificationLink ||
    body.syllabusLink ||
    "";

  body.date = body.date || body.postDate || body.releaseDate || body.admissionLastDate || body.lastDate || null;

  return body;
};

module.exports = {
  normalizePayload,
};
