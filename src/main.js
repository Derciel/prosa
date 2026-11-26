"use strict";

const {
    app, BrowserWindow, Menu, MenuItem, Tray, nativeImage, nativeTheme, shell, session, ipcMain, dialog,
    globalShortcut, powerMonitor, screen, clipboard, webContents
} = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const fs = require('fs');
const log = require('electron-log/main');
const config = require('./config');
const i18n = require('./i18n');
const password = require('./password');

const t = i18n.t;
const WA_URL = 'https://web.whatsapp.com';
const UI_DIR = path.join(__dirname, 'ui');
const UI_URL = pathToFileURL(UI_DIR).href;
const ASSETS_DIR = path.join(__dirname, 'assets');

// ---------------------------------------------------------------------------------------------
// Page styles. Messages and chat list are blurred and come back into focus under the mouse.
// ---------------------------------------------------------------------------------------------
// Each message is matched by its long-standing markers (message-in/out classes and the data-id attribute),
// and nested matches are skipped so a message is never blurred twice.
const MSG = ':is(.message-in, .message-out, [data-id])';
const BLUR_MESSAGES_CSS =
    '#main ' + MSG + ':not(' + MSG + ' ' + MSG + ') { filter: blur(7px); transition: filter .12s ease; }' +
    '#main [role="row"]:hover ' + MSG + ':not(' + MSG + ' ' + MSG + '),' +
    '#main ' + MSG + ':not(' + MSG + ' ' + MSG + '):hover { filter: none; }';

// The chat list lives in #pane-side, but the Archived screen is a separate drawer outside it.
const ROW = ':is([role="listitem"], [role="row"])';
const LIST = ':is(#pane-side, [data-testid="archived-drawer"]) ';
const BLUR_LIST_CSS =
    LIST + ROW + ':not(' + ROW + ' ' + ROW + ') { filter: blur(6px); transition: filter .12s ease; }' +
    LIST + ROW + ':not(' + ROW + ' ' + ROW + '):hover { filter: none; }';

const ZOOM = { small: 0.9, normal: 1, medium: 1.1, large: 1.25 };

// ---------------------------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------------------------
let mainWindow = null;
let lockWindow = null;
let settingsWindow = null;
let aboutWindow = null;
let tray = null;
let locked = false;
let quitting = false;
let hasUnread = false;
let pageStyleKeys = [];
let pendingGroupLink = null;
let userAgent = '';
const throttle = password.createThrottle();

const GROUP_LINK_RE = /https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+/;

function extractGroupLink(args) {
    for (var i = 0; i < args.length; i++) {
        var match = GROUP_LINK_RE.exec(args[i]);
        if (match) {
            return match[0];
        }
    }
    return null;
}

function alive(win) {
    return win && !win.isDestroyed();
}

function isWhatsAppHost(url) {
    try {
        var host = new URL(url).hostname;
        return host === 'whatsapp.com' || host.endsWith('.whatsapp.com') || host.endsWith('.whatsapp.net');
    } catch (e) {
        return false;
    }
}

function openExternalSafe(url) {
    try {
        var protocol = new URL(url).protocol;
        if (protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:') {
            shell.openExternal(url);
            return;
        }
    } catch (e) {}
    log.warn('URL externa bloqueada: ' + url);
}

// IPC from the local pages is only accepted from our own ui/ folder
function fromOurUi(event) {
    var url = event.senderFrame ? event.senderFrame.url : '';
    return url.startsWith(UI_URL);
}

function applyLanguage() {
    i18n.setLanguage(i18n.resolveLanguage(config.get('language'), app.getLocale()));
}

// The real Chromium user agent, without the "Electron/x" and app tokens that make WhatsApp Web
// treat the app as an unsupported browser. It always matches the Chromium version that is running.
function buildUserAgent() {
    var tokens = new RegExp('\\s(?:Electron|' + app.getName().replace(/[^\w]/g, '') + ')\\/\\S+', 'gi');
    return session.defaultSession.getUserAgent().replace(tokens, '');
}

// ---------------------------------------------------------------------------------------------
// Main window
// ---------------------------------------------------------------------------------------------
function isPositionVisible(x, y, width) {
    if (typeof x !== 'number' || typeof y !== 'number') {
        return false;
    }
    return screen.getAllDisplays().some(function (display) {
        var area = display.workArea;
        return x < area.x + area.width && x + (width || 100) > area.x &&
            y < area.y + area.height && y + 50 > area.y;
    });
}

