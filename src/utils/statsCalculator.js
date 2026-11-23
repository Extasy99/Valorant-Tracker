/**
 * Motor de cálculo de estatísticas de armas.
 * Totalmente independente da origem dos dados (Mock ou API oficial da Riot).
 */

export function calcularEstatisticasArmas(partidas, mapaArmas) {
  const acumulado = {};
  let totalRoundsGeral = 0;

  const garantirArma = (armaId) => {
    const id = armaId?.toLowerCase();
    if (!id || !mapaArmas[id]) return null;

    if (!acumulado[id]) {
      acumulado[id] = {
        ...mapaArmas[id],
        abates: 0,
        roundsUsada: 0,
        danoTotal: 0,
        tirosCabeca: 0,
        tirosCorpo: 0,
        tirosPerna: 0,
      };
    }
    return acumulado[id];
  };

  for (const partida of partidas) {
    for (const round of partida.rounds || []) {
      totalRoundsGeral += 1;

      // 1. Contabiliza abates pela arma que finalizou o oponente
      for (const abate of round.abates || []) {
        const entry = garantirArma(abate.armaId);
        if (entry) {
          entry.abates += 1;
        }
      }

      // 2. Contabiliza dano, tiros e rounds jogados pela arma equipada
      const equipada = garantirArma(round.armaEquipadaId);
      if (equipada) {
        equipada.roundsUsada += 1;
        equipada.danoTotal += round.dano || 0;
        equipada.tirosCabeca += round.headshots || 0;
        equipada.tirosCorpo += round.bodyshots || 0;
        equipada.tirosPerna += round.legshots || 0;
      }
    }
  }

  const listaArmas = Object.values(acumulado)
    .map((arma) => {
      const totalTiros = arma.tirosCabeca + arma.tirosCorpo + arma.tirosPerna;
      const hsPercent = totalTiros > 0 ? (arma.tirosCabeca / totalTiros) * 100 : 0;
      const bodyPercent = totalTiros > 0 ? (arma.tirosCorpo / totalTiros) * 100 : 0;
      const legPercent = totalTiros > 0 ? (arma.tirosPerna / totalTiros) * 100 : 0;
      const danoPorRound = arma.roundsUsada > 0 ? arma.danoTotal / arma.roundsUsada : 0;
      const abatesPorRound = arma.roundsUsada > 0 ? arma.abates / arma.roundsUsada : 0;

      return {
        ...arma,
        totalTiros,
        hsPercent: Number(hsPercent.toFixed(1)),
        bodyPercent: Number(bodyPercent.toFixed(1)),
        legPercent: Number(legPercent.toFixed(1)),
        danoPorRound: Math.round(danoPorRound),
        abatesPorRound: Number(abatesPorRound.toFixed(2)),
      };
    })
    .sort((a, b) => b.abates - a.abates);

  // Resumo geral do jogador
  const totais = listaArmas.reduce(
    (acc, a) => {
      acc.abates += a.abates;
      acc.dano += a.danoTotal;
      acc.cabeca += a.tirosCabeca;
      acc.totalTiros += a.totalTiros;
      return acc;
    },
    { abates: 0, dano: 0, cabeca: 0, totalTiros: 0 }
  );

  const resumo = {
    totalAbates: totais.abates,
    totalDano: totais.dano,
    totalRounds: totalRoundsGeral,
    hsMedio: totais.totalTiros > 0 ? Number(((totais.cabeca / totais.totalTiros) * 100).toFixed(1)) : 0,
    danoMedioRound: totalRoundsGeral > 0 ? Math.round(totais.dano / totalRoundsGeral) : 0,
    armaFavorita: listaArmas[0] || null,
  };

  return { armas: listaArmas, resumo };
}
