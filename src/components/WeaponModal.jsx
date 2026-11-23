import React from 'react';
import { X } from 'lucide-react';

export default function WeaponModal({ arma, onClose }) {
  if (!arma) return null;

  const { fichaTecnica } = arma;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </button>

        <div className="modal-header">
          <span className="category-pill">{arma.categoria}</span>
          <h2>{arma.nome}</h2>
          <p className="modal-cost">
            Custo na loja: <strong>{arma.custo > 0 ? `${arma.custo} créditos` : 'Grátis'}</strong>
          </p>
        </div>

        <div className="modal-hero">
          <img src={arma.icone} alt={arma.nome} />
        </div>

        <div className="modal-section">
          <h3>Desempenho do Jogador</h3>
          <div className="modal-stats-grid">
            <div className="mini-stat">
              <span>Abates</span>
              <strong>{arma.abates}</strong>
            </div>
            <div className="mini-stat">
              <span>Headshot %</span>
              <strong className="accent-cyan">{arma.hsPercent}%</strong>
            </div>
            <div className="mini-stat">
              <span>Dano / Round</span>
              <strong>{arma.danoPorRound}</strong>
            </div>
            <div className="mini-stat">
              <span>Rounds Usada</span>
              <strong>{arma.roundsUsada}</strong>
            </div>
          </div>
        </div>

        <div className="modal-section">
          <h3>Ficha Técnica (valorant-api.com)</h3>
          <div className="specs-grid">
            <div>
              <span>Cadência</span>
              <strong>{fichaTecnica.cadenciaTiro ? `${fichaTecnica.cadenciaTiro} tiros/s` : 'N/A'}</strong>
            </div>
            <div>
              <span>Pente</span>
              <strong>{fichaTecnica.tamanhoPente ?? 'N/A'}</strong>
            </div>
            <div>
              <span>Recarga</span>
              <strong>{fichaTecnica.tempoRecarga ? `${fichaTecnica.tempoRecarga}s` : 'N/A'}</strong>
            </div>
            <div>
              <span>Penetração</span>
              <strong>{fichaTecnica.penetracaoParede}</strong>
            </div>
          </div>

          {fichaTecnica.faixasDano.length > 0 && (
            <table className="damage-table">
              <thead>
                <tr>
                  <th>Distância</th>
                  <th>Cabeça</th>
                  <th>Corpo</th>
                  <th>Perna</th>
                </tr>
              </thead>
              <tbody>
                {fichaTecnica.faixasDano.map((f, idx) => (
                  <tr key={idx}>
                    <td>{f.inicio}m – {f.fim}m</td>
                    <td className="accent-red">{f.cabeca}</td>
                    <td>{f.corpo}</td>
                    <td>{f.perna}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