function showMain() {
    if (!alive(mainWindow)) {
        return;
    }
    if (mainWindow.isMinimized()) {
        mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
    syncLockWindow();
}

function toggleMain() {
    if (alive(mainWindow) && mainWindow.isVisible() && mainWindow.isFocused()) {
        mainWindow.hide();
    } else {
        showMain();
    }
}

async function applyPageStyles(reset) {
    if (!alive(mainWindow)) {
        return;
    }
    var wc = mainWindow.webContents;
    // CSS inserted before a navigation is gone afterwards, so after a load the old keys are void
    if (!reset) {
        for (var i = 0; i < pageStyleKeys.length; i++) {
            try { await wc.removeInsertedCSS(pageStyleKeys[i]); } catch (e) {}
        }
    }
    pageStyleKeys = [];
    try {
        if (config.get('blurMessages')) {
            pageStyleKeys.push(await wc.insertCSS(BLUR_MESSAGES_CSS));
        }
        if (config.get('blurList')) {
            pageStyleKeys.push(await wc.insertCSS(BLUR_LIST_CSS));
        }
    } catch (e) {
        log.warn('Não foi possível aplicar o desfoque: ' + e);
    }
}

async function onDomReady() {
    var wc = mainWindow.webContents;
    wc.setZoomFactor(ZOOM[config.get('fontSize')] || 1);
    await applyPageStyles(true);
    var cssFile = config.get('customCss');
    if (cssFile) {
        try {
            var stat = fs.statSync(cssFile);
            if (stat.size <= 512 * 1024) {
                await wc.insertCSS(fs.readFileSync(cssFile, 'utf-8'));
                log.info('CSS personalizado carregado: ' + cssFile);
            }
        } catch (e) {
            log.error('Erro no CSS personalizado: ' + e);
        }
    }
}

function updateBadge(title) {
    var match = title.match(/\((\d+)\)/);
    var count = match ? parseInt(match[1], 10) : 0;
    if (count > 0) {
        if (!mainWindow.isFocused() && !config.get('quietMode') && !locked) {
            mainWindow.flashFrame(true);
        }
        var name = count > 9 ? 0 : count;
        mainWindow.setOverlayIcon(
            nativeImage.createFromPath(path.join(ASSETS_DIR, 'badges', 'badge-' + name + '.png')), 'mensagens novas');
    } else {
        mainWindow.setOverlayIcon(null, '');
    }
    var unread = count > 0;
    if (unread !== hasUnread) {
        hasUnread = unread;
        updateTrayIcon();
    }
}

function createMainWindow() {
    var posX = config.get('posX');
    var posY = config.get('posY');
    if (!isPositionVisible(posX, posY, config.get('width'))) {
        posX = undefined;
        posY = undefined;
    }

    mainWindow = new BrowserWindow({
        x: posX,
        y: posY,
        width: config.get('width'),
        height: config.get('height'),
        minWidth: 600,
        minHeight: 500,
        title: 'Prosa',
        show: false,
        backgroundColor: nativeTheme.shouldUseDarkColors ? '#111b21' : '#ffffff',
        autoHideMenuBar: config.get('autoHideMenuBar'),
        icon: path.join(ASSETS_DIR, 'icon.png'),
        webPreferences: {
            contextIsolation: true,
            sandbox: true,
            nodeIntegration: false,
            spellcheck: true
        }
    });
    config.setWindowProvider(function () { return mainWindow; });

    var wc = mainWindow.webContents;
    wc.on('context-menu', onContextMenu);
    wc.on('dom-ready', onDomReady);
    wc.on('did-finish-load', function () {
        if (pendingGroupLink) {
            // Only once: a later reload must not open the same invite again
            openGroupLink(pendingGroupLink);
            pendingGroupLink = null;
        }
    });
    // Offline at startup (or a dropped connection): try again instead of staying on the error page
    wc.on('did-fail-load', function (event, code, description, url, isMainFrame) {
        if (isMainFrame && code !== -3) {
            log.warn('Falha ao carregar o WhatsApp Web (' + description + '), tentando de novo em 5 s');
            setTimeout(function () {
                if (alive(mainWindow)) {
                    mainWindow.webContents.loadURL(WA_URL, { userAgent: userAgent });
                }
            }, 5000);
        }
    });
    wc.on('render-process-gone', function (event, details) {
        log.error('Processo da página encerrou: ' + details.reason);
        if (details.reason !== 'clean-exit' && alive(mainWindow)) {
            mainWindow.webContents.reload();
        }
    });

    mainWindow.on('page-title-updated', function (event, title) { updateBadge(title); });

    // Shown when there is something to paint instead of an empty white frame; the timer is a safety net
    var showInitial = function () {
        if (!alive(mainWindow) || mainWindow.isVisible()) {
            return;
        }
        if (config.get('startMinimized') && tray) {
            return;
        }
        if (config.get('maximized')) {
            mainWindow.maximize();
        }
        showMain();
    };
    mainWindow.once('ready-to-show', showInitial);
    setTimeout(showInitial, 5000);

    var saveBounds = function () {
        // A minimized window reports bogus bounds on Windows
        if (mainWindow.isMinimized() || mainWindow.isFullScreen()) {
            return;
        }
        var bounds = mainWindow.getNormalBounds();
        config.set('posX', bounds.x);
        config.set('posY', bounds.y);
        config.set('width', bounds.width);
        config.set('height', bounds.height);
        config.saveSoon();
    };
    mainWindow.on('move', saveBounds);
    mainWindow.on('resize', saveBounds);

    mainWindow.on('close', function (event) {
        if (!quitting && tray) {
            event.preventDefault();
            mainWindow.hide();
        } else if (!quitting) {
            app.quit();
        }
    });
    mainWindow.on('show', function () { syncLockWindow(); updateTrayMenu(); });
    mainWindow.on('restore', syncLockWindow);
    mainWindow.on('hide', function () {
        syncLockWindow();
        updateTrayMenu();
        if (config.get('lockOnHide')) { lockApp(); }
    });
    mainWindow.on('minimize', function () {
        syncLockWindow();
        if (config.get('lockOnHide')) { lockApp(); }
    });
    mainWindow.on('closed', function () { mainWindow = null; });

    wc.setUserAgent(userAgent);
    mainWindow.loadURL(WA_URL, { userAgent: userAgent });
}

function openGroupLink(link) {
    if (!link || !alive(mainWindow)) {
        return;
    }
    log.info('Abrindo link de grupo');
    // The link is JSON-encoded and has already been matched against a strict pattern
    mainWindow.webContents.executeJavaScript(
        '(function (link) {' +
            'var el = document.createElement("a");' +
            'el.href = link; el.rel = "noopener noreferrer"; el.style.display = "none";' +
            'document.body.appendChild(el);' +
            'setTimeout(function () { el.click(); el.remove(); }, 500);' +
        '})(' + JSON.stringify(link) + ')'
    ).catch(function (e) { log.warn('Não foi possível abrir o link de grupo: ' + e); });
}

function onContextMenu(event, params) {
    var menu = new Menu();
    var wc = mainWindow.webContents;

    if (params.misspelledWord) {
        if (params.dictionarySuggestions.length > 0) {
            params.dictionarySuggestions.forEach(function (suggestion) {
                menu.append(new MenuItem({ label: suggestion, click: function () { wc.replaceMisspelling(suggestion); } }));
            });
        } else {
            menu.append(new MenuItem({ label: t('ctx.noSuggestions'), enabled: false }));
        }
        menu.append(new MenuItem({ type: 'separator' }));
        menu.append(new MenuItem({
            label: t('ctx.addToDictionary'),
            click: function () { wc.session.addWordToSpellCheckerDictionary(params.misspelledWord); }
        }));
        menu.append(new MenuItem({ type: 'separator' }));
    }
    if (params.isEditable) {
        menu.append(new MenuItem({ label: t('menu.cut'), role: 'cut', enabled: params.editFlags.canCut }));
        menu.append(new MenuItem({ label: t('menu.copy'), role: 'copy', enabled: params.editFlags.canCopy }));
        menu.append(new MenuItem({ label: t('menu.paste'), role: 'paste', enabled: params.editFlags.canPaste }));
        menu.append(new MenuItem({ label: t('menu.selectAll'), role: 'selectAll', enabled: params.editFlags.canSelectAll }));
    } else if (params.selectionText) {
        menu.append(new MenuItem({ label: t('menu.copy'), role: 'copy' }));
    }
    if (params.linkURL) {
        if (menu.items.length > 0) {
            menu.append(new MenuItem({ type: 'separator' }));
        }
        menu.append(new MenuItem({ label: t('ctx.copyLink'), click: function () { clipboard.writeText(params.linkURL); } }));
    }
    if (menu.items.length > 0) {
        menu.popup({ window: mainWindow });
    }
}

// ---------------------------------------------------------------------------------------------
// Session: user agent, permissions, proxy
// ---------------------------------------------------------------------------------------------
function setupSession() {
    var ses = session.defaultSession;
    userAgent = buildUserAgent();
    ses.setUserAgent(userAgent);
    log.info('User agent: ' + userAgent);

    // Notifications are denied while in quiet mode or while the app is locked. Everything else is only
    // granted to WhatsApp itself, never to another site that might get loaded.
    var allowed = function (permission, origin) {
        if (!isWhatsAppHost(origin)) {
            return false;
        }
        if (permission === 'notifications' && (config.get('quietMode') || locked)) {
            return false;
        }
        return true;
    };
    ses.setPermissionRequestHandler(function (contents, permission, callback, details) {
        callback(allowed(permission, details.requestingUrl || contents.getURL()));
    });
    ses.setPermissionCheckHandler(function (contents, permission, requestingOrigin) {
        return allowed(permission, requestingOrigin);
    });

    try {
        var languages = ses.availableSpellCheckerLanguages.filter(function (l) { return l === 'pt-BR' || l === 'en-US'; });
        if (languages.length > 0) {
            ses.setSpellCheckerLanguages(languages);
        }
    } catch (e) {
        log.warn('Corretor ortográfico indisponível: ' + e);
    }
}

function applyProxy() {
    var ses = session.defaultSession;
    var host = config.get('httpProxy');
    if (config.get('useProxy') && host) {
        var secure = config.get('httpsProxy') || host;
        log.info('Proxy configurado: http=' + host + ';https=' + secure);
        return ses.setProxy({ proxyRules: 'http=' + host + ';https=' + secure }).catch(function (e) {
            log.error('Não foi possível configurar o proxy: ' + e);
        });
    }
    return ses.setProxy({ mode: 'system' }).catch(function () {});
}

// ---------------------------------------------------------------------------------------------
// Tray
// ---------------------------------------------------------------------------------------------
function trayImage() {
    return nativeImage.createFromPath(path.join(ASSETS_DIR, hasUnread ? 'tray-unread.png' : 'tray.png'));
}

function updateTrayIcon() {
    if (tray) {
        tray.setImage(trayImage());
    }
}

function updateTrayMenu() {
    if (!tray) {
        return;
    }
    var visible = alive(mainWindow) && mainWindow.isVisible();
    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: visible ? t('tray.hide') : t('tray.show'),
            click: function () { if (visible) { mainWindow.hide(); } else { showMain(); } }
        },
        { label: t('tray.lock'), click: lockOrConfigure },
        { type: 'separator' },
        { label: t('tray.quit'), click: function () { app.quit(); } }
    ]));
}

