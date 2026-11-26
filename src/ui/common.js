"use strict";

// Helpers shared by the local pages (settings, lock)
(function () {
    var strings = window.prosa.strings;

    function $(id) {
        return document.getElementById(id);
    }

    // Fills {name} placeholders
    function message(key, vars) {
        var text = strings[key] || key;
        Object.keys(vars || {}).forEach(function (name) {
            text = text.split('{' + name + '}').join(String(vars[name]));
        });
        return text;
    }

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

    window.prosaUi = { $: $, message: message, applyStrings: applyStrings };
    applyStrings();
})();
