const HENRIK_API_KEY = import.meta.env.VITE_HENRIK_API_KEY;
const REGIAO = import.meta.env.VITE_HENRIK_REGION || 'br';

/**
 * Busca partidas reais diretamente no navegador usando a API da HenrikDev
 * e converte para o formato interno padrão do projeto.
 * @param {string} riotId Ex: "Nome#TAG"
 */
export async function buscarPartidasRiot(riotId) {
  const [gameName, tagLine] = riotId.split('#');
  if (!gameName || !tagLine) {
    throw new Error('Informe o Riot ID no formato Nome#TAG (ex: Aspas#BR1).');
  }

  if (!HENRIK_API_KEY) {
    throw new Error('Chave VITE_HENRIK_API_KEY não encontrada no arquivo .env.');
  }

  const url = `https://api.henrikdev.xyz/valorant/v3/matches/${REGIAO}/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}?mode=competitive&size=10`;

  const response = await fetch(url, {
    headers: {
      Authorization: HENRIK_API_KEY,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Jogador "${riotId}" não encontrado na região ${REGIAO.toUpperCase()}.`);
    }
    if (response.status === 429) {
      throw new Error('Limite de requisições da API atingido. Aguarde alguns segundos e tente novamente.');
    }
    throw new Error(`Erro na API HenrikDev (HTTP ${response.status}).`);
  }

  const json = await response.json();
  const partidasBrutas = json.data || [];

  if (partidasBrutas.length === 0) {
    throw new Error(`Nenhuma partida recente encontrada para "${riotId}".`);
  }

  return {
    jogador: {
      riotId: `${gameName}#${tagLine}`,
      regiao: REGIAO.toUpperCase(),
      partidasAnalisadas: partidasBrutas.length,
    },
    partidas: partidasBrutas.map((partida) =>
      normalizarPartidaHenrik(partida, gameName, tagLine)
    ),
  };
}

/**
 * Traduz uma partida da HenrikDev (v3/matches) para o formato interno
 * esperado por `utils/statsCalculator.js`.
 */
function normalizarPartidaHenrik(partida, gameName, tagLine) {
  const alvoNome = gameName.toLowerCase();
  const alvoTag = tagLine.toLowerCase();

  const jogadorInfo = (partida.players?.all_players || []).find(
    (p) => p.name?.toLowerCase() === alvoNome && p.tag?.toLowerCase() === alvoTag
  );
  const puuidJogador = jogadorInfo?.puuid;
  const displayAlvo = `${alvoNome}#${alvoTag}`;

  const rounds = (partida.rounds || []).map((round, index) => {
    const playerRound = (round.player_stats || []).find((p) =>
      puuidJogador
        ? p.player_puuid === puuidJogador
        : p.player_display_name?.toLowerCase() === displayAlvo
    );

    if (!playerRound) {
      return {
        numero: index + 1,
        armaEquipadaId: null,
        abates: [],
        dano: 0,
        headshots: 0,
        bodyshots: 0,
        legshots: 0,
      };
    }

    const abates = (playerRound.kill_events || [])
      .map((k) => ({
        armaId: k.damage_weapon_id?.toLowerCase() || null,
      }))
      .filter((k) => Boolean(k.armaId));

    let dano = 0;
    let headshots = 0;
    let bodyshots = 0;
    let legshots = 0;

    for (const d of playerRound.damage_events || []) {
      dano += d.damage || 0;
      headshots += d.headshots || 0;
      bodyshots += d.bodyshots || 0;
      legshots += d.legshots || 0;
    }

    return {
      numero: index + 1,
      armaEquipadaId: playerRound.economy?.weapon?.id?.toLowerCase() || null,
      abates,
      dano,
      headshots,
      bodyshots,
      legshots,
    };
  });

  return {
    matchId: partida.metadata?.matchid || 'unknown',
    mapa: partida.metadata?.map || 'Desconhecido',
    rounds,
  };
}