import { useState, useEffect, useRef } from 'react';
import '../stylesassure/quicksearch.css';

const QuickSearch = ({ onSearch, onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      try {
        setLoading(true);
        const data = await onSearch(query.trim());
        setResults(data || []);
        setShowResults(true);
        setSelectedIndex(-1);
      } catch (err) {
        console.error(err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, onSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!showResults || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % results.length);
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i =>
        i <= 0 ? results.length - 1 : i - 1
      );
    }

    if (e.key === 'Enter' && selectedIndex >= 0) {
      handleSelect(results[selectedIndex]);
    }

    if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  const handleSelect = (result) => {
    setQuery('');
    setShowResults(false);
    setSelectedIndex(-1);
    onSelectResult(result);
  };

  return (
    <div className="quick-search" ref={containerRef}>
      <input
        type="text"
        placeholder="Busca rápida..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => results.length && setShowResults(true)}
      />

      {loading && <div className="quick-search-loading">Buscando...</div>}

      {showResults && (
        <div className="quick-search-results">
          {results.length === 0 && !loading && (
            <div className="quick-search-empty">
              Nenhum resultado encontrado
            </div>
          )}

          {results.map((item, index) => (
            <div
              key={`${item.type}-${item.id}`}
              className={`quick-search-item ${
                index === selectedIndex ? 'active' : ''
              }`}
              onClick={() => handleSelect(item)}
            >
              <div className="qs-title">{item.title}</div>
              <div className="qs-subtitle">{item.subtitle}</div>
              <span className={`qs-tag ${item.type}`}>
                {item.type === 'report'
                  ? 'Relatório'
                  : 'Caso de Teste'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickSearch;