function createTray() {
    if (tray) {
        return;
    }
    try {
        tray = new Tray(trayImage());
    } catch (e) {
        log.error('Não foi possível criar o ícone da bandeja: ' + e);
        tray = null;
        return;
    }
    tray.setToolTip('Prosa');
    tray.on('click', showMain);
    updateTrayMenu();
}

function destroyTray() {
    if (tray) {
        tray.destroy();
        tray = null;
    }
}

// ---------------------------------------------------------------------------------------------
// Lock
// ---------------------------------------------------------------------------------------------
function lockConfigured() {
    return config.get('lockEnabled') === true && !!config.get('lockHash');
}

function fitLockWindow() {
    if (alive(lockWindow) && alive(mainWindow)) {
        lockWindow.setBounds(mainWindow.getBounds());
    }
}

// The lock window only exists on screen while the main window does
function syncLockWindow() {
    if (!locked || !alive(lockWindow) || !alive(mainWindow)) {
        return;
    }
    if (mainWindow.isVisible() && !mainWindow.isMinimized()) {
        fitLockWindow();
        if (!lockWindow.isVisible()) {
            lockWindow.show();
        }
        lockWindow.focus();
    } else {
        lockWindow.hide();
    }
}

function lockApp() {
    if (locked || !lockConfigured() || !alive(mainWindow)) {
        return false;
    }
    locked = true;
    throttle.reset();
    [settingsWindow, aboutWindow].forEach(function (win) { if (alive(win)) { win.destroy(); } });

    // Taskbar thumbnails, screenshots and screen sharing show a black window while locked
    mainWindow.setContentProtection(true);

    lockWindow = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        frame: false,
        show: false,
        resizable: false,
        movable: false,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        skipTaskbar: true,
        backgroundColor: nativeTheme.shouldUseDarkColors ? '#111b21' : '#f3f6f5',
        webPreferences: {
            preload: path.join(UI_DIR, 'preload-ui.js'),
            contextIsolation: true,
            sandbox: true,
            nodeIntegration: false
        }
    });
    lockWindow.setMenu(null);
    lockWindow.on('close', function (event) {
        if (locked && !quitting) {
            event.preventDefault();
        }
    });
    lockWindow.on('blur', function () {
        // Focus always comes back to the prompt while locked
        if (locked && alive(lockWindow) && alive(mainWindow) && mainWindow.isVisible() && !mainWindow.isMinimized()) {
            lockWindow.focus();
        }
    });
    lockWindow.loadFile(path.join(UI_DIR, 'lock.html'));
    fitLockWindow();
    lockWindow.once('ready-to-show', syncLockWindow);
    updateTrayMenu();
    log.info('Prosa bloqueado');
    return true;
}

