document.addEventListener('DOMContentLoaded', () => {
  AdminCommon.renderLayout('generate', 'AI 內容生成', '用 mock 生成文章草稿，再套用為可發布內容。');
  const root = document.getElementById('page-root');
  root.innerHTML = `
    <section class="split">
      <div class="card"><div class="card__body">
        <h3 class="card__title">生成條件</h3>
        <form id="generate-form" class="form-grid">
          <div><label>產業</label><input class="input" name="industry" value="虛擬攝影棚" required></div>
          <div><label>地區</label><input class="input" name="location" value="台北" required></div>
          <div class="full"><label>主題</label><input class="input" name="topic" value="攝影棚租借流程" required></div>
          <div><label>語氣</label><select class="select" name="tone"><option>專業</option><option>商務</option><option>親切</option></select></div>
          <div><label>分類</label><input class="input" name="category" value="租棚指南"></div>
          <div class="full"><label>CTA 文案</label><input class="input" name="cta" value="立即洽詢 Aplus 攝影棚方案"></div>
          <div class="full"><button class="btn btn--primary" type="submit">生成內容</button></div>
        </form>
      </div></div>
      <div class="preview" id="generate-preview">
        <div class="preview__eyebrow">AI PREVIEW</div>
        <h2 class="preview__title">尚未生成內容</h2>
        <p class="preview__summary">填寫左側欄位後，這裡會顯示文章標題、摘要、內文與 SEO 欄位預覽。</p>
      </div>
    </section>`;

  const form = document.getElementById('generate-form');
  const preview = document.getElementById('generate-preview');
  let generated = null;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const topic = fd.get('topic');
    const industry = fd.get('industry');
    const location = fd.get('location');
    const tone = fd.get('tone');
    const category = fd.get('category') || '文章';
    const cta = fd.get('cta');
    const title = `${topic}完整解析：${location}${industry}如何更有效執行？`;
    const summary = `從需求確認、設備配置到執行流程，快速掌握 ${topic} 的規劃重點，協助企業更有效安排內容製作。`;
    const content = `<p>當企業準備進行 ${topic} 時，最常見的問題不是只有預算，而是整體流程是否清楚、設備是否到位，以及是否有人可以協助現場執行。</p><h2>一、先確認內容目標與用途</h2><p>建議先釐清是直播、節目錄製、訪談內容還是產品說明影片，這會直接影響場地與機位配置。</p><h2>二、確認設備與技術支援</h2><p>如果希望流程更穩定，建議選擇可同時提供攝影機、燈光、收音與導播支援的場地，降低現場臨時調整成本。</p><h2>三、用專案方式評估時程與預算</h2><p>${tone}型內容建議從腳本、現場、後製與上架時程一起看，整體效率會更高。</p>`;
    generated = {
      title,
      slug: ArticleStore.slugify(title),
      summary,
      content,
      category,
      seoTitle: `${title}｜Aplus`,
      seoDescription: summary,
      ctaText: cta
    };
    preview.innerHTML = `
      <div class="preview__eyebrow">AI PREVIEW</div>
      <h2 class="preview__title">${generated.title}</h2>
      <p class="preview__summary">${generated.summary}</p>
      <div class="inline-meta"><span>Slug：${generated.slug}</span><span>分類：${generated.category}</span></div>
      <div class="preview__content">${generated.content}</div>
      <div class="preview__cta"><strong>${generated.ctaText}</strong><div style="margin-top:8px;color:var(--muted)">SEO Title：${generated.seoTitle}<br>SEO Description：${generated.seoDescription}</div></div>
      <div style="margin-top:18px;display:flex;gap:12px;flex-wrap:wrap;">
        <button class="btn btn--primary" id="apply-draft">套用為草稿</button>
        <button class="btn btn--soft" id="apply-publish">直接發布</button>
      </div>`;

    document.getElementById('apply-draft').addEventListener('click', () => applyGenerated('draft'));
    document.getElementById('apply-publish').addEventListener('click', () => applyGenerated('published'));
  });

  function applyGenerated(status) {
    if (!generated) return;
    const article = ArticleStore.createArticle({ ...generated, status });
    alert(status === 'published' ? '文章已發布，前台 blog 可看到。' : '已建立草稿，請到內容管理編輯。');
    location.href = './content.html';
  }
});
