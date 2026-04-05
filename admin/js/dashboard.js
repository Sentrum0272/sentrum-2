document.addEventListener('DOMContentLoaded', () => {
  AdminCommon.renderLayout('dashboard', '總覽 Dashboard', '掌握文章、流量、名單與轉換成效。');
  const root = document.getElementById('page-root');
  const stats = ArticleStore.getDashboardStats();
  const latestLeads = stats.leads.slice(0, 6);
  const publishedCount = stats.published.length;

  const topRows = stats.topArticles.map(({article, analytics}, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${article.title}</strong></td>
      <td>${analytics.pv}</td>
      <td>${analytics.leads}</td>
      <td>${analytics.conversionRate}%</td>
    </tr>`).join('') || `<tr><td colspan="5">目前尚無資料</td></tr>`;

  const leadRows = latestLeads.map((lead) => `
    <tr>
      <td>${lead.name}</td>
      <td>${lead.contactType || 'contact'}：${lead.contactValue || lead.contact || '-'}</td>
      <td>${lead.sourceArticleTitle || '-'}</td>
      <td>${AdminCommon.statusBadge(lead.status)}</td>
      <td>${AdminCommon.formatDate(lead.createdAt)}</td>
    </tr>`).join('') || `<tr><td colspan="5">目前尚無名單</td></tr>`;

  const chartData = stats.topArticles.length ? stats.topArticles : stats.published.slice(0, 6).map(article => ({ article, analytics: ArticleStore.getArticleAnalytics(article.id) }));
  const maxPv = Math.max(...chartData.map(item => item.analytics.pv || 0), 10);
  const bars = chartData.map(item => {
    const height = Math.max(18, Math.round(((item.analytics.pv || 0) / maxPv) * 200));
    const short = item.article.title.length > 8 ? item.article.title.slice(0,8) + '…' : item.article.title;
    return `<div class="chart-bar"><div class="chart-bar__fill" style="height:${height}px"></div><div class="chart-bar__label">${short}</div></div>`;
  }).join('') || '<div class="empty">發布文章後，這裡會顯示熱門文章趨勢。</div>';

  root.innerHTML = `
    <section class="grid grid--4">
      <div class="card"><div class="card__body kpi"><div class="kpi__label">總瀏覽量（PV）</div><div class="kpi__value">${stats.totalPv}</div><div class="kpi__sub">已發布文章 ${publishedCount} 篇</div></div></div>
      <div class="card"><div class="card__body kpi"><div class="kpi__label">總詢問數（Leads）</div><div class="kpi__value">${stats.totalLeads}</div><div class="kpi__sub">最新內容可持續導入名單</div></div></div>
      <div class="card"><div class="card__body kpi"><div class="kpi__label">轉換率</div><div class="kpi__value">${stats.conversionRate}%</div><div class="kpi__sub">Leads / PV</div></div></div>
      <div class="card"><div class="card__body kpi"><div class="kpi__label">平均停留時間</div><div class="kpi__value">${stats.avgStaySeconds}s</div><div class="kpi__sub">內容可讀性指標</div></div></div>
    </section>
    <section class="grid grid--2" style="margin-top:20px;">
      <div class="card"><div class="card__body"><h3 class="card__title">熱門文章趨勢</h3><div class="chart-bars">${bars}</div></div></div>
      <div class="card"><div class="card__body"><div class="toolbar"><h3 class="card__title" style="margin:0;">熱門文章 Top 5</h3><a href="./content.html" class="link-muted">查看全部</a></div><div class="table-wrap"><table><thead><tr><th>#</th><th>文章</th><th>PV</th><th>Leads</th><th>轉換率</th></tr></thead><tbody>${topRows}</tbody></table></div></div></div>
    </section>
    <section class="grid grid--2" style="margin-top:20px;">
      <div class="card"><div class="card__body"><div class="toolbar"><h3 class="card__title" style="margin:0;">最新詢問名單</h3><a href="./leads.html" class="link-muted">名單管理</a></div><div class="table-wrap"><table><thead><tr><th>姓名</th><th>聯絡方式</th><th>來源文章</th><th>狀態</th><th>時間</th></tr></thead><tbody>${leadRows}</tbody></table></div></div></div>
      <div class="card"><div class="card__body"><h3 class="card__title">管理建議</h3><div class="stat-list">
        <div class="stat-item"><strong>內容數量</strong><span>${stats.articles.length} 篇</span></div>
        <div class="stat-item"><strong>已發布</strong><span>${publishedCount} 篇</span></div>
        <div class="stat-item"><strong>草稿</strong><span>${stats.articles.filter(item=>item.status==='draft').length} 篇</span></div>
        <div class="stat-item"><strong>下一步</strong><span>補齊 SEO 欄位並持續發文</span></div>
      </div></div></div>
    </section>`;
});
