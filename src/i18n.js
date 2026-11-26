"use strict";

// Interface strings. Brazilian Portuguese is the main language; English is the fallback.
const dictionaries = {
    'pt-BR': {
        'menu.file': 'Arquivo',
        'menu.settings': 'Configurações',
        'menu.bonus': 'Configurações bônus',
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

        'btn.bonus': 'Prosa: configurações bônus',

        'settings.title': 'Configurações',
        'nav.general': 'Geral',
        'nav.appearance': 'Aparência',
        'nav.privacy': 'Privacidade e bloqueio',
        'nav.bonus': 'Bônus',
        'nav.advanced': 'Avançado',
        'nav.about': 'Atualizações e sobre',

        'gen.title': 'Geral',
        'gen.desc': 'Como o Prosa se comporta no Windows.',
        'gen.language': 'Idioma',
        'gen.langAuto': 'Automático (idioma do Windows)',
        'gen.trayIcon': 'Mostrar ícone na bandeja do sistema',
        'gen.trayIconHint': 'Com o ícone, fechar a janela mantém o Prosa rodando e as mensagens continuam chegando.',
        'gen.startMinimized': 'Iniciar minimizado na bandeja',
        'gen.autostart': 'Iniciar com o Windows',
        'gen.autoHideMenuBar': 'Ocultar a barra de menus (a tecla Alt mostra)',
        'gen.quietMode': 'Modo silencioso (sem notificações)',
        'gen.globalShortcut': 'Atalho global Ctrl+Alt+W para mostrar ou ocultar',

        'ap.title': 'Aparência',
        'ap.desc': 'Tamanho do texto e estilo extra.',
        'ap.fontSize': 'Tamanho do texto',
        'ap.fontSmall': 'Pequeno',
        'ap.fontNormal': 'Normal',
        'ap.fontLarge': 'Grande',
        'ap.fontXLarge': 'Muito grande',
        'ap.customCss': 'Arquivo de CSS personalizado',
        'ap.customCssHint': 'Para quem quer ajustar cores e espaços. Aplicado ao recarregar.',
        'ap.choose': 'Escolher…',
        'ap.remove': 'Remover',
        'ap.none': 'Nenhum',

        'pv.title': 'Privacidade e bloqueio',
        'pv.desc': 'Proteja o Prosa com uma senha.',
        'pv.lockEnabled': 'Bloquear o Prosa com senha',
        'pv.lockCurrent': 'Senha atual',
        'pv.lockNew': 'Nova senha (mínimo 4 caracteres)',
        'pv.lockNew2': 'Repita a nova senha',
        'pv.lockAfter': 'Bloquear após inatividade',
        'pv.lockNever': 'Nunca',
        'pv.lockMin1': '1 minuto',
        'pv.lockMin5': '5 minutos',
        'pv.lockMin15': '15 minutos',
        'pv.lockMin30': '30 minutos',
        'pv.lockMin60': '1 hora',
        'pv.lockOnHide': 'Bloquear ao minimizar ou ocultar na bandeja',
        'pv.lockHint': 'Com o bloqueio ativo, o Prosa abre bloqueado, as notificações ficam desligadas enquanto ele estiver bloqueado e Ctrl+L bloqueia na hora.',

        'bn.title': 'Configurações bônus',
        'bn.desc': 'Ferramentas extras de privacidade. O conteúdo fica desfocado e aparece quando você passa o mouse.',
        'bn.groupBlur': 'Desfoque de privacidade',
        'bn.blurMessages': 'Mensagens da conversa',
        'bn.blurList': 'Lista de conversas inteira',
        'bn.blurNames': 'Nomes dos contatos',
        'bn.blurPhotos': 'Fotos dos contatos',
        'bn.blurComposer': 'Campo de digitação',
        'bn.blurOnBlur': 'Desfocar tudo quando o Prosa perder o foco',
        'bn.blurOnBlurHint': 'Ao trocar de janela, a tela inteira do WhatsApp fica desfocada até você voltar ao Prosa.',
        'bn.groupButton': 'Atalho na tela',
        'bn.bonusButton': 'Mostrar o botão do Prosa na lateral do WhatsApp',
        'bn.bonusButtonHint': 'Um botão redondo verde na barra lateral abre esta página.',
        'bn.note': 'O desfoque depende da estrutura do WhatsApp Web, que muda sem aviso. Se algum item deixar de desfocar, avise o criador.',

        'adv.title': 'Avançado',
        'adv.desc': 'Desempenho e rede.',
        'adv.groupPerf': 'Desempenho',
        'adv.disableGpu': 'Desativar aceleração de hardware (reinicie para aplicar)',
        'adv.disableGpuHint': 'Só use se a tela piscar ou travar. Por padrão o Prosa usa a placa de vídeo.',
        'adv.groupNetwork': 'Rede',
        'adv.useProxy': 'Usar proxy',
        'adv.httpProxy': 'Proxy HTTP',
        'adv.httpsProxy': 'Proxy HTTPS (vazio = igual ao HTTP)',

        'ab.title': 'Atualizações e sobre',
        'ab.desc': 'Cliente desktop não oficial para o WhatsApp Web, feito com Electron.',
        'ab.installed': 'Versão instalada',
        'ab.disclaimer': 'Este NÃO é um produto oficial do WhatsApp nem da Meta. O Prosa apenas abre o WhatsApp Web, como um navegador faria, sem alterar nem reimplementar o serviço.',
        'ab.credits': 'Criado por Derciel Junior. Baseado no projeto whatsapp-desktop, licenciado sob a GPL-3.0. O código-fonte acompanha este programa.',
        'ab.source': 'Código-fonte no GitHub',

        'up.check': 'Buscar atualizações',
        'up.idle': 'Clique em "Buscar atualizações" para ver se há uma versão nova.',
        'up.checking': 'Verificando se há uma versão nova…',
        'up.none': 'Você está na versão mais recente.',
        'up.checkedAt': 'Verificado às {t}.',
        'up.available': 'A versão {v} foi encontrada. Preparando o download…',
        'up.downloading': 'Baixando a versão {v}: {p}%',
        'up.downloaded': 'A versão {v} está pronta para instalar.',
        'up.restart': 'Reiniciar e atualizar',
        'up.errorNet': 'Sem conexão com o GitHub. Confira a internet e tente de novo.',
        'up.error': 'Não foi possível verificar agora. Tente de novo em alguns minutos.',
        'up.dev': 'A verificação de atualizações só funciona no Prosa instalado.',

        'settings.save': 'Salvar',
        'settings.cancel': 'Cancelar',
        'settings.close': 'Fechar',
        'settings.saved': 'Configurações salvas.',

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

        'update.downloaded': 'Uma nova versão do Prosa foi baixada.',
        'update.restart': 'Reiniciar agora',
        'update.later': 'Depois'
    },
    'en': {
        'menu.file': 'File',
        'menu.settings': 'Settings',
        'menu.bonus': 'Bonus settings',
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

        'btn.bonus': 'Prosa: bonus settings',

        'settings.title': 'Settings',
        'nav.general': 'General',
        'nav.appearance': 'Appearance',
        'nav.privacy': 'Privacy and lock',
        'nav.bonus': 'Bonus',
        'nav.advanced': 'Advanced',
        'nav.about': 'Updates and about',

        'gen.title': 'General',
        'gen.desc': 'How Prosa behaves on Windows.',
        'gen.language': 'Language',
        'gen.langAuto': 'Automatic (Windows language)',
        'gen.trayIcon': 'Show tray icon',
        'gen.trayIconHint': 'With the icon, closing the window keeps Prosa running so messages keep arriving.',
        'gen.startMinimized': 'Start minimized to the tray',
        'gen.autostart': 'Start with Windows',
        'gen.autoHideMenuBar': 'Hide the menu bar (the Alt key shows it)',
        'gen.quietMode': 'Quiet mode (no notifications)',
        'gen.globalShortcut': 'Global shortcut Ctrl+Alt+W to show or hide',

        'ap.title': 'Appearance',
        'ap.desc': 'Text size and extra styling.',
        'ap.fontSize': 'Text size',
        'ap.fontSmall': 'Small',
        'ap.fontNormal': 'Normal',
        'ap.fontLarge': 'Large',
        'ap.fontXLarge': 'Extra large',
        'ap.customCss': 'Custom CSS file',
        'ap.customCssHint': 'For adjusting colors and spacing. Applied on reload.',
        'ap.choose': 'Choose…',
        'ap.remove': 'Remove',
        'ap.none': 'None',

        'pv.title': 'Privacy and lock',
        'pv.desc': 'Protect Prosa with a password.',
        'pv.lockEnabled': 'Lock Prosa with a password',
        'pv.lockCurrent': 'Current password',
        'pv.lockNew': 'New password (at least 4 characters)',
        'pv.lockNew2': 'Repeat the new password',
        'pv.lockAfter': 'Lock after inactivity',
        'pv.lockNever': 'Never',
        'pv.lockMin1': '1 minute',
        'pv.lockMin5': '5 minutes',
        'pv.lockMin15': '15 minutes',
        'pv.lockMin30': '30 minutes',
        'pv.lockMin60': '1 hour',
        'pv.lockOnHide': 'Lock when minimized or hidden to the tray',
        'pv.lockHint': 'With the lock on, Prosa starts locked, notifications are off while it is locked, and Ctrl+L locks it right away.',

        'bn.title': 'Bonus settings',
        'bn.desc': 'Extra privacy tools. Content stays blurred and shows when you hover over it.',
        'bn.groupBlur': 'Privacy blur',
        'bn.blurMessages': 'Conversation messages',
        'bn.blurList': 'The whole chat list',
        'bn.blurNames': 'Contact names',
        'bn.blurPhotos': 'Contact photos',
        'bn.blurComposer': 'Typing field',
        'bn.blurOnBlur': 'Blur everything when Prosa loses focus',
        'bn.blurOnBlurHint': 'When you switch windows, the whole WhatsApp screen is blurred until you come back to Prosa.',
        'bn.groupButton': 'On-screen shortcut',
        'bn.bonusButton': 'Show the Prosa button on the WhatsApp sidebar',
        'bn.bonusButtonHint': 'A round green button on the sidebar opens this page.',
        'bn.note': 'Blurring depends on the structure of WhatsApp Web, which changes without notice. If an item stops blurring, tell the author.',

        'adv.title': 'Advanced',
        'adv.desc': 'Performance and network.',
        'adv.groupPerf': 'Performance',
        'adv.disableGpu': 'Disable hardware acceleration (restart to apply)',
        'adv.disableGpuHint': 'Only use this if the screen flickers or freezes. By default Prosa uses the graphics card.',
        'adv.groupNetwork': 'Network',
        'adv.useProxy': 'Use a proxy',
        'adv.httpProxy': 'HTTP proxy',
        'adv.httpsProxy': 'HTTPS proxy (empty = same as HTTP)',

        'ab.title': 'Updates and about',
        'ab.desc': 'Unofficial desktop client for WhatsApp Web, built with Electron.',
        'ab.installed': 'Installed version',
        'ab.disclaimer': 'This is NOT an official WhatsApp or Meta product. Prosa only opens WhatsApp Web, as a browser would, without changing or reimplementing the service.',
        'ab.credits': 'Created by Derciel Junior. Based on the whatsapp-desktop project, licensed under the GPL-3.0. The source code comes with this program.',
        'ab.source': 'Source code on GitHub',

        'up.check': 'Check for updates',
        'up.idle': 'Click "Check for updates" to see if there is a new version.',
        'up.checking': 'Checking for a new version…',
        'up.none': 'You are on the latest version.',
        'up.checkedAt': 'Checked at {t}.',
        'up.available': 'Version {v} was found. Preparing the download…',
        'up.downloading': 'Downloading version {v}: {p}%',
        'up.downloaded': 'Version {v} is ready to install.',
        'up.restart': 'Restart and update',
        'up.errorNet': 'No connection to GitHub. Check the internet and try again.',
        'up.error': 'Could not check right now. Try again in a few minutes.',
        'up.dev': 'Update checks only work in the installed Prosa.',

        'settings.save': 'Save',
        'settings.cancel': 'Cancel',
        'settings.close': 'Close',
        'settings.saved': 'Settings saved.',

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

        'update.downloaded': 'A new version of Prosa has been downloaded.',
        'update.restart': 'Restart now',
        'update.later': 'Later'
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
