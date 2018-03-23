const {Menu, Tray} = require('electron')
const electron = require('electron')
const isDev = require('electron-is-dev');

const app = electron.app
console.log(app.getPath('exe'),'aaaaaaa')
var AutoLaunch = require('auto-launch');
if(!isDev){
  var minecraftAutoLauncher = new AutoLaunch({
    name: 'desktop-organizer',
  });
}
  var winston = require('winston');
  var basepath = app.getPath('logs');


  winston.configure({
    transports: [
      new (winston.transports.File)({ filename: basepath+'/somefile.log'  })
    ]
  });
  minecraftAutoLauncher.isEnabled()
  .then(function(isEnabled){
    if(isEnabled){
        return;
    }
    minecraftAutoLauncher.enable();
  })
  .catch(function(err){
      // handle error
  });// Module to control application life.

// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

let tray = null

const path =require('path')
const ipcMain = electron.ipcMain
const watcher = require('../src/helpers/watcher')
ipcMain.on('watch',(event,arg)=>{
  winston.info('watch from ui');
  if(watcher.hasAppsDB()){
    winston.info('apps hast');
  
  setInterval(watcher.watch,3000)
}
})
ipcMain.on('init',(event,arg)=>{
  console.log(arg)
  watcher.init(arg)
})
async function createWindow () {
  // Create the browser window.
  let hasApps = await watcher.hasAppsDB()
  
  winston.info(`watch from app ready ${JSON.stringify(hasApps)}`);

  if(hasApps.success == true){
    setInterval(watcher.watch,3000)
    winston.info('apps hast');
  }

  mainWindow = new BrowserWindow({show:false,width: 800, height: 600})

  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
  
  tray = new Tray(path.join(__dirname, 'icon.ico'))
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Exit', click: ()=>{
      app.quit()
    }},
    { label: 'Show App', click:  function(){
      mainWindow.show();
  } },

  ])
  tray.setToolTip('desktop organizer silently works in background')
  tray.setContextMenu(contextMenu)
  mainWindow.on('minimize',function(event){
    event.preventDefault();
    mainWindow.setSkipTaskbar(true)
    mainWindow.hide();
  });
  // mainWindow.on('close', function (event) {
  //   if(!app.isQuiting){
  //       event.preventDefault();
  //       mainWindow.hide();
  //   }
  
  //   return false;
  // });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
