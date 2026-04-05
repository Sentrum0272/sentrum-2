document.addEventListener("DOMContentLoaded", () => {
  AdminCommon.renderLayout("content", "內容管理", "管理文章欄位、SEO 設定與發布狀態。");
  const root = document.getElementById("page-root");

  function render() {
    const articles = ArticleStore.getArticles();

    root.innerHTML = `
      <div class="toolbar">
        <div class="toolbar__left">
          <input id="search-input" class="input" style="width:280px" placeholder="搜尋文章標題">
        </div>
        <div class="toolbar__right">
          <a class="btn btn--primary" href="./ai-generate.html">新增文章</a>
        </div>
      </div>

      <div class="card">
        <div class="card__body">
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>標題</th>
                  <th>狀態</th>
                  <th>分類</th>
                  <th>PV</th>
                  <th>Leads</th>
                  <th>更新時間</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody id="article-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const tbody = document.getElementById("article-tbody");

    const drawRows = (list) => {
      tbody.innerHTML =
        list
          .map((article) => {
            const analytics = ArticleStore.getAnalyticsByArticleId(article.id) || {
              pv: 0,
              leads: 0,
              conversionRate: 0
            };

            return `
              <tr>
                <td>
                  <strong>${article.title}</strong>
                  <div class="inline-meta">
                    <span>slug: ${article.slug}</span>
                  </div>
                </td>
                <td>${AdminCommon.statusBadge(article.status)}</td>
                <td>${article.category || "-"}</td>
                <td>${analytics.pv || 0}</td>
                <td>${analytics.leads || 0}</td>
                <td>${AdminCommon.formatDate(article.updatedAt)}</td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn--soft" data-action="view" data-id="${article.id}">查看</button>
                    <button class="btn btn--line" data-action="edit" data-id="${article.id}">編輯</button>
                    <button class="btn btn--primary" data-action="publish" data-id="${article.id}">
                      ${article.status === "published" ? "下架" : "發布"}
                    </button>
                    <button class="btn btn--danger" data-action="delete" data-id="${article.id}">刪除</button>
                  </div>
                </td>
              </tr>
            `;
          })
          .join("") || `<tr><td colspan="7">目前沒有文章</td></tr>`;
    };

    drawRows(articles);

    document.getElementById("search-input").addEventListener("input", (e) => {
      const keyword = e.target.value.trim().toLowerCase();
      const filtered = articles.filter(
        (item) =>
          item.title.toLowerCase().includes(keyword) ||
          (item.summary || "").toLowerCase().includes(keyword)
      );
      drawRows(filtered);
    });

    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;

      const { action, id } = btn.dataset;
      const article = ArticleStore.getArticles().find((item) => item.id === id);
      if (!article) return;

      if (action === "view") return viewArticle(article);
      if (action === "edit") return editArticle(article);

      if (action === "publish") {
        ArticleStore.updateArticle(id, {
          status: article.status === "published" ? "draft" : "published"
        });
        return render();
      }

      if (action === "delete") {
        if (confirm(`確定刪除「${article.title}」？`)) {
          ArticleStore.deleteArticle(id);
          render();
        }
      }
    });
  }

  function viewArticle(article) {
    const analytics = ArticleStore.getAnalyticsByArticleId(article.id) || {
      pv: 0,
      leads: 0,
      conversionRate: 0
    };

    AdminCommon.openModal({
      title: article.title,
      subtitle: `狀態：${article.status}｜Slug：${article.slug}`,
      body: `
        <div class="grid grid--2">
          <div>
            <strong>摘要</strong>
            <p>${article.summary || "-"}</p>
          </div>
          <div>
            <strong>SEO</strong>
            <p>
              SEO Title：${article.seoTitle || "-"}<br>
              SEO Description：${article.seoDescription || "-"}
            </p>
          </div>
        </div>

        <div class="inline-meta" style="margin:12px 0 16px;">
          <span>PV：${analytics.pv || 0}</span>
          <span>Leads：${analytics.leads || 0}</span>
          <span>轉換率：${analytics.conversionRate || 0}%</span>
        </div>

        <div style="line-height:1.85;color:#334155">${article.content}</div>

        <div style="margin-top:18px">
          <a class="btn btn--line" href="../article.html?slug=${article.slug}" target="_blank">前台預覽</a>
        </div>
      `
    });
  }

  function editArticle(article) {
    AdminCommon.openModal({
      title: "編輯文章",
      subtitle: article.title,
      body: `
        <form id="edit-form" class="form-grid">
          <div class="full"><label>標題</label><input class="input" name="title" value="${article.title}"></div>
          <div><label>分類</label><input class="input" name="category" value="${article.category || ""}"></div>
          <div><label>Slug</label><input class="input" name="slug" value="${article.slug}"></div>
          <div class="full"><label>摘要</label><textarea class="textarea" name="summary">${article.summary || ""}</textarea></div>
          <div class="full"><label>內容</label><textarea class="textarea" name="content" style="min-height:220px">${article.content || ""}</textarea></div>
          <div class="full"><label>SEO Title</label><input class="input" name="seoTitle" value="${article.seoTitle || ""}"></div>
          <div class="full"><label>SEO Description</label><textarea class="textarea" name="seoDescription">${article.seoDescription || ""}</textarea></div>
          <div>
            <label>狀態</label>
            <select class="select" name="status">
              <option value="draft" ${article.status === "draft" ? "selected" : ""}>草稿</option>
              <option value="published" ${article.status === "published" ? "selected" : ""}>已發布</option>
            </select>
          </div>
          <div style="display:flex;align-items:end">
            <button class="btn btn--primary" type="submit">儲存變更</button>
          </div>
        </form>
      `
    });

    document.getElementById("edit-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      ArticleStore.updateArticle(article.id, Object.fromEntries(fd.entries()));
      AdminCommon.closeModal();
      render();
    });
  }

  render();
});