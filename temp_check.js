// ========== 页面管理 ==========
const pages = {
  login: document.getElementById('loginPage'),
  home: document.getElementById('homePage'),
  work: document.getElementById('page-work'),
  life: document.getElementById('page-life'),
  study: document.getElementById('page-study'),
  collection: document.getElementById('page-collection'),
};

function showPage(name) {
  Object.values(pages).forEach(p => {
    p.classList.remove('active');
    p.style.background = '';
  });
  pages[name].classList.add('active');
  if (subPageBgMap.hasOwnProperty(name)) {
    const posMap = { work: 'left center', life: 'center center', study: 'center center', collection: 'center center' };
    pages[name].style.background = `url('../assets/${subPageBgMap[name]}') ${posMap[name] || 'center center'} / 100% 100% no-repeat`;
  }
  if (name === 'login') { entered = false; }
}

// ========== 用户认证 ==========
let currentUser = null;

async function loadUserList() {
  const res = await window.taojianAPI.getUsers();
  if (res.success) {
    const sel = document.getElementById('loginUserSelect');
    let html = '<option value="">-- 选择用户 --</option>';
    res.users.forEach(u => {
      html += `<option value="${escapeHtml(u)}">${escapeHtml(u)}</option>`;
    });
    sel.innerHTML = html;
  }
}

document.getElementById('loginUserSelect').addEventListener('change', (e) => {
  if (e.target.value) {
    document.getElementById('loginUsername').value = e.target.value;
  }
});

document.getElementById('loginBtn').addEventListener('click', async () => {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  if (!username || !password) {
    errorEl.textContent = '请输入用户名和密码';
    errorEl.classList.add('show');
    return;
  }
  const res = await window.taojianAPI.loginUser({ username, password });
  if (res.success) {
    currentUser = username;
    errorEl.classList.remove('show');
    enterHome();
  } else {
    errorEl.textContent = res.error || '登录失败';
    errorEl.classList.add('show');
  }
});

document.getElementById('registerBtn').addEventListener('click', async () => {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  if (!username || !password) {
    errorEl.textContent = '请输入用户名和密码';
    errorEl.classList.add('show');
    return;
  }
  const res = await window.taojianAPI.registerUser({ username, password });
  if (res.success) {
    errorEl.textContent = '注册成功！请登录';
    errorEl.classList.add('show');
    loadUserList();
  } else {
    errorEl.textContent = res.error || '注册失败';
    errorEl.classList.add('show');
  }
});

// 回车登录
document.getElementById('loginPassword').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('loginBtn').click();
});

// 页面加载时加载用户列表
loadUserList();

// ========== 登录页 ==========
let entered = false;
function enterHome() {
  if (entered || !currentUser) return;
  entered = true;

  const W = window.innerWidth, H = window.innerHeight;

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:200;pointer-events:none;overflow:hidden;';

  const shockwave = document.createElement('div');
  shockwave.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:0;height:0;border-radius:50%;border:3px solid rgba(255,255,255,0.9);box-shadow:0 0 30px rgba(255,255,255,0.6);opacity:0;z-index:4;';
  overlay.appendChild(shockwave);

  const svgNS = 'http://www.w3.org/2000/svg';
  const crackSvg = document.createElementNS(svgNS, 'svg');
  crackSvg.setAttribute('width', '100%');
  crackSvg.setAttribute('height', '100%');
  crackSvg.style.cssText = 'position:absolute;inset:0;z-index:2;filter:drop-shadow(0 0 3px rgba(255,255,255,0.9)) drop-shadow(0 0 10px rgba(200,220,255,0.6));';

  const centerX = 50, centerY = 50;
  const numCracks = 30;
  const crackItems = [];
  for (let i = 0; i < numCracks; i++) {
    const baseAngle = (i / numCracks) * Math.PI * 2;
    let d = `M${centerX},${centerY}`;
    let cx = centerX, cy = centerY;
    const segments = 2 + Math.floor(Math.random() * 3);
    for (let s = 0; s < segments; s++) {
      const segLen = 8 + Math.random() * 38;
      const angle = baseAngle + (Math.random() - 0.5) * 1.0;
      cx += Math.cos(angle) * segLen;
      cy += Math.sin(angle) * segLen;
      d += ` L${cx.toFixed(1)},${cy.toFixed(1)}`;
      if (Math.random() > 0.25 && s > 0) {
        const branchAngle = angle + (Math.random() > 0.5 ? 1.1 : -1.1) + (Math.random() - 0.5) * 0.6;
        const branchLen = segLen * (0.35 + Math.random() * 0.5);
        const bx = cx + Math.cos(branchAngle) * branchLen;
        const by = cy + Math.sin(branchAngle) * branchLen;
        const branch = document.createElementNS(svgNS, 'path');
        branch.setAttribute('d', `M${cx.toFixed(1)},${cy.toFixed(1)} L${bx.toFixed(1)},${by.toFixed(1)}`);
        branch.setAttribute('stroke', 'rgba(255,255,255,0.9)');
        branch.setAttribute('stroke-width', '0.45');
        branch.setAttribute('fill', 'none');
        branch.setAttribute('stroke-linecap', 'round');
        branch.style.opacity = '0';
        crackSvg.appendChild(branch);
        crackItems.push({ el: branch, dist: segLen * (s + 1) * 2 });
      }
    }
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke', 'rgba(255,255,255,1)');
    path.setAttribute('stroke-width', '0.75');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-linecap', 'round');
    path.style.opacity = '0';
    crackSvg.appendChild(path);
    crackItems.push({ el: path, dist: segments * 20 });
  }
  overlay.appendChild(crackSvg);

  const shards = [];
  const shardCount = 130;
  for (let i = 0; i < shardCount; i++) {
    const el = document.createElement('div');
    const isCenter = Math.random() < 0.55;
    const size = isCenter ? 12 + Math.random() * 55 : 35 + Math.random() * 130;
    let x, y;
    if (isCenter) {
      x = W / 2 + (Math.random() - 0.5) * W * 0.55;
      y = H / 2 + (Math.random() - 0.5) * H * 0.55;
    } else {
      x = Math.random() * W; y = Math.random() * H;
    }
    const sides = 3 + Math.floor(Math.random() * 3);
    const pts = [];
    for (let j = 0; j < sides; j++) {
      const a = (j / sides) * Math.PI * 2 + Math.random() * 1.1;
      const r = 25 + Math.random() * 38;
      pts.push(`${50 + Math.cos(a) * r}% ${50 + Math.sin(a) * r}%`);
    }
    const gradAngle = Math.random() * 360;
    const isBlue = Math.random() > 0.5;
    const highlight = isBlue ? 'rgba(215,240,255,0.9)' : 'rgba(255,248,230,0.95)';
    const mid = isBlue ? 'rgba(185,210,245,0.5)' : 'rgba(255,242,210,0.55)';
    const edgeGlow = isBlue ? 'rgba(190,220,255,0.5)' : 'rgba(255,240,190,0.45)';
    el.style.cssText = `
      position:absolute; left:${x}px; top:${y}px;
      width:${size}px; height:${size}px;
      clip-path:polygon(${pts.join(',')});
      background:linear-gradient(${gradAngle}deg,
        ${highlight} 0%,
        ${mid} 35%,
        rgba(165,195,235,0.25) 60%,
        rgba(255,255,255,0.1) 100%);
      box-shadow:
        inset 0 0 32px rgba(255,255,255,0.65),
        inset 0 0 10px rgba(255,255,255,1),
        0 0 24px ${edgeGlow},
        0 0 50px rgba(255,255,255,0.1),
        0 6px 20px rgba(40,30,15,0.35);
      opacity:0;
      z-index:3;
    `;
    overlay.appendChild(el);
    const dx = x + size / 2 - W / 2;
    const dy = y + size / 2 - H / 2;
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);
    shards.push({ el, x, y, size, distFromCenter, isCenter });
  }
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    shards.forEach((s) => {
      const delay = 80 + (s.distFromCenter / Math.max(W, H)) * 700;
      setTimeout(() => { s.el.style.transition = 'opacity 0.3s ease'; s.el.style.opacity = '1'; }, delay);
    });

    crackItems.forEach((cp) => {
      const delay = 200 + (cp.dist / 120) * 800 + Math.random() * 150;
      setTimeout(() => { cp.el.style.transition = 'opacity 0.18s ease'; cp.el.style.opacity = '1'; }, delay);
    });

    setTimeout(() => {
      shockwave.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      shockwave.style.width = '150px'; shockwave.style.height = '150px'; shockwave.style.opacity = '0.9';
      setTimeout(() => {
        shockwave.style.transition = 'all 0.7s ease-out';
        shockwave.style.width = '500px'; shockwave.style.height = '500px'; shockwave.style.opacity = '0';
      }, 500);
    }, 500);

    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;background:radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.92) 12%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0.1) 60%, transparent 75%);opacity:0;z-index:199;pointer-events:none;transition:opacity 0.15s ease;';
    document.body.appendChild(flash);
    setTimeout(() => { flash.style.opacity = '1'; }, 800);

    setTimeout(() => {
      shards.forEach((s) => {
        const sx = (Math.random() - 0.5) * 6;
        const sy = (Math.random() - 0.5) * 6;
        s.el.style.transition = 'transform 0.06s ease';
        s.el.style.transform = `translate(${sx}px, ${sy}px)`;
      });
      pages.login.style.transition = 'transform 0.06s ease';
      pages.login.style.transform = `translate(${(Math.random() - 0.5) * 3}px, ${(Math.random() - 0.5) * 3}px)`;
    }, 950);
    setTimeout(() => {
      shards.forEach((s) => { s.el.style.transform = `translate(${(Math.random() - 0.5) * 4}px, ${(Math.random() - 0.5) * 4}px)`; });
      pages.login.style.transform = `translate(${(Math.random() - 0.5) * 2}px, ${(Math.random() - 0.5) * 2}px)`;
    }, 1010);
    setTimeout(() => {
      shards.forEach((s) => { s.el.style.transform = 'translate(0,0)'; });
      pages.login.style.transform = 'translate(0,0)';
    }, 1080);

    setTimeout(() => {
      flash.style.transition = 'opacity 1.0s ease'; flash.style.opacity = '0';
      shards.forEach((s) => {
        const dx = s.x + s.size / 2 - W / 2;
        const dy = s.y + s.size / 2 - H / 2;
        const angle = Math.atan2(dy, dx);
        const dist = 300 + Math.random() * 1000;
        const fx = Math.cos(angle) * dist + (Math.random() - 0.5) * 350;
        const fy = Math.sin(angle) * dist + (Math.random() - 0.5) * 350;
        const rot = (Math.random() - 0.5) * 240;
        const delay = Math.random() * 0.35;
        const dur = 1.3 + Math.random() * 1.0;
        s.el.style.transition = `transform ${dur}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, opacity ${dur * 0.55}s ease ${delay}s`;
        requestAnimationFrame(() => {
          s.el.style.transform = `translate(${fx}px, ${fy}px) rotate(${rot}deg) scale(0.05)`;
          s.el.style.opacity = '0';
        });
      });
      setTimeout(() => { crackItems.forEach(cp => { cp.el.style.transition = 'opacity 0.8s ease'; cp.el.style.opacity = '0'; }); }, 500);
    }, 1200);

    setTimeout(() => { overlay.remove(); flash.remove(); }, 4000);
  });

  pages.login.style.transition = 'opacity 0.6s ease';
  pages.login.style.opacity = '0';

  setTimeout(() => {
    showPage('home');
    const home = pages.home;
    home.style.opacity = '0'; home.style.transform = 'scale(1.1)';
    requestAnimationFrame(() => {
      home.style.transition = 'opacity 1.4s ease, transform 1.4s ease';
      home.style.opacity = '1'; home.style.transform = 'scale(1)';
    });
  }, 800);

  setTimeout(() => {
    pages.login.style.transition = ''; pages.login.style.opacity = ''; pages.login.style.transform = '';
    pages.home.style.transition = ''; pages.home.style.opacity = ''; pages.home.style.transform = '';
  }, 2800);
}




// 退出
document.getElementById('logoutBtn').addEventListener('click', async () => {
  entered = false;
  currentUser = null;
  await window.taojianAPI.logoutUser();
  showPage('login');
  pages.login.style.opacity = '1'; pages.login.style.transform = 'scale(1)';
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginError').classList.remove('show');
  loadUserList();
});

// 返回按钮
document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', () => showPage('home'));
});

let columnPrefs = {};
async function loadColumnPrefs() {
  const res = await window.taojianAPI.loadColumnPrefs();
  if (res.success) columnPrefs = res.data || {};
}
async function saveColumnPrefs() {
  await window.taojianAPI.saveColumnPrefs(columnPrefs);
}

// ========== 四象限数据 ==========
const categoryMeta = {
  work: { name: '工作', icon: '&#128203;' },
  life: { name: '生活', icon: '&#127861;' },
  study: { name: '学习', icon: '&#127891;' },
  collection: { name: '收藏备忘', icon: '&#128278;' }
};
const sectorBgMap = { 0: 'bg-work.jpg', 1: 'bg-life.jpg', 2: 'bg-memorial.jpg', 3: 'bg-password.jpg' };
const subPageBgMap = { work: 'sub-work.jpg', life: 'sub-life.jpg', study: 'sub-memorial.jpg', collection: 'sub-password.jpg' };
const defaultHomeBg = '../assets/bg_home.jpg';

