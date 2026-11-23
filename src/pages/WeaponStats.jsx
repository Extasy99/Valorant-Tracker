import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import SummaryCards from '../components/SummaryCards.jsx';
import WeaponFilters from '../components/WeaponFilters.jsx';
import WeaponTable from '../components/WeaponTable.jsx';
import WeaponModal from '../components/WeaponModal.jsx';
import { carregarMapaDeArmas } from '../services/valorantAssets.js';
import { buscarPartidasDoJogador, USAR_MOCK } from '../services/matchProvider.js';
import { calcularEstatisticasArmas } from '../utils/statsCalculator.js';

export default function WeaponStats() {
  const [mapaArmas, setMapaArmas] = useState(null);
  const [riotId, setRiotId] = useState('Aspas#BR1');
  const [dadosJogador, setDadosJogador] = useState(null);
  const [armasStats, setArmasStats] = useState([]);
  const [resumo, setResumo] = useState(null);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Filtros e ordenação
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');
  const [ordenacao, setOrdenacao] = useState('abates');
  const [filtroNome, setFiltroNome] = useState('');
  const [armaSelecionada, setArmaSelecionada] = useState(null);

  // 1. Carrega os dados estáticos das armas da valorant-api.com uma única vez
  useEffect(() => {
    let ativo = true;
    async function iniciar() {
      try {
        setCarregando(true);
        const mapa = await carregarMapaDeArmas();
        if (!ativo) return;
        setMapaArmas(mapa);
      } catch (err) {
        if (!ativo) return;
        setErro(err.message || 'Erro ao carregar dados da valorant-api.com');
        setCarregando(false);
      }
    }
    iniciar();
    return () => {
      ativo = false;
    };
  }, []);

  // 2. Sempre que o Riot ID mudar (e o mapa de armas já estiver pronto), busca as partidas
  useEffect(() => {
    if (!mapaArmas) return;
    let ativo = true;

    async function carregarEstatisticas() {
      try {
        setErro('');
        setCarregando(true);
        const resultado = await buscarPartidasDoJogador(riotId, mapaArmas);
        if (!ativo) return;

        const { armas, resumo: novoResumo } = calcularEstatisticasArmas(
          resultado.partidas,
          mapaArmas
        );

        setDadosJogador(resultado.jogador);
        setArmasStats(armas);
        setResumo(novoResumo);
      } catch (err) {
        if (!ativo) return;
        setErro(err.message || 'Erro ao buscar estatísticas do jogador.');
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarEstatisticas();
    return () => {
      ativo = false;
    };
  }, [riotId, mapaArmas]);

  const categorias = useMemo(() => {
    const set = new Set(armasStats.map((a) => a.categoria));
    return Array.from(set).sort();
  }, [armasStats]);

  const armasFiltradas = useMemo(() => {
    return armasStats
      .filter((arma) => {
        if (categoriaAtiva !== 'Todas' && arma.categoria !== categoriaAtiva) return false;
        if (filtroNome && !arma.nome.toLowerCase().includes(filtroNome.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => b[ordenacao] - a[ordenacao]);
  }, [armasStats, categoriaAtiva, filtroNome, ordenacao]);

  return (
    <div className="app-shell">
      <Header riotIdAtual={riotId} onBuscar={setRiotId} carregando={carregando} />

      <main className="container main-content">
        {USAR_MOCK && (
          <div className="info-banner">
            <strong>Modo Simulação ativo:</strong> Os ícones, preços e fichas técnicas das armas vêm em tempo real da{' '}
            <code>valorant-api.com</code>, enquanto as partidas são simuladas em <code>src/services/mockMatches.js</code>.
            Quando tiver a API da Riot, basta configurar <code>VITE_USE_MOCK=false</code> no <code>.env</code>.
          </div>
        )}

        {erro && <div className="error-banner">{erro}</div>}

        {carregando && !resumo ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Carregando dados das armas e calculando estatísticas...</p>
          </div>
        ) : (
          <>
            {dadosJogador && <SummaryCards resumo={resumo} jogador={dadosJogador} />}

            <section className="table-section">
              <div className="section-header">
                <h2>Desempenho por Arma</h2>
                <span className="hint">Clique em qualquer arma para ver a ficha técnica completa</span>
              </div>

              <WeaponFilters
                categorias={categorias}
                categoriaAtiva={categoriaAtiva}
                onCategoriaChange={setCategoriaAtiva}
                ordenacao={ordenacao}
                onOrdenacaoChange={setOrdenacao}
                filtroNome={filtroNome}
                onFiltroNomeChange={setFiltroNome}
              />

              <WeaponTable
                armas={armasFiltradas}
                onSelecionarArma={setArmaSelecionada}
              />
            </section>
          </>
        )}
      </main>

      <WeaponModal arma={armaSelecionada} onClose={() => setArmaSelecionada(null)} />

      <footer className="footer">
        <div className="container">
          Dados estáticos de armas fornecidos por{' '}
          <a href="https://valorant-api.com" target="_blank" rel="noreferrer">
            valorant-api.com
          </a>
          . Este projeto não é afiliado à Riot Games.
        </div>
      </footer>
    </div>
  );
}
