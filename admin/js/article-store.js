const KEYS = {
  ARTICLES: "acl_articles",
  LEADS: "acl_leads",
  EVENTS: "acl_tracking_events",
  ANALYTICS: "acl_article_analytics"
};

function readTable(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function writeTable(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function slugify(text = "") {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateId(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function ensureSeeds() {
  const articles = readTable(KEYS.ARTICLES);
  if (!articles.length) {
    writeTable(KEYS.ARTICLES, []);
  }

  const leads = readTable(KEYS.LEADS);
  if (!leads.length) {
    writeTable(KEYS.LEADS, []);
  }

  const events = readTable(KEYS.EVENTS);
  if (!events.length) {
    writeTable(KEYS.EVENTS, []);
  }

  const analytics = readTable(KEYS.ANALYTICS);
  if (!analytics.length) {
    writeTable(KEYS.ANALYTICS, []);
  }
}

function createArticle(payload) {
  const articles = readTable(KEYS.ARTICLES);
  const now = new Date().toISOString();

  const article = {
    id: generateId("article"),
    locale: "zh-TW",
    title: payload.title || "未命名文章",
    slug: payload.slug || slugify(payload.title || "article"),
    summary: payload.summary || "",
    content: payload.content || "",
    category: payload.category || "文章",
    status: payload.status || "draft",
    seoTitle: payload.seoTitle || payload.title || "未命名文章",
    seoDescription: payload.seoDescription || payload.summary || "",
    publishedAt: payload.status === "published" ? now : null,
    createdAt: now,
    updatedAt: now
  };

  articles.push(article);
  writeTable(KEYS.ARTICLES, articles);

  ensureAnalytics(article.id);

  return article;
}

function updateArticle(id, patch = {}) {
  const articles = readTable(KEYS.ARTICLES);
  const now = new Date().toISOString();

  const updated = articles.map((article) => {
    if (article.id !== id) return article;

    const nextTitle = patch.title ?? article.title;
    const nextStatus = patch.status ?? article.status;

    return {
      ...article,
      ...patch,
      slug: patch.slug || slugify(nextTitle),
      seoTitle: patch.seoTitle || patch.title || article.seoTitle || nextTitle,
      seoDescription:
        patch.seoDescription ??
        patch.summary ??
        article.seoDescription ??
        article.summary ??
        "",
      publishedAt:
        nextStatus === "published"
          ? article.publishedAt || now
          : null,
      updatedAt: now
    };
  });

  writeTable(KEYS.ARTICLES, updated);
}

function updateArticleStatus(id, status) {
  updateArticle(id, { status });
}

function deleteArticle(id) {
  const articles = readTable(KEYS.ARTICLES).filter((article) => article.id !== id);
  writeTable(KEYS.ARTICLES, articles);

  const analytics = readTable(KEYS.ANALYTICS).filter((item) => item.articleId !== id);
  writeTable(KEYS.ANALYTICS, analytics);
}

function getArticles() {
  return readTable(KEYS.ARTICLES)
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getArticleById(id) {
  return readTable(KEYS.ARTICLES).find((article) => article.id === id) || null;
}

function getArticleBySlug(slug) {
  return readTable(KEYS.ARTICLES).find((article) => article.slug === slug) || null;
}

function getPublishedArticles() {
  return readTable(KEYS.ARTICLES)
    .filter((article) => article.status === "published")
    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
}

function ensureAnalytics(articleId) {
  const analytics = readTable(KEYS.ANALYTICS);
  const exists = analytics.find((item) => item.articleId === articleId);

  if (!exists) {
    analytics.push({
      id: generateId("analytics"),
      articleId,
      pv: 0,
      uv: 0,
      avgStaySeconds: 0,
      ctaClicks: 0,
      lineClicks: 0,
      formSubmits: 0,
      leads: 0,
      conversionRate: 0,
      updatedAt: new Date().toISOString()
    });

    writeTable(KEYS.ANALYTICS, analytics);
  }
}

function getAnalytics() {
  return readTable(KEYS.ANALYTICS);
}

function getAnalyticsByArticleId(articleId) {
  ensureAnalytics(articleId);
  return readTable(KEYS.ANALYTICS).find((item) => item.articleId === articleId) || null;
}

function incrementArticleMetric(articleId, field, amount = 1) {
  const analytics = readTable(KEYS.ANALYTICS);
  const now = new Date().toISOString();

  let found = false;

  const updated = analytics.map((item) => {
    if (item.articleId !== articleId) return item;

    found = true;
    const next = {
      ...item,
      [field]: (Number(item[field]) || 0) + amount,
      updatedAt: now
    };

    next.conversionRate = next.pv > 0
      ? Number(((next.leads / next.pv) * 100).toFixed(2))
      : 0;

    return next;
  });

  if (!found) {
    updated.push({
      id: generateId("analytics"),
      articleId,
      pv: field === "pv" ? amount : 0,
      uv: 0,
      avgStaySeconds: 0,
      ctaClicks: field === "ctaClicks" ? amount : 0,
      lineClicks: field === "lineClicks" ? amount : 0,
      formSubmits: field === "formSubmits" ? amount : 0,
      leads: field === "leads" ? amount : 0,
      conversionRate: 0,
      updatedAt: now
    });
  }

  writeTable(KEYS.ANALYTICS, updated);
}

function createLead(payload) {
  const leads = readTable(KEYS.LEADS);
  const now = new Date().toISOString();

  const lead = {
    id: generateId("lead"),
    name: payload.name || "",
    contactType: payload.contactType || "text",
    contactValue: payload.contactValue || payload.contact || "",
    message: payload.message || "",
    sourceArticleId: payload.sourceArticleId || "",
    sourceArticleTitle: payload.sourceArticleTitle || "",
    sourceChannel: payload.sourceChannel || "direct",
    status: payload.status || "new",
    note: payload.note || "",
    createdAt: now,
    updatedAt: now
  };

  leads.push(lead);
  writeTable(KEYS.LEADS, leads);

  if (lead.sourceArticleId) {
    incrementArticleMetric(lead.sourceArticleId, "formSubmits", 1);
    incrementArticleMetric(lead.sourceArticleId, "leads", 1);
  }

  return lead;
}

function getLeads() {
  return readTable(KEYS.LEADS)
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function updateLeadStatus(id, status) {
  const leads = readTable(KEYS.LEADS);
  const now = new Date().toISOString();

  const updated = leads.map((lead) => {
    if (lead.id !== id) return lead;
    return {
      ...lead,
      status,
      updatedAt: now
    };
  });

  writeTable(KEYS.LEADS, updated);
}

function trackEvent(payload) {
  const events = readTable(KEYS.EVENTS);
  const event = {
    id: generateId("event"),
    articleId: payload.articleId || "",
    eventType: payload.eventType || "page_view",
    source: payload.source || "direct",
    meta: payload.meta || {},
    createdAt: new Date().toISOString()
  };

  events.push(event);
  writeTable(KEYS.EVENTS, events);

  if (event.articleId) {
    if (event.eventType === "page_view") {
      incrementArticleMetric(event.articleId, "pv", 1);
    }
    if (event.eventType === "cta_click") {
      incrementArticleMetric(event.articleId, "ctaClicks", 1);
    }
    if (event.eventType === "line_click") {
      incrementArticleMetric(event.articleId, "lineClicks", 1);
    }
  }

  return event;
}

ensureSeeds();

window.ArticleStore = {
  KEYS,
  readTable,
  writeTable,
  slugify,
  createArticle,
  updateArticle,
  updateArticleStatus,
  deleteArticle,
  getArticles,
  getArticleById,
  getArticleBySlug,
  getPublishedArticles,
  getAnalytics,
  getAnalyticsByArticleId,
  incrementArticleMetric,
  createLead,
  getLeads,
  updateLeadStatus,
  trackEvent
};