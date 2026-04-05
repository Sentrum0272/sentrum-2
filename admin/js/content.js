document.addEventListener("DOMContentLoaded", () => {
  initPage();
});

async function initPage() {
  AdminCommon.renderLayout(
    "content",
    "內容管理",
    "管理文章欄位、SEO 設定與發布狀態。"
  );

  const root = document.getElementById("page-root");
  if (!root) return;

  await render();

  async function render() {
    let articles = [];
    let leads = [];

    try {
      [articles, leads] = await Promise.all([
        ArticleStore.getArticles(),
        ArticleStore.getLeads()
      ]);
    } catch (error) {
      console.error("載入文章資料失敗：", error);
      root.innerHTML = `
        <div class="card">
          <div class="card__body">
            <p>載入內容管理資料失敗：${error.message}</p>
          </div>
        </div>
      `;
      return;
    }

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
            const articleLeads = leads.filter(
              (lead) => lead.sourceArticleId === article.id
            ).length;

            return `
              <tr>
                <td>
                  <strong>${escapeHtml(article.title)}</strong>
                  <div class="inline-meta">
                    <span>slug: ${escapeHtml(article.slug)}</span>
                  </div>
                </td>
                <td>${AdminCommon.statusBadge(article.status)}</td>
                <td>${escapeHtml(article.category || "-")}</td>
                <td>0</td>
                <td>${articleLeads}</td>
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
          (item.title || "").toLowerCase().includes(keyword) ||
          (item.summary || "").toLowerCase().includes(keyword)
      );
      drawRows(filtered);
    });

    tbody.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;

      const { action, id } = btn.dataset;
      const article = articles.find((item) => item.id === id);
      if (!article) return;

      if (action === "view") {
        viewArticle(article, leads);
        return;
      }

      if (action === "edit") {
        editArticle(article);
        return;
      }

      if (action === "publish") {
        try {
          await ArticleStore.updateArticle(id, {
            status: article.status === "published" ? "draft" : "published"
          });
          await render();
        } catch (error) {
          console.error("更新發布狀態失敗：", error);
          alert(`更新失敗：${error.message}`);
        }
        return;
      }

      if (action === "delete") {
        if (!confirm(`確定刪除「${article.title}」？`)) return;

        try {
          await ArticleStore.deleteArticle(id);
          await render();
        } catch (error) {
          console.error("刪除文章失敗：", error);
          alert(`刪除失敗：${error.message}`);
        }
      }
    });
  }

  function viewArticle(article, leads) {
    const articleLeads = leads.filter(
      (lead) => lead.sourceArticleId === article.id
    ).length;

    AdminCommon.openModal({
      title: article.title,
      subtitle: `狀態：${article.status}｜Slug：${article.slug}`,
      body: `
        <div class="grid grid--2">
          <div>
            <strong>摘要</strong>
            <p>${escapeHtml(article.summary || "-")}</p>
          </div>
          <div>
            <strong>SEO</strong>
            <p>
              SEO Title：${escapeHtml(article.seoTitle || "-")}<br>
              SEO Description：${escapeHtml(article.seoDescription || "-")}
            </p>
          </div>
        </div>

        <div class="inline-meta" style="margin:12px 0 16px;">
          <span>PV：0</span>
          <span>Leads：${articleLeads}</span>
          <span>轉換率：-</span>
        </div>

        <div style="line-height:1.85;color:#334155">${article.content || ""}</div>

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
          <div class="full">
            <label>標題</label>
            <input class="input" name="title" value="${escapeAttr(article.title)}">
          </div>

          <div>
            <label>分類</label>
            <input class="input" name="category" value="${escapeAttr(article.category || "")}">
          </div>

          <div>
            <label>Slug</label>
            <input class="input" name="slug" value="${escapeAttr(article.slug)}">
          </div>

          <div class="full">
            <label>摘要</label>
            <textarea class="textarea" name="summary">${escapeHtml(article.summary || "")}</textarea>
          </div>

          <div class="full">
            <label>內容</label>
            <textarea class="textarea" name="content" style="min-height:220px">${escapeHtml(article.content || "")}</textarea>
          </div>

          <div class="full">
            <label>SEO Title</label>
            <input class="input" name="seoTitle" value="${escapeAttr(article.seoTitle || "")}">
          </div>

          <div class="full">
            <label>SEO Description</label>
            <textarea class="textarea" name="seoDescription">${escapeHtml(article.seoDescription || "")}</textarea>
          </div>

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

    const form = document.getElementById("edit-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fd = new FormData(e.target);
      const patch = Object.fromEntries(fd.entries());

      try {
        await ArticleStore.updateArticle(article.id, patch);
        AdminCommon.closeModal();
        await render();
      } catch (error) {
        console.error("更新文章失敗：", error);
        alert(`儲存失敗：${error.message}`);
      }
    });
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}