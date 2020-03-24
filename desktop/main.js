/**
 * @author xue chen
 * @since 2020/3/24
 */

// 引入 electron 并创建一个 BrowserWindow
const {app, BrowserWindow} = require("electron");
const path = require("path");

// 保持 window 对象的全局引用，避免 Javascript 对象被来及回收时，窗口被自动关闭
let mainWindow;

function createWindow() {

  mainWindow = new BrowserWindow({
    width: 650,
    height: 500,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js")
    }
  });

  // 加载应用 ---- 适用于 react 项目
  mainWindow.loadURL("http://localhost:3000/");

  // 打开开发者工具， 默认不打开
  // mainWindow.webContents.openDevTools();

  // 关闭 window 时触发下列事件
  mainWindow.on("closed", () => {
    mainWindow = null;
  })

}

// 当 electron 完成初始化并准备创建浏览器窗口时调用此方法
app.on("ready", createWindow);

// 所有窗口关闭时退出应用
app.on("window-all-closed", () => {
  // macOS 中除非用户按下 ‘cmd + Q’ 显示退出，否则应用于菜单栏始终处于活动状态
  if(process.platform !== 'darwin') {
    app.quit();
  }
});

app.on("activate", () => {
  // macOS 中点击 Dock 图标时没有已打开的其余应用窗口时，则通常在应用中重建一个窗口
  if(mainWindow === null) {
    createWindow();
  }
});

