import './PokemonCard.scss';
import pokeball from '../../img/pokeball.png';

interface PokemonCardProps {
  pokemonName: string;
  imageUrl?: string;
  types: { name: string; image: string }[];
  onCardClick: (pokemon: any) => void;
  pokemonData?: any;
}

function PokemonCard({ pokemonName, imageUrl, types, onCardClick, pokemonData }: PokemonCardProps) {
  const cardStyle = {
    backgroundColor: types && types.length > 0 ? getTypeColor(types[0].name) : '#f0f0f0',
  };

  return (
    <div className="pokemon_card" style={cardStyle} onClick={() => onCardClick(pokemonData)}>
      <img src={imageUrl || pokeball} alt={pokemonName} className="pokemon_card_image" />
      <div className="type_icons">
        {types && types.map((type) => (
          <div className="type_icon">
            <img key={type.name} src={type.image} alt={type.name} className='card_type_icon' />
          </div>
        ))}
      </div>
      <h1>{pokemonName}</h1>
    </div>
  );
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

export default PokemonCard;