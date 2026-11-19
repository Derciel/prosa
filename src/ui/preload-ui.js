"use strict";

// Bridge between the local windows (settings, about, lock) and the main process.
// The pages run sandboxed with no Node access: this is the only thing they can call.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('prosa', {
    strings: ipcRenderer.sendSync('ui:strings'),
    getSettings: () => ipcRenderer.invoke('settings:get'),
    saveSettings: (payload) => ipcRenderer.invoke('settings:save', payload),
    pickCss: () => ipcRenderer.invoke('settings:pick-css'),
    close: () => ipcRenderer.send('ui:close'),
    info: () => ipcRenderer.invoke('ui:info'),
    unlock: (password) => ipcRenderer.invoke('lock:unlock', password),
    forgotPassword: () => ipcRenderer.invoke('lock:forgot')
});