function unlockApp() {
    locked = false;
    throttle.reset();
    if (alive(lockWindow)) {
        lockWindow.destroy();
    }
    lockWindow = null;
    if (alive(mainWindow)) {
        mainWindow.setContentProtection(false);
        mainWindow.focus();
    }
    log.info('Prosa desbloqueado');
}

function lockOrConfigure() {
    if (!lockApp() && !locked) {
        showMain();
        openSettings();
    }
}

ipcMain.handle('lock:unlock', function (event, attempt) {
    if (!fromOurUi(event) || !locked) {
        return { ok: false, error: 'err.generic' };
    }
    var wait = throttle.waitSeconds();
    if (wait > 0) {
        return { ok: false, error: 'err.wait', vars: { s: wait } };
    }
    if (password.verify(attempt, config.get('lockHash'), config.get('lockSalt'))) {
        unlockApp();
        return { ok: true };
    }
    throttle.fail();
    var after = throttle.waitSeconds();
    return after > 0 ? { ok: false, error: 'err.wait', vars: { s: after } } : { ok: false, error: 'err.pwWrong' };
});

// Forgot the password: the only way back is to erase the local data, which also logs WhatsApp out
ipcMain.handle('lock:forgot', async function (event) {
    if (!fromOurUi(event) || !locked) {
        return { ok: false };
    }
    log.warn('Senha esquecida: apagando os dados locais');
    try {
        await session.defaultSession.clearStorageData();
        await session.defaultSession.clearCache();
    } catch (e) {
        log.error('Erro ao limpar os dados: ' + e);
    }
    config.set('lockEnabled', false);
    config.set('lockHash', '');
    config.set('lockSalt', '');
    config.write();
    quitting = true;
    app.relaunch();
    app.exit(0);
    return { ok: true };
});

