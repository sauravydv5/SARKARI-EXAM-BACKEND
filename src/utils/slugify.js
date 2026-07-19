export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function uniqueSlug(base) {
  const suffix = Date.now().toString(36);
  return `${slugify(base)}-${suffix}`;
}
