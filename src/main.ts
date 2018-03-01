import {app, shell, Menu, BrowserWindow} from 'electron';

let mainWindow: BrowserWindow | null;

function createWindow() {
    mainWindow = new BrowserWindow({
        autoHideMenuBar: false,
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

    // mainWindow.webContents.openDevTools();

    const template = [
        {
            label: 'Edit',
            submenu: [
                {
                    role: 'undo'
                },
                {
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'cut'
                },
                {
                    role: 'copy'
                },
                {
                    role: 'paste'
                },
                {
                    role: 'pasteandmatchstyle'
                },
                {
                    role: 'delete'
                },
                {
                    role: 'selectall'
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    role: 'reload'
                },
                {
                    role: 'forcereload'
                },
                {
                    role: 'toggledevtools'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'resetzoom'
                },
                {
                    role: 'zoomin'
                },
                {
                    role: 'zoomout'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'togglefullscreen'
                }
            ]
        },
        {
            role: 'window',
            submenu: [
                {
                    role: 'minimize'
                },
                {
                    role: 'close'
                }
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click() {
                        shell.openExternal('https://electronjs.org')
                    }
                },
                {
                    label: 'Documentation',
                    click() {
                        shell.openExternal(
                            `https://github.com/electron/electron/tree/v${process.versions.electron}/docs#readme`
                        )
                    }
                },
                {
                    label: 'Community Discussions',
                    click() {
                        shell.openExternal('https://discuss.atom.io/c/electron')
                    }
                },
                {
                    label: 'Search Issues',
                    click() {
                        shell.openExternal('https://github.com/electron/electron/issues')
                    }
                }
            ]
        }
    ]

    if (process.platform === 'darwin') {
        template.unshift({
            label: 'Electron',
            submenu: [
                {
                    role: 'about'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'services',
                    submenu: []
                },
                {
                    type: 'separator'
                },
                {
                    role: 'hide'
                },
                {
                    role: 'hideothers'
                },
                {
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                }
            ]
        } as any);

        template[3].submenu = [
            {
                role: 'close'
            },
            {
                role: 'minimize'
            },
            {
                role: 'zoom'
            },
            {
                type: 'separator'
            },
            {
                role: 'front'
            }
        ]
    } else {
        template.unshift({
            label: 'File',
            submenu: [{
                role: 'quit'
            }]
        })
    }

    const menu = Menu.buildFromTemplate(template as any)
    Menu.setApplicationMenu(menu)
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
