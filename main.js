const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  mainWindow.loadFile('index.html');
  
  // Open DevTools in development
  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// IPC handlers for cheat functions
ipcMain.on('save-game-data', (event, data) => {
  // Implementation for saving game data
  const savePath = path.join(app.getPath('userData'), 'game-save.json');
  fs.writeFileSync(savePath, JSON.stringify(data));
  event.reply('save-complete', true);
});

ipcMain.on('load-game-data', (event) => {
  // Implementation for loading game data
  const savePath = path.join(app.getPath('userData'), 'game-save.json');
  try {
    if (fs.existsSync(savePath)) {
      const data = JSON.parse(fs.readFileSync(savePath));
      event.reply('load-complete', data);
    } else {
      event.reply('load-complete', null);
    }
  } catch (error) {
    console.error('Error loading game data:', error);
    event.reply('load-complete', null);
  }
});