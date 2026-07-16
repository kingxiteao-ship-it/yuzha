const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('taojianAPI', {
  // 数据读写
  readData: (category) => ipcRenderer.invoke('data:read', category),
  writeData: (category, items) => ipcRenderer.invoke('data:write', category, items),
  saveItem: (category, item) => ipcRenderer.invoke('data:save', category, item),
  deleteItem: (category, id) => ipcRenderer.invoke('data:delete', category, id),
  exportData: (category) => ipcRenderer.invoke('data:export', category),
  importData: (category) => ipcRenderer.invoke('data:import', category),

  // 附件管理
  uploadAttachment: (args) => ipcRenderer.invoke('attach:upload', args),
  downloadAttachment: (args) => ipcRenderer.invoke('attach:download', args),
  removeAttachment: (args) => ipcRenderer.invoke('attach:remove', args),

  // 打开外部链接
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),

  // 草稿
  saveDraft: (category, item) => ipcRenderer.invoke('draft:save', category, item),
  readDraft: (category) => ipcRenderer.invoke('draft:read', category),
  clearDraft: (category) => ipcRenderer.invoke('draft:clear', category),

  // 用户认证
  registerUser: (args) => ipcRenderer.invoke('auth:register', args),
  loginUser: (args) => ipcRenderer.invoke('auth:login', args),
  getUsers: () => ipcRenderer.invoke('auth:getUsers'),
  logoutUser: () => ipcRenderer.invoke('auth:logout'),

  // 列宽偏好
  saveColumnPrefs: (prefs) => ipcRenderer.invoke('column:save', prefs),
  loadColumnPrefs: () => ipcRenderer.invoke('column:load'),

  // 工具函数
  genId: () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
  formatDate: (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  },
  formatDateShort: (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
});
