/**
 * Gerador determinístico de partidas simuladas (Mock).
 * Usa os UUIDs REAIS retornados pela valorant-api.com.
 */

const PERFIL_ARMAS = [
  { nome: 'Vandal', peso: 28, hsBase: 0.34, danoMedio: 158 },
  { nome: 'Phantom', peso: 20, hsBase: 0.28, danoMedio: 146 },
  { nome: 'Ghost', peso: 10, hsBase: 0.38, danoMedio: 108 },
  { nome: 'Sheriff', peso: 9, hsBase: 0.44, danoMedio: 142 },
  { nome: 'Classic', peso: 8, hsBase: 0.26, danoMedio: 84 },
  { nome: 'Operator', peso: 7, hsBase: 0.14, danoMedio: 165 },
  { nome: 'Spectre', peso: 6, hsBase: 0.21, danoMedio: 122 },
  { nome: 'Guardian', peso: 4, hsBase: 0.48, danoMedio: 150 },
  { nome: 'Marshal', peso: 3, hsBase: 0.41, danoMedio: 130 },
  { nome: 'Outlaw', peso: 3, hsBase: 0.22, danoMedio: 148 },
  { nome: 'Bulldog', peso: 3, hsBase: 0.27, danoMedio: 132 },
  { nome: 'Judge', peso: 2, hsBase: 0.11, danoMedio: 138 },
  { nome: 'Odin', peso: 2, hsBase: 0.17, danoMedio: 144 },
  { nome: 'Stinger', peso: 2, hsBase: 0.19, danoMedio: 112 },
  { nome: 'Frenzy', peso: 2, hsBase: 0.22, danoMedio: 96 },
  { nome: 'Shorty', peso: 1, hsBase: 0.12, danoMedio: 105 },
  { nome: 'Bucky', peso: 1, hsBase: 0.14, danoMedio: 118 },
  { nome: 'Ares', peso: 1, hsBase: 0.18, danoMedio: 125 },
];

const MAPAS = ['Ascent', 'Haven', 'Bind', 'Split', 'Lotus', 'Sunset', 'Abyss', 'Pearl'];

function hashString(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function criarGeradorAleatorio(seed) {
  let state = seed || 123456789;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function sortearArma(armasDisponiveis, rand) {
  const somaPesos = armasDisponiveis.reduce((acc, a) => acc + a.peso, 0);
  let alvo = rand() * somaPesos;
  for (const item of armasDisponiveis) {
    alvo -= item.peso;
    if (alvo <= 0) return item;
  }
  return armasDisponiveis[0];
}

export async function buscarPartidasMock(riotId, mapaArmas) {
  await new Promise((resolve) => setTimeout(resolve, 350));

  const porNome = {};
  for (const arma of Object.values(mapaArmas)) {
    porNome[arma.nome.toLowerCase()] = arma.uuid;
  }

  const armasDisponiveis = PERFIL_ARMAS
    .map((p) => ({
      ...p,
      uuid: porNome[p.nome.toLowerCase()],
    }))
    .filter((p) => Boolean(p.uuid));

  const rand = criarGeradorAleatorio(hashString(riotId.toLowerCase().trim()));
  const totalPartidas = 20;
  const partidas = [];
  const bonusPrecisao = (rand() - 0.45) * 0.1;

  for (let m = 0; m < totalPartidas; m++) {
    const totalRounds = 18 + Math.floor(rand() * 8);
    const rounds = [];

    for (let r = 0; r < totalRounds; r++) {
      const escolhida = sortearArma(armasDisponiveis, rand);

      const rollKills = rand();
      let qtdAbates = 0;
      if (rollKills > 0.96) qtdAbates = 4;
      else if (rollKills > 0.86) qtdAbates = 3;
      else if (rollKills > 0.65) qtdAbates = 2;
      else if (rollKills > 0.32) qtdAbates = 1;

      const abates = Array.from({ length: qtdAbates }, () => ({
        armaId: escolhida.uuid,
      }));

      const totalTiros = qtdAbates > 0
        ? qtdAbates * (1 + Math.floor(rand() * 3))
        : (rand() > 0.5 ? 1 + Math.floor(rand() * 2) : 0);

      const taxaHs = Math.min(0.65, Math.max(0.05, escolhida.hsBase + bonusPrecisao));
      let headshots = 0;
      let bodyshots = 0;
      let legshots = 0;

      for (let t = 0; t < totalTiros; t++) {
        const tiro = rand();
        if (tiro < taxaHs) headshots++;
        else if (tiro < taxaHs + (1 - taxaHs) * 0.85) bodyshots++;
        else legshots++;
      }

      const dano = qtdAbates > 0
        ? Math.round(qtdAbates * escolhida.danoMedio * (0.85 + rand() * 0.3))
        : (totalTiros > 0 ? Math.round(totalTiros * 36) : 0);

      rounds.push({
        numero: r + 1,
        armaEquipadaId: escolhida.uuid,
        abates,
        dano,
        headshots,
        bodyshots,
        legshots,
      });
    }

    partidas.push({
      matchId: `mock-${hashString(riotId)}-${m + 1}`,
      mapa: MAPAS[Math.floor(rand() * MAPAS.length)],
      rounds,
    });
  }

  return {
    jogador: {
      riotId,
      regiao: 'BR',
      partidasAnalisadas: partidas.length,
    },
    partidas,
  };
}
