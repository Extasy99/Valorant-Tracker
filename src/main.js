import './index.css';
import { carregarMapaDeArmas } from './services/valorantAssets.js';
import { buscarPartidasDoJogador, USAR_MOCK } from './services/matchProvider.js';
import { calcularEstatisticasArmas } from './utils/statsCalculator.js';

const SUGESTOES = ['Aspas#BR1', 'Less#LOUD', 'Sacy#SEN', 'TenZ#005'];

// Estado global simples da aplicação (substitui o useState do React)
const estado = {
  mapaArmas: null,
  riotId: 'Aspas#BR1',
  jogador: null,
  armasStats: [],
  resumo: null,
  categoriaAtiva: 'Todas',
  ordenacao: 'abates',
  filtroNome: '',
};

// Referências dos elementos HTML (DOM)
const elSearchForm = document.getElementById('search-form');
const elSearchInput = document.getElementById('search-input');
const elSearchBtn = document.getElementById('search-btn');
const elModeBadge = document.getElementById('mode-badge');
const elModeBadgeText = document.getElementById('mode-badge-text');
const elSuggestionsBar = document.getElementById('suggestions-bar');
const elInfoBanner = document.getElementById('info-banner');
const elErrorBanner = document.getElementById('error-banner');
const elLoadingState = document.getElementById('loading-state');
const elDashboard = document.getElementById('dashboard-content');
const elSummarySection = document.getElementById('summary-section');
const elCategoryTabs = document.getElementById('category-tabs');
const elFilterName = document.getElementById('filter-name');
const elSortSelect = document.getElementById('sort-select');
const elTableContainer = document.getElementById('table-container');
const elModal = document.getElementById('weapon-modal');

function inicializarInterface() {
  // Atualiza selo de modo (Mock vs API Real)
  elModeBadge.className = `mode-badge ${USAR_MOCK ? 'mock' : 'live'}`;
  elModeBadgeText.textContent = USAR_MOCK ? 'Modo Mock' : 'API Real';
  if (USAR_MOCK) {
    elInfoBanner.classList.remove('hidden');
  }

  renderizarSugestoes();

  // Evento de busca
  elSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const valor = elSearchInput.value.trim();
    if (!valor) return;
    const riotIdFormatado = valor.includes('#') ? valor : `${valor}#BR1`;
    elSearchInput.value = riotIdFormatado;
    carregarJogador(riotIdFormatado);
  });

  // Evento de filtro por nome
  elFilterName.addEventListener('input', (e) => {
    estado.filtroNome = e.target.value;
    renderizarTabela();
  });

  // Evento de ordenação
  elSortSelect.addEventListener('change', (e) => {
    estado.ordenacao = e.target.value;
    renderizarTabela();
  });

  // Fechar modal clicando fora ou pressionando ESC
  elModal.addEventListener('click', (e) => {
    if (e.target === elModal) fecharModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharModal();
  });
}

