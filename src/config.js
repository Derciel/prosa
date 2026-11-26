"use strict";

const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const log = require('electron-log/main');

const defaults = {
    width: 1100,
    height: 760,
    maximized: false,
    quietMode: false,
    blurMessages: false,
    blurList: false,
    blurNames: false,
    blurPhotos: false,
    blurComposer: false,
    blurOnBlur: false,
    bonusButton: true,
    fontSize: 'normal',
    customCss: '',
    lockEnabled: false,
    lockHash: '',
    lockSalt: '',
    lockAfterMinutes: 0,
    lockOnHide: false,
    trayIcon: true,
    startMinimized: false,
    autostart: false,
    autoHideMenuBar: false,
    disableGpu: false,
    globalShortcut: false,
    language: 'auto',
    useProxy: false,
    httpProxy: '',
    httpsProxy: ''
};

let settings = Object.assign({}, defaults);
let saveTimer = null;
let getWindow = function () { return null; };

function file() {
    return path.join(app.getPath('userData'), 'settings.json');
}

function load() {
    try {
        // Editors such as Notepad save a BOM at the start of the file, which JSON.parse rejects
        const data = JSON.parse(fs.readFileSync(file(), 'utf-8').replace(/^﻿/, ''));
        settings = Object.assign({}, defaults, data);
        log.info('Configuração carregada');
    } catch (e) {
        settings = Object.assign({}, defaults);
        if (e.code !== 'ENOENT') {
            log.warn('Não foi possível ler as configurações (' + e + '), usando o padrão');
        }
    }
}

function write() {
    try {
        const win = getWindow();
        if (win && !win.isDestroyed()) {
            settings.maximized = win.isMaximized();
        }
        // Temp file + rename: a crash in the middle of the write can never leave a broken settings.json
        fs.writeFileSync(file() + '.tmp', JSON.stringify(settings), 'utf-8');
        fs.renameSync(file() + '.tmp', file());
    } catch (e) {
        log.error('Erro ao salvar as configurações: ' + e);
    }
}

function get(key) {
    return settings[key];
}

function set(key, value) {
    settings[key] = value;
}

function all() {
    return Object.assign({}, settings);
}

// Debounced save, used for things that change often (window position and size)
function saveSoon() {
    if (saveTimer) {
        clearTimeout(saveTimer);
    }
    saveTimer = setTimeout(function () {
        saveTimer = null;
        write();
    }, 1500);
}

function flush() {
    if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
        write();
    }
}

function setWindowProvider(fn) {
    getWindow = fn;
}

module.exports = { defaults, load, write, get, set, all, saveSoon, flush, setWindowProvider };
