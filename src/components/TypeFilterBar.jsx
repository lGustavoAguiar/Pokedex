import { useEffect, useState } from 'react';
import { getPokemonTypes } from '../data/pokemonApi';
import './TypeFilterBar.css';

const TypeFilterBar = ({ onTypeSelect, selectedType }) => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getPokemonTypes();
        setTypes(result.types || result);
      } catch (err) {
        setError('Erro ao carregar tipos');
      } finally {
        setLoading(false);
      }
    };
    fetchTypes();
  }, []);

  if (loading) return <div className="type-filter-bar">Carregando tipos...</div>;
  if (error) return <div className="type-filter-bar error">{error}</div>;

  return (
    <div className="type-filter-bar">
      <button
        className={`type-btn${!selectedType ? ' active' : ''}`}
        onClick={() => onTypeSelect('')}
      >
        Todos
      </button>
      {types.map((type) => (
        <button
          key={type}
          className={`type-btn${selectedType === type ? ' active' : ''}`}
          onClick={() => onTypeSelect(type)}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default TypeFilterBar;