function startIdleWatcher() {
    setInterval(function () {
        var minutes = config.get('lockAfterMinutes');
        if (!locked && minutes > 0 && lockConfigured() && powerMonitor.getSystemIdleTime() >= minutes * 60) {
            lockApp();
        }
    }, 15000);
    powerMonitor.on('lock-screen', function () {
        if (lockConfigured()) {
            lockApp();
        }
    });
}

// ---------------------------------------------------------------------------------------------
// Settings and About windows
// ---------------------------------------------------------------------------------------------
function openUiWindow(file, options) {
    var win = new BrowserWindow(Object.assign({
        show: false,
        center: true,
        minimizable: false,
        maximizable: false,
        autoHideMenuBar: true,
        title: 'Prosa',
        icon: path.join(ASSETS_DIR, 'icon.png'),
        backgroundColor: nativeTheme.shouldUseDarkColors ? '#111b21' : '#f3f6f5',
        webPreferences: {
            preload: path.join(UI_DIR, 'preload-ui.js'),
            contextIsolation: true,
            sandbox: true,
            nodeIntegration: false
        }
    }, options));
    win.setMenu(null);
    win.loadFile(path.join(UI_DIR, file));
    win.once('ready-to-show', function () { win.show(); });
    return win;
}

function openSettings() {
    if (locked) {
        return;
    }
    if (alive(settingsWindow)) {
        settingsWindow.show();
        settingsWindow.focus();
        return;
    }
    settingsWindow = openUiWindow('settings.html', { width: 580, height: 760, resizable: true });
    settingsWindow.on('closed', function () { settingsWindow = null; });
}

function openAbout() {
    if (locked) {
        return;
    }
    if (alive(aboutWindow)) {
        aboutWindow.show();
        aboutWindow.focus();
        return;
    }
    aboutWindow = openUiWindow('about.html', { width: 520, height: 400, resizable: false });
    aboutWindow.on('closed', function () { aboutWindow = null; });
}

var BOOLEAN_KEYS = ['blurMessages', 'blurList', 'quietMode', 'lockEnabled', 'lockOnHide', 'trayIcon',
    'startMinimized', 'autostart', 'autoHideMenuBar', 'disableGpu', 'globalShortcut', 'useProxy'];
var PROXY_RE = /^[A-Za-z0-9._\-:\[\]@]{0,200}$/;

ipcMain.on('ui:strings', function (event) {
    event.returnValue = fromOurUi(event) ? i18n.allStrings() : {};
});