// 内存中的数据缓存
const appData = { work: [], life: [], study: [], collection: [] };
let currentCategory = '';
let currentItemId = null;
let searchTerm = '';

// 加载数据
async function loadCategory(cat) {
  const res = await window.taojianAPI.readData(cat);
  if (res.success) appData[cat] = res.data;
  else console.error('读取失败:', res.error);
  return appData[cat];
}

// 渲染列表
function renderList(cat, filter = '') {
  const body = document.getElementById('body-' + cat);
  const searchBar = body.querySelector('.search-bar');
  let items = appData[cat] || [];
    // 按更新时间降序排序
    items = [...items].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  if (filter) {
    const term = filter.toLowerCase();
    items = items.filter(it => (it.title || '').toLowerCase().includes(term) || (it.content || '').toLowerCase().includes(term));
  }

  // 清空已有条目（保留搜索栏）
  const existing = body.querySelectorAll('.sub-item, .empty-state');
  existing.forEach(el => el.remove());

  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `<div class="empty-icon">&#128221;</div><div class="empty-text">暂无条目</div><div class="empty-sub">点击右上角「新建」添加第一个条目</div>`;
    body.appendChild(empty);
  } else {
    items.forEach((it, idx) => {
      const desc = (it.content || '').split('\n')[0].substring(0, 40) || '...';
      const date = window.taojianAPI.formatDate(it.updatedAt);
      const el = document.createElement('div');
      el.className = 'sub-item';
      el.dataset.id = it.id;
      el.innerHTML = `
        <div class="si-icon">${categoryMeta[cat].icon}</div>
        <div class="si-text">
          <div class="si-title">${escapeHtml(it.title || '未命名')}</div>
          <div class="si-desc">${escapeHtml(desc)}</div>
          <div class="si-date">${date}</div>
        </div>
        <div class="si-actions">
          <button class="si-btn" data-edit="${it.id}">&#9998;</button>
          <button class="si-btn danger" data-delete="${it.id}">&#128465;</button>
        </div>
      `;
      el.addEventListener('click', (e) => {
        if (e.target.closest('.si-actions')) return;
        openEdit(cat, it.id);
      });
      body.appendChild(el);
    });
  }

  // 绑定操作按钮
  body.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openEdit(cat, btn.dataset.edit); });
  });
  body.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.stopPropagation(); openDeleteConfirm(cat, btn.dataset.delete); });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str; return div.innerHTML;
}

// 安全弹窗：alert 后如果编辑框仍打开，恢复焦点到第一个输入框
function safeAlert(msg) {
  alert(msg);
  if (editModal && editModal.classList.contains('active')) {
    setTimeout(() => {
      const active = document.querySelector('.modal-body .field-input:focus, .modal-body .field-textarea:focus');
      const first = document.querySelector('.modal-body .field-input, .modal-body .field-textarea');
      if (active) active.focus();
      else if (first) first.focus();
    }, 50);
  }
}

// 模糊搜索自动补全
function initColumnResizers(tableKey, headerEl, rowsContainerId) {
  if (!headerEl) return;
  const cells = headerEl.querySelectorAll(':scope > div');
  cells.forEach((cell, idx) => {
    if (idx >= cells.length - 1) return;
    let resizer = cell.querySelector('.col-resizer');
    if (!resizer) {
      resizer = document.createElement('div');
      resizer.className = 'col-resizer';
      cell.appendChild(resizer);
    }
    resizer.onmousedown = (e) => {
      e.preventDefault();
      const startX = e.clientX;
      const style = window.getComputedStyle(headerEl);
      const cols = style.gridTemplateColumns.split(' ');
      const startWidth = parseFloat(cols[idx]);
      const onMove = (ev) => {
        const delta = ev.clientX - startX;
        const newCols = [...cols];
        // Convert to px if needed
        const headerRect = headerEl.getBoundingClientRect();
        const base = newCols[idx].endsWith('px') ? parseFloat(newCols[idx]) : headerRect.width * (parseFloat(newCols[idx]) / newCols.reduce((s, c) => s + (c.endsWith('px') ? parseFloat(c) : parseFloat(c) * headerRect.width), 0));
        const newW = Math.max(40, base + delta);
        newCols[idx] = newW + 'px';
        headerEl.style.gridTemplateColumns = newCols.join(' ');
        const container = document.getElementById(rowsContainerId);
        if (container) {
          container.querySelectorAll('.work-row').forEach(row => {
            row.style.gridTemplateColumns = newCols.join(' ');
          });
        }
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        columnPrefs[tableKey] = headerEl.style.gridTemplateColumns;
        saveColumnPrefs();
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    };
  });
}

function applyColumnWidths(tableKey, headerEl, rowsContainerId) {
  if (!headerEl || !columnPrefs[tableKey]) return;
  const w = columnPrefs[tableKey];
  headerEl.style.gridTemplateColumns = w;
  const container = document.getElementById(rowsContainerId);
  if (container) {
    container.querySelectorAll('.work-row').forEach(row => {
      row.style.gridTemplateColumns = w;
    });
  }
}

function setupFuzzyAutocomplete(inputId, getSuggestions) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const wrap = document.createElement('div');
  wrap.className = 'fuzzy-wrap';
  input.parentNode.insertBefore(wrap, input);
  wrap.appendChild(input);
  const list = document.createElement('div');
  list.className = 'fuzzy-list';
  wrap.appendChild(list);

  input.addEventListener('input', () => {
    const val = input.value.trim().toLowerCase();
    const suggestions = getSuggestions().filter(s => s.toLowerCase().includes(val));
    if (!val || suggestions.length === 0) {
      list.classList.remove('active');
      return;
    }
    list.innerHTML = suggestions.slice(0, 10).map(s => `<div class="fuzzy-item">${escapeHtml(s)}</div>`).join('');
    list.classList.add('active');
    list.querySelectorAll('.fuzzy-item').forEach(item => {
      item.addEventListener('click', () => {
        input.value = item.textContent;
        list.classList.remove('active');
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) list.classList.remove('active');
  });
}


// 打开子页面
async function openSector(key) {
  await loadColumnPrefs();
  if (key === 'work') {
    currentCategory = key;
    await loadWorkData();
    switchWorkTab('todo');
    updateWorkFilterOptions();
    showPage(key);
    return;
  }
  if (key === 'life') {
    currentCategory = key;
    await loadLifeData();
    switchLifeTab('todo');
    updateLifeFilterOptions();
    showPage(key);
    return;
  }
  if (key === 'study') {
    currentCategory = key;
    await loadStudyData();
    renderStudy();
    updateStudyFilterOptions();
    showPage(key);
    return;
  }
  if (key === 'collection') {
    currentCategory = key;
    await loadCollectionData();
    switchCollectionTab('urls');
    updateCollectionFilterOptions();
    showPage(key);
    return;
  }
  currentCategory = key;
  await loadCategory(key);
  renderList(key);
  showPage(key);
}

// 搜索
const searchInputs = document.querySelectorAll('[data-search]');
searchInputs.forEach(inp => {
  inp.addEventListener('input', (e) => {
    const cat = inp.dataset.search;
    renderList(cat, e.target.value.trim());
  });
});

// ========== 编辑模态框 ==========
const editModal = document.getElementById('editModal');
const modalTitle = document.getElementById('modalTitle');
const modalInputTitle = document.getElementById('modalInputTitle');
const modalInputContent = document.getElementById('modalInputContent');
const modalSave = document.getElementById('modalSave');
const modalCancel = document.getElementById('modalCancel');
const modalDelete = document.getElementById('modalDelete');
const modalClose = document.getElementById('modalClose');

let draftTimer = null;
function openEdit(cat, id) {
  if (cat === 'study') { openStudyEdit(id); return; }
  if (cat === 'collection') { openCollectionEdit(currentCollectionTab, id); return; }
  currentCategory = cat;
  currentItemId = id || null;
  const item = id ? (appData[cat] || []).find(i => i.id === id) : null;
  modalTitle.textContent = item ? '编辑' : '新建';
  modalInputTitle.value = item ? item.title : '';
  modalInputContent.value = item ? item.content : '';
  modalDelete.style.display = item ? 'inline-block' : 'none';
  editModal.classList.add('active');
  setTimeout(() => modalInputTitle.focus(), 100);
  // 自动保存草稿
  if (draftTimer) clearInterval(draftTimer);
  draftTimer = setInterval(() => {
    if (!editModal.classList.contains('active')) { clearInterval(draftTimer); return; }
    const draft = { title: modalInputTitle.value, content: modalInputContent.value };
    window.taojianAPI.saveDraft(cat, draft);
  }, 5000);
}

function closeEdit() {
  editModal.classList.remove('active');
  if (draftTimer) { clearInterval(draftTimer); draftTimer = null; }
  window.taojianAPI.clearDraft(currentCategory);
  currentItemId = null;
}

modalSave.addEventListener('click', async () => {
  if (currentCategory === 'work' || currentCategory === 'life') return; // 工作/生活模块由独立处理器处理
  const title = modalInputTitle.value.trim();
  const content = modalInputContent.value;
  if (!title) { modalInputTitle.focus(); return; }
  const item = { id: currentItemId, title, content };
  const res = await window.taojianAPI.saveItem(currentCategory, item);
  if (res.success) {
    appData[currentCategory] = res.data;
    renderList(currentCategory, document.querySelector(`[data-search="${currentCategory}"]`)?.value.trim() || '');
    closeEdit();
  } else {
    safeAlert('保存失败：' + res.error);
  }
});

modalCancel.addEventListener('click', closeEdit);
modalClose.addEventListener('click', closeEdit);
// editModal.addEventListener('click', (e) => { if (e.target === editModal) closeEdit(); }); // 点击外部不关闭，防止误触丢失内容

// 删除按钮（在编辑模态框中）
modalDelete.addEventListener('click', () => {
  if (currentCategory === 'work') {
    if (!currentWorkItemId) return;
    closeEdit();
    deleteWorkItem(currentWorkTab, currentWorkItemId);
    return;
  }
  if (currentCategory === 'study') {
    if (!currentStudyItemId) return;
    closeEdit();
    deleteStudyItem(currentStudyItemId);
    return;
  }
  if (currentCategory === 'collection') {
    if (!currentCollectionItemId) return;
    closeEdit();
    deleteCollectionItem(currentCollectionTab, currentCollectionItemId);
    return;
  }
  if (!currentItemId) return;
  closeEdit();
  openDeleteConfirm(currentCategory, currentItemId);
});

// ========== 删除确认对话框 ==========
const confirmDialog = document.getElementById('confirmDialog');
let confirmDeleteId = null;
let confirmDeleteCat = null;
let confirmDeleteCallback = null;

function openDeleteConfirm(cat, id, callback = null) {
  confirmDeleteCat = cat;
  confirmDeleteId = id;
  confirmDeleteCallback = callback;
  confirmDialog.classList.add('active');
}

function closeConfirm() {
  confirmDialog.classList.remove('active');
  confirmDeleteId = null; confirmDeleteCat = null; confirmDeleteCallback = null;
}

async function doDelete() {
  if (!confirmDeleteId || !confirmDeleteCat) return;
  if (confirmDeleteCallback) {
    confirmDeleteCallback();
    return;
  }
  const res = await window.taojianAPI.deleteItem(confirmDeleteCat, confirmDeleteId);
  if (res.success) {
    appData[confirmDeleteCat] = res.data;
    renderList(confirmDeleteCat, document.querySelector(`[data-search="${confirmDeleteCat}"]`)?.value.trim() || '');
    closeConfirm();
  } else {
    safeAlert('删除失败：' + res.error);
  }
}

// confirmDialog.addEventListener('click', (e) => { if (e.target === confirmDialog) closeConfirm(); }); // 点击外部不关闭
document.getElementById('confirmCancel').addEventListener('click', closeConfirm);
document.getElementById('confirmDelete').addEventListener('click', doDelete);

// 新建按钮
document.querySelectorAll('[data-new]').forEach(btn => {
  btn.addEventListener('click', () => openEdit(btn.dataset.new, null));
});

// 导出按钮
document.querySelectorAll('[data-export]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const cat = btn.dataset.export;
    const res = await window.taojianAPI.exportData(cat);
    if (res.success && !res.cancelled) {
      safeAlert('导出成功！');
    } else if (!res.cancelled) {
      safeAlert('导出失败：' + res.error);
    }
  });
});

// 导入按钮
document.querySelectorAll('[data-import]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const cat = btn.dataset.import;
    const res = await window.taojianAPI.importData(cat);
    if (res.success && !res.cancelled) {
      appData[cat] = res.data;
      renderList(cat, document.querySelector(`[data-search="${cat}"]`)?.value.trim() || '');
      safeAlert(`导入成功！共 ${res.data.length} 条数据`);
    } else if (!res.cancelled) {
      safeAlert('导入失败：' + res.error);
    }
  });
});

// ========== 四象限公转动画 & 交互 ==========
const pieContainer = document.getElementById('pieContainer');
const pieLabels = document.querySelectorAll('.pie-label');
const sectorPhotoWraps = document.querySelectorAll('.sector-photo-wrap');
const homePage = document.getElementById('homePage');

