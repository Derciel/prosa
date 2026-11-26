"use strict";

// Bridge between the local windows (settings, lock) and the main process.
// The pages run sandboxed with no Node access: this is the only thing they can call.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('prosa', {
    strings: ipcRenderer.sendSync('ui:strings'),
    getSettings: () => ipcRenderer.invoke('settings:get'),
    saveSettings: (payload) => ipcRenderer.invoke('settings:save', payload),
    pickCss: () => ipcRenderer.invoke('settings:pick-css'),
    close: () => ipcRenderer.send('ui:close'),
    info: () => ipcRenderer.invoke('ui:info'),
    openSource: () => ipcRenderer.send('ui:open-source'),
    unlock: (password) => ipcRenderer.invoke('lock:unlock', password),
    forgotPassword: () => ipcRenderer.invoke('lock:forgot'),
    getUpdateState: () => ipcRenderer.invoke('update:get'),
    checkUpdates: () => ipcRenderer.send('update:check'),
    installUpdate: () => ipcRenderer.send('update:install'),
    onUpdateState: (callback) => ipcRenderer.on('update:state', (event, state) => callback(state)),
    onGoto: (callback) => ipcRenderer.on('ui:goto', (event, tab) => callback(tab))
});
