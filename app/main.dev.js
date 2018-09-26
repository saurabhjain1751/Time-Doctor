/* eslint global-require: 0, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow } from 'electron';
import MenuBuilder from './menu';

import { configureStore } from './store/configureStore';

const electron = require('electron');

const ipc = electron.ipcMain;
const store = configureStore(undefined, 'main');
global.mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.log);
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 480,
    height: 220
  });
  mainWindow.setResizable(false);

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // let top = new BrowserWindow()
  //   global.child = new BrowserWindow({parent: mainWindow, show:false})
  //   child.loadURL(`file://${__dirname}/app.html#/widget`);

  //   child.once('ready-to-show', () => {
  //     child.show()
  //   })

  //   child.webContents.on("async-ping", (event,arg) => {
  //     console.log("Hi I am reciving on child ", arg);
  //   })

  global.child = new BrowserWindow({
    width: 170,
    height: 45,
    show: false,
    frame: false
  });
  global.child.loadURL(`file://${__dirname}/app.html#/widget`);
  global.child.setResizable(false);
  ipc.on('asynchronous-message', (event, arg) => {
    if (arg) {
      global.child.show();
    } else {
      global.child.minimize();
    }
  });
  ipc.on('asynchronous-timer-message', (event, arg) => {
    // console.log("hello reciving IPC is -",arg);
    // ipc.send('asynchronous-msg', arg)
    mainWindow.webContents.send('async-ping', arg);
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});
