import React from 'react';
import './PokemonStats.scss';
import { PokemonData } from '../../types/PokemonData';

interface PokemonStatsProps {
  pokemonStats: {
    hp: number;
    atk: number;
    def: number;
    spe_atk: number;
    spe_def: number;
  };
}
function PokemonStats({ pokemonStats }: PokemonStatsProps) {

  return (
    <div className="stats_container">
        <div>
            <h4>PV</h4>
            <h4>{pokemonStats.hp}</h4>
        </div>
        <div>
            <h4>ATK</h4>
            <h4>{pokemonStats.atk}</h4>
        </div>
        <div>
            <h4>DEF</h4>
            <h4>{pokemonStats.def}</h4>
        </div>
        <div>
            <h4>ATK SPE</h4>
            <h4>{pokemonStats.spe_atk}</h4>
        </div>
        <div>
            <h4>DEF SPE</h4>
            <h4>{pokemonStats.spe_def}</h4>
        </div>
    </div>
  );
}

export default PokemonStats;