import React, { useState, useEffect } from 'react';
import ChoiceBtnList from '../../components/PokeballAnswers/PokeballAnswers';
import PokemonCard from '../../components/PokemonCard/PokemonCard';
import QuestionArea from '../../components/QuestionArea/QuestionArea';
import './Homepage.scss';
import pokinatorMascot from '../../img/pokinator_mascot.png';
import topBackgroundImg from '../../img/pokemon_map.png';
import pokinatorLogo from '../../img/pokinator_logo.png';
import PopupPokemonDetails from '../../components/PopupPokemonDetails/PopupPokemonDetails';

interface PokemonData {
    pokedex_id: number;
    name: {
        fr: string;
        en: string;
        jp: string;
    };
    sprites: {
        regular: string;
        shiny: string | null;
        gmax: {
            regular: string;
            shiny: string;
        } | null;
    };
    types: {
        name: string;
    }[];
    // ... autres propriétés
}

interface ErrorType {
    message: string;
}

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface ChatBody {
    messages: ChatMessage[];
}

function Homepage() {
    const pokemonNamesList = ['Bulbizarre', 'Salamèche', 'Carapuce', 'Pikachu', 'Rondoudou', 'Mewtwo', 'Mew', 'Groudon', 'Embrylex', 'Léviator']; // Liste des noms de Pokémon à afficher
    const [pokemonData, setPokemonData] = useState<PokemonData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorType | null>(null);
    const [typeIcons, setTypeIcons] = useState<{ name: string; image: string }[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<PokemonData | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [bodyPokemon, setBodyPokemon] = useState<ChatBody>({
      "messages": [{
          "role": "system",
          "content": "Tu joues à un jeu avec moi. Voici les règles, je vais penser à un pokemon, tu dois deviner lequel en me posant des questions à laquelle je devrais repondre par \"oui\", \"non\" ou \"je sais pas\". Il ne devra pas y avoir de commentaire inutile dan ta question. Les nom des pokemon seront en français."
      }]
  });
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPokemon),
    };

    useEffect(() => {
        const fetchPokemonData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch('https://tyradex.vercel.app/api/v1/pokemon');
                if (!response.ok) {
                    const errorMessage = `Erreur HTTP! Statut: ${response.status}`;
                    console.error('Erreur lors de la récupération des données Pokémon:', errorMessage);
                    throw new Error(errorMessage);
                }
                const allPokemon: PokemonData[] = await response.json();
                console.log('Données Pokémon récupérées avec succès:', allPokemon);

                const filteredPokemon = allPokemon.filter((pokemon) =>
                    pokemonNamesList.some(
                        (name) => pokemon.name.fr === name || pokemon.name.en === name
                    )
                );

                setPokemonData(filteredPokemon);
            } catch (e: any) {
                let message = 'Une erreur inconnue est survenue lors de la récupération des données Pokémon.';
                if (e instanceof Error) {
                    message = e.message;
                } else if (typeof e === 'string') {
                    message = e;
                }
                setError({ message });
                console.error('Erreur lors de la récupération des données Pokémon:', e);
            } finally {
                setLoading(false);
            }
        };

        const fetchTypeIcons = async () => {
            try {
                const response = await fetch('https://pokebuildapi.fr/api/v1/types');
                if (!response.ok) {
                    const errorMessage = `Erreur HTTP! Statut: ${response.status}`;
                    console.error('Erreur lors de la récupération des icônes de type:', errorMessage);
                    throw new Error(errorMessage);
                }
                const data = await response.json();
                setTypeIcons(data);
                console.log('Icônes de type récupérées avec succès:', data);
            } catch (error) {
                console.error('Erreur lors de la récupération des icônes de type:', error);
            }
        };

        fetchPokemonData();
        fetchTypeIcons();
        postAnswer();
    }, []);

    const postAnswer = async (answer?: string) => {
      try {
          const response = await fetch('chat', requestOptions);
          console.warn(requestOptions)
          if (!response.ok) {
              const errorMessage = `Erreur HTTP lors de l'envoi de la réponse: Statut ${response.status}`;
              console.error('Erreur lors de l\'envoi de la réponse:', errorMessage);
              return;
          }
          const data: ChatMessage = await response.json(); // Type la réponse de l'API
          setBodyPokemon(prevBodyPokemon => ({
              messages: [...prevBodyPokemon.messages, data] // Ajoute le nouveau message au tableau
          }));
          console.log('Réponse envoyée et reçue avec succès:', data);
          setCurrentQuestion(data.content);
      } catch (error) {
          console.error('Erreur lors de l\'envoi de la réponse ou du traitement de la réponse:', error);
      }
  };

    const getPokemonTypesWithIcons = (pokemonTypes: { name: string }[]) => {
        return pokemonTypes.map((type) => {
            const icon = typeIcons.find((icon) => icon.name === type.name);
            return {
                name: type.name,
                image: icon ? icon.image : '',
            };
        });
    };

    const modifyBodyAndPost = (answer: string) => {
      setBodyPokemon(prevBodyPokemon => ({
          messages: [...prevBodyPokemon.messages, {
              role: "user",
              content: answer
          }]
      }));
      postAnswer();
  };

    const handleCardClick = (pokemon: PokemonData) => {
        setSelectedPokemon(pokemon);
        setIsPopupOpen(true);
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setSelectedPokemon(null);
    };

    if (loading) {
        return <div>Chargement...</div>;
    }

    if (error) {
        return <div>Erreur: {error.message}</div>;
    }

    return (
        <div className="homepage_container">
            <div className="homepage_top_container">
                <div className="homepage_left_container">
                    <img src={pokinatorMascot} alt="" className='pokinator_mascot' />
                    <img src={pokinatorLogo} alt="" className='pokinator_logo' />
                </div>
                <div className="homepage_right_container">
                    <div className="choice_btn_list_container">
                        <ChoiceBtnList onAnswer={modifyBodyAndPost} />
                    </div>
                    <div className="question_area_container">
                        <QuestionArea question={currentQuestion} />
                    </div>
                </div>
            </div>
            <div className="hommepage_bottom_container">
                {pokemonData.map((pokemon: PokemonData) => (
                    <PokemonCard
                        key={pokemon.pokedex_id}
                        pokemonName={pokemon.name.fr}
                        imageUrl={pokemon.sprites.regular}
                        types={getPokemonTypesWithIcons(pokemon.types)}
                        onCardClick={handleCardClick}
                        pokemonData={pokemon}
                    />
                ))}
            </div>
            <div className="homepage-background-container">
                <img src={topBackgroundImg} alt="" />
            </div>&
            <PopupPokemonDetails
                pokemon={selectedPokemon}
                isOpen={isPopupOpen}
                onClose={handleClosePopup}
                typeIcons={typeIcons} // Passer typeIcons ici
            />
        </div>
    );
}

export default Homepage;