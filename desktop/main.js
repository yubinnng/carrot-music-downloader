/**
 * @author xue chen
 * @since 2020/3/24
 */

// 引入 electron 并创建一个 BrowserWindow
const {app, BrowserWindow, ipcMain, shell} = require("electron");

// 保持 window 对象的全局引用，避免 Javascript 对象被来及回收时，窗口被自动关闭
let mainWindow;
const url = require("url");
const path = require("path");

const goTheLock = app.requestSingleInstanceLock();

function createWindow() {

  mainWindow = new BrowserWindow({
    width: 650,
    height: 500,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });



  // 加载应用 ---- 适用于 react 项目
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, './index.html'),
    protocol: 'file:',
    slashes: true
  }));


  // 关闭 window 时触发下列事件
  mainWindow.on("closed", () => {
    mainWindow = null;
  });



}

if(!goTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if(mainWindow) {
      if(mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  })
}

// 当 electron 完成初始化并准备创建浏览器窗口时调用此方法
app.on("ready", createWindow);

// 所有窗口关闭时退出应用
app.on("window-all-closed", () => {
  // macOS 中除非用户按下 ‘cmd + Q’ 显示退出，否则应用于菜单栏始终处于活动状态
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on("activate", () => {
  // macOS 中点击 Dock 图标时没有已打开的其余应用窗口时，则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on("remove", (event, args) => {
  args === 200 && mainWindow.close();
});

ipcMain.on("min", (event, args) => {
  args === 200 && mainWindow.minimize();

});

ipcMain.on("open-url", (event, url) => {
  shell.openExternal(url).then();
});

// 服务端进程
let serverProc;

const createServerProc = () => {
  let server_app = '../../server/server';
  let suffix;
  switch (process.platform) {
    case 'win32':
      suffix = '.exe';
      break;
    case 'darwin':
      suffix = '.app';
      break;
    case 'linux':
      suffix = '';
      break;
  }
  serverProc = require('child_process').execFile(server_app + suffix);
  console.log('server proc start');
};

const closeServerProc = () => {
  serverProc.kill();
  serverProc = null;
  console.log('server proc close');
};

app.on('ready', createServerProc);
app.on('will-quit', closeServerProc);