const ORBIT_RADIUS = 32;
const ORBIT_SIZE = 24;
const orbits = [
  { sector: 0, angle: 0,   speed: 0.10 },
  { sector: 1, angle: 90,  speed: 0.10 },
  { sector: 2, angle: 180, speed: 0.10 },
  { sector: 3, angle: 270, speed: 0.10 }
];
let isPaused = false;
let animId = null;
let currentHover = -1;

function updateOrbit() {
  orbits.forEach((orb, i) => {
    if (!isPaused) orb.angle += orb.speed;
    const rad = orb.angle * Math.PI / 180;
    const x = 50 - ORBIT_SIZE / 2 + ORBIT_RADIUS * Math.cos(rad);
    const y = 50 - ORBIT_SIZE / 2 + ORBIT_RADIUS * Math.sin(rad);
    sectorPhotoWraps[i].style.left = x + '%'; sectorPhotoWraps[i].style.top = y + '%';
    pieLabels[i].style.left = x + '%'; pieLabels[i].style.top = y + '%';
  });
  animId = requestAnimationFrame(updateOrbit);
}
animId = requestAnimationFrame(updateOrbit);

function getHoveredSector(e) {
  for (let i = 0; i < 4; i++) {
    const rect = sectorPhotoWraps[i].getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const dist = Math.sqrt((e.clientX - cx) ** 2 + (e.clientY - cy) ** 2);
    if (dist <= rect.width / 2) return i;
  }
  return -1;
}

pieContainer.addEventListener('mousemove', (e) => {
  const sector = getHoveredSector(e);
  if (sector !== currentHover) {
    if (currentHover >= 0) {
      isPaused = false;
      sectorPhotoWraps[currentHover].style.transform = 'scale(1)';
      sectorPhotoWraps[currentHover].style.opacity = '0.85';
      pieLabels[currentHover].style.opacity = '1';
    }
    currentHover = sector;
    if (sector >= 0) {
      isPaused = true;
      sectorPhotoWraps[sector].style.transform = 'scale(1.12)';
      sectorPhotoWraps[sector].style.opacity = '1';
      pieLabels[sector].style.opacity = '1';
      homePage.classList.add('bg-sharp');
      homePage.style.filter = 'brightness(1.06) contrast(1.04)';
      homePage.style.background = `url('../assets/${sectorBgMap[sector]}') center center / cover no-repeat`;
    } else {
      homePage.classList.remove('bg-sharp');
      homePage.style.filter = '';
      homePage.style.background = '';
    }
  }
});

pieContainer.addEventListener('mouseleave', () => {
  if (currentHover >= 0) {
    isPaused = false;
    sectorPhotoWraps[currentHover].style.transform = 'scale(1)';
    sectorPhotoWraps[currentHover].style.opacity = '0.85';
    pieLabels[currentHover].style.opacity = '1';
    currentHover = -1;
  }
  homePage.classList.remove('bg-sharp');
  homePage.style.filter = '';
  homePage.style.background = '';
});

pieLabels.forEach((label) => {
  label.addEventListener('click', () => {
    const key = label.dataset.key;
    if (key) openSector(key);
  });
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (editModal.classList.contains('active')) closeEdit();
    else if (confirmDialog.classList.contains('active')) closeConfirm();
  }
});


// ========== 工作模块 ==========
const workMeta = {
  todo:    { cat: 'work-todo',    label: '待办工作', name: '待办工作' },
  done:    { cat: 'work-done',    label: '已归档', name: '已归档工作' },
  notes:   { cat: 'work-notes',   label: '工作笔记', name: '工作笔记' },
  project: { cat: 'work-project', label: '项目档案', name: '项目档案' },
  freight: { cat: 'work-freight', label: '货运追踪', name: '货运追踪' }
};
const workData = { todo: [], done: [], notes: [], project: [], freight: [] };
let currentWorkTab = 'todo';
let currentWorkItemId = null;

// 加载全部工作数据
async function loadWorkData() {
  for (const [key, meta] of Object.entries(workMeta)) {
    const res = await window.taojianAPI.readData(meta.cat);
    if (res.success) workData[key] = res.data;
    else console.error('读取失败:', meta.cat, res.error);
  }
}

// 切换标签
function switchWorkTab(tab) {
  currentWorkTab = tab;
  document.querySelectorAll('.work-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.workTab === tab);
  });
  document.querySelectorAll('[data-work-panel]').forEach(p => {
    p.style.display = p.dataset.workPanel === tab ? 'block' : 'none';
  });
  renderWorkTab(tab);
  updateWorkFilterOptions();
}

// 更新项目筛选下拉
function updateWorkFilterOptions() {
  const sel = document.getElementById('workFilterProject');
  const allProjects = new Set();
  (workData[currentWorkTab] || []).forEach(it => { if (it.project) allProjects.add(it.project); });
  const currentVal = sel.value;
  let html = '<option value="all">全部项目</option>';
  Array.from(allProjects).sort().forEach(p => {
    html += `<option value="${escapeHtml(p)}"${p === currentVal ? ' selected' : ''}>${escapeHtml(p)}</option>`;
  });
  sel.innerHTML = html;
}

// 渲染当前标签
function renderWorkTab(tab, filterText = '') {
  const container = document.getElementById(`work-rows-${tab}`);
  const header = document.querySelector(`[data-work-panel="${tab}"]:not([style*="display:none"]) .work-table-header`) || document.querySelector(`[data-work-panel="${tab}"] .work-table-header`);
  let items = workData[tab] || [];
  items = [...items].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  const term = filterText.toLowerCase();
  if (term) {
    items = items.filter(it => Object.values(it).some(v => String(v || '').toLowerCase().includes(term)));
  }
  const projFilter = document.getElementById('workFilterProject').value;
  if (projFilter !== 'all') {
    items = items.filter(it => it.project === projFilter);
  }

  container.innerHTML = '';
  if (items.length === 0) {
    container.innerHTML = `<div class="work-empty"><div class="empty-icon">&#128221;</div><div class="empty-text">暂无${workMeta[tab].label}条目</div><div class="empty-sub">点击右上角「新建」添加</div></div>`;
    return;
  }

  if (tab === 'todo') renderTodoRows(items, container);
  else if (tab === 'done') renderDoneRows(items, container);
  else if (tab === 'notes') renderNotesRows(items, container);
  else if (tab === 'project') renderProjectRows(items, container);
  else if (tab === 'freight') renderFreightRows(items, container);
  requestAnimationFrame(() => {
    const h = document.querySelector(`[data-work-panel="${tab}"] .work-table-header`);
    if (h) {
      initColumnResizers(`work-${tab}`, h, `work-rows-${tab}`);
      applyColumnWidths(`work-${tab}`, h, `work-rows-${tab}`);
    }
  });
}

function renderTodoRows(items, container) {
  items.forEach(it => {
    const tagMap = { '待办': 'todo', '进行中': 'doing', '延期': 'delay' };
    const tagClass = tagMap[it.status] || 'todo';
    const el = document.createElement('div');
    el.className = 'work-row';
    el.style.gridTemplateColumns = '1.5fr 2fr 1fr 1fr 1fr 90px 100px';
    el.innerHTML = `
      <div>${escapeHtml(it.project || '')}</div>
      <div>${escapeHtml(it.task || '')}</div>
      <div>${escapeHtml(it.contact || '')}</div>
      <div>${escapeHtml(it.createDate || '')}</div>
      <div>${escapeHtml(it.dueDate || '')}</div>
      <div><span class="col-tag ${tagClass}">${escapeHtml(it.status || '待办')}</span></div>
      <div class="work-row-actions">
        <button class="wr-btn complete" title="标记完成" data-complete="${it.id}">&#10003;</button>
        <button class="wr-btn" title="编辑" data-edit-work="${it.id}">&#9998;</button>
        <button class="wr-btn danger" title="删除" data-delete-work="${it.id}">&#128465;</button>
      </div>`;
    el.addEventListener('click', (e) => { if (!e.target.closest('.work-row-actions')) openWorkEdit('todo', it.id); });
    container.appendChild(el);
  });
}

function renderDoneRows(items, container) {
  items.forEach(it => {
    const el = document.createElement('div');
    el.className = 'work-row';
    el.style.gridTemplateColumns = '1.5fr 2fr 1fr 1fr 1fr 1fr 100px';
    el.innerHTML = `
      <div>${escapeHtml(it.project || '')}</div>
      <div>${escapeHtml(it.task || '')}</div>
      <div>${escapeHtml(it.contact || '')}</div>
      <div>${escapeHtml(it.createDate || '')}</div>
      <div>${escapeHtml(it.dueDate || '')}</div>
      <div>${escapeHtml(it.completedDate || '')}</div>
      <div class="work-row-actions">
        <button class="wr-btn complete" title="移回待办" data-return-todo="${it.id}">&#8634;</button>
        <button class="wr-btn" title="编辑" data-edit-work="${it.id}">&#9998;</button>
        <button class="wr-btn danger" title="删除" data-delete-work="${it.id}">&#128465;</button>
      </div>`;
    el.addEventListener('click', (e) => { if (!e.target.closest('.work-row-actions')) openWorkEdit('done', it.id); });
    container.appendChild(el);
  });
}

function renderNotesRows(items, container) {
  items.forEach(it => {
    const el = document.createElement('div');
    el.className = 'work-note-card';
    el.dataset.id = it.id;
    el.innerHTML = `
      <div class="work-note-project">${escapeHtml(it.project || '无项目')}<span class="work-note-date">${escapeHtml(it.date || '')}</span></div>
      <div class="work-note-text">${escapeHtml(it.note || '').replace(/\n/g, '<br>')}</div>
      <div class="work-note-time">${window.taojianAPI.formatDate(it.updatedAt)}</div>
      <div class="work-row-actions" style="opacity:1;justify-content:flex-end;margin-top:8px;">
        <button class="wr-btn" title="编辑" data-edit-work="${it.id}">&#9998;</button>
        <button class="wr-btn danger" title="删除" data-delete-work="${it.id}">&#128465;</button>
      </div>`;
    el.addEventListener('click', (e) => { if (!e.target.closest('.work-row-actions')) openWorkEdit('notes', it.id); });
    container.appendChild(el);
  });
}

function renderProjectRows(items, container) {
  items.forEach(it => {
    const el = document.createElement('div');
    el.className = 'work-row';
    el.style.gridTemplateColumns = '1.5fr 1fr 1.2fr 1.5fr 2fr 1.5fr 100px';
    el.innerHTML = `
      <div>${escapeHtml(it.project || '')}</div>
      <div>${escapeHtml(it.name || '')}</div>
      <div>${escapeHtml(it.position || '')}</div>
      <div>${escapeHtml(it.phone || '')}</div>
      <div>${escapeHtml(it.address || '')}</div>
      <div>${escapeHtml(it.remark || '')}</div>
      <div class="work-row-actions">
        <button class="wr-btn" title="编辑" data-edit-work="${it.id}">&#9998;</button>
        <button class="wr-btn danger" title="删除" data-delete-work="${it.id}">&#128465;</button>
      </div>`;
    el.addEventListener('click', (e) => { if (!e.target.closest('.work-row-actions')) openWorkEdit('project', it.id); });
    container.appendChild(el);
  });
}

function renderFreightRows(items, container) {
  items.forEach(it => {
    const tagMap = { '运输中': 'shipping', '已送达': 'delivered', '异常': 'abnormal' };
    const tagClass = tagMap[it.status] || 'shipping';
    const el = document.createElement('div');
    el.className = 'work-row';
    el.style.gridTemplateColumns = '1.5fr 2fr 110px 1fr 1.5fr 1fr 100px';
    el.innerHTML = `
      <div>${escapeHtml(it.project || '')}</div>
      <div>${escapeHtml(it.cargo || '')}</div>
      <div><span class="col-tag ${tagClass}">${escapeHtml(it.status || '运输中')}</span></div>
      <div>${escapeHtml(it.company || '')}</div>
      <div>${escapeHtml(it.trackingNo || '')}</div>
      <div>${escapeHtml(it.shipDate || '')}</div>
      <div class="work-row-actions">
        <button class="wr-btn" title="编辑" data-edit-work="${it.id}">&#9998;</button>
        <button class="wr-btn danger" title="删除" data-delete-work="${it.id}">&#128465;</button>
      </div>`;
    el.addEventListener('click', (e) => { if (!e.target.closest('.work-row-actions')) openWorkEdit('freight', it.id); });
    container.appendChild(el);
  });
}

// 标记完成
async function markWorkComplete(id) {
  const item = workData.todo.find(i => i.id === id);
  if (!item) return;
  const resDel = await window.taojianAPI.deleteItem('work-todo', id);
  if (!resDel.success) { safeAlert('操作失败：' + resDel.error); return; }
  workData.todo = resDel.data;
  const doneItem = { project: item.project, task: item.task, contact: item.contact, createDate: item.createDate, dueDate: item.dueDate, completedDate: new Date().toISOString().slice(0,10) };
  const resAdd = await window.taojianAPI.saveItem('work-done', doneItem);
  if (resAdd.success) workData.done = resAdd.data;
  renderWorkTab('todo');
  updateWorkFilterOptions();
  safeAlert('已标记为完成！');
}

