import * as electron from 'electron';

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
let mainWindow: electron.BrowserWindow | null;

function createWindow() {
    mainWindow = new BrowserWindow({
        frame: true,
        fullscreen: false,
        fullscreenable: true,
        height: 920,
        minHeight: 920,
        minWidth: 1600,
        resizable: true,
        title: 'rt_helper',
        webPreferences: {
            devTools: true,
            zoomFactor: 0.8,
        },
        width: 1600,
    });

    mainWindow.loadURL('file://' + __dirname + '/index.html');

    mainWindow.on(EVENTS.CLOSED, () => {
        mainWindow = null;
    });

}

app.on(EVENTS.READY, createWindow);

app.on(EVENTS.WINDOW_ALL_CLOSED, () => {
    // if (process.platform !== MAC_OS) {
        app.quit();
    // }
});

app.on(EVENTS.ACTIVATE, () => {
    if (mainWindow === null) {
        createWindow();
    }
});

const enum EVENTS {
    ACTIVATE = 'activate',
    CLOSED = 'closed',
    READY = 'ready',
    WINDOW_ALL_CLOSED = 'window-all-closed',
}

const MAC_OS = 'darwin';
