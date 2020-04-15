# Carrot music download

### 主要框架
1. electron @8.1.1
2. react
3. axios

### 脚手架
create-react-app

#### 新建项目
```
create-react-app desktop
cd desktop
yarn add electron
```
1. 修改package.json
    ```
    {
        ...
        "main": "main.js"
        ... 
    }
    ```
2. 根目录下新建main.js
    ```
   // 引入 electron 并创建一个 BrowserWindow
   const {app, BrowserWindow, ipcMain, shell} = require("electron");
   const path = require("path");
   
   // 保持 window 对象的全局引用，避免 Javascript 对象被来及回收时，窗口被自动关闭
   let mainWindow;
   
   function createWindow() {
   
     mainWindow = new BrowserWindow({
       width: 650,
       height: 500,
       frame: false,
       resizable: false,
       webPreferences: {
         nodeIntegration: true,
         preload: path.join(__dirname, "preload.js")
       }
     });
   
     // 加载应用 ---- 适用于 react 项目
     mainWindow.loadURL("http://localhost:3000/");
   
     // 关闭 window 时触发下列事件
     mainWindow.on("closed", () => {
       mainWindow = null;
     });
   
   
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
    ```
#### 渲染进程中引入electron
*   index.html
    ```
      <script>
         window.electron = require('electron');
       </script>
    ```
#### 项目打包
electron-builder
1. desktop下
   ```
   yarn build/npm run build
   ```
2. 复制根目录下的main.js到build，进入build文件下，新建package.json，内容如下：
   ```
   {
     "name": "carrot-music-downloader",
     "version": "0.1.0",
     "private": true,
     "homepage": ".",
     "main": "main.js",
     "author": "xue chen",
     "build": {
       "directories": {
         "output": "../../release/desktop"
       },
       "win": {
         "icon": "./favicon.ico"
       }
     }
   }
3. 在build下
   ```
   yarn add electron@8.2.0 --dev
   // 或者 npm install electron --save-dev
   ```
4. 安装electron-builder(建议全局安装)
   ```
   yarn global add electron-builder
    // 或者 npm install -g electron-builder
   ```   
5. 在build下
    
   ```
   electron-builder --win --dir
   ```