// 已归档移回待办
async function markWorkReturnToTodo(id) {
  const item = workData.done.find(i => i.id === id);
  if (!item) return;
  const resDel = await window.taojianAPI.deleteItem('work-done', id);
  if (!resDel.success) { safeAlert('操作失败：' + resDel.error); return; }
  workData.done = resDel.data;
  const todoItem = { project: item.project, task: item.task, contact: item.contact, createDate: item.createDate, dueDate: item.dueDate, status: '待办' };
  const resAdd = await window.taojianAPI.saveItem('work-todo', todoItem);
  if (resAdd.success) workData.todo = resAdd.data;
  renderWorkTab('done');
  updateWorkFilterOptions();
  safeAlert('已移回待办！');
}

// 删除工作条目
async function deleteWorkItem(tab, id) {
  openDeleteConfirm(workMeta[tab].cat, id, async () => {
    const res = await window.taojianAPI.deleteItem(workMeta[tab].cat, id);
    if (res.success) {
      workData[tab] = res.data;
      renderWorkTab(tab);
      updateWorkFilterOptions();
      closeConfirm();
    } else {
      safeAlert('删除失败：' + res.error);
    }
  });
}

// 打开工作编辑
function openWorkEdit(tab, id) {
  currentWorkTab = tab;
  currentWorkItemId = id || null;
  const item = id ? workData[tab].find(i => i.id === id) : null;
  modalTitle.textContent = item ? '编辑' + workMeta[tab].label : '新建' + workMeta[tab].label;
  buildWorkEditForm(tab, item);
  modalDelete.style.display = item ? 'inline-block' : 'none';
  editModal.classList.add('active');
  // 项目名称模糊搜索
  if (document.getElementById('wf-project')) {
    const allProjects = new Set();
    Object.values(workData).forEach(arr => arr.forEach(it => { if (it.project) allProjects.add(it.project); }));
    setupFuzzyAutocomplete('wf-project', () => Array.from(allProjects).sort());
  }
  setTimeout(() => {
    const firstInput = document.querySelector('.modal-body .field-input');
    if (firstInput) firstInput.focus();
  }, 100);
}

function buildWorkEditForm(tab, item) {
  const v = (k) => item ? (item[k] || '') : '';
  const body = document.querySelector('#editModal .modal-body');
  let html = '';
  if (tab === 'todo') {
    html = `
      <div class="field-group"><label class="field-label">项目</label><input type="text" class="field-input" id="wf-project" value="${escapeHtml(v('project'))}" placeholder="项目名称"></div>
      <div class="field-group"><label class="field-label">待办事项</label><input type="text" class="field-input" id="wf-task" value="${escapeHtml(v('task'))}" placeholder="待办事项"></div>
      <div class="field-group"><label class="field-label">对接人</label><input type="text" class="field-input" id="wf-contact" value="${escapeHtml(v('contact'))}" placeholder="对接人姓名"></div>
      <div class="field-group" style="display:flex;gap:12px;">
        <div style="flex:1"><label class="field-label">任务创建时间</label><input type="date" class="field-input" id="wf-createDate" value="${v('createDate')}"></div>
        <div style="flex:1"><label class="field-label">预计完成时间</label><input type="date" class="field-input" id="wf-dueDate" value="${v('dueDate')}"></div>
      </div>
      <div class="field-group"><label class="field-label">状态</label>
        <select class="field-input" id="wf-status">
          <option value="待办" ${v('status')==='待办'?'selected':''}>待办</option>
          <option value="进行中" ${v('status')==='进行中'?'selected':''}>进行中</option>
          <option value="延期" ${v('status')==='延期'?'selected':''}>延期</option>
        </select>
      </div>`;
  } else if (tab === 'done') {
    html = `
      <div class="field-group"><label class="field-label">项目</label><input type="text" class="field-input" id="wf-project" value="${escapeHtml(v('project'))}" placeholder="项目名称"></div>
      <div class="field-group"><label class="field-label">待办事项</label><input type="text" class="field-input" id="wf-task" value="${escapeHtml(v('task'))}" placeholder="待办事项"></div>
      <div class="field-group"><label class="field-label">对接人</label><input type="text" class="field-input" id="wf-contact" value="${escapeHtml(v('contact'))}" placeholder="对接人姓名"></div>
      <div class="field-group" style="display:flex;gap:12px;">
        <div style="flex:1"><label class="field-label">任务创建时间</label><input type="date" class="field-input" id="wf-createDate" value="${v('createDate')}"></div>
        <div style="flex:1"><label class="field-label">预计完成时间</label><input type="date" class="field-input" id="wf-dueDate" value="${v('dueDate')}"></div>
      </div>
      <div class="field-group"><label class="field-label">实际完成时间</label><input type="date" class="field-input" id="wf-completedDate" value="${v('completedDate')}"></div>`;
  } else if (tab === 'notes') {
    html = `
      <div class="field-group" style="display:flex;gap:12px;">
        <div style="flex:1"><label class="field-label">项目</label><input type="text" class="field-input" id="wf-project" value="${escapeHtml(v('project'))}" placeholder="项目名称"></div>
        <div style="flex:0.5"><label class="field-label">日期</label><input type="date" class="field-input" id="wf-date" value="${v('date')}"></div>
      </div>
      <div class="field-group"><label class="field-label">笔记内容</label><textarea class="field-textarea" id="wf-note" spellcheck="false" placeholder="在此记录工作笔记..." style="min-height:260px;">${escapeHtml(v('note'))}</textarea></div>`;
  } else if (tab === 'project') {
    html = `
      <div class="field-group"><label class="field-label">项目</label><input type="text" class="field-input" id="wf-project" value="${escapeHtml(v('project'))}" placeholder="项目名称"></div>
      <div class="field-group"><label class="field-label">人员姓名</label><input type="text" class="field-input" id="wf-name" value="${escapeHtml(v('name'))}" placeholder="姓名"></div>
      <div class="field-group"><label class="field-label">职务</label><input type="text" class="field-input" id="wf-position" value="${escapeHtml(v('position'))}" placeholder="职务"></div>
      <div class="field-group"><label class="field-label">联系电话</label><input type="text" class="field-input" id="wf-phone" value="${escapeHtml(v('phone'))}" placeholder="联系电话"></div>
      <div class="field-group"><label class="field-label">寄件地址</label><input type="text" class="field-input" id="wf-address" value="${escapeHtml(v('address'))}" placeholder="寄件地址"></div>
      <div class="field-group"><label class="field-label">备注</label><textarea class="field-textarea" id="wf-remark" spellcheck="false" placeholder="备注信息...">${escapeHtml(v('remark'))}</textarea></div>`;
  } else if (tab === 'freight') {
    html = `
      <div class="field-group"><label class="field-label">项目</label><input type="text" class="field-input" id="wf-project" value="${escapeHtml(v('project'))}" placeholder="项目名称"></div>
      <div class="field-group"><label class="field-label">货物名称及数量</label><input type="text" class="field-input" id="wf-cargo" value="${escapeHtml(v('cargo'))}" placeholder="例如：样品x50件"></div>
      <div class="field-group"><label class="field-label">货物状态</label>
        <select class="field-input" id="wf-status">
          <option value="运输中" ${v('status')==='运输中'?'selected':''}>运输中</option>
          <option value="已送达" ${v('status')==='已送达'?'selected':''}>已送达</option>
          <option value="异常" ${v('status')==='异常'?'selected':''}>异常</option>
        </select>
      </div>
      <div class="field-group"><label class="field-label">货运公司</label><input type="text" class="field-input" id="wf-company" value="${escapeHtml(v('company'))}" placeholder="货运公司名称"></div>
      <div class="field-group"><label class="field-label">快递单号</label><input type="text" class="field-input" id="wf-trackingNo" value="${escapeHtml(v('trackingNo'))}" placeholder="快递单号"></div>
      <div class="field-group"><label class="field-label">发货日期</label><input type="date" class="field-input" id="wf-shipDate" value="${v('shipDate')}"></div>`;
  }
  body.innerHTML = html;
}

// 保存工作条目
async function saveWorkItem() {
  const tab = currentWorkTab;
  const id = currentWorkItemId;
  let item = { id };
  if (tab === 'todo') {
    item = { ...item, project: document.getElementById('wf-project').value.trim(), task: document.getElementById('wf-task').value.trim(), contact: document.getElementById('wf-contact').value.trim(), createDate: document.getElementById('wf-createDate').value, dueDate: document.getElementById('wf-dueDate').value, status: document.getElementById('wf-status').value };
  } else if (tab === 'done') {
    item = { ...item, project: document.getElementById('wf-project').value.trim(), task: document.getElementById('wf-task').value.trim(), contact: document.getElementById('wf-contact').value.trim(), createDate: document.getElementById('wf-createDate').value, dueDate: document.getElementById('wf-dueDate').value, completedDate: document.getElementById('wf-completedDate').value };
  } else if (tab === 'notes') {
    item = { ...item, project: document.getElementById('wf-project').value.trim(), date: document.getElementById('wf-date').value, note: document.getElementById('wf-note').value };
  } else if (tab === 'project') {
    item = { ...item, project: document.getElementById('wf-project').value.trim(), name: document.getElementById('wf-name').value.trim(), position: document.getElementById('wf-position').value.trim(), phone: document.getElementById('wf-phone').value.trim(), address: document.getElementById('wf-address').value.trim(), remark: document.getElementById('wf-remark').value };
  } else if (tab === 'freight') {
    item = { ...item, project: document.getElementById('wf-project').value.trim(), cargo: document.getElementById('wf-cargo').value.trim(), status: document.getElementById('wf-status').value, company: document.getElementById('wf-company').value.trim(), trackingNo: document.getElementById('wf-trackingNo').value.trim(), shipDate: document.getElementById('wf-shipDate').value };
  }
  const cat = workMeta[tab].cat;
  const res = await window.taojianAPI.saveItem(cat, item);
  if (res.success) {
    workData[tab] = res.data;
    renderWorkTab(tab);
    updateWorkFilterOptions();
    closeEdit();
  } else {
    safeAlert('保存失败：' + res.error);
  }
}

// 工作标签点击
document.querySelectorAll('[data-work-tab]').forEach(t => {
  t.addEventListener('click', () => switchWorkTab(t.dataset.workTab));
});

// 工作搜索
document.getElementById('workSearchInput').addEventListener('input', (e) => {
  renderWorkTab(currentWorkTab, e.target.value.trim());
});

// 项目筛选
document.getElementById('workFilterProject').addEventListener('change', () => {
  renderWorkTab(currentWorkTab, document.getElementById('workSearchInput').value.trim());
});

// 工作新建按钮
document.querySelector('[data-new-work]').addEventListener('click', () => openWorkEdit(currentWorkTab, null));

