import sanitizeHtml from 'sanitize-html';

const htmlOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    'ul',
    'ol',
    'li',
    'h2',
    'h3',
    'h4',
    'a',
    'span',
    'blockquote',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel', 'title'],
    span: ['class'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', {
      rel: 'noopener noreferrer',
      target: '_blank',
    }),
  },
};

/** Strip dangerous HTML from admin-provided content */
export function sanitizeContent(html) {
  if (!html || typeof html !== 'string') return '';
  return sanitizeHtml(html, htmlOptions);
}

/** Plain text only — remove all tags */
export function sanitizeText(text, maxLen = 5000) {
  if (text === null || text === undefined) return '';
  const clean = sanitizeHtml(String(text), { allowedTags: [], allowedAttributes: {} }).trim();
  return clean.slice(0, maxLen);
}

/** Allow only http(s) URLs or empty */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const t = url.trim();
  if (!t) return '';
  try {
    const u = new URL(t);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
    return u.toString();
  } catch {
    return '';
  }
}

/** Pick and sanitize fields allowed on create/update */
export function sanitizePostPayload(body = {}) {
  const dates = body.importantDates || {};
  const links = body.links || {};

  return {
    title: sanitizeText(body.title, 300),
    category: body.category,
    shortDescription: sanitizeText(body.shortDescription, 1000),
    content: sanitizeContent(body.content),
    organization: sanitizeText(body.organization, 200),
    department: sanitizeText(body.department, 200),
    postName: sanitizeText(body.postName, 300),
    totalVacancies: Math.max(0, parseInt(body.totalVacancies, 10) || 0),
    vacancyDetails: sanitizeText(body.vacancyDetails, 2000),
    qualification: sanitizeText(body.qualification, 500),
    ageLimit: sanitizeText(body.ageLimit, 300),
    applicationFee: sanitizeText(body.applicationFee, 500),
    salary: sanitizeText(body.salary, 500),
    selectionProcess: sanitizeText(body.selectionProcess, 1000),
    documentsRequired: sanitizeText(body.documentsRequired, 2000),
    howToApply: sanitizeText(body.howToApply, 3000),
    importantDates: {
      notificationDate: sanitizeText(dates.notificationDate, 100),
      startDate: sanitizeText(dates.startDate, 100),
      lastDate: sanitizeText(dates.lastDate, 100),
      examDate: sanitizeText(dates.examDate, 100),
      resultDate: sanitizeText(dates.resultDate, 100),
      admitCardDate: sanitizeText(dates.admitCardDate, 100),
    },
    links: {
      applyOnline: sanitizeUrl(links.applyOnline),
      importantLink: sanitizeUrl(links.importantLink),
      officialNotification: sanitizeUrl(links.officialNotification),
      officialWebsite: sanitizeUrl(links.officialWebsite),
      downloadAdmitCard: sanitizeUrl(links.downloadAdmitCard),
      checkResult: sanitizeUrl(links.checkResult),
      answerKey: sanitizeUrl(links.answerKey),
    },
    tags: Array.isArray(body.tags)
      ? body.tags.map((t) => sanitizeText(t, 40)).filter(Boolean).slice(0, 20)
      : [],
    isFeatured: Boolean(body.isFeatured),
    isNew: Boolean(body.isNew),
    isActive: body.isActive === undefined ? true : Boolean(body.isActive),
  };
}