ipcMain.handle('ui:info', function (event) {
    return fromOurUi(event) ? { version: app.getVersion() } : {};
});

ipcMain.on('ui:close', function (event) {
    if (!fromOurUi(event)) {
        return;
    }
    var win = BrowserWindow.fromWebContents(event.sender);
    if (alive(win) && win !== lockWindow) {
        win.close();
    }
});

ipcMain.handle('settings:get', function (event) {
    if (!fromOurUi(event) || locked) {
        return {};
    }
    var current = config.all();
    current.hasPassword = !!current.lockHash;
    delete current.lockHash;
    delete current.lockSalt;
    return current;
});

ipcMain.handle('settings:pick-css', async function (event) {
    if (!fromOurUi(event) || locked) {
        return null;
    }
    var result = await dialog.showOpenDialog(settingsWindow, {
        properties: ['openFile'],
        filters: [{ name: 'CSS', extensions: ['css'] }]
    });
    return result.canceled || result.filePaths.length === 0 ? null : result.filePaths[0];
});

ipcMain.handle('settings:save', function (event, payload) {
    if (!fromOurUi(event) || locked || !payload || typeof payload.values !== 'object') {
        return { ok: false, error: 'err.generic' };
    }
    var v = payload.values;
    var lock = payload.lock || {};

    // Validate everything that comes from the page
    var clean = {};
    for (var i = 0; i < BOOLEAN_KEYS.length; i++) {
        clean[BOOLEAN_KEYS[i]] = v[BOOLEAN_KEYS[i]] === true;
    }
    clean.fontSize = ZOOM[v.fontSize] ? v.fontSize : 'normal';
    clean.language = (v.language === 'pt-BR' || v.language === 'en') ? v.language : 'auto';
    clean.lockAfterMinutes = [0, 1, 5, 15, 30, 60].indexOf(v.lockAfterMinutes) >= 0 ? v.lockAfterMinutes : 0;
    clean.customCss = (typeof v.customCss === 'string' && v.customCss.length < 600) ? v.customCss : '';
    if (typeof v.httpProxy !== 'string' || typeof v.httpsProxy !== 'string' ||
        !PROXY_RE.test(v.httpProxy) || !PROXY_RE.test(v.httpsProxy)) {
        return { ok: false, error: 'err.generic' };
    }
    clean.httpProxy = v.httpProxy;
    clean.httpsProxy = v.httpsProxy;

    // Lock rules: a password is needed to turn it on, and the current one to change or remove it
    var hadPassword = !!config.get('lockHash');
    var newHash = null;
    var wait = throttle.waitSeconds();
    var checkCurrent = function () {
        if (wait > 0) {
            return { ok: false, error: 'err.wait', vars: { s: wait } };
        }
        if (!lock.current) {
            return { ok: false, error: 'err.pwCurrentRequired' };
        }
        if (!password.verify(lock.current, config.get('lockHash'), config.get('lockSalt'))) {
            throttle.fail();
            return { ok: false, error: 'err.pwWrong' };
        }
        throttle.reset();
        return null;
    };

    var failure = null;
    if (clean.lockEnabled) {
        if (lock.newPassword) {
            if (String(lock.newPassword).length < 4) {
                return { ok: false, error: 'err.pwShort' };
            }
            if (lock.newPassword !== lock.newPassword2) {
                return { ok: false, error: 'err.pwMismatch' };
            }
            if (hadPassword) {
                failure = checkCurrent();
            }
            if (failure) { return failure; }
            newHash = password.hash(lock.newPassword);
        } else if (!hadPassword) {
            return { ok: false, error: 'err.pwNewRequired' };
        }
    } else if (hadPassword) {
        failure = checkCurrent();
        if (failure) { return failure; }
    }

    var reloadNeeded = clean.customCss !== config.get('customCss');
    Object.keys(clean).forEach(function (key) { config.set(key, clean[key]); });
    if (newHash) {
        config.set('lockHash', newHash.hash);
        config.set('lockSalt', newHash.salt);
    }
    if (!clean.lockEnabled) {
        config.set('lockHash', '');
        config.set('lockSalt', '');
    }
    config.write();
    applySettings(reloadNeeded);
    return { ok: true };
});

// Everything that can change while the app is running is applied right away
function applySettings(reloadNeeded) {
    applyLanguage();
    buildMenu();
    if (config.get('trayIcon')) { createTray(); } else { destroyTray(); }
    updateTrayMenu();
    if (alive(mainWindow)) {
        mainWindow.setAutoHideMenuBar(config.get('autoHideMenuBar'));
        mainWindow.setMenuBarVisibility(!config.get('autoHideMenuBar'));
        mainWindow.webContents.setZoomFactor(ZOOM[config.get('fontSize')] || 1);
        if (reloadNeeded) {
            mainWindow.webContents.reload();
        } else {
            applyPageStyles(false);
        }
    }
    applyProxy();
    applyAutostart();
    registerGlobalShortcut();
}

