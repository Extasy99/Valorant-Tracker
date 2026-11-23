import { buscarPartidasMock } from './mockMatches.js';
import { buscarPartidasRiot } from './riotMatches.js';

/**
 * CHAVE SELETORA (Adapter Pattern)
 *
 * Por padrão, roda em modo Mock (true).
 * Quando você tiver a API de partidas pronta, crie um arquivo `.env` na raiz
 * com `VITE_USE_MOCK=false` e o site passará a consumir `riotMatches.js`
 * sem precisar alterar nenhum componente visual ou cálculo.
 */
export const USAR_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export async function buscarPartidasDoJogador(riotId, mapaArmas) {
  if (USAR_MOCK) {
    return buscarPartidasMock(riotId, mapaArmas);
  }
  return buscarPartidasRiot(riotId);
}
