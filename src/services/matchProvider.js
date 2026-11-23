import { buscarPartidasMock } from './mockMatches.js';
import { buscarPartidasRiot } from './riotMatches.js';

export const USAR_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

export async function buscarPartidasDoJogador(riotId, mapaArmas) {
  if (USAR_MOCK) {
    return buscarPartidasMock(riotId, mapaArmas);
  }
  return buscarPartidasRiot(riotId);
}
