# VALTRACK — Rastreador de Estatísticas de Armas no Valorant

Projeto feito em **HTML + CSS + JavaScript puro** com **Vite** (sem React e sem backend), consumindo os dados reais das armas na [`valorant-api.com`](https://valorant-api.com/) e as últimas partidas competitivas na API da [`HenrikDev`](https://api.henrikdev.xyz/).

## Como rodar localmente

1. Instale as dependências (apenas o Vite):
   ```bash
   npm install
   ```
2. Crie um arquivo `.env` na raiz baseado no `.env.example`:
   ```env
   VITE_USE_MOCK=false
   VITE_HENRIK_API_KEY=sua_chave_aqui
   VITE_HENRIK_REGION=br
   ```
3. Inicie o servidor:
   ```bash
   npm run dev
   ```
