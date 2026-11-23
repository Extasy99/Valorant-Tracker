import React from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';

export default function WeaponFilters({
  categorias,
  categoriaAtiva,
  onCategoriaChange,
  ordenacao,
  onOrdenacaoChange,
  filtroNome,
  onFiltroNomeChange,
}) {
  return (
    <div className="filters-bar">
      <div className="category-tabs">
        <button
          type="button"
          className={`tab-btn ${categoriaAtiva === 'Todas' ? 'active' : ''}`}
          onClick={() => onCategoriaChange('Todas')}
        >
          Todas
        </button>
        {categorias.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`tab-btn ${categoriaAtiva === cat ? 'active' : ''}`}
            onClick={() => onCategoriaChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="filters-right">
        <div className="mini-input">
          <Filter size={15} />
          <input
            type="text"
            value={filtroNome}
            onChange={(e) => onFiltroNomeChange(e.target.value)}
            placeholder="Filtrar arma..."
          />
        </div>

        <div className="mini-select">
          <ArrowUpDown size={15} />
          <select value={ordenacao} onChange={(e) => onOrdenacaoChange(e.target.value)}>
            <option value="abates">Mais Abates</option>
            <option value="hsPercent">Maior HS%</option>
            <option value="danoPorRound">Maior Dano/Round</option>
            <option value="abatesPorRound">Maior Abates/Round</option>
            <option value="roundsUsada">Mais Rounds Usada</option>
          </select>
        </div>
      </div>
    </div>
  );
}
