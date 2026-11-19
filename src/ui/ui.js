"use strict";

(function () {
    var strings = window.prosa.strings;
    var $ = function (id) { return document.getElementById(id); };

    function applyStrings() {
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            el.textContent = strings[el.getAttribute('data-i18n')] || el.getAttribute('data-i18n');
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
            el.placeholder = strings[el.getAttribute('data-i18n-placeholder')] || '';
        });
        var title = strings[document.body.dataset.page + '.title'];
        if (title) {
            document.title = title;
        }
    }

    function message(key, vars) {
        var text = strings[key] || key;
        Object.keys(vars || {}).forEach(function (name) {
            text = text.split('{' + name + '}').join(String(vars[name]));
        });
        return text;
    }

    // ---- Settings ----------------------------------------------------------------------------
    var checkboxes = ['blurMessages', 'blurList', 'quietMode', 'lockEnabled', 'lockOnHide', 'trayIcon',
        'startMinimized', 'autostart', 'autoHideMenuBar', 'disableGpu', 'globalShortcut', 'useProxy'];
    var selects = ['fontSize', 'language', 'lockAfterMinutes'];
    var texts = ['httpProxy', 'httpsProxy'];
    var customCss = '';
    var hasPassword = false;

    function refreshLockFields() {
        var enabled = $('lockEnabled').checked;
        $('lockFields').classList.toggle('hidden', !enabled);
        // The current password is only asked when a password already exists
        $('lockCurrentWrap').classList.toggle('hidden', !hasPassword);
    }

    function refreshProxyFields() {
        var enabled = $('useProxy').checked;
        $('httpProxy').disabled = !enabled;
        $('httpsProxy').disabled = !enabled;
    }

    function refreshCssName() {
        $('cssName').textContent = customCss ? customCss : strings['settings.none'];
    }

    async function initSettings() {
        var current = await window.prosa.getSettings();
        hasPassword = current.hasPassword;
        checkboxes.forEach(function (id) { $(id).checked = current[id] === true; });
        selects.forEach(function (id) { $(id).value = String(current[id]); });
        texts.forEach(function (id) { $(id).value = current[id] || ''; });
        customCss = current.customCss || '';
        refreshCssName();
        refreshLockFields();
        refreshProxyFields();

        $('lockEnabled').addEventListener('change', refreshLockFields);
        $('useProxy').addEventListener('change', refreshProxyFields);
        $('cssChoose').addEventListener('click', async function () {
            var file = await window.prosa.pickCss();
            if (file) {
                customCss = file;
                refreshCssName();
            }
        });
        $('cssClear').addEventListener('click', function () {
            customCss = '';
            refreshCssName();
        });
        $('cancel').addEventListener('click', function () { window.prosa.close(); });
        $('save').addEventListener('click', saveSettings);
    }

    async function saveSettings() {
        var values = {};
        checkboxes.forEach(function (id) { values[id] = $(id).checked; });
        selects.forEach(function (id) { values[id] = $(id).value; });
        texts.forEach(function (id) { values[id] = $(id).value.trim(); });
        values.lockAfterMinutes = parseInt(values.lockAfterMinutes, 10) || 0;
        values.customCss = customCss;

        var result = await window.prosa.saveSettings({
            values: values,
            lock: {
                current: $('lockCurrent').value,
                newPassword: $('lockNew').value,
                newPassword2: $('lockNew2').value
            }
        });
        if (result && result.ok) {
            window.prosa.close();
            return;
        }
        $('error').textContent = message((result && result.error) || 'err.generic', result && result.vars);
    }

    // ---- Lock screen -------------------------------------------------------------------------
    function initLock() {
        $('form').addEventListener('submit', async function (event) {
            event.preventDefault();
            var result = await window.prosa.unlock($('password').value);
            if (!result.ok) {
                $('error').textContent = message(result.error, result.vars);
                $('password').value = '';
                $('password').focus();
            }
        });
        $('forgot').addEventListener('click', function () {
            if (window.confirm(strings['lock.forgotConfirm'])) {
                window.prosa.forgotPassword();
            }
        });
        $('password').focus();
    }

    // ---- About -------------------------------------------------------------------------------
    async function initAbout() {
        var info = await window.prosa.info();
        $('version').textContent = info.version;
    }

    applyStrings();
    var page = document.body.dataset.page;
    if (page === 'settings') { initSettings(); }
    if (page === 'lock') { initLock(); }
    if (page === 'about') { initAbout(); }
})();
