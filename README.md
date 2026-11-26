# Prosa

Cliente desktop **não oficial** para o WhatsApp Web, em português, feito com Electron.
O Prosa apenas abre o WhatsApp Web, como um navegador faria. Não é um produto do WhatsApp nem da Meta.

Baseado no projeto [whatsapp-desktop](https://github.com/oOthkOo/whatsapp-desktop), licenciado sob a **GPL-3.0**.
Este código também é GPL-3.0: quem receber o instalador tem direito de receber o código-fonte (esta pasta).

## O que tem

- Interface em português (Brasil), com inglês como alternativa. O idioma segue o Windows.
- **Configurações bônus** (aba "Bônus" e botão redondo verde na lateral do WhatsApp): desfoque de privacidade com revelação ao passar o mouse, item por item.
  - Mensagens da conversa (`Ctrl+Alt+B` liga e desliga), lista de conversas, nomes dos contatos, fotos dos contatos e campo de digitação.
  - "Desfocar tudo quando o Prosa perder o foco": ao trocar de janela, a tela inteira fica desfocada.
- **Janela de configurações com menu lateral**: Geral, Aparência, Privacidade e bloqueio, Bônus, Avançado e Atualizações e sobre. `Ctrl+,` abre, `Ctrl+Shift+B` abre direto nos bônus.
- **Atualizações visíveis**: *Arquivo > Verificar atualizações* abre a página de atualizações, que mostra verificando, baixando (com barra de progresso), pronta para instalar, sem conexão ou já na versão mais recente.
- **Bloqueio com senha**: o Prosa abre bloqueado, bloqueia após inatividade (1 a 60 min), ao minimizar/ocultar e ao bloquear o Windows. `Ctrl+L` bloqueia na hora.
  - A senha é guardada só como hash (scrypt com sal).
  - 5 erros seguidos travam a tentativa por 30 segundos.
  - Bloqueado, as notificações ficam desligadas e a janela fica preta em capturas e miniaturas.
  - "Esqueci a senha" apaga os dados locais (inclusive a sessão do WhatsApp) e remove o bloqueio.
- Modo silencioso, ícone na bandeja com indicador de mensagens novas, início minimizado, início com o Windows, tamanho do texto, CSS personalizado, proxy.
- Atualização automática (veja abaixo).
- Electron atual, sem dependências de CDN: as telas de configuração funcionam offline.

## Desenvolvimento

```bash
npm install
node node_modules/electron/install.js   # baixa o binário do Electron (o npm novo não roda esse passo sozinho)
npm start
```

## Gerar o instalador

```bash
npm run dist
```

O instalador sai em `dist/` (`Prosa Setup <versão>.exe`). Ele instala só para o usuário (não pede administrador),
cria atalhos na área de trabalho e no menu Iniciar, e tem instalador em português.

O instalador **não é assinado**. O Windows SmartScreen vai mostrar "O Windows protegeu o computador" na primeira
execução; é preciso clicar em "Mais informações" e "Executar assim mesmo". Para evitar isso é preciso um certificado
de assinatura de código (configure em `build.win` no `package.json`).

## Atualização automática

O app procura atualizações 20 segundos depois de abrir e a cada 6 horas, e também em *Arquivo > Verificar atualizações*.
Ele baixa em segundo plano e pergunta se quer reiniciar.

As versões ficam nos *Releases* do repositório [Derciel/prosa](https://github.com/Derciel/prosa/releases) (que precisa ser público,
senão o app não consegue baixar sem um token). Para lançar uma nova versão:

1. Aumente `version` no `package.json` (por exemplo, `1.0.1`).
2. Rode `npm run dist` para gerar o instalador, o `.blockmap` e o `latest.yml` em `dist/`.
3. Publique um release com a tag `v<versão>` anexando esses três arquivos:

```bash
gh release create v1.0.1 "dist/Prosa-Setup-1.0.1.exe" "dist/Prosa-Setup-1.0.1.exe.blockmap" dist/latest.yml --title "Prosa 1.0.1" --notes "O que mudou"
```

Os arquivos precisam ser anexados ao release com esses nomes exatos (sem espaços), porque o `latest.yml` aponta para eles.
Quem já tem o Prosa instalado recebe a atualização sozinho.

## Observações

- Os seletores de desfoque (`#main`, `#pane-side`, `.message-in`, `.message-out`, `[data-id]`) dependem da estrutura do
  WhatsApp Web, que muda sem aviso. Se o desfoque parar de funcionar depois de uma mudança deles, ajuste `BLUR_MESSAGES_CSS`
  e `BLUR_LIST_CSS` em `src/main.js`.
- O Prosa usa um perfil próprio (`%APPDATA%\Prosa`): é preciso ler o QR code uma vez.
