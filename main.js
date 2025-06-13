const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os');
const fsp = require('fs/promises');

// ===================== 🌍 Entorno =====================
process.env.NODE_ENV = 'production';

// ===================== 🪟 Crear ventana principal =====================
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false,
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL('http://localhost:3100');
    mainWindow.webContents.openDevTools(); // DevTools solo en dev
  } else {
    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
  }
}

// ===================== 📂 Diálogo: abrir PDF =====================
ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
  });
  return result.canceled ? null : result.filePaths[0];
});

// ===================== 💾 Guardar PDF en Desktop\PDFS GUARDADOS =====================
ipcMain.handle('pdf:saveToDesktop', async (_, filePath, fileName) => {
  try {
    const saveDir = path.join(os.homedir(), 'Desktop', 'PDFS GUARDADOS');
    await fsp.mkdir(saveDir, { recursive: true });       // crea carpeta si falta

    const dest = path.join(saveDir, fileName);           // destino final
    await fsp.copyFile(filePath, dest);

    return { success: true, path: dest };
  } catch (error) {
    console.error('[Main] ❌ Error al guardar PDF:', error);
    return { success: false, error: error.message };
  }
});

// ===================== 📝 Guardar texto como archivo en la misma carpeta =====================
ipcMain.handle('save-result', async (_, text) => {
  try {
    const saveDir = path.join(os.homedir(), 'Desktop', 'PDFS GUARDADOS');
    await fsp.mkdir(saveDir, { recursive: true });

    const filePath = path.join(saveDir, 'resultado.txt');
    await fsp.writeFile(filePath, text, 'utf8');

    return { success: true, path: filePath };
  } catch (error) {
    console.error('[Main] ❌ Error al guardar texto:', error);
    return { success: false, error: error.message };
  }
});

// ===================== 📦 Cargar PDF como binario =====================
ipcMain.handle('pdf:loadData', async (_, filePath) => {
  try {
    return await fsp.readFile(filePath);
  } catch (error) {
    console.error('[Main] ❌ Error al leer PDF:', error);
    throw error;
  }
});

// ===================== 🚀 Inicialización de App =====================
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// ===================== 🛑 Salida =====================
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
