document.addEventListener('DOMContentLoaded', () => {
  AdminCommon.renderLayout('analytics', '成效分析', '查看單篇文章的 PV、Leads 與轉換率。');
  const root = document.getElementById('page-root');
  const articles = await ArticleStore.getArticles();
  const options = articles.map(item => `<option value="${item.id}">${item.title}</option>`).join('');
  root.innerHTML = `
    <div class="card"><div class="card__body">
      <div class="toolbar"><div class="toolbar__left"><select id="article-select" class="select" style="width:420px">${options}</select></div></div>
      <div id="analytics-view"></div>
    </div></div>`;

  const select = document.getElementById('article-select');
  const view = document.getElementById('analytics-view');

  function renderArticleAnalytics(id) {
    const article = ArticleStore.getArticles().find(item => item.id === id);
    if (!article) { view.innerHTML = '<div class="empty">找不到文章</div>'; return; }
    const analytics = ArticleStore.getArticleAnalytics(id);
    const leads = ArticleStore.getLeads().filter(item => item.sourceArticleId === id);
    view.innerHTML = `
      <div class="grid grid--4">
        <div class="card"><div class="card__body kpi"><div class="kpi__label">PV</div><div class="kpi__value">${analytics.pv}</div></div></div>
        <div class="card"><div class="card__body kpi"><div class="kpi__label">UV</div><div class="kpi__value">${analytics.uv}</div></div></div>
        <div class="card"><div class="card__body kpi"><div class="kpi__label">表單送出</div><div class="kpi__value">${analytics.formSubmits}</div></div></div>
        <div class="card"><div class="card__body kpi"><div class="kpi__label">轉換率</div><div class="kpi__value">${analytics.conversionRate}%</div></div></div>
      </div>
      <div class="grid grid--2" style="margin-top:20px;">
        <div class="card"><div class="card__body"><h3 class="card__title">文章資訊</h3><div class="stat-list">
          <div class="stat-item"><strong>標題</strong><span>${article.title}</span></div>
          <div class="stat-item"><strong>狀態</strong><span>${article.status}</span></div>
          <div class="stat-item"><strong>Slug</strong><span>${article.slug}</span></div>
          <div class="stat-item"><strong>SEO</strong><span>${article.seoTitle || '-'}</span></div>
        </div></div></div>
        <div class="card"><div class="card__body"><h3 class="card__title">來源名單</h3><div class="table-wrap"><table><thead><tr><th>姓名</th><th>聯絡方式</th><th>需求</th><th>狀態</th></tr></thead><tbody>${leads.map(lead=>`<tr><td>${lead.name}</td><td>${lead.contactValue || lead.contact || '-'}</td><td>${lead.message || '-'}</td><td>${AdminCommon.statusBadge(lead.status)}</td></tr>`).join('') || '<tr><td colspan="4">目前尚無名單</td></tr>'}</tbody></table></div></div></div>
      </div>`;
  }
  renderArticleAnalytics(select.value);
  select.addEventListener('change', () => renderArticleAnalytics(select.value));
});