function renderizarSugestoes() {
  const botoesAntigos = elSuggestionsBar.querySelectorAll('.chip');
  botoesAntigos.forEach((b) => b.remove());

  SUGESTOES.forEach((id) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chip ${estado.riotId.toLowerCase() === id.toLowerCase() ? 'active' : ''}`;
    btn.textContent = id;
    btn.addEventListener('click', () => {
      elSearchInput.value = id;
      carregarJogador(id);
    });
    elSuggestionsBar.appendChild(btn);
  });
}

function mostrarErro(mensagem) {
  if (!mensagem) {
    elErrorBanner.classList.add('hidden');
    elErrorBanner.textContent = '';
    return;
  }
  elErrorBanner.textContent = mensagem;
  elErrorBanner.classList.remove('hidden');
}

function definirCarregando(carregando) {
  elSearchBtn.disabled = carregando;
  elSearchBtn.textContent = carregando ? 'Buscando...' : 'Analisar';
  if (carregando && !estado.resumo) {
    elLoadingState.classList.remove('hidden');
    elDashboard.classList.add('hidden');
  } else {
    elLoadingState.classList.add('hidden');
  }
}

async function carregarJogador(riotId) {
  if (!estado.mapaArmas) return;

  estado.riotId = riotId;
  renderizarSugestoes();
  mostrarErro('');
  definirCarregando(true);

  try {
    const resultado = await buscarPartidasDoJogador(riotId, estado.mapaArmas);
    const { armas, resumo } = calcularEstatisticasArmas(resultado.partidas, estado.mapaArmas);

    estado.jogador = resultado.jogador;
    estado.armasStats = armas;
    estado.resumo = resumo;
    estado.categoriaAtiva = 'Todas';

    elDashboard.classList.remove('hidden');
    renderizarResumo();
    renderizarCategorias();
    renderizarTabela();
  } catch (err) {
    mostrarErro(err.message || 'Erro ao buscar estatísticas do jogador.');
  } finally {
    definirCarregando(false);
  }
}

function renderizarResumo() {
  const { resumo, jogador } = estado;
  if (!resumo || !jogador) return;

  const favorita = resumo.armaFavorita
    ? `
      <div class="featured-weapon">
        <div>
          <div class="stat-card-value">${resumo.armaFavorita.nome}</div>
          <div class="stat-card-sub">
            ${resumo.armaFavorita.abates} abates • ${resumo.armaFavorita.hsPercent}% HS
          </div>
        </div>
        <img
          src="${resumo.armaFavorita.icone}"
          alt="${resumo.armaFavorita.nome}"
          class="featured-weapon-img"
        />
      </div>
    `
    : '<div class="stat-card-sub">Sem dados</div>';

  elSummarySection.innerHTML = `
    <div class="player-banner">
      <div>
        <span class="player-region">${jogador.regiao}</span>
        <h1 class="player-name">${jogador.riotId}</h1>
      </div>
      <div class="player-meta">
        <span>${jogador.partidasAnalisadas} partidas analisadas</span>
        <span>•</span>
        <span>${resumo.totalRounds} rounds</span>
      </div>
    </div>

    <div class="summary-grid">
      <div class="stat-card">
        <div class="stat-card-header"><span>Total de Abates</span></div>
        <div class="stat-card-value">${resumo.totalAbates.toLocaleString('pt-BR')}</div>
        <div class="stat-card-sub">Em todas as categorias</div>
      </div>

      <div class="stat-card">
        <div class="stat-card-header"><span>Headshot Médio</span></div>
        <div class="stat-card-value accent-cyan">${resumo.hsMedio}%</div>
        <div class="stat-card-sub">Precisão de tiros na cabeça</div>
      </div>

      <div class="stat-card">
        <div class="stat-card-header"><span>Dano / Round</span></div>
        <div class="stat-card-value accent-gold">${resumo.danoMedioRound}</div>
        <div class="stat-card-sub">${resumo.totalDano.toLocaleString('pt-BR')} de dano total</div>
      </div>

      <div class="stat-card stat-card-featured">
        <div class="stat-card-header"><span>Arma Principal</span></div>
        ${favorita}
      </div>
    </div>
  `;
}

function renderizarCategorias() {
  const categorias = ['Todas', ...Array.from(new Set(estado.armasStats.map((a) => a.categoria))).sort()];
  elCategoryTabs.innerHTML = '';

  categorias.forEach((cat) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `tab-btn ${estado.categoriaAtiva === cat ? 'active' : ''}`;
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      estado.categoriaAtiva = cat;
      renderizarCategorias();
      renderizarTabela();
    });
    elCategoryTabs.appendChild(btn);
  });
}

function renderizarTabela() {
  const filtradas = estado.armasStats
    .filter((arma) => {
      if (estado.categoriaAtiva !== 'Todas' && arma.categoria !== estado.categoriaAtiva) return false;
      if (estado.filtroNome && !arma.nome.toLowerCase().includes(estado.filtroNome.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => b[estado.ordenacao] - a[estado.ordenacao]);

  if (!filtradas.length) {
    elTableContainer.innerHTML = '<div class="empty-state">Nenhuma arma encontrada com os filtros atuais.</div>';
    return;
  }

  const linhas = filtradas
    .map(
      (arma) => `
      <tr class="weapon-row" data-uuid="${arma.uuid}" title="Clique para ver a ficha técnica completa">
        <td>
          <div class="weapon-cell">
            <div class="weapon-img-box">
              <img src="${arma.icone}" alt="${arma.nome}" loading="lazy" />
            </div>
            <div>
              <div class="weapon-name">${arma.nome}</div>
              <div class="weapon-cost">
                ${arma.custo > 0 ? `${arma.custo.toLocaleString('pt-BR')} créd.` : 'Grátis'}
              </div>
            </div>
          </div>
        </td>
        <td><span class="category-pill">${arma.categoria}</span></td>
        <td class="num strong">${arma.abates}</td>
        <td class="num">${arma.abatesPorRound.toFixed(2)}</td>
        <td class="num">${arma.danoPorRound}</td>
        <td>
          <div class="accuracy-bar-wrap">
            <div class="accuracy-bar">
              <div class="bar-hs" style="width: ${arma.hsPercent}%" title="Cabeça: ${arma.hsPercent}%"></div>
              <div class="bar-body" style="width: ${arma.bodyPercent}%" title="Corpo: ${arma.bodyPercent}%"></div>
              <div class="bar-leg" style="width: ${arma.legPercent}%" title="Perna: ${arma.legPercent}%"></div>
            </div>
            <div class="accuracy-legend">
              <span class="dot-hs">${arma.hsPercent}%</span>
              <span class="dot-body">${arma.bodyPercent}%</span>
              <span class="dot-leg">${arma.legPercent}%</span>
            </div>
          </div>
        </td>
        <td class="num">
          <span class="hs-badge ${arma.hsPercent >= 30 ? 'high' : ''}">${arma.hsPercent}%</span>
        </td>
      </tr>
    `
    )
    .join('');

  elTableContainer.innerHTML = `
    <div class="table-wrapper">
      <table class="weapon-table">
        <thead>
          <tr>
            <th>Arma</th>
            <th>Categoria</th>
            <th class="num">Abates</th>
            <th class="num">Abates / Rd</th>
            <th class="num">Dano / Rd</th>
            <th>Precisão (Cabeça / Corpo / Perna)</th>
            <th class="num">HS%</th>
          </tr>
        </thead>
        <tbody>${linhas}</tbody>
      </table>
    </div>
  `;

  // Adiciona evento de clique em cada linha para abrir o modal
  elTableContainer.querySelectorAll('.weapon-row').forEach((row) => {
    row.addEventListener('click', () => {
      const arma = filtradas.find((a) => a.uuid === row.dataset.uuid);
      if (arma) abrirModal(arma);
    });
  });
}

function abrirModal(arma) {
  const { fichaTecnica } = arma;

  const tabelaDano = fichaTecnica.faixasDano.length
    ? `
      <table class="damage-table">
        <thead>
          <tr>
            <th>Distância</th>
            <th>Cabeça</th>
            <th>Corpo</th>
            <th>Perna</th>
          </tr>
        </thead>
        <tbody>
          ${fichaTecnica.faixasDano
            .map(
              (f) => `
            <tr>
              <td>${f.inicio}m – ${f.fim}m</td>
              <td class="accent-red">${f.cabeca}</td>
              <td>${f.corpo}</td>
              <td>${f.perna}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `
    : '';

  elModal.innerHTML = `
    <div class="modal-card">
      <button type="button" id="modal-close-btn" class="modal-close" aria-label="Fechar">✕</button>

      <div class="modal-header">
        <span class="category-pill">${arma.categoria}</span>
        <h2>${arma.nome}</h2>
        <p class="modal-cost">
          Custo na loja: <strong>${arma.custo > 0 ? `${arma.custo} créditos` : 'Grátis'}</strong>
        </p>
      </div>

      <div class="modal-hero">
        <img src="${arma.icone}" alt="${arma.nome}" />
      </div>

      <div class="modal-section">
        <h3>Desempenho do Jogador</h3>
        <div class="modal-stats-grid">
          <div class="mini-stat"><span>Abates</span><strong>${arma.abates}</strong></div>
          <div class="mini-stat"><span>Headshot %</span><strong class="accent-cyan">${arma.hsPercent}%</strong></div>
          <div class="mini-stat"><span>Dano / Round</span><strong>${arma.danoPorRound}</strong></div>
          <div class="mini-stat"><span>Rounds Usada</span><strong>${arma.roundsUsada}</strong></div>
        </div>
      </div>

      <div class="modal-section">
        <h3>Ficha Técnica (valorant-api.com)</h3>
        <div class="specs-grid">
          <div><span>Cadência</span><strong>${fichaTecnica.cadenciaTiro ? `${fichaTecnica.cadenciaTiro} tiros/s` : 'N/A'}</strong></div>
          <div><span>Pente</span><strong>${fichaTecnica.tamanhoPente ?? 'N/A'}</strong></div>
          <div><span>Recarga</span><strong>${fichaTecnica.tempoRecarga ? `${fichaTecnica.tempoRecarga}s` : 'N/A'}</strong></div>
          <div><span>Penetração</span><strong>${fichaTecnica.penetracaoParede}</strong></div>
        </div>
        ${tabelaDano}
      </div>
    </div>
  `;

  elModal.classList.remove('hidden');
  document.getElementById('modal-close-btn').addEventListener('click', fecharModal);
}

function fecharModal() {
  elModal.classList.add('hidden');
  elModal.innerHTML = '';
}

// Ponto de entrada: carrega armas da valorant-api.com e depois busca o primeiro jogador
async function iniciar() {
  inicializarInterface();
  definirCarregando(true);
  try {
    estado.mapaArmas = await carregarMapaDeArmas();
    await carregarJogador(estado.riotId);
  } catch (err) {
    mostrarErro(err.message || 'Erro ao carregar dados da valorant-api.com');
    definirCarregando(false);
  }
}

iniciar();
