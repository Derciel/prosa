"use strict";

(function () {
    var $ = window.prosaUi.$;
    var message = window.prosaUi.message;

    var checkboxes = ['blurMessages', 'blurList', 'blurNames', 'blurPhotos', 'blurComposer', 'blurOnBlur', 'bonusButton',
        'quietMode', 'lockEnabled', 'lockOnHide', 'trayIcon', 'startMinimized', 'autostart', 'autoHideMenuBar',
        'disableGpu', 'globalShortcut', 'useProxy'];
    var selects = ['fontSize', 'language', 'lockAfterMinutes'];
    var texts = ['httpProxy', 'httpsProxy'];
    var customCss = '';
    var hasPassword = false;
    var messageTimer = null;

    // ---- Navigation --------------------------------------------------------------------------
    function showTab(name) {
        var found = false;
        document.querySelectorAll('.page').forEach(function (page) {
            var match = page.dataset.page === name;
            page.classList.toggle('hidden', !match);
            found = found || match;
        });
        if (!found) {
            return showTab('general');
        }
        document.querySelectorAll('.nav').forEach(function (nav) {
            nav.classList.toggle('active', nav.dataset.tab === name);
        });
        // Nothing to save on the updates page
        $('foot').classList.toggle('no-save', name === 'about');
        $('message').textContent = '';
        document.querySelector('.pages').scrollTop = 0;
    }

    // ---- Footer message ----------------------------------------------------------------------
    function say(text, isError) {
        var el = $('message');
        el.textContent = text;
        el.classList.toggle('error', !!isError);
        clearTimeout(messageTimer);
        if (text && !isError) {
            messageTimer = setTimeout(function () { el.textContent = ''; }, 3000);
        }
    }

    // ---- Settings form -----------------------------------------------------------------------
    function refreshLockFields() {
        $('lockFields').classList.toggle('hidden', !$('lockEnabled').checked);
        // The current password is only asked when a password already exists
        $('lockCurrentWrap').classList.toggle('hidden', !hasPassword);
    }

    function refreshProxyFields() {
        var enabled = $('useProxy').checked;
        $('httpProxy').disabled = !enabled;
        $('httpsProxy').disabled = !enabled;
    }

    function refreshCssName() {
        $('cssName').textContent = customCss || window.prosa.strings['ap.none'];
        $('cssName').title = customCss;
    }

    function fillForm(current) {
        hasPassword = current.hasPassword;
        checkboxes.forEach(function (id) { $(id).checked = current[id] === true; });
        selects.forEach(function (id) { $(id).value = String(current[id]); });
        texts.forEach(function (id) { $(id).value = current[id] || ''; });
        customCss = current.customCss || '';
        refreshCssName();
        refreshLockFields();
        refreshProxyFields();
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
            ['lockCurrent', 'lockNew', 'lockNew2'].forEach(function (id) { $(id).value = ''; });
            fillForm(await window.prosa.getSettings());
            say(window.prosa.strings['settings.saved'], false);
            return;
        }
        // The lock fields live on the privacy page: take the person there when the problem is theirs
        if (result && /^err\.pw/.test(result.error)) {
            showTab('privacy');
        }
        say(message((result && result.error) || 'err.generic', result && result.vars), true);
    }

    // ---- Updates -----------------------------------------------------------------------------
    function renderUpdate(s) {
        var card = $('updateCard');
        card.dataset.state = s.status;
        $('currentVersion').textContent = s.version;

        var text = '';
        if (s.status === 'idle') {
            text = message('up.idle');
        } else if (s.status === 'checking') {
            text = message('up.checking');
        } else if (s.status === 'none') {
            var when = s.checkedAt ? new Date(s.checkedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
            text = message('up.none') + (when ? ' ' + message('up.checkedAt', { t: when }) : '');
        } else if (s.status === 'downloading') {
            text = s.percent > 0 ? message('up.downloading', { v: s.available, p: s.percent }) : message('up.available', { v: s.available });
        } else if (s.status === 'downloaded') {
            text = message('up.downloaded', { v: s.available });
        } else if (s.status === 'error') {
            text = message(s.error === 'network' ? 'up.errorNet' : 'up.error');
        } else if (s.status === 'dev') {
            text = message('up.dev');
        }
        $('updateStatus').textContent = text;

        var busy = s.status === 'checking' || s.status === 'downloading';
        $('updateCheck').disabled = busy || s.status === 'dev';
        $('updateCheck').classList.toggle('hidden', s.status === 'downloaded');
        $('updateInstall').classList.toggle('hidden', s.status !== 'downloaded');
        $('updateProgress').classList.toggle('hidden', s.status !== 'downloading' && s.status !== 'downloaded');
        $('updateBar').style.width = (s.status === 'downloaded' ? 100 : s.percent) + '%';
        // A dot on the menu entry when a new version is on its way or ready
        $('updateDot').classList.toggle('hidden', s.status !== 'downloading' && s.status !== 'downloaded');
    }

    // ---- Start -------------------------------------------------------------------------------
    async function init() {
        document.querySelectorAll('.nav').forEach(function (nav) {
            nav.addEventListener('click', function () { showTab(nav.dataset.tab); });
        });
        window.prosa.onGoto(showTab);

        var info = await window.prosa.info();
        $('brandVersion').textContent = 'v' + info.version;

        fillForm(await window.prosa.getSettings());
        showTab(location.hash.slice(1) || 'general');

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
        $('save').addEventListener('click', saveSettings);
        $('close').addEventListener('click', function () { window.prosa.close(); });
        $('openSource').addEventListener('click', function () { window.prosa.openSource(); });

        $('updateCheck').addEventListener('click', function () { window.prosa.checkUpdates(); });
        $('updateInstall').addEventListener('click', function () { window.prosa.installUpdate(); });
        window.prosa.onUpdateState(renderUpdate);
        renderUpdate(await window.prosa.getUpdateState());
    }

    init();
})();
