import React, { useState } from 'react';
import { Crosshair, Search, Database, Wifi } from 'lucide-react';
import { USAR_MOCK } from '../services/matchProvider.js';

const SUGESTOES = ['Aspas#BR1', 'Less#LOUD', 'Sacy#SEN', 'TenZ#005'];

export default function Header({ riotIdAtual, onBuscar, carregando }) {
  const [input, setInput] = useState(riotIdAtual);

  const handleSubmit = (e) => {
    e.preventDefault();
    const valor = input.trim();
    if (!valor) return;
    onBuscar(valor.includes('#') ? valor : `${valor}#BR1`);
  };

  const handleSugestao = (id) => {
    setInput(id);
    onBuscar(id);
  };

  return (
    <header className="header">
      <div className="container header-inner">
        <div className="brand">
          <div className="brand-icon">
            <Crosshair size={22} />
          </div>
          <div>
            <span className="brand-title">VALTRACK</span>
            <span className="brand-subtitle">Weapon Analytics</span>
          </div>
        </div>

        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite um Riot ID (ex: Nome#BR1)"
              aria-label="Buscar Riot ID"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={carregando}>
            {carregando ? 'Buscando...' : 'Analisar'}
          </button>
        </form>

        <div className={`mode-badge ${USAR_MOCK ? 'mock' : 'live'}`} title={
          USAR_MOCK
            ? 'Usando partidas simuladas + ícones reais da valorant-api.com'
            : 'Conectado à API real de partidas'
        }>
          {USAR_MOCK ? <Database size={14} /> : <Wifi size={14} />}
          <span>{USAR_MOCK ? 'Modo Mock' : 'API Real'}</span>
        </div>
      </div>

      <div className="container suggestions-bar">
        <span className="suggestions-label">Perfis rápidos:</span>
        {SUGESTOES.map((id) => (
          <button
            key={id}
            type="button"
            className={`chip ${riotIdAtual.toLowerCase() === id.toLowerCase() ? 'active' : ''}`}
            onClick={() => handleSugestao(id)}
          >
            {id}
          </button>
        ))}
      </div>
    </header>
  );
}
