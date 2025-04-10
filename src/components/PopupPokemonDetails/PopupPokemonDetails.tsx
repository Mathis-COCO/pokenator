import React from 'react';
import './PopupPokemonDetails.scss';
import { PokemonData } from '../../types/PokemonData';
import PokemonStats from '../PokemonStats/PokemonStats';
import PokemonEvolutions from '../PokemonEvolutions/PokemonEvolutions';

interface TypeIcon {
  name: string;
  image: string;
}

interface PopupPokemonDetailsProps {
  pokemon: PokemonData | null;
  isOpen: boolean;
  onClose: () => void;
  typeIcons: TypeIcon[];
  pokemonList: PokemonData[];
}

function getTypeColor(typeName: string): string {
  switch (typeName) {
    case 'Normal':
      return '#A8A878';
    case 'Feu':
      return '#F08030';
    case 'Eau':
      return '#6890F0';
    case 'Plante':
      return '#78C850';
    case 'Électrik':
      return '#F8D030';
    case 'Glace':
      return '#98D8D8';
    case 'Combat':
      return '#C03028';
    case 'Poison':
      return '#A040A0';
    case 'Sol':
      return '#E0C068';
    case 'Vol':
      return '#A890F0';
    case 'Psy':
      return '#F85888';
    case 'Insecte':
      return '#A8B820';
    case 'Roche':
      return '#B8A038';
    case 'Spectre':
      return '#705898';
    case 'Dragon':
      return '#7038F8';
    case 'Ténèbres':
      return '#705848';
    case 'Acier':
      return '#B8B8D0';
    case 'Fée':
      return '#EE99AC';
    default:
      return '#f0f0f0';
  }
}

function PopupPokemonDetails({ pokemon, isOpen, onClose, typeIcons, pokemonList }: PopupPokemonDetailsProps) {
  if (!isOpen || !pokemon) {
    return null;
  }

  console.log(pokemon)

  const mainType = pokemon.types[0]?.name;
  const mainTypeColor = mainType ? getTypeColor(mainType) : '#f0f0f0';
  const mainTypeIcon = mainType
    ? typeIcons.find((icon) => icon.name === mainType)?.image
    : null;

  return (
  <div className="popup-overlay">
      <button className="close-button" onClick={onClose}>
        X
      </button>
      <div className="popup-content" style={{ backgroundColor: mainTypeColor }}>
        <div className="left_container">
          <div className="pokemon_main_infos_container">
            <div className="pokemon_details">
              <h2>{pokemon.name.fr}</h2>
              <div className="pokemon_physical_details">
                <h3>{pokemon.height}</h3>
                <h3>{pokemon.weight}</h3>              
              </div>
            </div>
            <div className="pokemon_types_container">
              {pokemon.types.map((type) => (
                <div className="pokemon_type_img_container">
                  <img src={typeIcons.find(icon => icon.name === type.name)?.image} alt={type.name} className='pokemon_type_img' />
                </div>
              ))}
            </div>
          </div>

          <img src={pokemon.sprites.regular} alt={pokemon.name.fr} className="pokemon-sprite" />

          {mainTypeIcon && (
            <div className="main-type-icon">
              <img src={mainTypeIcon} alt={mainType} />
            </div>
          )}     
          <h2 className="pokemon_category">{pokemon.category}</h2>     
        </div>
        <div className="right_container">
          <PokemonEvolutions pokemon={pokemon} pokemonList={pokemonList} />
          <h3>Génération {pokemon.generation}</h3>
          <h3>Taux de capture : {pokemon.catch_rate}%</h3>
          <PokemonStats pokemonStats={pokemon.stats} />
          <p className='resistances_text'>Résistances : </p>
          <div className="resistances_container">
            {pokemon.resistances.map((resistance) => {
                const resistanceIcon = typeIcons.find(icon => icon.name === resistance.name)?.image;
                return (
                    <div key={resistance.name} className="resistance">
                        {resistanceIcon ? (
                          <div className="type_icon">
                            <img src={resistanceIcon} alt={resistance.name} className="resistance_icon" />
                          </div>
                        ) : (
                            <p>{resistance.name}</p>
                        )}
                        <h4>{resistance.multiplier}x</h4>
                    </div>
                );
            })}
        </div>

        </div>


        {/* <div className="pokemon-types">
          Types: {pokemon.types.map((type) => (
            <span key={type.name} className={`type ${type.name}`}>{type.name}</span>
          ))}
        </div>
        {pokemon.sprites.shiny && (
          <div className="shiny-sprite">
            <p>Shiny:</p>
            <img src={pokemon.sprites.shiny} alt={`${pokemon.name.fr} shiny`} />
          </div>
        )}
        {pokemon.sprites.gmax?.regular && (
          <div className="gmax-sprite">
            <p>Gigamax:</p>
            <img src={pokemon.sprites.gmax.regular} alt={`${pokemon.name.fr} gigamax`} />
          </div>
        )}
        {pokemon.sprites.gmax?.shiny && (
          <div className="shiny-gmax-sprite">
            <p>Gigamax Shiny:</p>
            <img src={pokemon.sprites.gmax.shiny} alt={`${pokemon.name.fr} gigamax shiny`} />
          </div>
        )} */}
        {/* Ajoutez d'autres informations que vous souhaitez afficher */}
      </div>
    </div>
  );
}

export default PopupPokemonDetails;