const { contextBridge, ipcRenderer } = require('electron');

// ===================== 🔐 Seguridad =====================
if (!process.contextIsolated) {
  throw new Error(
    '¡Error crítico! ContextIsolation debe estar ACTIVADO en main.js'
  );
}

// ===================== 🧠 API Segura para el Frontend =====================
contextBridge.exposeInMainWorld('electronAPI', {
  // 📂 Abrir diálogo de selección de archivo
  openFile: () => ipcRenderer.invoke('dialog:openFile'),

  // 💾 Guardar PDF en escritorio
  savePDF: (src, name) => ipcRenderer.invoke('pdf:saveToDesktop', src, name),

  // 📝 Guardar texto como archivo
  saveText: (text) => ipcRenderer.invoke('save-result', text),

  // 📦 Cargar datos binarios de un PDF
  loadPDFData: (file) => ipcRenderer.invoke('pdf:loadData', file),

  // ☁️ Guardar en Google Drive
  saveToGoogleDrive: (file) => ipcRenderer.invoke('cloud:saveToGoogleDrive', file),

  // ☁️ Guardar en OneDrive
  saveToOneDrive: (file) => ipcRenderer.invoke('cloud:saveToOneDrive', file),
});

// ===================== 🧪 Debug opcional =====================
[
  'dialog:openFile',
  'pdf:saveToDesktop',
  'save-result',
  'pdf:loadData',
  'cloud:saveToGoogleDrive',
  'cloud:saveToOneDrive'
].forEach((channel) => {
  ipcRenderer.on(channel, (_, ...args) => {
    console.log(`[IPC Monitor] Canal "${channel}" recibió:`, ...args);
  });
});

console.log('✅ Preload.js cargado. API disponible en window.electronAPI');