function applyAutostart() {
    // In development this would register the bare Electron executable as a startup program
    if (app.isPackaged) {
        app.setLoginItemSettings({ openAtLogin: config.get('autostart') === true });
    }
}

function registerGlobalShortcut() {
    globalShortcut.unregisterAll();
    if (config.get('globalShortcut')) {
        var ok = globalShortcut.register('CommandOrControl+Alt+W', toggleMain);
        if (!ok) {
            log.warn('Não foi possível registrar o atalho global');
        }
    }
}

// ---------------------------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------------------------
function changeAudioRate(delta) {
    if (!alive(mainWindow) || locked) {
        return;
    }
    // Runs inside the page, the only place where the <audio> elements WhatsApp Web uses can be reached.
    // The rate is kept within what the browser accepts and also applied to voice messages played later.
    mainWindow.webContents.executeJavaScript(
        '(function () {' +
            'var rate = Math.round(((window.audioRate || 1) + (' + delta + ')) * 10) / 10;' +
            'window.audioRate = Math.min(4, Math.max(0.4, rate));' +
            'if (!window.__audioRateHook) {' +
                'window.__audioRateHook = true;' +
                'document.addEventListener("play", function (e) {' +
                    'if (e.target && e.target.tagName == "AUDIO") { e.target.playbackRate = window.audioRate || 1; }' +
                '}, true);' +
            '}' +
            'Array.prototype.forEach.call(document.querySelectorAll("audio"), function (a) { a.playbackRate = window.audioRate; });' +
        '})()'
    ).catch(function () {});
}

