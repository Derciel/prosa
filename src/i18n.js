"use strict";

// Interface strings. Brazilian Portuguese is the main language; English is the fallback.
const dictionaries = {
    'pt-BR': {
        'menu.file': 'Arquivo',
        'menu.settings': 'Configurações',
        'menu.about': 'Sobre o Prosa',
        'menu.checkUpdates': 'Verificar atualizações',
        'menu.quit': 'Sair',
        'menu.edit': 'Editar',
        'menu.undo': 'Desfazer',
        'menu.redo': 'Refazer',
        'menu.cut': 'Recortar',
        'menu.copy': 'Copiar',
        'menu.paste': 'Colar',
        'menu.selectAll': 'Selecionar tudo',
        'menu.view': 'Exibir',
        'menu.reload': 'Recarregar',
        'menu.fullscreen': 'Tela cheia',
        'menu.blur': 'Desfocar mensagens (passe o mouse para ver)',
        'menu.quiet': 'Modo silencioso',
        'menu.lockNow': 'Bloquear agora',
        'menu.devtools': 'Ferramentas do desenvolvedor',
        'menu.window': 'Janela',
        'menu.minimize': 'Minimizar',
        'menu.close': 'Fechar',
        'menu.audio': 'Áudio',
        'menu.audioUp': 'Aumentar a velocidade do áudio em 20%',
        'menu.audioDown': 'Diminuir a velocidade do áudio em 20%',

        'tray.show': 'Mostrar',
        'tray.hide': 'Ocultar',
        'tray.lock': 'Bloquear',
        'tray.quit': 'Sair',

        'ctx.noSuggestions': 'Sem sugestões',
        'ctx.addToDictionary': 'Adicionar ao dicionário',
        'ctx.copyLink': 'Copiar link',

        'settings.title': 'Configurações',
        'settings.appearance': 'Aparência',
        'settings.blurMessages': 'Desfocar as mensagens (passe o mouse para ver)',
        'settings.blurList': 'Desfocar a lista de conversas (passe o mouse para ver)',
        'settings.fontSize': 'Tamanho do texto',
        'settings.fontSmall': 'Pequeno',
        'settings.fontNormal': 'Normal',
        'settings.fontLarge': 'Grande',
        'settings.fontXLarge': 'Muito grande',
        'settings.customCss': 'Arquivo de CSS personalizado',
        'settings.choose': 'Escolher…',
        'settings.remove': 'Remover',
        'settings.none': 'Nenhum',
        'settings.privacy': 'Privacidade e bloqueio',
        'settings.lockEnabled': 'Bloquear o Prosa com senha',
        'settings.lockCurrent': 'Senha atual',
        'settings.lockNew': 'Nova senha (mínimo 4 caracteres)',
        'settings.lockNew2': 'Repita a nova senha',
        'settings.lockAfter': 'Bloquear após inatividade',
        'settings.lockNever': 'Nunca',
        'settings.lockMin1': '1 minuto',
        'settings.lockMin5': '5 minutos',
        'settings.lockMin15': '15 minutos',
        'settings.lockMin30': '30 minutos',
        'settings.lockMin60': '1 hora',
        'settings.lockOnHide': 'Bloquear ao minimizar ou ocultar na bandeja',
        'settings.lockHint': 'Com o bloqueio ativo, o Prosa abre bloqueado, as notificações ficam desligadas enquanto ele estiver bloqueado e Ctrl+L bloqueia na hora.',
        'settings.notifications': 'Notificações',
        'settings.quietMode': 'Modo silencioso (sem notificações)',
        'settings.system': 'Sistema',
        'settings.trayIcon': 'Mostrar ícone na bandeja do sistema',
        'settings.startMinimized': 'Iniciar minimizado na bandeja',
        'settings.autostart': 'Iniciar com o Windows',
        'settings.autoHideMenuBar': 'Ocultar a barra de menus (Alt mostra)',
        'settings.disableGpu': 'Desativar aceleração de hardware (reinicie para aplicar)',
        'settings.globalShortcut': 'Atalho global Ctrl+Alt+W para mostrar/ocultar (reinicie para aplicar)',
        'settings.language': 'Idioma',
        'settings.langAuto': 'Automático',
        'settings.network': 'Rede',
        'settings.useProxy': 'Usar proxy (reinicie para aplicar)',
        'settings.httpProxy': 'Proxy HTTP',
        'settings.httpsProxy': 'Proxy HTTPS (vazio = igual ao HTTP)',
        'settings.save': 'Salvar',
        'settings.cancel': 'Cancelar',

        'err.pwShort': 'A senha precisa ter pelo menos 4 caracteres.',
        'err.pwMismatch': 'As senhas não conferem.',
        'err.pwWrong': 'Senha incorreta.',
        'err.pwCurrentRequired': 'Informe a senha atual para alterar o bloqueio.',
        'err.pwNewRequired': 'Defina uma senha para ativar o bloqueio.',
        'err.wait': 'Muitas tentativas. Aguarde {s} segundos.',
        'err.generic': 'Não foi possível salvar as configurações.',

        'lock.title': 'Prosa bloqueado',
        'lock.prompt': 'Digite a senha para continuar',
        'lock.password': 'Senha',
        'lock.unlock': 'Desbloquear',
        'lock.forgot': 'Esqueci a senha',
        'lock.forgotConfirm': 'Isso apaga os dados do Prosa neste computador, inclusive a sessão do WhatsApp (você vai precisar ler o QR code de novo). Continuar?',

        'about.title': 'Sobre o Prosa',
        'about.desc': 'Cliente desktop não oficial para o WhatsApp Web, feito com Electron.',
        'about.disclaimer': 'Este NÃO é um produto oficial do WhatsApp nem da Meta. O Prosa apenas abre o WhatsApp Web, como um navegador faria, sem alterar nem reimplementar o serviço.',
        'about.version': 'Versão',
        'about.credits': 'Criado por Derciel Junior. Baseado no projeto whatsapp-desktop, licenciado sob a GPL-3.0. O código-fonte acompanha este programa.',

        'update.downloaded': 'Uma nova versão do Prosa foi baixada.',
        'update.restart': 'Reiniciar agora',
        'update.later': 'Depois',
        'update.none': 'Você já está usando a versão mais recente.',
        'update.error': 'Não foi possível verificar atualizações agora.'
    },
    'en': {
        'menu.file': 'File',
        'menu.settings': 'Settings',
        'menu.about': 'About Prosa',
        'menu.checkUpdates': 'Check for updates',
        'menu.quit': 'Quit',
        'menu.edit': 'Edit',
        'menu.undo': 'Undo',
        'menu.redo': 'Redo',
        'menu.cut': 'Cut',
        'menu.copy': 'Copy',
        'menu.paste': 'Paste',
        'menu.selectAll': 'Select all',
        'menu.view': 'View',
        'menu.reload': 'Reload',
        'menu.fullscreen': 'Full screen',
        'menu.blur': 'Blur messages (hover to reveal)',
        'menu.quiet': 'Quiet mode',
        'menu.lockNow': 'Lock now',
        'menu.devtools': 'Developer tools',
        'menu.window': 'Window',
        'menu.minimize': 'Minimize',
        'menu.close': 'Close',
        'menu.audio': 'Audio',
        'menu.audioUp': 'Increase audio speed by 20%',
        'menu.audioDown': 'Decrease audio speed by 20%',

        'tray.show': 'Show',
        'tray.hide': 'Hide',
        'tray.lock': 'Lock',
        'tray.quit': 'Quit',

        'ctx.noSuggestions': 'No suggestions',
        'ctx.addToDictionary': 'Add to dictionary',
        'ctx.copyLink': 'Copy link',

        'settings.title': 'Settings',
        'settings.appearance': 'Appearance',
        'settings.blurMessages': 'Blur messages (hover to reveal)',
        'settings.blurList': 'Blur the chat list (hover to reveal)',
        'settings.fontSize': 'Text size',
        'settings.fontSmall': 'Small',
        'settings.fontNormal': 'Normal',
        'settings.fontLarge': 'Large',
        'settings.fontXLarge': 'Extra large',
        'settings.customCss': 'Custom CSS file',
        'settings.choose': 'Choose…',
        'settings.remove': 'Remove',
        'settings.none': 'None',
        'settings.privacy': 'Privacy and lock',
        'settings.lockEnabled': 'Lock Prosa with a password',
        'settings.lockCurrent': 'Current password',
        'settings.lockNew': 'New password (at least 4 characters)',
        'settings.lockNew2': 'Repeat the new password',
        'settings.lockAfter': 'Lock after inactivity',
        'settings.lockNever': 'Never',
        'settings.lockMin1': '1 minute',
        'settings.lockMin5': '5 minutes',
        'settings.lockMin15': '15 minutes',
        'settings.lockMin30': '30 minutes',
        'settings.lockMin60': '1 hour',
        'settings.lockOnHide': 'Lock when minimized or hidden to the tray',
        'settings.lockHint': 'With the lock on, Prosa starts locked, notifications are off while it is locked, and Ctrl+L locks it right away.',
        'settings.notifications': 'Notifications',
        'settings.quietMode': 'Quiet mode (no notifications)',
        'settings.system': 'System',
        'settings.trayIcon': 'Show tray icon',
        'settings.startMinimized': 'Start minimized to the tray',
        'settings.autostart': 'Start with Windows',
        'settings.autoHideMenuBar': 'Hide the menu bar (Alt shows it)',
        'settings.disableGpu': 'Disable hardware acceleration (restart to apply)',
        'settings.globalShortcut': 'Global shortcut Ctrl+Alt+W to show/hide (restart to apply)',
        'settings.language': 'Language',
        'settings.langAuto': 'Automatic',
        'settings.network': 'Network',
        'settings.useProxy': 'Use a proxy (restart to apply)',
        'settings.httpProxy': 'HTTP proxy',
        'settings.httpsProxy': 'HTTPS proxy (empty = same as HTTP)',
        'settings.save': 'Save',
        'settings.cancel': 'Cancel',

        'err.pwShort': 'The password needs at least 4 characters.',
        'err.pwMismatch': 'The passwords do not match.',
        'err.pwWrong': 'Wrong password.',
        'err.pwCurrentRequired': 'Enter the current password to change the lock.',
        'err.pwNewRequired': 'Set a password to turn the lock on.',
        'err.wait': 'Too many attempts. Wait {s} seconds.',
        'err.generic': 'The settings could not be saved.',

        'lock.title': 'Prosa is locked',
        'lock.prompt': 'Enter the password to continue',
        'lock.password': 'Password',
        'lock.unlock': 'Unlock',
        'lock.forgot': 'Forgot the password',
        'lock.forgotConfirm': 'This erases Prosa data on this computer, including the WhatsApp session (you will need to scan the QR code again). Continue?',

        'about.title': 'About Prosa',
        'about.desc': 'Unofficial desktop client for WhatsApp Web, built with Electron.',
        'about.disclaimer': 'This is NOT an official WhatsApp or Meta product. Prosa only opens WhatsApp Web, as a browser would, without changing or reimplementing the service.',
        'about.version': 'Version',
        'about.credits': 'Created by Derciel Junior. Based on the whatsapp-desktop project, licensed under the GPL-3.0. The source code comes with this program.',

        'update.downloaded': 'A new version of Prosa has been downloaded.',
        'update.restart': 'Restart now',
        'update.later': 'Later',
        'update.none': 'You are already on the latest version.',
        'update.error': 'Could not check for updates right now.'
    }
};

let current = 'pt-BR';

// "auto" follows the Windows language: any Portuguese variant maps to pt-BR, everything else to English
function resolveLanguage(setting, systemLocale) {
    if (setting === 'pt-BR' || setting === 'en') {
        return setting;
    }
    return String(systemLocale || '').toLowerCase().startsWith('pt') ? 'pt-BR' : 'en';
}

function setLanguage(lang) {
    current = dictionaries[lang] ? lang : 'pt-BR';
}

function getLanguage() {
    return current;
}

function t(key, vars) {
    var text = dictionaries[current][key];
    if (text === undefined) {
        text = dictionaries['en'][key];
    }
    if (text === undefined) {
        return key;
    }
    if (vars) {
        Object.keys(vars).forEach(function (name) {
            text = text.split('{' + name + '}').join(String(vars[name]));
        });
    }
    return text;
}

function allStrings() {
    return Object.assign({}, dictionaries['en'], dictionaries[current]);
}

module.exports = { resolveLanguage, setLanguage, getLanguage, t, allStrings };
