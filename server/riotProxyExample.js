/**
 * EXEMPLO DE BACKEND PROXY (Node.js + Express)
 *
 * Use este arquivo como base quando conseguir sua Production API Key no
 * Riot Developer Portal (https://developer.riotgames.com/).
 *
 * Para rodar este servidor separado:
 *   npm init -y && npm install express cors dotenv
 *   RIOT_API_KEY=RGAPI-xxxx node riotProxyExample.js
 */

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const ACCOUNT_REGION = 'americas'; // americas | europe | asia
const VAL_SHARD = 'br';            // br | na | latam | eu | ap | kr

app.get('/api/matches/:gameName/:tagLine', async (req, res) => {
  try {
    if (!RIOT_API_KEY) {
      return res.status(500).json({ message: 'RIOT_API_KEY não configurada no servidor.' });
    }

    const { gameName, tagLine } = req.params;
    const headers = { 'X-Riot-Token': RIOT_API_KEY };

    // 1. Buscar PUUID pelo Riot ID (ACCOUNT-V1)
    const accRes = await fetch(
      `https://${ACCOUNT_REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers }
    );
    if (!accRes.ok) {
      return res.status(accRes.status).json({ message: 'Jogador não encontrado na Riot API.' });
    }
    const account = await accRes.json();

    // 2. Buscar lista de matchIds recentes (VAL-MATCH-V1)
    const listRes = await fetch(
      `https://${VAL_SHARD}.api.riotgames.com/val/match/v1/matchlists/by-puuid/${account.puuid}`,
      { headers }
    );
    if (!listRes.ok) {
      return res.status(listRes.status).json({ message: 'Erro ao buscar histórico de partidas (verifique sua Production Key).' });
    }
    const matchlist = await listRes.json();

    // Limita às 10 partidas mais recentes para respeitar rate limits
    const ultimas = (matchlist.history || []).slice(0, 10);

    // 3. Buscar detalhes de cada partida
    const matches = await Promise.all(
      ultimas.map(async (item) => {
        const mRes = await fetch(
          `https://${VAL_SHARD}.api.riotgames.com/val/match/v1/matches/${item.matchId}`,
          { headers }
        );
        return mRes.ok ? mRes.json() : null;
      })
    );

    res.json({
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
      region: VAL_SHARD.toUpperCase(),
      matches: matches.filter(Boolean),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(3001, () => {
  console.log('Riot Proxy rodando em http://localhost:3001');
});
