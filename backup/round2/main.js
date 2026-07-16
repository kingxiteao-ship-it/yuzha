const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
const ATTACH_DIR = path.join(DATA_DIR, 'attachments', 'study');
const CONFIG_PATH = path.join(__dirname, 'config.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(ATTACH_DIR)) {
  fs.mkdirSync(ATTACH_DIR, { recursive: true });
}

// ========== 窗口配置（记忆窗口位置和大小）==========
function loadWindowConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    }
  } catch (e) {}
  return { width: 1280, height: 800 };
}

function saveWindowConfig(win) {
  try {
    const bounds = win.getNormalBounds();
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({
      width: bounds.width, height: bounds.height,
      x: bounds.x, y: bounds.y,
      maximized: win.isMaximized()
    }, null, 2), 'utf-8');
  } catch (e) {}
}

// ========== 数据文件 ==========
const DATA_FILES = {
  'work-todo': path.join(DATA_DIR, 'work_todo.json'),
  'work-done': path.join(DATA_DIR, 'work_done.json'),
  'work-notes': path.join(DATA_DIR, 'work_notes.json'),
  'work-project': path.join(DATA_DIR, 'work_project.json'),
  'work-freight': path.join(DATA_DIR, 'work_freight.json'),
  work: path.join(DATA_DIR, 'work.json'),
  life: path.join(DATA_DIR, 'life.json'),
  study: path.join(DATA_DIR, 'study.json'),
  password: path.join(DATA_DIR, 'password.json'),
  'life-todo': path.join(DATA_DIR, 'life_todo.json'),
  'life-trip': path.join(DATA_DIR, 'life_trip.json'),
  'life-finance': path.join(DATA_DIR, 'life_finance.json'),
  'life-journal': path.join(DATA_DIR, 'life_journal.json')
};

