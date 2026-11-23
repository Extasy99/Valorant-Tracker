# VALTRACK — Rastreador de Estatísticas de Armas no Valorant

Projeto completo em **React + Vite** no estilo Tracker.gg, estruturado com **Adapter Pattern** para consumir os dados reais de armas da [`valorant-api.com`](https://valorant-api.com/) hoje e permitir conectar a API oficial de partidas da Riot Games (`VAL-MATCH-V1`) no futuro sem alterar a interface nem os cálculos.

## O que já funciona pronto

- **Integração real com `valorant-api.com`:** nomes em pt-BR, ícones, categorias, custos, cadência, recarga, penetração e tabela de dano por distância (com cache automático de 24h no `localStorage`).
- **Motor de estatísticas (`src/utils/statsCalculator.js`):** calcula Abates, Abates/Round, Dano/Round, % de Headshot, Corpo e Perna, Arma Principal e resumo geral.
- **Modo Mock realista (`src/services/mockMatches.js`):** gera 20 partidas simuladas usando os UUIDs reais das armas para qualquer `Nome#TAG` digitado.
- **Interface completa:** busca por Riot ID, cards de resumo, filtros por categoria, ordenação, barra visual de precisão e modal com ficha técnica completa de cada arma.

## Como rodar localmente

Requisitos: **Node.js 18+** instalado.

```bash
# 1. Instale as dependências
npm install

# 2. Inicie o servidor de desenvolvimento
npm run dev
```

Abra o endereço exibido no terminal (geralmente `http://localhost:5173`).

## Como plugar a API real de partidas depois

1. Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
   ```env
   VITE_USE_MOCK=false
   VITE_API_BASE_URL=http://localhost:3001
   ```
2. Suba o backend proxy usando o modelo pronto em `server/riotProxyExample.js` com a sua `RIOT_API_KEY` (nunca exponha a chave da Riot diretamente no frontend).
3. Pronto — o arquivo `src/services/matchProvider.js` troca automaticamente do Mock para `src/services/riotMatches.js`.
