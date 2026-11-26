"use strict";

// Preload of the WhatsApp Web window. It exposes one single capability to the page: opening Prosa's own
// bonus settings from the button placed on the WhatsApp sidebar. The main process checks who is calling.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('prosaBridge', {
    openBonus: () => ipcRenderer.send('bonus:open')
});