// 默认初始数据
const DEFAULT_DATA = {
  'work-todo': [
    { id: 'wt1', project: '示例项目A', task: '合同审核', contact: '张三', createDate: '2026-07-01', dueDate: '2026-07-15', status: '待办', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'wt2', project: '示例项目B', task: '样品寄送', contact: '李四', createDate: '2026-07-05', dueDate: '2026-07-20', status: '进行中', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'wt3', project: '示例项目C', task: '报价确认', contact: '王五', createDate: '2026-07-10', dueDate: '2026-07-12', status: '延期', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  'work-done': [
    { id: 'wd1', project: '示例项目A', task: '需求确认', contact: '张三', createDate: '2026-06-01', dueDate: '2026-06-10', completedDate: '2026-06-09', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'wd2', project: '示例项目B', task: '方案设计', contact: '李四', createDate: '2026-06-05', dueDate: '2026-06-20', completedDate: '2026-06-18', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  'work-notes': [
    { id: 'wn1', project: '示例项目A', note: '今日与张三确认了合同条款，需要修改付款方式部分。\n\n客户要求在30%预付的基础上，增加验收后付款条款。', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'wn2', project: '示例项目B', note: '样品测试反馈：材质需要更换为更环保的版本。\n\n客户强调必须通过SGS检测，建议提前准备相关文件。', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  'work-project': [
    { id: 'wp1', project: '示例项目A', name: '张三', position: '采购经理', phone: '138-1234-5678', address: '北京市朝阳区XX路XX号', remark: '主要对接人，决策流程较快', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'wp2', project: '示例项目A', name: '赵六', position: '技术主管', phone: '139-8765-4321', address: '北京市海淀区XX路XX号', remark: '负责技术评审', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'wp3', project: '示例项目B', name: '李四', position: '项目经理', phone: '137-9999-8888', address: '上海市浦东新区XX路XX号', remark: '需要每月汇报进度', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  'work-freight': [
    { id: 'wf1', project: '示例项目A', cargo: '样品x50件', status: '运输中', company: '顺丰速运', trackingNo: 'SF1234567890', shipDate: '2026-07-01', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'wf2', project: '示例项目B', cargo: '样品x30件', status: '已送达', company: '中通快递', trackingNo: 'ZT9876543210', shipDate: '2026-06-28', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  work: [
    { id: 'w1', title: '项目进度', content: '当前要务与里程碑\n\n记录当前正在进行的工作任务和进度安排，设置关键节点提醒。\n\n- 第一阶段：需求分析与设计\n- 第二阶段：核心功能开发\n- 第三阶段：测试与优化\n- 第四阶段：上线部署', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'w2', title: '会议纪要', content: '笔墨记录 · 行动项\n\n会议时间：2026年7月\n参会人员：项目组成员\n\n会议要点：\n1. 确定下一阶段目标\n2. 分配任务到个人\n3. 设定验收标准\n\n行动项：\n- [ ] 完成原型设计\n- [ ] 编写技术文档\n- [ ] 准备演示材料', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'w3', title: '灵感备忘', content: '灵光一现 · 随手珍藏\n\n突然想到的几个创意方向：\n\n1. 将传统水墨风格与现代交互设计结合\n2. 加入语音备忘功能，用方言记录生活点滴\n3. 自动生成诗词配文的图文排版\n4. 设置节气提醒，在每个节气推送相关诗词', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  life: [
    { id: 'l1', title: '今日待办', content: '起居日常 · 闲情雅趣\n\n\u2610 早晨浇花\n\u2610 去超市买菜\n\u2610 取快递\n\u2610 整理书桌\n\u2610 泡一壶茶\n\u2610 读半小时书\n\n备注：记得买龙井茶叶', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'l2', title: '心情日记', content: '记录今日心境与感悟\n\n今日天气：晴转多云\n\n今天是一个安静的日子。窗外的蝉鸣声此起彼伏，倒也不觉得聒噪，反而像是一首夏日的背景乐。泡了一壶铁观音，茶香袅袅，思绪也随之飘远。\n\n想起王维的诗句：行到水穷处，坐看云起时。人生的许多时候，正是在看似无路可走的地方，反而能发现新的风景。', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'l3', title: '周末计划', content: '周末雅集 · 茶叙时光\n\n周六：\n- 上午：去书店逛逛\n- 下午：约朋友茶叙\n- 晚上：整理读书笔记\n\n周日：\n- 上午：公园散步\n- 下午：学习新技能\n- 晚上：早休息', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  study: [
    { id: 's1', category: '网络', tags: 'TCP/IP,协议栈', content: 'TCP/IP协议栈是互联网通信的基础架构，包含四层模型：应用层、传输层、网络层、链路层。\n\n核心要点：\n1. IP负责寻址和路由\n2. TCP提供可靠传输和流量控制\n3. UDP提供无连接快速传输\n4. 应用层协议（HTTP/FTP/DNS）构建具体服务', links: [{ url: 'https://datatracker.ietf.org/doc/html/rfc791', remark: 'IP协议RFC文档' }, { url: 'https://datatracker.ietf.org/doc/html/rfc793', remark: 'TCP协议RFC文档' }], attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 's2', category: '编程', tags: 'JavaScript,Electron', content: 'Electron 是基于 Chromium 和 Node.js 的跨平台桌面应用框架。\n\n核心概念：\n1. 主进程（Main Process）：负责窗口管理和系统交互\n2. 渲染进程（Renderer Process）：负责页面展示和用户交互\n3. IPC通信：通过 preload 脚本和 contextBridge 安全通信\n4. 打包发布：使用 electron-builder 或 electron-forge', links: [{ url: 'https://www.electronjs.org/docs/latest/', remark: 'Electron官方文档' }], attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 's3', category: '办公软件', tags: 'Excel,函数', content: 'Excel 常用函数速查：\n\n1. VLOOKUP：垂直查找，语法 =VLOOKUP(查找值, 区域, 列号, [精确匹配])\n2. SUMIF：条件求和，语法 =SUMIF(条件区域, 条件, [求和区域])\n3. INDEX+MATCH：比VLOOKUP更灵活的查找组合\n4. TEXT函数：格式化日期和数字\n5. 数据透视表：快速汇总大量数据', links: [{ url: 'https://support.microsoft.com/zh-cn/excel', remark: 'Excel官方帮助中心' }], attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  password: [
    { id: 'p1', title: '常用网站账号', content: '各类账号 · 安全存储\n\n网站名称：示例网站\n账号：user@example.com\n密码：[请在此记录密码]\n备注：主要工作邮箱\n\n---\n\n网站名称：另一网站\n账号：username\n密码：[请在此记录密码]\n备注：个人博客账号', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p2', title: '密钥管理', content: '重要密钥 · 分级保护\n\n密钥名称：API密钥\n密钥内容：[请在此记录密钥]\n\n使用场景：开发接口调用\n\n---\n\n密钥名称：数据库密码\n密钥内容：[请在此记录密码]\n\n使用场景：本地数据库连接', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'p3', title: '密码安全提示', content: '双重验证 · 加固防护\n\n安全建议：\n\n1. 不同网站使用不同的密码\n2. 定期更换重要账户的密码\n3. 开启双重验证（2FA）\n4. 不在公共设备上保存密码\n5. 使用密码管理器生成强密码\n\n密码生成规则：\n- 至少12位字符\n- 包含大小写字母、数字和特殊符号\n- 避免使用个人信息', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  'life-todo': [
    { id: 'lt1', date: '2026-07-15', task: '购买周末聚会食材', priority: '高', status: '待办', remark: '需要准备牛肉、蔬菜和饮料', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'lt2', date: '2026-07-16', task: '缴纳物业费', priority: '中', status: '已完成', remark: '已通过微信支付完成', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'lt3', date: '2026-07-20', task: '整理书房书架', priority: '低', status: '待办', remark: '按类别重新分类摆放', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  'life-trip': [
    { id: 'ltr1', date: '2026-08-05', time: '08:30', location: '杭州西湖', people: '家人', transport: '自驾', status: '计划中', remark: '提前预订湖边民宿', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'ltr2', date: '2026-09-12', time: '14:00', location: '苏州园林', people: '朋友', transport: '高铁', status: '计划中', remark: '购买园林联票更划算', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'ltr3', date: '2026-06-20', time: '10:00', location: '成都宽窄巷子', people: '独自', transport: '飞机', status: '已出行', remark: '品尝了当地火锅和串串', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  'life-finance': [
    { id: 'lf1', type: '收入', category: '工资', item: '7月基本工资', amount: 8500, time: '2026-07-01', remark: '税后实发', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'lf2', type: '收入', category: '其他', item: '兼职翻译稿费', amount: 1200, time: '2026-07-08', remark: '英语技术文档翻译', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'lf3', type: '收入', category: '其他', item: '二手书出售', amount: 180, time: '2026-07-10', remark: '在闲鱼卖出5本旧书', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'lf4', type: '支出', category: '餐饮', item: '周末聚餐', amount: 268, time: '2026-07-12', remark: '日料店', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'lf5', type: '支出', category: '交通', item: '地铁充值', amount: 100, time: '2026-07-01', remark: '月卡', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'lf6', type: '支出', category: '购物', item: '夏季T恤', amount: 199, time: '2026-07-05', remark: '优衣库', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  'life-journal': [
    { id: 'lj1', date: '2026-07-10', title: '雨后初晴', content: '傍晚的一场雷阵雨驱散了多日的闷热。雨停后，推开窗户，空气里弥漫着泥土与青草的清香。远处的天空挂起一道淡淡的彩虹，像是天空写给大地的情书。\n\n这样的时刻，让人想起苏轼那句：一蓑烟雨任平生。生活中的风雨，终究会过去，留下的是清新的空气和更明亮的天空。', tags: '日记,随想', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'lj2', date: '2026-07-12', title: '读《人间词话》有感', content: '王国维在《人间词话》中提出的人生三境界，读来令人深思。\n\n第一境界：昨夜西风凋碧树，独上高楼，望尽天涯路。\n第二境界：衣带渐宽终不悔，为伊消得人憔悴。\n第三境界：众里寻他千百度，蓦然回首，那人却在灯火阑珊处。\n\n这三重境界，不仅是做学问的阶梯，更是人生修行的写照。从迷茫到执着，再到顿悟，每个人都在书写自己的三重境界。', tags: '读书,诗词', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'lj3', date: '2026-07-14', title: '夜市见闻', content: '夏夜的夜市总是热闹。烤串的烟雾、孩童的笑声、摊主热情的吆喝，交织成一幅生动的人间烟火图。\n\n路过一个卖糖画的老摊，一位老师傅正用熬好的糖汁在石板上作画。眨眼间，一只栩栩如生的小龙便跃然板上。小朋友举着糖画，眼睛笑成了月牙。\n\n这些平凡而温暖的瞬间，正是生活最珍贵的馈赠。', tags: '生活,随记', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ]
};

// 初始化数据文件
function initDataFile(key) {
  if (!fs.existsSync(DATA_FILES[key])) {
    fs.writeFileSync(DATA_FILES[key], JSON.stringify(DEFAULT_DATA[key], null, 2), 'utf-8');
  }
}

Object.keys(DATA_FILES).forEach(initDataFile);

// ========== Splash 加载窗口 ==========
let splashWindow = null;
let mainWindow = null;

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 480, height: 320,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    center: true,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      sandbox: false
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'renderer', 'splash.html'));

  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
  });
}

// ========== 主窗口 ==========
function createMainWindow() {
  const cfg = loadWindowConfig();
  mainWindow = new BrowserWindow({
    width: cfg.width || 1280,
    height: cfg.height || 800,
    x: cfg.x,
    y: cfg.y,
    minWidth: 900,
    minHeight: 600,
    title: '涛笺',
    show: false,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  if (cfg.maximized) {
    mainWindow.maximize();
  }

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      splashWindow = null;
    }
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('close', () => {
    saveWindowConfig(mainWindow);
  });
}

// ========== 附件工具 ==========
function getEntryAttachDir(entryId) {
  return path.join(ATTACH_DIR, entryId);
}

function ensureEntryAttachDir(entryId) {
  const dir = getEntryAttachDir(entryId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function removeEntryAttachDir(entryId) {
  const dir = getEntryAttachDir(entryId);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

// ========== IPC 处理 ==========

// 读取数据
ipcMain.handle('data:read', async (_, category) => {
  try {
    const filePath = DATA_FILES[category];
    if (!fs.existsSync(filePath)) {
      initDataFile(category);
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return { success: true, data: JSON.parse(data) };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 写入数据
ipcMain.handle('data:write', async (_, category, items) => {
  try {
    const filePath = DATA_FILES[category];
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 保存单条
ipcMain.handle('data:save', async (_, category, item) => {
  try {
    const filePath = DATA_FILES[category];
    let items = [];
    if (fs.existsSync(filePath)) {
      items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    const now = new Date().toISOString();
    if (item.id) {
      const idx = items.findIndex(i => i.id === item.id);
      if (idx >= 0) {
        items[idx] = { ...items[idx], ...item, updatedAt: now };
      } else {
        items.push({ ...item, createdAt: now, updatedAt: now });
      }
    } else {
      item.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      items.unshift({ ...item, createdAt: now, updatedAt: now });
    }
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf-8');
    return { success: true, data: items };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 删除单条
ipcMain.handle('data:delete', async (_, category, id) => {
  try {
    const filePath = DATA_FILES[category];
    let items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    items = items.filter(i => i.id !== id);
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf-8');
    // 清理学习模块附件
    if (category === 'study') {
      removeEntryAttachDir(id);
    }
    return { success: true, data: items };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 导出数据
ipcMain.handle('data:export', async (_, category) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: `${category}_backup_${new Date().toISOString().slice(0,10)}.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (!filePath) return { success: false, cancelled: true };
    const data = fs.readFileSync(DATA_FILES[category], 'utf-8');
    fs.writeFileSync(filePath, data, 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// 导入数据
ipcMain.handle('data:import', async (_, category) => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });
    if (!filePaths || filePaths.length === 0) return { success: false, cancelled: true };
    const importData = fs.readFileSync(filePaths[0], 'utf-8');
    const parsed = JSON.parse(importData);
    if (!Array.isArray(parsed)) {
      return { success: false, error: '导入文件格式不正确，应为 JSON 数组' };
    }
    const now = new Date().toISOString();
    const normalized = parsed.map(item => ({
      id: item.id || Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      title: item.title || '未命名',
      content: item.content || '',
      createdAt: item.createdAt || now,
      updatedAt: item.updatedAt || now
    }));
    fs.writeFileSync(DATA_FILES[category], JSON.stringify(normalized, null, 2), 'utf-8');
    return { success: true, data: normalized };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ========== 附件上传 ==========
ipcMain.handle('attach:upload', async (_, { entryId }) => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      title: '选择附件'
    });
    if (!filePaths || filePaths.length === 0) {
      return { success: false, cancelled: true };
    }
    const srcPath = filePaths[0];
    const stats = fs.statSync(srcPath);
    if (stats.size > 100 * 1024 * 1024) {
      return { success: false, error: '文件超过 100MB 限制' };
    }
    const destDir = ensureEntryAttachDir(entryId);
    const fileName = path.basename(srcPath);
    const destPath = path.join(destDir, fileName);
    // 如果同名文件已存在，追加序号
    let finalName = fileName;
    let finalPath = destPath;
    let counter = 1;
    while (fs.existsSync(finalPath)) {
      const ext = path.extname(fileName);
      const base = path.basename(fileName, ext);
      finalName = `${base} (${counter})${ext}`;
      finalPath = path.join(destDir, finalName);
      counter++;
    }
    fs.copyFileSync(srcPath, finalPath);
    return {
      success: true,
      attachment: {
        name: finalName,
        size: stats.size,
        sizeReadable: formatFileSize(stats.size),
        path: path.relative(DATA_DIR, finalPath).replace(/\\/g, '/')
      }
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ========== 附件下载（另存为）==========
ipcMain.handle('attach:download', async (_, { relPath, suggestedName }) => {
  try {
    const fullPath = path.join(DATA_DIR, relPath);
    if (!fs.existsSync(fullPath)) {
      return { success: false, error: '附件不存在' };
    }
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: suggestedName || path.basename(fullPath)
    });
    if (!filePath) return { success: false, cancelled: true };
    fs.copyFileSync(fullPath, filePath);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ========== 附件删除 ==========
ipcMain.handle('attach:remove', async (_, { entryId, fileName }) => {
  try {
    const dir = getEntryAttachDir(entryId);
    const filePath = path.join(dir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    // 如果目录空了，删除目录
    if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ========== 打开外部链接 ==========
ipcMain.handle('shell:openExternal', async (_, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ========== 草稿 ==========
const drafts = new Map();
ipcMain.handle('draft:save', async (_, category, item) => {
  drafts.set(`${category}_draft`, item);
  return { success: true };
});
ipcMain.handle('draft:read', async (_, category) => {
  const draft = drafts.get(`${category}_draft`);
  return { success: true, data: draft || null };
});
ipcMain.handle('draft:clear', async (_, category) => {
  drafts.delete(`${category}_draft`);
  return { success: true };
});

// ========== App 生命周期 ==========
app.whenReady().then(() => {
  createSplashWindow();
  setTimeout(() => {
    createMainWindow();
  }, 1500);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
