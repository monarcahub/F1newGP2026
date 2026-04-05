# GridPlay F1 Streaming Platform

Este projeto é uma plataforma de streaming de Fórmula 1 com integração ao Supabase e Telegram.

## Configuração de Produção

### 1. GitHub
- Crie um novo repositório no GitHub.
- Suba todos os arquivos (exceto `node_modules` e `.env`).

### 2. Vercel (Frontend + API)
- Conecte seu repositório do GitHub ao Vercel.
- Configure as seguintes Variáveis de Ambiente no painel da Vercel:
  - `VITE_SUPABASE_URL`: URL do seu projeto Supabase.
  - `VITE_SUPABASE_ANON_KEY`: Chave anônima do seu projeto Supabase.
  - `WEBHOOK_SECRET`: Uma chave secreta para validar webhooks de pagamento.
- O Vercel detectará automaticamente o Vite e usará `npm run build`.
- O endpoint do webhook estará disponível em `https://seu-app.vercel.app/api/webhook`.

### 3. Supabase
- Certifique-se de que as tabelas `f1profiles`, `f1subscribes` e `videos` estão criadas e com as políticas de RLS configuradas.
- O sistema de upgrade automático já está integrado ao frontend.

### 4. Pagamentos (Stripe/Mercado Pago)
- Configure o webhook do seu provedor de pagamentos para apontar para `https://seu-app.vercel.app/api/webhook`.
- Use o `WEBHOOK_SECRET` configurado para validar as requisições.

## Estrutura do Projeto
- `src/`: Frontend React + Vite.
- `api/`: Funções Serverless para a Vercel (Webhook).
- `server.ts`: Servidor Express para desenvolvimento local ou outros provedores.
- `vercel.json`: Configuração de roteamento para a Vercel.
