# 📖 O Guia Definitivo: Sistema de Tickets Discord (Do Zero ao Railway)

Este tutorial foi desenhado para cobrir **absolutamente todos os passos**, desde a criação do bot no portal do Discord até a hospedagem 24/7 no Railway, de forma **extremamente detalhista**.

---

## 🛠️ Parte 1: Pré-requisitos (O que você precisa ter no PC)

Antes de mexer com qualquer código, você precisa de 3 ferramentas fundamentais instaladas no seu computador:
1. **[Node.js](https://nodejs.org/en/) (Versão 20 ou superior)**: O motor que roda o JavaScript. Baixe a versão "LTS".
2. **[Git](https://git-scm.com/downloads)**: Para enviar o código para o GitHub.
3. **[Visual Studio Code](https://code.visualstudio.com/)**: O editor de código (para editar o `.env`).

*Para verificar se o Node.js e o npm estão instalados, abra o terminal (CMD/PowerShell) e digite `node -v` e `npm -v`.*

---

## 🤖 Parte 2: Criando o Bot no Portal do Discord

Você precisa de uma "Identidade" para o seu bot.
1. Acesse o **[Discord Developer Portal](https://discord.com/developers/applications)**.
2. Clique no botão azul **"New Application"** no canto superior direito.
3. Dê um nome ao seu bot e aceite os termos.
4. No menu esquerdo, vá na aba **"Bot"**.
5. **Privileged Gateway Intents (MUITO IMPORTANTE)**:
   - Role a página para baixo e encontre as 3 chaves: **Presence Intent**, **Server Members Intent** e **Message Content Intent**.
   - Ative (deixe azul) **TODAS AS TRÊS**. Sem elas, o bot não consegue ler as mensagens nem carregar membros.
6. Clique em **"Reset Token"** e copie a enorme chave de letras e números que aparecer. **Guarde esse Token com a sua vida** (não mande para ninguém).
7. Salve as alterações.

### Convidando o bot para o seu servidor
1. No menu esquerdo, vá em **"OAuth2"** -> **"URL Generator"**.
2. Em *Scopes*, marque **"bot"** e **"applications.commands"**.
3. Em *Bot Permissions*, marque **"Administrator"**.
4. Copie a URL gerada no fim da página, cole no seu navegador e adicione o bot no seu servidor.

---

## 🏗️ Parte 3: Preparando o seu Servidor do Discord

Para o bot funcionar, ele precisa saber os IDs numéricos de canais e cargos.
**Como pegar IDs no Discord:** Vá em *Configurações de Usuário -> Avançado* e ative o **Modo Desenvolvedor**. Agora você pode clicar com o botão direito em qualquer cargo, usuário ou canal e clicar em "Copiar ID".

**O que você precisa criar/pegar o ID no seu servidor:**
1. **ID do Servidor (`GUILD_ID`)**: Clique com o botão direito no ícone do servidor e copie o ID.
2. **Categoria de Tickets (`TICKET_CATEGORY_ID`)**: Crie uma categoria chamada "Tickets" (onde os canais vão abrir). Copie o ID dela.
3. **Canal de Logs (`LOG_CHANNEL_ID`)**: Crie um canal privado para a staff ver os históricos de tickets fechados.
4. **Canal de Feedbacks (`FEEDBACK_CHANNEL_ID`)**: Crie um canal público (ou privado) onde as avaliações de estrelas vão cair.
5. **Cargos da Equipe (`ADMIN_ROLE_ID`, `MOD_ROLE_ID`, `SUPPORT_ROLE_ID`)**: Crie esses três cargos, distribua para sua equipe e copie o ID de cada um.
6. **Cargo de Influenciador (`INFLUENCER_ROLE_ID`)**: Cargo que o bot dará automaticamente para a pessoa caso a candidatura dela a influenciador seja aprovada. Copie o ID.

---

## 💻 Parte 4: Configuração Local

1. Abra a pasta do bot (`bot dc 2026`) no **Visual Studio Code**.
2. Você verá um arquivo chamado `.env.example`.
3. Renomeie este arquivo para apenas `.env`.
4. Abra o arquivo `.env` e preencha com todos os dados que você pegou nas partes 2 e 3. Exemplo:
   ```env
   DISCORD_TOKEN=MTE2... (O token do bot)
   CLIENT_ID=116... (O ID do bot no portal do developer)
   GUILD_ID=123456789...
   LOG_CHANNEL_ID=987654321...
   FEEDBACK_CHANNEL_ID=456789123...
   ADMIN_ROLE_ID=1111111...
   MOD_ROLE_ID=2222222...
   SUPPORT_ROLE_ID=3333333...
   INFLUENCER_ROLE_ID=4444444...
   TICKET_CATEGORY_ID=5555555...
   MAX_RESERVATIONS=60
   PORT=3000
   DATABASE_PATH=./data/tickets.sqlite
   ```
   *(Nota: Enquanto você testar no PC, deixe `DATABASE_PATH=./data/tickets.sqlite`)*

5. Abra o terminal (No VSCode: `Terminal -> New Terminal`).
6. Digite o seguinte comando para instalar todas as dependências:
   ```bash
   npm install
   ```
7. Registre o comando `/painel` no servidor digitando:
   ```bash
   npm run deploy
   ```
8. (Opcional) Teste se está tudo ok rodando:
   ```bash
   npm start
   ```
   Se aparecer `[INFO] Ready! Logged in as...`, pode parar o bot (Ctrl+C).

---

## ☁️ Parte 5: Colocando no GitHub

1. Vá no [GitHub](https://github.com/) e crie uma conta (se não tiver).
2. Crie um repositório novo clicando no **"+" -> "New Repository"**.
3. Escolha o modo **Privado** e não adicione README.
4. No terminal do VSCode (dentro da pasta do bot), rode os comandos na ordem:
   ```bash
   git init
   git add .
   git commit -m "Meu Bot de Tickets"
   git branch -M main
   git remote add origin SUA_URL_DO_GITHUB_AQUI
   git push -u origin main
   ```
*(O seu código agora está na nuvem, mas o arquivo `.env` com suas senhas não foi junto por segurança, pois o configuramos no arquivo `.gitignore`.)*

---

## 🚂 Parte 6: Hospedagem Definitiva no Railway

1. Acesse [Railway.app](https://railway.app/) e faça login com seu GitHub.
2. Clique em **"New Project"** -> **"Deploy from GitHub repo"**.
3. Selecione o repositório que você acabou de criar. Ele vai começar a fazer o deploy (e vai dar erro no início, ignore).
4. No painel, clique no quadrado verde com o nome do seu projeto.
5. **Configurando o Disco (Isso impede que o banco de dados resete):**
   - Vá na aba **Settings**.
   - Desça até **Volumes**.
   - Clique em **Add Volume**.
   - No campo **Mount Path**, escreva EXATAMENTE: `/app/data`
6. **Variáveis de Ambiente (.env no Railway):**
   - Vá na aba **Variables**.
   - Adicione **todas** as variáveis que você colocou no arquivo `.env` do seu PC.
   - **MUITO IMPORTANTE:** Aqui no Railway, mude o valor da variável `DATABASE_PATH` para `/app/data/tickets.sqlite` (isso avisa ao bot para salvar no disco rígido fixo que você criou no passo 5).
   - Confirme se `PORT` está como `3000`.
7. O Railway vai reiniciar o bot automaticamente após você colocar as variáveis.
8. Vá na aba **Deployments**, aguarde ficar verdinho ✅. 
9. Se você clicar em **View Logs**, verá o servidor rodando lindamente!

---

## 🎮 Parte 7: Como usar o Bot

1. Vá no seu servidor do Discord em um canal que só você/administradores têm acesso (como uma sala da staff).
2. Digite `/painel` e aperte Enter.
3. O bot vai gerar a Central de Tickets linda e profissional com os 7 botões.

### Funcionalidades Especiais:
- **Fluxo UEFI e Influenciador:** Se o usuário clicar, um Formulário (Modal) vai abrir na tela pedindo informações (Por que quer? Qual link? Quantos seguidores?). Quando ele preencher, abre um canal, e a equipe terá botões verdes e vermelhos para aprovar/reprovar instantaneamente com 1 clique.
- **Fechamento de Ticket:** O atendente clica em fechar. O bot pede confirmação com um timer de 60 segundos (para evitar fechar sem querer).
- **Transcripts e Logs:** O canal deleta sozinho, o bot gera uma página HTML (transcript) com todo o histórico de conversas do ticket, calcula o tempo total de atendimento, e joga isso tudo no canal `LOG_CHANNEL_ID`.
- **Avaliações DM:** Assim que deleta o ticket, o usuário recebe uma mensagem no privado pedindo pra clicar em de 1 a 5 estrelinhas, podendo deixar comentário. Essa avaliação viaja direto e elegante para o canal `FEEDBACK_CHANNEL_ID`.
- **Reserva de Vagas:** Limitado ao `MAX_RESERVATIONS` (60), com sistema anti-duplicidade em banco de dados!

E pronto. Você tem um projeto profissional na nuvem. Sucesso com o servidor!
