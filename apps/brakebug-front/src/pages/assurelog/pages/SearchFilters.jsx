import { useState, useEffect } from 'react';
import '../stylesassure/searchfilter.css';

const defaultFilters = {
  search: '',
  responsible: '',
  date_from: '',
  date_to: '',
  status: '',
  feature: '',
  environment: '',
  sort_by: 'created_at',
  sort_order: 'desc'
};

const SearchFilter = ({
  filters: initialFilters = {},
  suggestions = {},
  onFiltersChange
}) => {
  const [filters, setFilters] = useState({
    ...defaultFilters,
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'sort_by' && value === 'created_at') return false;
    if (key === 'sort_order' && value === 'desc') return false;
    return value !== '';
  });

  return (
    <div className="search-filter">
      {/* Busca principal */}
      <div className="search-main">
        <input
          type="text"
          placeholder="Buscar por título, responsável, descrição..."
          value={filters.search}
          onChange={e => updateFilter('search', e.target.value)}
        />

        <button
          type="button"
          className="btn-outline"
          onClick={() => setShowAdvanced(v => !v)}
        >
          Filtros
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn-outline"
            onClick={clearFilters}
          >
            Limpar
          </button>
        )}
      </div>

      {/* Filtros avançados */}
      {showAdvanced && (
        <div className="search-advanced">
          <div className="filter-grid">
            <div className="form-field">
              <label>Responsável</label>
              <select
                value={filters.responsible}
                onChange={e => updateFilter('responsible', e.target.value)}
              >
                <option value="">Todos</option>
                {suggestions.responsible?.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={e => updateFilter('status', e.target.value)}
              >
                <option value="">Todos</option>
                {suggestions.status?.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-grid">
            <div className="form-field">
              <label>Data inicial</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={e => updateFilter('date_from', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Data final</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={e => updateFilter('date_to', e.target.value)}
              />
            </div>
          </div>

          <div className="filter-grid">
            <div className="form-field">
              <label>Feature / Cenário</label>
              <select
                value={filters.feature}
                onChange={e => updateFilter('feature', e.target.value)}
              >
                <option value="">Todas</option>
                {suggestions.feature?.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Ambiente</label>
              <select
                value={filters.environment}
                onChange={e => updateFilter('environment', e.target.value)}
              >
                <option value="">Todos</option>
                {suggestions.environment?.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-grid">
            <div className="form-field">
              <label>Ordenar por</label>
              <select
                value={filters.sort_by}
                onChange={e => updateFilter('sort_by', e.target.value)}
              >
                <option value="created_at">Criação</option>
                <option value="date">Data do teste</option>
                <option value="title">Título</option>
                <option value="made_by">Responsável</option>
              </select>
            </div>

            <div className="form-field">
              <label>Ordem</label>
              <button
                type="button"
                className="btn-outline"
                onClick={() =>
                  updateFilter(
                    'sort_order',
                    filters.sort_order === 'asc' ? 'desc' : 'asc'
                  )
                }
              >
                {filters.sort_order === 'asc'
                  ? 'Crescente'
                  : 'Decrescente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