// 工作导出按钮
document.querySelector('[data-export-work]').addEventListener('click', async () => {
  const allData = {};
  for (const [key, meta] of Object.entries(workMeta)) {
    const res = await window.taojianAPI.readData(meta.cat);
    if (res.success) allData[key] = res.data;
  }
  const blob = new Blob([JSON.stringify(allData, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `work_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// 工作表格事件委托（动态按钮）
document.getElementById('workBody').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.dataset.complete) {
    e.stopPropagation();
    markWorkComplete(btn.dataset.complete);
  } else if (btn.dataset.editWork) {
    e.stopPropagation();
    openWorkEdit(currentWorkTab, btn.dataset.editWork);
  } else if (btn.dataset.returnTodo) {
    e.stopPropagation();
    markWorkReturnToTodo(btn.dataset.returnTodo);
  } else if (btn.dataset.deleteWork) {
    e.stopPropagation();
    deleteWorkItem(currentWorkTab, btn.dataset.deleteWork);
  }
});

// 修改模态框保存按钮支持工作/生活模块
modalSave.addEventListener('click', async () => {
  if (currentCategory === 'work') {
    await saveWorkItem();
    return;
  }
  if (currentCategory === 'life') {
    await saveLifeItem();
    return;
  }
  if (currentCategory === 'study') {
    await saveStudyItem();
    return;
  }
  if (currentCategory === 'collection') {
    await saveCollectionItem();
    return;
  }
  // 原有的保存逻辑...
  const title = modalInputTitle.value.trim();
  const content = modalInputContent.value;
  if (!title) { modalInputTitle.focus(); return; }
  const item = { id: currentItemId, title, content };
  const res = await window.taojianAPI.saveItem(currentCategory, item);
  if (res.success) {
    appData[currentCategory] = res.data;
    renderList(currentCategory, document.querySelector(`[data-search="${currentCategory}"]`)?.value.trim() || '');
    closeEdit();
  } else {
    safeAlert('保存失败：' + res.error);
  }
});

// 修改关闭编辑恢复模态框body
const originalCloseEdit = closeEdit;
closeEdit = function() {
  editModal.classList.remove('active');
  if (draftTimer) { clearInterval(draftTimer); draftTimer = null; }
  window.taojianAPI.clearDraft(currentCategory);
  currentItemId = null; currentWorkItemId = null; currentStudyItemId = null; currentCollectionItemId = null;
  // 恢复模态框body为默认结构（用于非工作模块）
  setTimeout(() => {
    const body = document.querySelector('#editModal .modal-body');
    body.innerHTML = `
      <div class="field-group"><label class="field-label">标题</label><input type="text" class="field-input" id="modalInputTitle" placeholder="输入标题..."></div>
      <div class="field-group"><label class="field-label">内容</label><textarea class="field-textarea" spellcheck="false" id="modalInputContent" placeholder="在此书写...

墨染流年，笺藏春秋"></textarea></div>
    `;
  }, 400);
};

// ========== 收藏备忘模块 ==========
const collectionMeta = {
  urls:     { cat: 'collection-urls',     label: '收藏网址', name: '收藏网址' },
  memories: { cat: 'collection-memories', label: '纪念日', name: '纪念日' },
  accounts: { cat: 'collection-accounts', label: '账号密码', name: '账号密码' },
  tips:     { cat: 'collection-tips',     label: '小tips', name: '小tips' }
};
const collectionData = { urls: [], memories: [], accounts: [], tips: [] };
let currentCollectionTab = 'urls';
let currentCollectionItemId = null;

async function loadCollectionData() {
  for (const [key, meta] of Object.entries(collectionMeta)) {
    const res = await window.taojianAPI.readData(meta.cat);
    if (res.success) collectionData[key] = res.data;
    else console.error('读取失败:', meta.cat, res.error);
  }
}

function switchCollectionTab(tab) {
  currentCollectionTab = tab;
  document.querySelectorAll('[data-collection-tab]').forEach(t => {
    t.classList.toggle('active', t.dataset.collectionTab === tab);
  });
  document.querySelectorAll('[data-collection-panel]').forEach(p => {
    p.style.display = p.dataset.collectionPanel === tab ? 'block' : 'none';
  });
  renderCollectionTab(tab);
  updateCollectionFilterOptions();
}

function updateCollectionFilterOptions() {
  const sel = document.getElementById('collectionFilterType');
  const tab = currentCollectionTab;
  let html = '<option value="all">全部类型</option>';
  if (tab === 'urls') {
    html += '<option value="有网址">有网址</option><option value="无网址">无网址</option>';
  } else if (tab === 'memories') {
    html += '<option value="本月">本月</option><option value="已过">已过</option>';
  } else if (tab === 'accounts') {
    const allTypes = new Set();
    (collectionData.accounts || []).forEach(it => { if (it.type) allTypes.add(it.type); });
    Array.from(allTypes).sort().forEach(t => {
      html += `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`;
    });
  } else if (tab === 'tips') {
    html += '<option value="有内容">有内容</option>';
  }
  sel.innerHTML = html;
}

function renderCollectionTab(tab, filterText = '') {
  const container = document.getElementById(`collection-rows-${tab}`);
  let items = collectionData[tab] || [];
  items = [...items].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  const term = filterText.toLowerCase();
  if (term) {
    items = items.filter(it => Object.values(it).some(v => String(v || '').toLowerCase().includes(term)));
  }
  const typeFilter = document.getElementById('collectionFilterType').value;
  if (typeFilter !== 'all') {
    if (tab === 'accounts') {
      items = items.filter(it => it.type === typeFilter);
    }
  }

  container.innerHTML = '';
  if (items.length === 0) {
    container.innerHTML = `<div class="work-empty"><div class="empty-icon">&#128221;</div><div class="empty-text">暂无${collectionMeta[tab].label}条目</div><div class="empty-sub">点击右上角「新建」添加</div></div>`;
    return;
  }

  if (tab === 'urls') renderCollectionUrlsRows(items, container);
  else if (tab === 'memories') renderCollectionMemoriesRows(items, container);
  else if (tab === 'accounts') renderCollectionAccountsRows(items, container);
  else if (tab === 'tips') renderCollectionTipsRows(items, container);
  requestAnimationFrame(() => {
    const h = document.querySelector(`[data-collection-panel="${tab}"] .work-table-header`);
    if (h) {
      initColumnResizers(`collection-${tab}`, h, `collection-rows-${tab}`);
      applyColumnWidths(`collection-${tab}`, h, `collection-rows-${tab}`);
    }
  });
}

function renderCollectionUrlsRows(items, container) {
  items.forEach(it => {
    const el = document.createElement('div');
    el.className = 'work-row';
    el.style.gridTemplateColumns = '1.5fr 2fr 1.5fr 100px';
    el.innerHTML = `
      <div>${escapeHtml(it.title || '')}</div>
      <div><a href="${escapeHtml(it.url || '')}" target="_blank" style="color:#3050a0;text-decoration:underline;" onclick="event.stopPropagation();window.taojianAPI.openExternal('${escapeHtml(it.url || '')}');return false;">${escapeHtml(it.url || '')}</a></div>
      <div>${escapeHtml(it.remark || '')}</div>
      <div class="work-row-actions">
        <button class="wr-btn" title="编辑" data-edit-collection="${it.id}">&#9998;</button>
        <button class="wr-btn danger" title="删除" data-delete-collection="${it.id}">&#128465;</button>
      </div>`;
    el.addEventListener('click', (e) => { if (!e.target.closest('.work-row-actions') && !e.target.closest('a')) openCollectionEdit('urls', it.id); });
    container.appendChild(el);
  });
}

function renderCollectionMemoriesRows(items, container) {
  items.forEach(it => {
    const el = document.createElement('div');
    el.className = 'work-row';
    el.style.gridTemplateColumns = '1.5fr 1fr 2fr 100px';
    el.innerHTML = `
      <div>${escapeHtml(it.title || '')}</div>
      <div>${escapeHtml(it.date || '')}</div>
      <div>${escapeHtml(it.remark || '')}</div>
      <div class="work-row-actions">
        <button class="wr-btn" title="编辑" data-edit-collection="${it.id}">&#9998;</button>
        <button class="wr-btn danger" title="删除" data-delete-collection="${it.id}">&#128465;</button>
      </div>`;
    el.addEventListener('click', (e) => { if (!e.target.closest('.work-row-actions')) openCollectionEdit('memories', it.id); });
    container.appendChild(el);
  });
}

function renderCollectionAccountsRows(items, container) {
  items.forEach(it => {
    const el = document.createElement('div');
    el.className = 'work-row';
    el.style.gridTemplateColumns = '1fr 1.5fr 1.5fr 1.5fr 100px';
    el.innerHTML = `
      <div>${escapeHtml(it.type || '')}</div>
      <div>${escapeHtml(it.account || '')}</div>
      <div>${escapeHtml(it.password || '')}</div>
      <div>${escapeHtml(it.remark || '')}</div>
      <div class="work-row-actions">
        <button class="wr-btn" title="编辑" data-edit-collection="${it.id}">&#9998;</button>
        <button class="wr-btn danger" title="删除" data-delete-collection="${it.id}">&#128465;</button>
      </div>`;
    el.addEventListener('click', (e) => { if (!e.target.closest('.work-row-actions')) openCollectionEdit('accounts', it.id); });
    container.appendChild(el);
  });
}

function renderCollectionTipsRows(items, container) {
  items.forEach(it => {
    const el = document.createElement('div');
    el.className = 'work-note-card';
    el.dataset.id = it.id;
    el.innerHTML = `
      <div class="work-note-project">${escapeHtml(it.title || '无标题')}<span class="work-note-date">${window.taojianAPI.formatDate(it.updatedAt)}</span></div>
      <div class="work-note-text">${escapeHtml(it.content || '').split('\n').join('<br>')}</div>
      <div class="work-row-actions" style="opacity:1;justify-content:flex-end;margin-top:8px;">
        <button class="wr-btn" title="编辑" data-edit-collection="${it.id}">&#9998;</button>
        <button class="wr-btn danger" title="删除" data-delete-collection="${it.id}">&#128465;</button>
      </div>`;
    el.addEventListener('click', (e) => { if (!e.target.closest('.work-row-actions')) openCollectionEdit('tips', it.id); });
    container.appendChild(el);
  });
}

async function deleteCollectionItem(tab, id) {
  openDeleteConfirm(collectionMeta[tab].cat, id, async () => {
    const res = await window.taojianAPI.deleteItem(collectionMeta[tab].cat, id);
    if (res.success) {
      collectionData[tab] = res.data;
      renderCollectionTab(tab);
      updateCollectionFilterOptions();
      closeConfirm();
    } else {
      safeAlert('删除失败：' + res.error);
    }
  });
}

function openCollectionEdit(tab, id) {
  currentCollectionTab = tab;
  currentCollectionItemId = id || null;
  const item = id ? collectionData[tab].find(i => i.id === id) : null;
  modalTitle.textContent = item ? '编辑' + collectionMeta[tab].label : '新建' + collectionMeta[tab].label;
  buildCollectionEditForm(tab, item);
  modalDelete.style.display = item ? 'inline-block' : 'none';
  editModal.classList.add('active');
  setTimeout(() => {
    const firstInput = document.querySelector('.modal-body .field-input');
    if (firstInput) firstInput.focus();
  }, 100);
}

function buildCollectionEditForm(tab, item) {
  const v = (k) => item ? (item[k] || '') : '';
  const body = document.querySelector('#editModal .modal-body');
  let html = '';
  if (tab === 'urls') {
    html = `
      <div class="field-group"><label class="field-label">标题</label><input type="text" class="field-input" id="col-title" value="${escapeHtml(v('title'))}" placeholder="标题"></div>
      <div class="field-group"><label class="field-label">网址</label><input type="text" class="field-input" id="col-url" value="${escapeHtml(v('url'))}" placeholder="https://..."></div>
      <div class="field-group"><label class="field-label">备注</label><textarea class="field-textarea" id="col-remark" placeholder="备注...">${escapeHtml(v('remark'))}</textarea></div>`;
  } else if (tab === 'memories') {
    html = `
      <div class="field-group"><label class="field-label">纪念日名称</label><input type="text" class="field-input" id="col-title" value="${escapeHtml(v('title'))}" placeholder="纪念日名称"></div>
      <div class="field-group"><label class="field-label">日期</label><input type="date" class="field-input" id="col-date" value="${v('date')}"></div>
      <div class="field-group"><label class="field-label">备注</label><textarea class="field-textarea" id="col-remark" placeholder="备注...">${escapeHtml(v('remark'))}</textarea></div>`;
  } else if (tab === 'accounts') {
    html = `
      <div class="field-group"><label class="field-label">账户类型</label><input type="text" class="field-input" id="col-type" value="${escapeHtml(v('type'))}" placeholder="例如：邮箱、服务器、社交账号"></div>
      <div class="field-group"><label class="field-label">账户</label><input type="text" class="field-input" id="col-account" value="${escapeHtml(v('account'))}" placeholder="账户名称/账号"></div>
      <div class="field-group"><label class="field-label">密码</label><input type="text" class="field-input" id="col-password" value="${escapeHtml(v('password'))}" placeholder="密码（可不填）"></div>
      <div class="field-group"><label class="field-label">备注</label><textarea class="field-textarea" id="col-remark" placeholder="备注...">${escapeHtml(v('remark'))}</textarea></div>`;
  } else if (tab === 'tips') {
    html = `
      <div class="field-group"><label class="field-label">标题</label><input type="text" class="field-input" id="col-title" value="${escapeHtml(v('title'))}" placeholder="标题"></div>
      <div class="field-group"><label class="field-label">内容</label><textarea class="field-textarea" id="col-content" placeholder="记录生活小妙招..." style="min-height:260px;">${escapeHtml(v('content'))}</textarea></div>`;
  }
  body.innerHTML = html;
}

async function saveCollectionItem() {
  const tab = currentCollectionTab;
  const id = currentCollectionItemId;
  let item = { id };
  if (tab === 'urls') {
    item = { ...item, title: document.getElementById('col-title').value.trim(), url: document.getElementById('col-url').value.trim(), remark: document.getElementById('col-remark').value };
  } else if (tab === 'memories') {
    item = { ...item, title: document.getElementById('col-title').value.trim(), date: document.getElementById('col-date').value, remark: document.getElementById('col-remark').value };
  } else if (tab === 'accounts') {
    item = { ...item, type: document.getElementById('col-type').value.trim(), account: document.getElementById('col-account').value.trim(), password: document.getElementById('col-password').value, remark: document.getElementById('col-remark').value };
  } else if (tab === 'tips') {
    item = { ...item, title: document.getElementById('col-title').value.trim(), content: document.getElementById('col-content').value };
  }
  const cat = collectionMeta[tab].cat;
  const res = await window.taojianAPI.saveItem(cat, item);
  if (res.success) {
    collectionData[tab] = res.data;
    renderCollectionTab(tab);
    updateCollectionFilterOptions();
    closeEdit();
  } else {
    safeAlert('保存失败：' + res.error);
  }
}

// 收藏备忘标签点击
document.querySelectorAll('[data-collection-tab]').forEach(t => {
  t.addEventListener('click', () => switchCollectionTab(t.dataset.collectionTab));
});

// 收藏备忘搜索
document.getElementById('collectionSearchInput').addEventListener('input', (e) => {
  renderCollectionTab(currentCollectionTab, e.target.value.trim());
});

// 类型筛选
document.getElementById('collectionFilterType').addEventListener('change', () => {
  renderCollectionTab(currentCollectionTab, document.getElementById('collectionSearchInput').value.trim());
});

// 新建按钮
document.querySelector('[data-new="collection"]').addEventListener('click', () => openCollectionEdit(currentCollectionTab, null));

// 表格事件委托
document.getElementById('collectionBody').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.dataset.editCollection) {
    e.stopPropagation();
    openCollectionEdit(currentCollectionTab, btn.dataset.editCollection);
  } else if (btn.dataset.deleteCollection) {
    e.stopPropagation();
    deleteCollectionItem(currentCollectionTab, btn.dataset.deleteCollection);
  }
});

// ========== 学习模块 ==========
let studyData = [];
let currentStudyItemId = null;
let currentStudyAttachments = [];
let currentStudyLinks = [];

