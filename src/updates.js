"use strict";

const { app } = require('electron');
const log = require('electron-log/main');

// One place that knows where the update check stands. The settings window shows this state live,
// so "Check for updates" always gives visible feedback instead of an easy-to-miss dialog.
//
// status: idle | checking | downloading | downloaded | none | error | dev
let updater = null;
let state = {
    status: app.isPackaged ? 'idle' : 'dev',
    version: app.getVersion(),
    available: '',
    percent: 0,
    error: '',
    checkedAt: 0
};
const listeners = [];

function setState(patch) {
    state = Object.assign({}, state, patch);
    listeners.forEach(function (fn) {
        try { fn(state); } catch (e) { log.warn('Erro ao avisar a mudança de estado: ' + e); }
    });
}

function getState() {
    return state;
}

function onChange(fn) {
    listeners.push(fn);
}

function friendlyError(error) {
    var text = String(error && error.message ? error.message : error);
    return /ERR_(NAME_NOT_RESOLVED|INTERNET_DISCONNECTED|NETWORK_CHANGED|CONNECTION|TIMED_OUT|PROXY)|ENOTFOUND|ETIMEDOUT|ECONNRESET/i.test(text)
        ? 'network' : 'other';
}

// callbacks.onDownloaded runs once a new version is ready to install
function init(callbacks) {
    if (!app.isPackaged) {
        return;
    }
    try {
        updater = require('electron-updater').autoUpdater;
        updater.logger = log;
        updater.autoDownload = true;
        updater.autoInstallOnAppQuit = true;

        updater.on('checking-for-update', function () {
            setState({ status: 'checking', error: '', percent: 0 });
        });
        updater.on('update-available', function (info) {
            setState({ status: 'downloading', available: info.version, percent: 0 });
        });
        updater.on('download-progress', function (progress) {
            setState({ status: 'downloading', percent: Math.round(progress.percent || 0) });
        });
        updater.on('update-not-available', function () {
            setState({ status: 'none', checkedAt: Date.now() });
        });
        updater.on('error', function (e) {
            log.warn('Erro na atualização: ' + e);
            setState({ status: 'error', error: friendlyError(e), checkedAt: Date.now() });
        });
        updater.on('update-downloaded', function (info) {
            setState({ status: 'downloaded', available: info.version, percent: 100 });
            if (callbacks && callbacks.onDownloaded) {
                callbacks.onDownloaded(info.version);
            }
        });
    } catch (e) {
        log.warn('Atualização automática indisponível: ' + e);
        updater = null;
    }
}

function check() {
    if (!updater) {
        return;
    }
    // A check or download already running must not be started twice
    if (state.status === 'checking' || state.status === 'downloading') {
        return;
    }
    // A new version that is already downloaded stays as it is
    if (state.status === 'downloaded') {
        return;
    }
    updater.checkForUpdates().catch(function (e) {
        // The 'error' event already updated the state; this only keeps the rejection from being unhandled
        log.warn('Erro ao verificar atualizações: ' + e);
    });
}

function install() {
    if (updater && state.status === 'downloaded') {
        // Silent install, then Prosa starts again by itself
        updater.quitAndInstall(true, true);
    }
}

module.exports = { init, check, install, getState, onChange };
