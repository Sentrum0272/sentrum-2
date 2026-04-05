document.addEventListener('DOMContentLoaded', () => {
  AdminCommon.renderLayout('leads', '詢問名單', '管理從文章導入的表單名單與狀態。');
  const root = document.getElementById('page-root');

  function render() {
    const leads = ArticleStore.getLeads();
    root.innerHTML = `
      <div class="toolbar">
        <div class="toolbar__left"><input id="lead-search" class="input" style="width:280px" placeholder="搜尋姓名或來源文章"></div></div>
      </div>
      <div class="card"><div class="card__body"><div class="table-wrap"><table>
      <thead><tr><th>姓名</th><th>聯絡方式</th><th>需求內容</th><th>來源文章</th><th>狀態</th><th>時間</th><th>操作</th></tr></thead><tbody id="lead-tbody"></tbody></table></div></div></div>`;
      const tbody = document.getElementById('lead-tbody');
      const draw = (list) => {
        tbody.innerHTML = list.map(lead => `<tr>
          <td><strong>${lead.name}</strong></td>
          <td>${lead.contactValue || lead.contact || '-'}</td>
          <td>${lead.message || '-'}</td>
          <td>${lead.sourceArticleTitle || '-'}</td>
          <td>${AdminCommon.statusBadge(lead.status)}</td>
          <td>${AdminCommon.formatDate(lead.createdAt)}</td>
          <td><select class="select" data-id="${lead.id}" style="width:140px"><option value="new" ${lead.status==='new'?'selected':''}>未處理</option><option value="contacted" ${lead.status==='contacted'?'selected':''}>已聯絡</option><option value="negotiating" ${lead.status==='negotiating'?'selected':''}>成交中</option><option value="won" ${lead.status==='won'?'selected':''}>已成交</option><option value="lost" ${lead.status==='lost'?'selected':''}>未成交</option></select></td>
        </tr>`).join('') || `<tr><td colspan="7">目前尚無詢問名單</td></tr>`;
      };
      draw(leads);
      document.getElementById('lead-search').addEventListener('input', (e) => {
        const keyword = e.target.value.trim().toLowerCase();
        draw(leads.filter(item => item.name.toLowerCase().includes(keyword) || (item.sourceArticleTitle || '').toLowerCase().includes(keyword)));
      });
      tbody.addEventListener('change', (e) => {
        if (e.target.matches('select[data-id]')) {
          ArticleStore.updateLeadStatus(e.target.dataset.id, e.target.value);
          render();
        }
      });
  }
  render();
});