async function loadStudyData() {
  const res = await window.taojianAPI.readData('study');
  if (res.success) studyData = res.data;
  else console.error('读取失败:', res.error);
}

function renderStudy(filterText = '') {
  const container = document.getElementById('study-rows');
  const header = document.querySelector('[data-study-panel="list"] .work-table-header');
  let items = studyData || [];
  items = [...items].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  const term = filterText.toLowerCase();
  if (term) {
    items = items.filter(it =>
      (it.category || '').toLowerCase().includes(term) ||
      (it.tags || '').toLowerCase().includes(term) ||
      (it.content || '').toLowerCase().includes(term)
    );
  }
  const catFilter = document.getElementById('studyFilterCategory').value;
  if (catFilter !== 'all') {
    items = items.filter(it => it.category === catFilter);
  }

  container.innerHTML = '';
  if (items.length === 0) {
    container.innerHTML = `<div class="work-empty"><div class="empty-icon">&#128221;</div><div class="empty-text">暂无学习条目</div><div class="empty-sub">点击右上角「新建」添加第一条知识</div></div>`;
    return;
  }

  items.forEach(it => {
    const abstract = (it.content || '').split('\n')[0].substring(0, 60) || '...';
    const tagsHtml = (it.tags || '').split(/[,，]/).filter(t => t.trim()).map(t =>
      `<span class="study-tag-chip">${escapeHtml(t.trim())}</span>`
    ).join(' ');
    const links = it.links || [];
    const linkCount = links.length;
    const attachments = it.attachments || [];
    const attachCount = attachments.length;

    const el = document.createElement('div');
    el.className = 'work-row';
    el.style.gridTemplateColumns = '100px 120px 1fr 60px 60px 100px';
    el.innerHTML = `
      <div><span class="study-category-badge">${escapeHtml(it.category || '未分类')}</span></div>
      <div>${tagsHtml}</div>
      <div><div class="study-row-abstract" onclick="this.classList.toggle('expanded')">${escapeHtml(it.content || '')}</div></div>
      <div style="text-align:center;color:#3050a0;font-size:0.85rem;">${linkCount > 0 ? linkCount + '个' : '-'}</div>
      <div style="text-align:center;color:var(--ink-muted);font-size:0.85rem;">${attachCount > 0 ? attachCount + '个' : '-'}</div>
      <div class="work-row-actions">
        <button class="wr-btn" title="编辑" data-edit-study="${it.id}">&#9998;</button>
        <button class="wr-btn danger" title="删除" data-delete-study="${it.id}">&#128465;</button>
      </div>
    `;
    el.addEventListener('click', (e) => {
      if (!e.target.closest('.work-row-actions')) openStudyEdit(it.id);
    });
    container.appendChild(el);
  });
  requestAnimationFrame(() => {
    const h = document.querySelector('[data-study-panel="list"] .work-table-header');
    if (h) {
      initColumnResizers('study-list', h, 'study-rows');
      applyColumnWidths('study-list', h, 'study-rows');
    }
  });
}

function updateStudyFilterOptions() {
  const sel = document.getElementById('studyFilterCategory');
  const allCats = new Set();
  (studyData || []).forEach(it => { if (it.category) allCats.add(it.category); });
  const currentVal = sel.value;
  let html = '<option value="all">全部分类</option>';
  Array.from(allCats).sort().forEach(c => {
    html += `<option value="${escapeHtml(c)}"${c === currentVal ? ' selected' : ''}>${escapeHtml(c)}</option>`;
  });
  sel.innerHTML = html;
}

function openStudyEdit(id) {
  currentStudyItemId = id || null;
  const item = id ? studyData.find(i => i.id === id) : null;
  modalTitle.textContent = item ? '编辑知识' : '新建知识';
  buildStudyEditForm(item);
  modalDelete.style.display = item ? 'inline-block' : 'none';
  editModal.classList.add('active');
  setTimeout(() => {
    const firstInput = document.querySelector('.modal-body .field-input');
    if (firstInput) firstInput.focus();
  }, 100);
}

function buildStudyEditForm(item) {
  const v = (k) => item ? (item[k] || '') : '';
  const body = document.querySelector('#editModal .modal-body');
  currentStudyAttachments = item ? (item.attachments || []) : [];
  currentStudyLinks = item ? (item.links || []) : [];

  // 预设分类选项
  const presetCategories = ['网络', '编程', '绘图', '办公软件'];
  const allCats = new Set(presetCategories);
  (studyData || []).forEach(it => { if (it.category) allCats.add(it.category); });
  const catOptions = Array.from(allCats).sort().map(c =>
    `<option value="${escapeHtml(c)}"${v('category') === c ? ' selected' : ''}>${escapeHtml(c)}</option>`
  ).join('');

  // 链接 HTML
  const linksHtml = currentStudyLinks.map((link, idx) => `
    <div class="modal-link-row" data-link-idx="${idx}">
      <input type="text" class="field-input" data-link-url="${idx}" value="${escapeHtml(link.url || '')}" placeholder="网址">
      <input type="text" class="field-input" data-link-remark="${idx}" value="${escapeHtml(link.remark || '')}" placeholder="备注" style="flex:0.5">
      <button class="link-remove-btn" data-remove-link="${idx}">&times;</button>
    </div>
  `).join('');

  // 附件 HTML
  const attachHtml = currentStudyAttachments.map((att, idx) => `
    <div class="modal-attach-item" data-attach-idx="${idx}">
      <span class="attach-name">${escapeHtml(att.name)}</span>
      <span class="attach-size">${att.sizeReadable || att.size || ''}</span>
      <div class="attach-actions">
        <button class="wr-btn" title="下载" data-download-attach="${idx}" style="width:24px;height:24px;font-size:0.7rem;">&#11015;</button>
        <button class="wr-btn danger" title="删除" data-remove-attach="${idx}" style="width:24px;height:24px;font-size:0.7rem;">&times;</button>
      </div>
    </div>
  `).join('');

  const timeInfo = item ? `
    <div class="study-info-row">
      <span>创建时间：${window.taojianAPI.formatDate(item.createdAt)}</span>
      <span>更新时间：${window.taojianAPI.formatDate(item.updatedAt)}</span>
    </div>
  ` : '';

  body.innerHTML = `
    <div class="field-group">
      <label class="field-label">分类</label>
      <div style="display:flex;gap:8px;">
        <select class="field-input" id="study-category-select" style="flex:1;" onchange="document.getElementById('study-category-input').value=this.value">
          <option value="">-- 选择或自定义 --</option>
          ${catOptions}
        </select>
        <input type="text" class="field-input" id="study-category-input" value="${escapeHtml(v('category'))}" placeholder="自定义分类" style="flex:1;">
      </div>
    </div>
    <div class="field-group">
      <label class="field-label">标签（用逗号分隔）</label>
      <input type="text" class="field-input" id="study-tags" value="${escapeHtml(v('tags'))}" placeholder="例如：TCP/IP, 协议栈">
    </div>
    <div class="field-group">
      <label class="field-label">知识详情</label>
      <textarea class="field-textarea" spellcheck="false" id="study-content" placeholder="在此记录知识详情..." style="min-height:200px;">${escapeHtml(v('content'))}</textarea>
    </div>
    <div class="field-group">
      <label class="field-label">相关网址</label>
      <div id="study-links-container">${linksHtml}</div>
      <button class="modal-btn" id="study-add-link" style="margin-top:8px;padding:6px 16px;font-size:0.8rem;">+ 添加链接</button>
    </div>
    <div class="field-group">
      <label class="field-label">相关资料</label>
      <div class="modal-attach-list" id="study-attach-list">${attachHtml}</div>
      <button class="modal-btn" id="study-upload-btn" style="margin-top:8px;padding:6px 16px;font-size:0.8rem;">+ 上传附件</button>
    </div>
    ${timeInfo}
  `;

  // 绑定附件上传
  const uploadBtn = document.getElementById('study-upload-btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
      const entryId = currentStudyItemId || 'temp_' + Date.now();
      const res = await window.taojianAPI.uploadAttachment({ entryId });
      if (res.success) {
        currentStudyAttachments.push(res.attachment);
        buildStudyEditForm({
          id: currentStudyItemId,
          category: document.getElementById('study-category-input').value,
          tags: document.getElementById('study-tags').value,
          content: document.getElementById('study-content').value,
          links: currentStudyLinks,
          attachments: currentStudyAttachments,
          createdAt: item ? item.createdAt : undefined,
          updatedAt: item ? item.updatedAt : undefined
        });
      } else if (!res.cancelled) {
        safeAlert('上传失败：' + res.error);
      }
    });
  }

  // 绑定附件删除
  body.querySelectorAll('[data-remove-attach]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.removeAttach);
      const att = currentStudyAttachments[idx];
      if (att && currentStudyItemId) {
        await window.taojianAPI.removeAttachment({ entryId: currentStudyItemId, fileName: att.name });
      }
      currentStudyAttachments.splice(idx, 1);
      buildStudyEditForm({
        id: currentStudyItemId,
        category: document.getElementById('study-category-input').value,
        tags: document.getElementById('study-tags').value,
        content: document.getElementById('study-content').value,
        links: currentStudyLinks,
        attachments: currentStudyAttachments,
        createdAt: item ? item.createdAt : undefined,
        updatedAt: item ? item.updatedAt : undefined
      });
    });
  });

  // 绑定附件下载
  body.querySelectorAll('[data-download-attach]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.downloadAttach);
      const att = currentStudyAttachments[idx];
      if (att) {
        const res = await window.taojianAPI.downloadAttachment({ relPath: att.path, suggestedName: att.name });
        if (res.success) safeAlert('下载成功！');
        else if (!res.cancelled) safeAlert('下载失败：' + res.error);
      }
    });
  });

  // 绑定添加链接
  const addLinkBtn = document.getElementById('study-add-link');
  if (addLinkBtn) {
    addLinkBtn.addEventListener('click', () => {
      currentStudyLinks.push({ url: '', remark: '' });
      buildStudyEditForm({
        id: currentStudyItemId,
        category: document.getElementById('study-category-input').value,
        tags: document.getElementById('study-tags').value,
        content: document.getElementById('study-content').value,
        links: currentStudyLinks,
        attachments: currentStudyAttachments,
        createdAt: item ? item.createdAt : undefined,
        updatedAt: item ? item.updatedAt : undefined
      });
    });
  }

  // 绑定删除链接
  body.querySelectorAll('[data-remove-link]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.removeLink);
      currentStudyLinks.splice(idx, 1);
      buildStudyEditForm({
        id: currentStudyItemId,
        category: document.getElementById('study-category-input').value,
        tags: document.getElementById('study-tags').value,
        content: document.getElementById('study-content').value,
        links: currentStudyLinks,
        attachments: currentStudyAttachments,
        createdAt: item ? item.createdAt : undefined,
        updatedAt: item ? item.updatedAt : undefined
      });
    });
  });

  // 绑定链接变化（实时更新）
  body.querySelectorAll('[data-link-url]').forEach(inp => {
    inp.addEventListener('change', () => {
      const idx = parseInt(inp.dataset.linkUrl);
      currentStudyLinks[idx].url = inp.value;
    });
  });
  body.querySelectorAll('[data-link-remark]').forEach(inp => {
    inp.addEventListener('change', () => {
      const idx = parseInt(inp.dataset.linkRemark);
      currentStudyLinks[idx].remark = inp.value;
    });
  });
}

async function saveStudyItem() {
  const id = currentStudyItemId;
  const category = document.getElementById('study-category-input').value.trim();
  const tags = document.getElementById('study-tags').value.trim();
  const content = document.getElementById('study-content').value.trim();

  if (!category) { safeAlert('请选择或输入分类'); document.getElementById('study-category-input').focus(); return; }
  if (!content) { safeAlert('请填写知识详情'); document.getElementById('study-content').focus(); return; }

  // 更新当前链接数据（从输入框读取最新值）
  document.querySelectorAll('#study-links-container .modal-link-row').forEach(row => {
    const idx = parseInt(row.dataset.linkIdx);
    const urlInp = row.querySelector('[data-link-url]');
    const remarkInp = row.querySelector('[data-link-remark]');
    if (currentStudyLinks[idx]) {
      currentStudyLinks[idx].url = urlInp ? urlInp.value.trim() : '';
      currentStudyLinks[idx].remark = remarkInp ? remarkInp.value.trim() : '';
    }
  });
  // 过滤空链接
  const links = currentStudyLinks.filter(l => l.url.trim());

  const item = {
    id,
    category,
    tags,
    content,
    links,
    attachments: currentStudyAttachments
  };

  const res = await window.taojianAPI.saveItem('study', item);
  if (res.success) {
    studyData = res.data;
    renderStudy();
    updateStudyFilterOptions();
    closeEdit();
  } else {
    safeAlert('保存失败：' + res.error);
  }
}

async function deleteStudyItem(id) {
  openDeleteConfirm('study', id, async () => {
    const res = await window.taojianAPI.deleteItem('study', id);
    if (res.success) {
      studyData = res.data;
      renderStudy();
      updateStudyFilterOptions();
      closeConfirm();
    } else {
      safeAlert('删除失败：' + res.error);
    }
  });
}

// 学习模块事件监听
document.getElementById('studySearchInput').addEventListener('input', (e) => {
  renderStudy(e.target.value.trim());
});

document.getElementById('studyFilterCategory').addEventListener('change', () => {
  renderStudy(document.getElementById('studySearchInput').value.trim());
});

