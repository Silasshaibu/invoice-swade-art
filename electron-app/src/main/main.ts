import { app, BrowserWindow, shell, Menu, Tray, nativeImage, ipcMain } from 'electron'
import path from 'path'

const isDev = process.env.NODE_ENV !== 'production'
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../../public/icon.png'),
    show: false,
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => mainWindow?.show())

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => { mainWindow = null })
}

function setupTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, '../../public/icon.png'))
  tray = new Tray(icon.resize({ width: 16, height: 16 }))
  tray.setToolTip('Invoice — swade-art')
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open Invoice', click: () => { mainWindow?.show(); mainWindow?.focus() } },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]))
  tray.on('double-click', () => { mainWindow?.show(); mainWindow?.focus() })
}

ipcMain.handle('print-to-pdf', async () => {
  if (!mainWindow) return null
  const data = await mainWindow.webContents.printToPDF({ printBackground: true })
  return data
})

app.whenReady().then(() => {
  createWindow()
  if (!isDev) setupTray()
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('before-quit', () => { tray?.destroy() })
