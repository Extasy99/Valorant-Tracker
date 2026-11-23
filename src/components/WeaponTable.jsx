import React from 'react';

export default function WeaponTable({ armas, onSelecionarArma }) {
  if (!armas.length) {
    return (
      <div className="empty-state">
        Nenhuma arma encontrada com os filtros atuais.
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="weapon-table">
        <thead>
          <tr>
            <th>Arma</th>
            <th>Categoria</th>
            <th className="num">Abates</th>
            <th className="num">Abates / Rd</th>
            <th className="num">Dano / Rd</th>
            <th>Precisão (Cabeça / Corpo / Perna)</th>
            <th className="num">HS%</th>
          </tr>
        </thead>
        <tbody>
          {armas.map((arma) => (
            <tr
              key={arma.uuid}
              onClick={() => onSelecionarArma(arma)}
              className="weapon-row"
              title="Clique para ver a ficha técnica completa"
            >
              <td>
                <div className="weapon-cell">
                  <div className="weapon-img-box">
                    <img src={arma.icone} alt={arma.nome} loading="lazy" />
                  </div>
                  <div>
                    <div className="weapon-name">{arma.nome}</div>
                    <div className="weapon-cost">
                      {arma.custo > 0 ? `${arma.custo.toLocaleString('pt-BR')} créd.` : 'Grátis'}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <span className="category-pill">{arma.categoria}</span>
              </td>
              <td className="num strong">{arma.abates}</td>
              <td className="num">{arma.abatesPorRound.toFixed(2)}</td>
              <td className="num">{arma.danoPorRound}</td>
              <td>
                <div className="accuracy-bar-wrap">
                  <div className="accuracy-bar">
                    <div
                      className="bar-hs"
                      style={{ width: `${arma.hsPercent}%` }}
                      title={`Cabeça: ${arma.hsPercent}%`}
                    />
                    <div
                      className="bar-body"
                      style={{ width: `${arma.bodyPercent}%` }}
                      title={`Corpo: ${arma.bodyPercent}%`}
                    />
                    <div
                      className="bar-leg"
                      style={{ width: `${arma.legPercent}%` }}
                      title={`Perna: ${arma.legPercent}%`}
                    />
                  </div>
                  <div className="accuracy-legend">
                    <span className="dot-hs">{arma.hsPercent}%</span>
                    <span className="dot-body">{arma.bodyPercent}%</span>
                    <span className="dot-leg">{arma.legPercent}%</span>
                  </div>
                </div>
              </td>
              <td className="num">
                <span className={`hs-badge ${arma.hsPercent >= 30 ? 'high' : ''}`}>
                  {arma.hsPercent}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