document.querySelector('[data-new="study"]').addEventListener('click', () => openStudyEdit(null));

document.getElementById('studyBody').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.dataset.editStudy) {
    e.stopPropagation();
    openStudyEdit(btn.dataset.editStudy);
  } else if (btn.dataset.deleteStudy) {
    e.stopPropagation();
    deleteStudyItem(btn.dataset.deleteStudy);
  }
});

// 学习模块链接点击（委托到表格区域）
document.getElementById('studyBody').addEventListener('click', async (e) => {
  const link = e.target.closest('.study-link-item');
  if (link) {
    const url = link.dataset.url;
    if (url) {
      await window.taojianAPI.openExternal(url);
    }
  }
});


// ========== 生活模块 ==========
const lifeMeta = {
  todo:    { cat: 'life-todo',    label: '待办清单', name: '待办清单' },
  done:    { cat: 'life-done',    label: '已完成', name: '已完成' },
  trip:    { cat: 'life-trip',    label: '出行计划', name: '出行计划' },
  finance: { cat: 'life-finance', label: '收支记账', name: '收支记账' },
  journal: { cat: 'life-journal', label: '手账杂记', name: '手账杂记' }
};
const lifeData = { todo: [], done: [], trip: [], finance: [], journal: [] };
let currentLifeTab = 'todo';
let currentLifeItemId = null;

// 加载全部生活数据
async function loadLifeData() {
  for (const [key, meta] of Object.entries(lifeMeta)) {
    const res = await window.taojianAPI.readData(meta.cat);
    if (res.success) lifeData[key] = res.data;
    else console.error('读取失败:', meta.cat, res.error);
  }
}

// 切换标签
function switchLifeTab(tab) {
  currentLifeTab = tab;
  document.querySelectorAll('[data-life-tab]').forEach(t => {
    t.classList.toggle('active', t.dataset.lifeTab === tab);
  });
  document.querySelectorAll('[data-life-panel]').forEach(p => {
    p.style.display = p.dataset.lifePanel === tab ? 'block' : 'none';
  });
  renderLifeTab(tab);
  updateLifeFilterOptions();
}

// 更新筛选下拉选项
function updateLifeFilterOptions() {
  const sel = document.getElementById('lifeFilterStatus');
  const tab = currentLifeTab;
  let html = '<option value="all">全部状态</option>';
  if (tab === 'todo') {
    html += '<option value="待办">待办</option><option value="已完成">已完成</option>';
  } else if (tab === 'trip') {
    html += '<option value="计划中">计划中</option><option value="已出行">已出行</option><option value="已取消">已取消</option>';
  } else if (tab === 'finance') {
    html += '<option value="收入">收入</option><option value="支出">支出</option>';
  } else if (tab === 'journal') {
    // 随笔无状态筛选，用标签筛选
    const allTags = new Set();
    (lifeData.journal || []).forEach(it => {
      if (it.tags) it.tags.split(/[,，]/).forEach(t => { const tag = t.trim(); if (tag) allTags.add(tag); });
    });
    Array.from(allTags).sort().forEach(tag => {
      html += `<option value="${escapeHtml(tag)}">${escapeHtml(tag)}</option>`;
    });
  }
  sel.innerHTML = html;
}

// 渲染当前标签
function renderLifeTab(tab, filterText = '') {
  const container = document.getElementById(`life-rows-${tab}`);
  const header = document.querySelector(`[data-life-panel="${tab}"]:not([style*="display:none"]) .work-table-header`) || document.querySelector(`[data-life-panel="${tab}"] .work-table-header`);
  let items = lifeData[tab] || [];
  items = [...items].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  const term = filterText.toLowerCase();
  if (term) {
    items = items.filter(it => Object.values(it).some(v => String(v || '').toLowerCase().includes(term)));
  }
  const statusFilter = document.getElementById('lifeFilterStatus').value;
  if (statusFilter !== 'all') {
    if (tab === 'journal') {
      items = items.filter(it => (it.tags || '').includes(statusFilter));
    } else {
      items = items.filter(it => it.status === statusFilter || it.type === statusFilter);
    }
  }

  container.innerHTML = '';
  if (items.length === 0) {
    container.innerHTML = `<div class="work-empty"><div class="empty-icon">&#128221;</div><div class="empty-text">暂无${lifeMeta[tab].label}条目</div><div class="empty-sub">点击右上角「新建」添加</div></div>`;
    return;
  }

  if (tab === 'todo') renderLifeTodoRows(items, container);
  else if (tab === 'done') renderLifeDoneRows(items, container);
  else if (tab === 'trip') renderLifeTripRows(items, container);
  else if (tab === 'finance') renderLifeFinanceRows(items, container);
  else if (tab === 'journal') renderLifeJournalRows(items, container);
  requestAnimationFrame(() => {
    const h = document.querySelector(`[data-life-panel="${tab}"] .work-table-header`);
    if (h) {
      initColumnResizers(`life-${tab}`, h, `life-rows-${tab}`);
      applyColumnWidths(`life-${tab}`, h, `life-rows-${tab}`);
    }
  });
}

