const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os');
const fsp = require('fs/promises');
const { google } = require('googleapis');
const { Client } = require('@microsoft/microsoft-graph-client');
require('dotenv').config();

// ===================== 🌍 Entorno =====================
process.env.NODE_ENV = 'production';

// Credenciales de Google Drive desde variables de entorno
const GOOGLE_CREDENTIALS = {
  client_id: process.env.GOOGLE_CLIENT_ID,
  client_secret: process.env.GOOGLE_CLIENT_SECRET,
  redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
};

// Credenciales de OneDrive (reemplazar con tus propias credenciales)
const ONEDRIVE_CREDENTIALS = {
  clientId: 'TU_CLIENT_ID',
  clientSecret: 'TU_CLIENT_SECRET',
  redirectUri: 'http://localhost'
};

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

// ===================== ☁️ Google Drive =====================
ipcMain.handle('cloud:saveToGoogleDrive', async (_, filePath) => {
  try {
    const auth = new google.auth.OAuth2(
      GOOGLE_CREDENTIALS.client_id,
      GOOGLE_CREDENTIALS.client_secret,
      GOOGLE_CREDENTIALS.redirect_uri
    );

    // Aquí deberías implementar el flujo de autenticación
    // Este es un ejemplo simplificado
    const drive = google.drive({ version: 'v3', auth });
    const fileMetadata = {
      name: path.basename(filePath)
    };

    const media = {
      mimeType: 'application/pdf',
      body: await fsp.readFile(filePath)
    };

    const file = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    });

    return { success: true, fileId: file.data.id, link: file.data.webViewLink };
  } catch (error) {
    console.error('Error al guardar en Google Drive:', error);
    return { success: false, error: error.message };
  }
});

// ===================== ☁️ OneDrive =====================
ipcMain.handle('cloud:saveToOneDrive', async (_, filePath) => {
  try {
    const client = Client.init({
      authProvider: (done) => {
        // Aquí deberías implementar el flujo de autenticación
        // Este es un ejemplo simplificado
        done(null, 'ACCESS_TOKEN');
      }
    });

    const fileName = path.basename(filePath);
    const fileContent = await fsp.readFile(filePath);

    const uploadSession = await client
      .api('/me/drive/root:/' + fileName + ':/createUploadSession')
      .post({});

    const response = await client
      .api(uploadSession.uploadUrl)
      .put(fileContent);

    return { success: true, fileId: response.id, link: response.webUrl };
  } catch (error) {
    console.error('Error al guardar en OneDrive:', error);
    return { success: false, error: error.message };
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
