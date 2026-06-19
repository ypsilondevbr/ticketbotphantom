# 🚀 Tutorial Definitivo: Hospedando o Bot de Tickets no Railway

Este projeto já foi construído com a infraestrutura exata que o Railway exige (arquivos `railway.json`, `Procfile` e o servidor Express na porta correta). Siga este passo a passo para colocar o bot online 24/7.

---

## 📌 Passo 1: Subir o código para o GitHub
O Railway puxa o código diretamente do GitHub. Se você ainda não subiu, faça o seguinte:
1. Crie um repositório **Privado** no [GitHub](https://github.com/new).
2. Na pasta do bot (`bot dc 2026`), abra o terminal e rode:
   ```bash
   git init
   git add .
   git commit -m "Deploy inicial"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git
   git push -u origin main
   ```

---

## 📌 Passo 2: Criando o Projeto no Railway
1. Acesse [Railway.app](https://railway.app/) e faça login com sua conta do GitHub.
2. Clique no botão **"New Project"** no canto superior direito.
3. Escolha **"Deploy from GitHub repo"**.
4. Selecione o repositório do seu bot.
5. Clique em **"Deploy Now"**. 
   *(O primeiro deploy pode falhar porque ainda não configuramos as variáveis e o banco, é normal. Vamos arrumar isso agora.)*

---

## 📌 Passo 3: Configurando o Disco (Volume) para o Banco SQLite
Como estamos usando SQLite (`better-sqlite3`), se não criarmos um "Volume", o banco de dados será deletado toda vez que o bot reiniciar (apagando os tickets, verificações, etc).
1. No painel do seu projeto no Railway, clique no bloco verde do seu repositório.
2. Vá na aba **Settings** (Configurações).
3. Desça até a seção **Volumes**.
4. Clique em **"Add Volume"** (Adicionar Volume).
5. Onde diz "Mount Path", digite exatamente:
   `/app/data`
   *(É nesta pasta que nosso bot salva o arquivo `tickets.sqlite` e os transcripts).*

---

## 📌 Passo 4: Variáveis de Ambiente (.env)
O bot precisa das suas IDs para funcionar. 
1. Ainda no bloco do seu repositório, vá para a aba **Variables** (Variáveis).
2. Adicione as seguintes variáveis clicando em **"New Variable"** (você pode copiar e colar do seu `.env.example`):

| Variável | O que colocar |
| :--- | :--- |
| `DISCORD_TOKEN` | O token do seu bot (pego no Discord Developer Portal) |
| `CLIENT_ID` | O ID do bot |
| `GUILD_ID` | O ID do seu servidor do Discord |
| `LOG_CHANNEL_ID` | ID do canal onde os logs de ticket fechado irão cair |
| `FEEDBACK_CHANNEL_ID` | ID do canal onde vão cair as avaliações de 1 a 5 estrelas |
| `ADMIN_ROLE_ID` | ID do cargo de Administrador |
| `MOD_ROLE_ID` | ID do cargo de Moderador |
| `SUPPORT_ROLE_ID` | ID do cargo de Suporte |
| `INFLUENCER_ROLE_ID` | ID do cargo que é dado ao aprovar influenciador |
| `TICKET_CATEGORY_ID` | ID da categoria onde os canais de ticket serão criados |
| `MAX_RESERVATIONS` | `60` (Padrão de vagas) |
| `PORT` | `3000` |
| `DATABASE_PATH` | `/app/data/tickets.sqlite` **(MUITO IMPORTANTE!)** |

> ⚠️ **Aviso crítico sobre o `DATABASE_PATH`**: Como estamos usando o Railway e montamos o volume na pasta `/app/data`, você deve colocar `/app/data/tickets.sqlite` no valor dessa variável.

---

## 📌 Passo 5: Registrando os Slash Commands (Opcional no Railway)
Os comandos (como o `/painel`) precisam ser registrados no Discord. Você pode fazer isso de duas formas:
- **Localmente:** Rode `node src/deploy-commands.js` no terminal do seu PC antes de hospedar.
- **No Railway:** Se quiser rodar por lá, vá na aba **Settings** do Railway, mude temporariamente o **Start Command** para `node src/deploy-commands.js`, deixe ele rodar uma vez, e depois volte o Start Command para `node src/index.js`.

> **Nota:** Como deixamos configurado o `railway.json` e o `Procfile`, o comando padrão do Railway será sempre `node src/index.js`.

---

## 📌 Passo 6: Finalizando o Deploy
1. Após configurar as variáveis de ambiente e o volume de disco, o Railway automaticamente irá gerar uma nova versão (Build).
2. Aguarde o fim do processo. Na aba **Deployments**, você deve ver um checkmark verde ✅.
3. Clique na aba **View Logs** -> **Deploy Logs**.
4. Você deve ver:
   ```
   [INFO] Database initialized
   [INFO] Ready! Logged in as SeuBot#1234
   [INFO] Health server listening on port 3000
   ```

Pronto! Seu sistema de tickets está **100% online**, com salvamento seguro das avaliações e configurações, e aprovado no health check do Railway para nunca cair. Vá para o Discord e use `/painel` para iniciar.
