const KEYS = {
  ARTICLES: 'acl_articles',
  LEADS: 'acl_leads',
  EVENTS: 'acl_tracking_events',
  ANALYTICS: 'acl_article_analytics'
};

function readTable(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function writeTable(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
function slugify(text = '') {
  return text.toString().trim().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^
