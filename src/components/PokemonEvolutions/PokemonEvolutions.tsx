import React from 'react';
import './PokemonEvolutions.scss';
import { PokemonData } from '../../types/PokemonData';

interface PokemonEvolutionsProps {
  pokemonList: PokemonData[];
  pokemon: PokemonData;
  appLanguage: string;
}

function getTypeColor(typeName: string): string {
  switch (typeName) {
    case 'Normal': return '#A8A878';
    case 'Feu': return '#F08030';
    case 'Eau': return '#6890F0';
    case 'Plante': return '#78C850';
    case 'Électrik': return '#F8D030';
    case 'Glace': return '#98D8D8';
    case 'Combat': return '#C03028';
    case 'Poison': return '#A040A0';
    case 'Sol': return '#E0C068';
    case 'Vol': return '#A890F0';
    case 'Psy': return '#F85888';
    case 'Insecte': return '#A8B820';
    case 'Roche': return '#B8A038';
    case 'Spectre': return '#705898';
    case 'Dragon': return '#7038F8';
    case 'Ténèbres': return '#705848';
    case 'Acier': return '#B8B8D0';
    case 'Fée': return '#EE99AC';
    default: return '#f0f0f0';
  }
}

function PokemonEvolutions({ pokemonList, pokemon, appLanguage }: PokemonEvolutionsProps) {
  return (
    <div className="evolution_container">
      {/* Évolutions précédentes */}
      {pokemon.evolution?.pre?.map((preEvolution) => {
        const evoData = pokemonList.find(p => p.name.fr === preEvolution.name);
        const typeColor = evoData ? getTypeColor(evoData.types[0]?.name) : '#f0f0f0';

        return (
          <div
            key={preEvolution.name}
            className="evolution"
            style={{ backgroundColor: typeColor }}
          >
            {evoData && (
              <img
                src={evoData.sprites.regular}
                alt={evoData.name[appLanguage as keyof typeof evoData.name]}
                className="evolution-img"
              />
            )}
            <p>{evoData?.name[appLanguage as keyof typeof evoData.name]}</p>
          </div>
        );
      })}

      {/* Pokémon actuel */}
      <div
        className="evolution"
        style={{ backgroundColor: getTypeColor(pokemon.types[0]?.name) }}
      >
        <img src={pokemon.sprites.regular} alt={pokemon.name.fr} className="evolution-img" />
        <p>{pokemon.name[appLanguage as keyof typeof pokemon.name]}</p>
      </div>

      {/* Évolutions suivantes */}
      {pokemon.evolution?.next?.map((nextEvolution) => {
        const evoData = pokemonList.find(p => p.name.fr === nextEvolution.name);
        const typeColor = evoData ? getTypeColor(evoData.types[0]?.name) : '#f0f0f0';

        return (
          <div
            key={nextEvolution.name}
            className="evolution"
            style={{ backgroundColor: typeColor }}
          >
            {evoData && (
              <img
                src={evoData.sprites.regular}
                alt={evoData.name[appLanguage as keyof typeof evoData.name]}
                className="evolution-img"
              />
            )}
            <p>{evoData?.name[appLanguage as keyof typeof evoData.name]}</p>
          </div>
        );
      })}
    </div>
  );
}

export default PokemonEvolutions;
