import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import './app.css';

const queryClient = new QueryClient();

// API'den Pokemon listesini alacak özel bir hook
function useFetchPokemonList(searchTerm) {
  return useQuery(['pokemonList', searchTerm], async () => {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=10&offset=0&search=${searchTerm}`
    );
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  });
}

// API'den seçilen Pokemon'un detaylarını alacak özel bir hook
function useFetchPokemonDetails(pokemonName) {
  return useQuery(
    ['pokemonDetails', pokemonName],
    async () => {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
    { enabled: !!pokemonName } // Pokemon seçildiğinde sorguyu etkinleştir
  );
}

function PokemonList({ searchTerm, onSelect }) {
  const { data, status } = useFetchPokemonList(searchTerm);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'error') return <div>Error loading data</div>;

  return (
    <ul>
      {data.results.map((pokemon) => (
        <li key={pokemon.name} onClick={() => onSelect(pokemon.name)}>
          {pokemon.name}
        </li>
      ))}
    </ul>
  );
}

function PokemonDetails({ pokemonName }) {
  const { data, status } = useFetchPokemonDetails(pokemonName);

  if (status === 'loading') return <div>Loading...</div>;
  if (status === 'error') return <div>Error loading data</div>;
  if (!data) return null;

  const sprites = Object.values(data.sprites).filter(
    (sprite) => sprite !== null
  );

  return (
    <div>
      <h2>{data.name}</h2>
      <div className="pokemon-images">
        {sprites.map((sprite, index) => (
          <img key={index} src={sprite} alt={`${data.name} sprite`} />
        ))}
      </div>
      <p>
        Height: {data.height * 10} cm | Weight: {data.weight / 10} kg
      </p>
    </div>
  );
}
function App() {
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container">
        <h1>Pokemon List</h1>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for a Pokemon..."
        />
        <div className="pokemon-list">
          <PokemonList searchTerm={searchTerm} onSelect={setSelectedPokemon} />
        </div>
        <h1>Pokemon Details</h1>
        <div className="pokemon-details">
          <PokemonDetails pokemonName={selectedPokemon} />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;