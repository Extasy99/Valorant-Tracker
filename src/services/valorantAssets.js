const CACHE_KEY = 'valtrack_weapons_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 horas

/**
 * Busca todas as armas na API pública valorant-api.com (em pt-BR)
 * e devolve um dicionário indexado pelo UUID em minúsculo.
 */
export async function carregarMapaDeArmas(forcarAtualizacao = false) {
  if (!forcarAtualizacao) {
    try {
      const cachedRaw = localStorage.getItem(CACHE_KEY);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (Date.now() - cached.timestamp < CACHE_TTL_MS && cached.data) {
          return cached.data;
        }
      }
    } catch {
      // Ignora erro de cache e segue para o fetch
    }
  }

  const response = await fetch('https://valorant-api.com/v1/weapons?language=pt-BR');
  if (!response.ok) {
    throw new Error(`Falha ao buscar armas na valorant-api.com (HTTP ${response.status})`);
  }

  const json = await response.json();
  const mapaArmas = {};

  for (const arma of json.data || []) {
    const uuid = arma.uuid.toLowerCase();
    mapaArmas[uuid] = {
      uuid,
      nome: arma.displayName,
      icone: arma.displayIcon,
      killfeedIcon: arma.killStreamIcon || arma.displayIcon,
      categoria: arma.shopData?.categoryText || 'Corpo a corpo',
      custo: arma.shopData?.cost ?? 0,
      fichaTecnica: {
        cadenciaTiro: arma.weaponStats?.fireRate ?? null,
        tamanhoPente: arma.weaponStats?.magazineSize ?? null,
        tempoRecarga: arma.weaponStats?.reloadTimeSeconds ?? null,
        tempoEquipar: arma.weaponStats?.equipTimeSeconds ?? null,
        precisaoPrimeiroTiro: arma.weaponStats?.firstBulletAccuracy ?? null,
        penetracaoParede: traduzirPenetracao(arma.weaponStats?.wallPenetration),
        faixasDano: (arma.weaponStats?.damageRanges || []).map((faixa) => ({
          inicio: faixa.rangeStartMeters,
          fim: faixa.rangeEndMeters,
          cabeca: Math.round(faixa.headDamage),
          corpo: Math.round(faixa.bodyDamage),
          perna: Math.round(faixa.legDamage),
        })),
      },
    };
  }

  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ timestamp: Date.now(), data: mapaArmas })
    );
  } catch {
    // Ignora caso localStorage esteja cheio ou bloqueado
  }

  return mapaArmas;
}

function traduzirPenetracao(valor) {
  if (!valor) return 'N/A';
  if (valor.includes('High')) return 'Alta';
  if (valor.includes('Medium')) return 'Média';
  if (valor.includes('Low')) return 'Baixa';
  return 'N/A';
}
