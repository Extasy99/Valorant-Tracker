/**
 * Integração REAL com a API de partidas (via seu Backend Proxy).
 *
 * IMPORTANTE:
 * Nunca coloque sua RIOT_API_KEY diretamente no frontend (navegador),
 * pois além de expor sua chave publicamente, a API da Riot bloqueia CORS.
 *
 * Fluxo recomendado em produção:
 * Frontend (este arquivo) -> Seu Backend (server/riotProxyExample.js) -> Riot Games API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Busca partidas reais no seu backend e normaliza para o formato interno do site.
 * @param {string} riotId Ex: "Nome#TAG"
 */
export async function buscarPartidasRiot(riotId) {
  const [gameName, tagLine] = riotId.split('#');
  if (!gameName || !tagLine) {
    throw new Error('Informe o Riot ID no formato Nome#TAG (ex: Aspas#BR1).');
  }

  const url = `${API_BASE_URL}/api/matches/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
  const response = await fetch(url);

  if (!response.ok) {
    const erro = await response.json().catch(() => ({}));
    throw new Error(erro.message || `Erro ao consultar partidas na API (HTTP ${response.status})`);
  }

  const dados = await response.json();

  // Converte o JSON bruto da Riot (VAL-MATCH-V1) para o formato padrão interno
  return {
    jogador: {
      riotId: `${dados.gameName}#${dados.tagLine}`,
      regiao: dados.region || 'BR',
      partidasAnalisadas: dados.matches.length,
    },
    partidas: dados.matches.map((partida) => normalizarPartidaRiot(partida, dados.puuid)),
  };
}

/**
 * Traduz uma partida da API oficial VAL-MATCH-V1 da Riot para o formato interno
 * esperado por `utils/statsCalculator.js`.
 */
export function normalizarPartidaRiot(partidaRiot, puuidJogador) {
  const rounds = (partidaRiot.roundResults || []).map((round) => {
    const playerRound = (round.playerStats || []).find((p) => p.puuid === puuidJogador);

    if (!playerRound) {
      return {
        numero: round.roundNum + 1,
        armaEquipadaId: null,
        abates: [],
        dano: 0,
        headshots: 0,
        bodyshots: 0,
        legshots: 0,
      };
    }

    const abates = (playerRound.kills || [])
      .map((k) => ({
        armaId: k.finishingDamage?.damageItem?.toLowerCase() || null,
      }))
      .filter((k) => Boolean(k.armaId));

    let dano = 0;
    let headshots = 0;
    let bodyshots = 0;
    let legshots = 0;

    for (const d of playerRound.damage || []) {
      dano += d.damage || 0;
      headshots += d.headshots || 0;
      bodyshots += d.bodyshots || 0;
      legshots += d.legshots || 0;
    }

    return {
      numero: round.roundNum + 1,
      armaEquipadaId: playerRound.economy?.weapon?.toLowerCase() || null,
      abates,
      dano,
      headshots,
      bodyshots,
      legshots,
    };
  });

  return {
    matchId: partidaRiot.matchInfo?.matchId || 'unknown',
    mapa: partidaRiot.matchInfo?.mapId || 'Desconhecido',
    rounds,
  };
}