function renderLifeTodoRows(items, container) {
  items.forEach(it => {
    const pMap = { '高': 'priority-high', '中': 'priority-medium', '低': 'priority-low' };
    const pClass = pMap[it.priority] || 'priority-low';
    const sMap = { '待办': 'life-todo', '已完成': 'life-done' };
    const sClass = sMap[it.status] || 'life-todo';
    const el = document.createElement('div');
    el.className = 'work-row';
    el.style.gridTemplateColumns = '1fr 2.5fr 90px 90px 2fr 100px';
    el.innerHTML = `
      <div>${escapeHtml(it.date || '')}</div>
      <div>${escapeHtml(it.task || '')}</div>
      <div><span class="col-tag ${pClass}">${escapeHtml(it.priority || '低')}</span></div>
      <div><span class="col-tag ${sClass}">${escapeHtml(it.status || '待办')}</span></div>
      <div>${escapeHtml(it.remark || '')}</div>
      <div class="work-row-actions">
        ${it.status !== '已完成' ? `<button class="wr-btn complete" title="标记完成" data-complete-life="${it.id}">&#10003;</button>` : ''}
        <button class="wr-btn" title="编辑" data-edit-life="${it.id}">&#9998;</button>
        <button class="wr-btn danger" title="删除" data-delete-life="${it.id}">&#128465;</button>
      </div>`;
    el.addEventListener('click', (e) => { if (!e.target.closest('.work-row-actions')) openLifeEdit('todo', it.id); });
    container.appendChild(el);
  });
}

function renderLifeTripRows(items, container) {
  items.forEach(it => {
    const sMap = { '计划中': 'trip-plan', '已出行': 'trip-done', '已取消': 'trip-cancel' };
    const sClass = sMap[it.status] || 'trip-plan';
    const el = document.createElement('div');
    el.className = 'work-row';
    el.style.gridTemplateColumns = '1fr 1fr 1.2fr 1fr 1fr 90px 1.5fr 100px';
    el.innerHTML = `
      <div>${escapeHtml(it.date || '')}</div>
      <div>${escapeHtml(it.time || '')}</div>
      <div>${escapeHtml(it.place || '')}</div>
      <div>${escapeHtml(it.people || '')}</div>
      <div>${escapeHtml(it.transport || '')}</div>
      <div><span class="col-tag ${sClass}">${escapeHtml(it.status || '计划中')}</span></div>
      <div>${escapeHtml(it.remark || '')}</div>
      <div class="work-row-actions">
        <button class="wr-btn" title="编辑" data-edit-life="${it.id}">&#9998;</button>
        <button class="wr-btn danger" title="删除" data-delete-life="${it.id}">&#128465;</button>
      </div>`;
    el.addEventListener('click', (e) => { if (!e.target.closest('.work-row-actions')) openLifeEdit('trip', it.id); });
    container.appendChild(el);
  });
}

function renderLifeFinanceRows(items, container) {
  // 汇总
  let totalIncome = 0, totalExpense = 0;
  items.forEach(it => {
    const amt = parseFloat(it.amount) || 0;
    if (it.type === '收入') totalIncome += amt;
    else if (it.type === '支出') totalExpense += amt;
  });
  const summaryEl = document.getElementById('life-finance-summary');
  summaryEl.innerHTML = `
    <div class="sum-item"><span class="sum-label">总收入</span><span class="sum-value income">+${totalIncome.toFixed(2)}</span></div>
    <div class="sum-item"><span class="sum-label">总支出</span><span class="sum-value expense">-${totalExpense.toFixed(2)}</span></div>
    <div class="sum-item"><span class="sum-label">结余</span><span class="sum-value">${(totalIncome - totalExpense).toFixed(2)}</span></div>
  `;

  items.forEach(it => {
    const tClass = it.type === '收入' ? 'type-income' : 'type-expense';
    const el = document.createElement('div');
    el.className = 'work-row';
    el.style.gridTemplateColumns = '80px 1fr 2fr 1fr 1.2fr 1.5fr 100px';
    el.innerHTML = `
      <div><span class="col-tag ${tClass}">${escapeHtml(it.type || '支出')}</span></div>
      <div>${escapeHtml(it.category || '')}</div>
      <div>${escapeHtml(it.item || '')}</div>
      <div>${escapeHtml(it.amount || '')}</div>
      <div>${escapeHtml(it.time || '')}</div>
      <div>${escapeHtml(it.remark || '')}</div>
      <div class="work-row-actions">
        <button class="wr-btn" title="编辑" data-edit-life="${it.id}">&#9998;</button>
        <button class="wr-btn danger" title="删除" data-delete-life="${it.id}">&#128465;</button>
      </div>`;
    el.addEventListener('click', (e) => { if (!e.target.closest('.work-row-actions')) openLifeEdit('finance', it.id); });
    container.appendChild(el);
  });
}

function renderLifeJournalRows(items, container) {
  items.forEach(it => {
    const el = document.createElement('div');
    el.className = 'work-note-card';
    el.dataset.id = it.id;
    const tagsHtml = (it.tags || '').split(/[,，]/).filter(t => t.trim()).map(t =>
      `<span class="life-journal-tag">${escapeHtml(t.trim())}</span>`
    ).join('');
    el.innerHTML = `
      <div class="work-note-project">${escapeHtml(it.title || '无标题')}<span class="work-note-date">${escapeHtml(it.date || '')}</span></div>
      <div class="work-note-text">${escapeHtml(it.content || '').split('\n').join('<br>')}</div>
      <div class="life-journal-tags">${tagsHtml}</div>
      <div class="work-note-time">${window.taojianAPI.formatDate(it.updatedAt)}</div>
      <div class="work-row-actions" style="opacity:1;justify-content:flex-end;margin-top:8px;">
        <button class="wr-btn" title="编辑" data-edit-life="${it.id}">&#9998;</button>
        <button class="wr-btn danger" title="删除" data-delete-life="${it.id}">&#128465;</button>
      </div>`;
    el.addEventListener('click', (e) => { if (!e.target.closest('.work-row-actions')) openLifeEdit('journal', it.id); });
    container.appendChild(el);
  });
}

function renderLifeDoneRows(items, container) {
  items.forEach(it => {
    const pMap = { '高': 'priority-high', '中': 'priority-medium', '低': 'priority-low' };
    const pClass = pMap[it.priority] || 'priority-low';
    const el = document.createElement('div');
    el.className = 'work-row';
    el.style.gridTemplateColumns = '1fr 2.5fr 90px 90px 2fr 100px';
    el.innerHTML = `
      <div>${escapeHtml(it.date || '')}</div>
      <div>${escapeHtml(it.task || '')}</div>
      <div><span class="col-tag ${pClass}">${escapeHtml(it.priority || '低')}</span></div>
      <div><span class="col-tag life-done">已完成</span></div>
      <div>${escapeHtml(it.remark || '')}</div>
      <div class="work-row-actions">
        <button class="wr-btn complete" title="移回待办" data-return-life="${it.id}">&#8634;</button>
        <button class="wr-btn" title="编辑" data-edit-life="${it.id}">&#9998;</button>
        <button class="wr-btn danger" title="删除" data-delete-life="${it.id}">&#128465;</button>
      </div>`;
    el.addEventListener('click', (e) => { if (!e.target.closest('.work-row-actions')) openLifeEdit('done', it.id); });
    container.appendChild(el);
  });
}

// 标记待办完成
async function markLifeTodoComplete(id) {
  const item = lifeData.todo.find(i => i.id === id);
  if (!item) return;
  // 从待办删除
  const resDel = await window.taojianAPI.deleteItem('life-todo', id);
  if (!resDel.success) { safeAlert('操作失败：' + resDel.error); return; }
  lifeData.todo = resDel.data;
  // 添加到已完成（去掉id，让系统生成新id）
  const doneItem = { date: item.date, task: item.task, priority: item.priority, status: '已完成', remark: item.remark };
  const resAdd = await window.taojianAPI.saveItem('life-done', doneItem);
  if (resAdd.success) lifeData.done = resAdd.data;
  renderLifeTab('todo');
  updateLifeFilterOptions();
}

// 已完成的移回待办
async function markLifeReturnToTodo(id) {
  const item = lifeData.done.find(i => i.id === id);
  if (!item) return;
  const resDel = await window.taojianAPI.deleteItem('life-done', id);
  if (!resDel.success) { safeAlert('操作失败：' + resDel.error); return; }
  lifeData.done = resDel.data;
  const todoItem = { date: item.date, task: item.task, priority: item.priority, status: '待办', remark: item.remark };
  const resAdd = await window.taojianAPI.saveItem('life-todo', todoItem);
  if (resAdd.success) lifeData.todo = resAdd.data;
  renderLifeTab('done');
  updateLifeFilterOptions();
}

// 删除生活条目
async function deleteLifeItem(tab, id) {
  openDeleteConfirm(lifeMeta[tab].cat, id, async () => {
    const res = await window.taojianAPI.deleteItem(lifeMeta[tab].cat, id);
    if (res.success) {
      lifeData[tab] = res.data;
      renderLifeTab(tab);
      updateLifeFilterOptions();
      closeConfirm();
    } else {
      safeAlert('删除失败：' + res.error);
    }
  });
}

// 打开生活编辑
function openLifeEdit(tab, id) {
  currentLifeTab = tab;
  currentLifeItemId = id || null;
  const item = id ? lifeData[tab].find(i => i.id === id) : null;
  modalTitle.textContent = item ? '编辑' + lifeMeta[tab].label : '新建' + lifeMeta[tab].label;
  buildLifeEditForm(tab, item);
  modalDelete.style.display = item ? 'inline-block' : 'none';
  editModal.classList.add('active');
  setTimeout(() => {
    const firstInput = document.querySelector('.modal-body .field-input');
    if (firstInput) firstInput.focus();
  }, 100);
}

function buildLifeEditForm(tab, item) {
  const v = (k) => item ? (item[k] || '') : '';
  const body = document.querySelector('#editModal .modal-body');
  let html = '';
  if (tab === 'todo') {
    html = `
      <div class="field-group"><label class="field-label">日期</label><input type="date" class="field-input" id="lf-date" value="${v('date')}"></div>
      <div class="field-group"><label class="field-label">待办事项</label><input type="text" class="field-input" id="lf-task" value="${escapeHtml(v('task'))}" placeholder="待办事项"></div>
      <div class="field-group"><label class="field-label">优先级</label>
        <select class="field-input" id="lf-priority">
          <option value="高" ${v('priority')==='高'?'selected':''}>高</option>
          <option value="中" ${v('priority')==='中'?'selected':''}>中</option>
          <option value="低" ${v('priority')==='低'?'selected':''}>低</option>
        </select>
      </div>
      <div class="field-group"><label class="field-label">状态</label>
        <select class="field-input" id="lf-status">
          <option value="待办" ${v('status')==='待办'?'selected':''}>待办</option>
          <option value="已完成" ${v('status')==='已完成'?'selected':''}>已完成</option>
        </select>
      </div>
      <div class="field-group"><label class="field-label">备注</label><textarea class="field-textarea" spellcheck="false" id="lf-remark" placeholder="备注...">${escapeHtml(v('remark'))}</textarea></div>`;
  } else if (tab === 'trip') {
    html = `
      <div class="field-group"><label class="field-label">日期</label><input type="date" class="field-input" id="lf-date" value="${v('date')}"></div>
      <div class="field-group"><label class="field-label">时间</label><input type="text" class="field-input" id="lf-time" value="${escapeHtml(v('time'))}" placeholder="例如：14:00"></div>
      <div class="field-group"><label class="field-label">地点</label><input type="text" class="field-input" id="lf-place" value="${escapeHtml(v('place'))}" placeholder="地点"></div>
      <div class="field-group"><label class="field-label">人物</label><input type="text" class="field-input" id="lf-people" value="${escapeHtml(v('people'))}" placeholder="同行人物"></div>
      <div class="field-group"><label class="field-label">交通方式</label>
        <select class="field-input" id="lf-transport">
          <option value="飞机" ${v('transport')==='飞机'?'selected':''}>飞机</option>
          <option value="高铁" ${v('transport')==='高铁'?'selected':''}>高铁</option>
          <option value="火车" ${v('transport')==='火车'?'selected':''}>火车</option>
          <option value="汽车" ${v('transport')==='汽车'?'selected':''}>汽车</option>
          <option value="自驾" ${v('transport')==='自驾'?'selected':''}>自驾</option>
          <option value="公交/地铁" ${v('transport')==='公交/地铁'?'selected':''}>公交/地铁</option>
          <option value="步行" ${v('transport')==='步行'?'selected':''}>步行</option>
          <option value="其他" ${v('transport')==='其他'?'selected':''}>其他</option>
        </select>
      </div>
      <div class="field-group"><label class="field-label">状态</label>
        <select class="field-input" id="lf-status">
          <option value="计划中" ${v('status')==='计划中'?'selected':''}>计划中</option>
          <option value="已出行" ${v('status')==='已出行'?'selected':''}>已出行</option>
          <option value="已取消" ${v('status')==='已取消'?'selected':''}>已取消</option>
        </select>
      </div>
      <div class="field-group"><label class="field-label">备注</label><textarea class="field-textarea" spellcheck="false" id="lf-remark" placeholder="备注...">${escapeHtml(v('remark'))}</textarea></div>`;
  } else if (tab === 'finance') {
    html = `
      <div class="field-group"><label class="field-label">类型</label>
        <select class="field-input" id="lf-type">
          <option value="收入" ${v('type')==='收入'?'selected':''}>收入</option>
          <option value="支出" ${v('type')==='支出'?'selected':''}>支出</option>
        </select>
      </div>
      <div class="field-group"><label class="field-label">分类</label>
        <select class="field-input" id="lf-category">
          <option value="工资" ${v('category')==='工资'?'selected':''}>工资</option>
          <option value="餐饮" ${v('category')==='餐饮'?'selected':''}>餐饮</option>
          <option value="交通" ${v('category')==='交通'?'selected':''}>交通</option>
          <option value="购物" ${v('category')==='购物'?'selected':''}>购物</option>
          <option value="娱乐" ${v('category')==='娱乐'?'selected':''}>娱乐</option>
          <option value="其他" ${v('category')==='其他'?'selected':''}>其他</option>
        </select>
      </div>
      <div class="field-group"><label class="field-label">项目</label><input type="text" class="field-input" id="lf-item" value="${escapeHtml(v('item'))}" placeholder="项目名称"></div>
      <div class="field-group"><label class="field-label">金额</label><input type="number" class="field-input" id="lf-amount" value="${v('amount')}" placeholder="0.00" step="0.01"></div>
      <div class="field-group"><label class="field-label">时间</label><input type="datetime-local" class="field-input" id="lf-time" value="${v('time')}"></div>
      <div class="field-group"><label class="field-label">备注</label><textarea class="field-textarea" spellcheck="false" id="lf-remark" placeholder="备注...">${escapeHtml(v('remark'))}</textarea></div>`;
  } else if (tab === 'journal') {
    html = `
      <div class="field-group"><label class="field-label">日期</label><input type="date" class="field-input" id="lf-date" value="${v('date')}"></div>
      <div class="field-group"><label class="field-label">标题</label><input type="text" class="field-input" id="lf-title" value="${escapeHtml(v('title'))}" placeholder="标题"></div>
      <div class="field-group"><label class="field-label">内容</label><textarea class="field-textarea" spellcheck="false" id="lf-content" placeholder="在此书写..." style="min-height:260px;">${escapeHtml(v('content'))}</textarea></div>
      <div class="field-group"><label class="field-label">标签（用逗号分隔）</label><input type="text" class="field-input" id="lf-tags" value="${escapeHtml(v('tags'))}" placeholder="例如：读书, 思考, 随笔"></div>`;
  } else if (tab === 'done') {
    html = `
      <div class="field-group"><label class="field-label">日期</label><input type="date" class="field-input" id="lf-date" value="${v('date')}"></div>
      <div class="field-group"><label class="field-label">待办事项</label><input type="text" class="field-input" id="lf-task" value="${escapeHtml(v('task'))}" placeholder="待办事项"></div>
      <div class="field-group"><label class="field-label">优先级</label>
        <select class="field-input" id="lf-priority">
          <option value="高" ${v('priority')==='高'?'selected':''}>高</option>
          <option value="中" ${v('priority')==='中'?'selected':''}>中</option>
          <option value="低" ${v('priority')==='低'?'selected':''}>低</option>
        </select>
      </div>
      <div class="field-group"><label class="field-label">备注</label><textarea class="field-textarea" spellcheck="false" id="lf-remark" placeholder="备注...">${escapeHtml(v('remark'))}</textarea></div>`;
  }
  body.innerHTML = html;
}

// 保存生活条目
async function saveLifeItem() {
  const tab = currentLifeTab;
  const id = currentLifeItemId;
  let item = { id };
  if (tab === 'todo') {
    item = { ...item, date: document.getElementById('lf-date').value, task: document.getElementById('lf-task').value.trim(), priority: document.getElementById('lf-priority').value, status: document.getElementById('lf-status').value, remark: document.getElementById('lf-remark').value };
    // 如果状态改为已完成，迁移到 done
    if (item.status === '已完成') {
      if (id) {
        const resDel = await window.taojianAPI.deleteItem('life-todo', id);
        if (!resDel.success) { safeAlert('操作失败：' + resDel.error); return; }
        lifeData.todo = resDel.data;
      }
      const doneItem = { date: item.date, task: item.task, priority: item.priority, status: '已完成', remark: item.remark };
      const resAdd = await window.taojianAPI.saveItem('life-done', doneItem);
      if (resAdd.success) {
        lifeData.done = resAdd.data;
        renderLifeTab('todo');
        updateLifeFilterOptions();
        closeEdit();
      } else {
        safeAlert('保存失败：' + resAdd.error);
      }
      return;
    }
  } else if (tab === 'trip') {
    item = { ...item, date: document.getElementById('lf-date').value, time: document.getElementById('lf-time').value.trim(), place: document.getElementById('lf-place').value.trim(), people: document.getElementById('lf-people').value.trim(), transport: document.getElementById('lf-transport').value, status: document.getElementById('lf-status').value, remark: document.getElementById('lf-remark').value };
  } else if (tab === 'finance') {
    item = { ...item, type: document.getElementById('lf-type').value, category: document.getElementById('lf-category').value, item: document.getElementById('lf-item').value.trim(), amount: document.getElementById('lf-amount').value, time: document.getElementById('lf-time').value, remark: document.getElementById('lf-remark').value };
  } else if (tab === 'journal') {
    item = { ...item, date: document.getElementById('lf-date').value, title: document.getElementById('lf-title').value.trim(), content: document.getElementById('lf-content').value, tags: document.getElementById('lf-tags').value.trim() };
  } else if (tab === 'done') {
    item = { ...item, date: document.getElementById('lf-date').value, task: document.getElementById('lf-task').value.trim(), priority: document.getElementById('lf-priority').value, status: '已完成', remark: document.getElementById('lf-remark').value };
  }
  const cat = lifeMeta[tab].cat;
  const res = await window.taojianAPI.saveItem(cat, item);
  if (res.success) {
    lifeData[tab] = res.data;
    renderLifeTab(tab);
    updateLifeFilterOptions();
    closeEdit();
  } else {
    safeAlert('保存失败：' + res.error);
  }
}

// 生活标签点击
document.querySelectorAll('[data-life-tab]').forEach(t => {
  t.addEventListener('click', () => switchLifeTab(t.dataset.lifeTab));
});

// 生活搜索
document.getElementById('lifeSearchInput').addEventListener('input', (e) => {
  renderLifeTab(currentLifeTab, e.target.value.trim());
});

// 状态筛选
document.getElementById('lifeFilterStatus').addEventListener('change', () => {
  renderLifeTab(currentLifeTab, document.getElementById('lifeSearchInput').value.trim());
});

// 生活新建按钮
document.querySelector('[data-new-life]').addEventListener('click', () => openLifeEdit(currentLifeTab, null));

// 生活导入按钮
document.querySelector('[data-import-life]').addEventListener('click', async () => {
  const tab = currentLifeTab;
  const cat = lifeMeta[tab].cat;
  const res = await window.taojianAPI.importData(cat);
  if (res.success && !res.cancelled) {
    lifeData[tab] = res.data;
    renderLifeTab(tab);
    safeAlert(`导入成功！共 ${res.data.length} 条数据`);
  } else if (!res.cancelled) {
    safeAlert('导入失败：' + res.error);
  }
});

// 生活导出按钮
document.querySelector('[data-export-life]').addEventListener('click', async () => {
  const tab = currentLifeTab;
  const cat = lifeMeta[tab].cat;
  const res = await window.taojianAPI.exportData(cat);
  if (res.success && !res.cancelled) {
    safeAlert('导出成功！');
  } else if (!res.cancelled) {
    safeAlert('导出失败：' + res.error);
  }
});

// 生活表格事件委托（动态按钮）
document.getElementById('lifeBody').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.dataset.completeLife) {
    e.stopPropagation();
    markLifeTodoComplete(btn.dataset.completeLife);
  } else if (btn.dataset.returnLife) {
    e.stopPropagation();
    markLifeReturnToTodo(btn.dataset.returnLife);
  } else if (btn.dataset.editLife) {
    e.stopPropagation();
    openLifeEdit(currentLifeTab, btn.dataset.editLife);
  } else if (btn.dataset.deleteLife) {
    e.stopPropagation();
    deleteLifeItem(currentLifeTab, btn.dataset.deleteLife);
  }
});

// 初始化：登录页
showPage('login');
