import React from 'react';
import { Flame, Target, Award, Zap } from 'lucide-react';

export default function SummaryCards({ resumo, jogador }) {
  if (!resumo) return null;

  return (
    <section className="summary-section">
      <div className="player-banner">
        <div>
          <span className="player-region">{jogador.regiao}</span>
          <h1 className="player-name">{jogador.riotId}</h1>
        </div>
        <div className="player-meta">
          <span>{jogador.partidasAnalisadas} partidas analisadas</span>
          <span>•</span>
          <span>{resumo.totalRounds} rounds</span>
        </div>
      </div>

      <div className="summary-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span>Total de Abates</span>
            <Flame size={18} className="accent-red" />
          </div>
          <div className="stat-card-value">{resumo.totalAbates.toLocaleString('pt-BR')}</div>
          <div className="stat-card-sub">Em todas as categorias</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Headshot Médio</span>
            <Target size={18} className="accent-cyan" />
          </div>
          <div className="stat-card-value">{resumo.hsMedio}%</div>
          <div className="stat-card-sub">Precisão de tiros na cabeça</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Dano / Round</span>
            <Zap size={18} className="accent-gold" />
          </div>
          <div className="stat-card-value">{resumo.danoMedioRound}</div>
          <div className="stat-card-sub">{resumo.totalDano.toLocaleString('pt-BR')} de dano total</div>
        </div>

        <div className="stat-card stat-card-featured">
          <div className="stat-card-header">
            <span>Arma Principal</span>
            <Award size={18} className="accent-red" />
          </div>
          {resumo.armaFavorita ? (
            <div className="featured-weapon">
              <div>
                <div className="stat-card-value">{resumo.armaFavorita.nome}</div>
                <div className="stat-card-sub">
                  {resumo.armaFavorita.abates} abates • {resumo.armaFavorita.hsPercent}% HS
                </div>
              </div>
              <img
                src={resumo.armaFavorita.icone}
                alt={resumo.armaFavorita.nome}
                className="featured-weapon-img"
              />
            </div>
          ) : (
            <div className="stat-card-sub">Sem dados</div>
          )}
        </div>
      </div>
    </section>
  );
}
