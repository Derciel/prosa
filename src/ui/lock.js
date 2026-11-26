"use strict";

(function () {
    var $ = window.prosaUi.$;
    var message = window.prosaUi.message;

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
        if (window.confirm(window.prosa.strings['lock.forgotConfirm'])) {
            window.prosa.forgotPassword();
        }
    });

    $('password').focus();
})();