function buildMenu() {
    var template = [
        {
            label: t('menu.file'),
            submenu: [
                { label: t('menu.settings'), accelerator: 'CmdOrCtrl+,', click: openSettings },
                { label: t('menu.checkUpdates'), click: function () { checkForUpdates(true); } },
                { label: t('menu.about'), click: openAbout },
                { type: 'separator' },
                { label: t('menu.quit'), accelerator: 'CmdOrCtrl+Q', click: function () { app.quit(); } }
            ]
        },
        {
            label: t('menu.edit'),
            submenu: [
                { label: t('menu.undo'), role: 'undo' },
                { label: t('menu.redo'), role: 'redo' },
                { type: 'separator' },
                { label: t('menu.cut'), role: 'cut' },
                { label: t('menu.copy'), role: 'copy' },
                { label: t('menu.paste'), role: 'paste' },
                { label: t('menu.selectAll'), role: 'selectAll' }
            ]
        },
        {
            label: t('menu.view'),
            submenu: [
                {
                    label: t('menu.reload'),
                    accelerator: 'CmdOrCtrl+R',
                    click: function () { if (alive(mainWindow) && !locked) { mainWindow.webContents.reload(); } }
                },
                { label: t('menu.fullscreen'), role: 'togglefullscreen' },
                { type: 'separator' },
                {
                    label: t('menu.blur'),
                    type: 'checkbox',
                    accelerator: 'CmdOrCtrl+Alt+B',
                    checked: config.get('blurMessages') === true,
                    click: function (item) {
                        config.set('blurMessages', item.checked);
                        config.write();
                        applyPageStyles(false);
                    }
                },
                {
                    label: t('menu.quiet'),
                    type: 'checkbox',
                    accelerator: 'CmdOrCtrl+Alt+Q',
                    checked: config.get('quietMode') === true,
                    click: function (item) {
                        config.set('quietMode', item.checked);
                        config.write();
                    }
                },
                { type: 'separator' },
                { label: t('menu.lockNow'), accelerator: 'CmdOrCtrl+L', click: lockOrConfigure },
                { type: 'separator' },
                { label: t('menu.devtools'), accelerator: 'CmdOrCtrl+Shift+I', role: 'toggleDevTools' }
            ]
        },
        {
            label: t('menu.window'),
            submenu: [
                { label: t('menu.minimize'), role: 'minimize' },
                { label: t('menu.close'), role: 'close' }
            ]
        },
        {
            label: t('menu.audio'),
            submenu: [
                { label: t('menu.audioUp'), accelerator: 'CmdOrCtrl+=', click: function () { changeAudioRate(0.2); } },
                { label: t('menu.audioDown'), accelerator: 'CmdOrCtrl+-', click: function () { changeAudioRate(-0.2); } }
            ]
        }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ---------------------------------------------------------------------------------------------
// Updates
// ---------------------------------------------------------------------------------------------
var updater = null;
var manualUpdateCheck = false;

function setupUpdater() {
    // Only an installed build has update information, and the update server may not exist yet
    if (!app.isPackaged) {
        return;
    }
    try {
        updater = require('electron-updater').autoUpdater;
        updater.logger = log;
        updater.autoDownload = true;
        updater.autoInstallOnAppQuit = true;
        updater.on('update-not-available', function () {
            if (manualUpdateCheck) {
                manualUpdateCheck = false;
                dialog.showMessageBox({ type: 'info', message: t('update.none'), buttons: ['OK'] });
            }
        });
        updater.on('error', function (e) {
            log.warn('Erro na atualização: ' + e);
            if (manualUpdateCheck) {
                manualUpdateCheck = false;
                dialog.showMessageBox({ type: 'warning', message: t('update.error'), buttons: ['OK'] });
            }
        });
        updater.on('update-downloaded', function () {
            manualUpdateCheck = false;
            dialog.showMessageBox({
                type: 'info',
                message: t('update.downloaded'),
                buttons: [t('update.restart'), t('update.later')],
                defaultId: 0,
                cancelId: 1
            }).then(function (result) {
                if (result.response === 0) {
                    quitting = true;
                    updater.quitAndInstall();
                }
            });
        });
        // Checked a little after startup so it never competes with loading the chats
        setTimeout(function () { checkForUpdates(false); }, 20000);
        setInterval(function () { checkForUpdates(false); }, 6 * 60 * 60 * 1000);
    } catch (e) {
        log.warn('Atualização automática indisponível: ' + e);
    }
}

function checkForUpdates(manual) {
    if (!updater) {
        if (manual) {
            dialog.showMessageBox({ type: 'info', message: t('update.none'), buttons: ['OK'] });
        }
        return;
    }
    manualUpdateCheck = manual;
    updater.checkForUpdates().catch(function (e) { log.warn('Erro ao verificar atualizações: ' + e); });
}

// ---------------------------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------------------------
function start() {
    config.load();
    // Must be decided before the app is ready
    if (config.get('disableGpu')) {
        app.disableHardwareAcceleration();
    } else {
        // Let the graphics card do the painting: GPU rasterization and zero-copy uploads keep the blur and scrolling
        // off the CPU, and ignoring the driver blocklist keeps acceleration on for older drivers that Chromium would
        // otherwise switch to software. "Disable hardware acceleration" in the settings turns all of this off.
        app.commandLine.appendSwitch('ignore-gpu-blocklist');
        app.commandLine.appendSwitch('enable-gpu-rasterization');
        app.commandLine.appendSwitch('enable-zero-copy');
    }
    app.setAppUserModelId('br.com.nicopel.prosa');
    pendingGroupLink = extractGroupLink(process.argv.slice(1));

    app.on('second-instance', function (event, argv) {
        showMain();
        openGroupLink(extractGroupLink(argv));
    });

    // Windows opened by the pages never get Node and can only navigate within WhatsApp
    app.on('web-contents-created', function (event, contents) {
        contents.on('will-attach-webview', function (e) { e.preventDefault(); });
        contents.setWindowOpenHandler(function (details) {
            openExternalSafe(details.url);
            return { action: 'deny' };
        });
        contents.on('will-navigate', function (e, url) {
            var isMain = alive(mainWindow) && contents === mainWindow.webContents;
            if (!(isMain && isWhatsAppHost(url))) {
                e.preventDefault();
                if (isMain) {
                    openExternalSafe(url);
                }
            }
        });
    });

    app.on('before-quit', function () {
        quitting = true;
        config.flush();
    });
    app.on('will-quit', function () { globalShortcut.unregisterAll(); });
    app.on('window-all-closed', function () { app.quit(); });

    app.whenReady().then(function () {
        applyLanguage();
        setupSession();
        applyProxy();
        buildMenu();
        if (config.get('trayIcon')) {
            createTray();
        }
        createMainWindow();
        if (lockConfigured()) {
            lockApp();
        }
        registerGlobalShortcut();
        applyAutostart();
        startIdleWatcher();
        setupUpdater();
        // Leaves a trace in the log of whether the graphics card is really in use
        setTimeout(function () {
            var s = app.getGPUFeatureStatus();
            log.info('GPU: composição=' + s.gpu_compositing + ', rasterização=' + s.rasterization + ', canvas=' + s['2d_canvas']);
        }, 15000);
    });
}

log.initialize();
if (app.requestSingleInstanceLock()) {
    start();
} else {
    app.quit();
}
