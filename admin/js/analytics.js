document.addEventListener("DOMContentLoaded", async () => {
  AdminCommon.renderLayout(
    "analytics",
    "成效分析",
    "查看單篇文章的 Leads 與基本成效。"
  );

  const root = document.getElementById("page-root");

  let articles = [];
  let leads = [];

  try {
    [articles, leads] = await Promise.all([
      ArticleStore.getArticles(),
      ArticleStore.getLeads()
    ]);
  } catch (error) {
    console.error(error);
    root.innerHTML = `<div class="card"><div class="card__body">載入失敗：${error.message}</div></div>`;
    return;
  }

  const options = articles
    .map((item) => `<option value="${item.id}">${item.title}</option>`)
    .join("");

  root.innerHTML = `
    <div class="card">
      <div class="card__body">
        <div class="toolbar">
          <div class="toolbar__left">
            <select id="article-select" class="select" style="width:420px">
              ${options}
            </select>
          </div>
        </div>

        <div id="analytics-view"></div>
      </div>
    </div>
  `;

  const select = document.getElementById("article-select");
  const view = document.getElementById("analytics-view");

  function renderArticleAnalytics(id) {
    const article = articles.find((item) => item.id === id);

    if (!article) {
      view.innerHTML = '<div class="empty">找不到文章</div>';
      return;
    }

    const articleLeads = leads.filter(
      (item) => item.sourceArticleId === id
    );

    const leadCount = articleLeads.length;

    view.innerHTML = `
      <div class="grid grid--4">
        <div class="card"><div class="card__body kpi">
          <div class="kpi__label">PV</div>
          <div class="kpi__value">0</div>
        </div></div>

        <div class="card"><div class="card__body kpi">
          <div class="kpi__label">UV</div>
          <div class="kpi__value">0</div>
        </div></div>

        <div class="card"><div class="card__body kpi">
          <div class="kpi__label">表單送出</div>
          <div class="kpi__value">${leadCount}</div>
        </div></div>

        <div class="card"><div class="card__body kpi">
          <div class="kpi__label">轉換率</div>
          <div class="kpi__value">-</div>
        </div></div>
      </div>

      <div class="grid grid--2" style="margin-top:20px;">
        <div class="card">
          <div class="card__body">
            <h3 class="card__title">文章資訊</h3>
            <div class="stat-list">
              <div class="stat-item"><strong>標題</strong><span>${article.title}</span></div>
              <div class="stat-item"><strong>狀態</strong><span>${article.status}</span></div>
              <div class="stat-item"><strong>Slug</strong><span>${article.slug}</span></div>
              <div class="stat-item"><strong>SEO</strong><span>${article.seoTitle || "-"}</span></div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card__body">
            <h3 class="card__title">來源名單</h3>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>姓名</th>
                    <th>聯絡方式</th>
                    <th>需求</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    articleLeads
                      .map(
                        (lead) => `
                        <tr>
                          <td>${lead.name}</td>
                          <td>${lead.contact || "-"}</td>
                          <td>${lead.message || "-"}</td>
                        </tr>
                      `
                      )
                      .join("") ||
                    `<tr><td colspan="3">目前尚無名單</td></tr>`
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderArticleAnalytics(select.value);
  select.addEventListener("change", () =>
    renderArticleAnalytics(select.value)
  );
});