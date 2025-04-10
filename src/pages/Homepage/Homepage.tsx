import React, { useState, useEffect } from 'react';
import ChoiceBtnList from '../../components/PokeballAnswers/PokeballAnswers';
import PokemonCard from '../../components/PokemonCard/PokemonCard';
import QuestionArea from '../../components/QuestionArea/QuestionArea';
import './Homepage.scss';
import pokinatorMascot from '../../img/pokinator_mascot.png';
import topBackgroundImg from '../../img/pokemon_map.png';
import pokinatorLogo from '../../img/pokinator_logo.png';
import PopupPokemonDetails from '../../components/PopupPokemonDetails/PopupPokemonDetails';
import { PokemonData } from '../../types/PokemonData';

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
    const iaContext: ChatBody = {
        "messages": [{
            "role": "system",
            "content": `Tu joues à un jeu avec moi. Voici les règles, je vais penser à un pokemon, tu dois deviner lequel` +
            `en me posant des questions à laquelle je devrais repondre par "oui", "non" ou "je sais pas". Les nom des pokemons seront en français.` +
            `La réponse devra être dans un format json. Un 1er attribut nommé "type" contenant soit "question" si le contenu est une question,` +
            `soit "answer" si le contenu est une tentative à trouver un pokemon. Le second attribut "content" contiendra le contenu de ta question ou reponse.` +
            `Lorsque le type est "answer" le content contiendra uniquement le nom du pokemeon et rien d'autre.Ta reponse devra comporter uniquement le json.`
        }]
    };
    const [ pokemonNamesList, setPokemonNameList ] = useState<String[]>([]);
    const [pokemonData, setPokemonData] = useState<PokemonData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorType | null>(null);
    const [typeIcons, setTypeIcons] = useState<{ name: string; image: string }[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<PokemonData | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<string>('');
    const [bodyPokemon, setBodyPokemon] = useState<ChatBody>(iaContext);

    useEffect(() => {
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
            } catch (error) {
                console.error('Erreur lors de la récupération des icônes de type:', error);
            }
        };

        fetchPokemonData(pokemonNamesList);
        fetchTypeIcons();
        postAnswer(bodyPokemon);
    }, []);

    const fetchPokemonData = async (pokemons: String[]) => {
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
                pokemons.some(
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

    const postAnswer = async (body: { messages: ChatMessage[]}) => {
      try {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        };
        const response = await fetch('chat', requestOptions);
        if (!response.ok) {
            const errorMessage = `Erreur HTTP lors de l'envoi de la réponse: Statut ${response.status}`;
            console.error('Erreur lors de l\'envoi de la réponse:', errorMessage);
            return;
        }
        const data: ChatMessage = await response.json(); // Type la réponse de l'API
        setBodyPokemon({
            messages: [...body.messages, data] // Ajoute le nouveau message au tableau
        });

        const botResponse = JSON.parse(data.content.substring(7, data.content.length - 3));

        setCurrentQuestion(botResponse.type !== "answer" ? botResponse.content : `Penses tu au pokemon ${botResponse.content}?`);
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
        const lastMessage = bodyPokemon.messages[bodyPokemon.messages.length - 1];
        const msgContent = lastMessage.content;
        const msgContentJson = JSON.parse(msgContent.substring(7, msgContent.length - 3))
        if (lastMessage.role === "assistant" && msgContentJson.type === "answer" && answer === "oui") {
            const pokedex = [
                ...pokemonNamesList, msgContentJson.content
            ];
            setPokemonNameList(pokedex);
            fetchPokemonData(pokedex);
            setBodyPokemon(iaContext);
            postAnswer(iaContext);
        } else {
            postAnswer({
                messages: [...bodyPokemon.messages, {
                    role: "user",
                    content: answer
                }]
            });
        }

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
            </div>
            <PopupPokemonDetails
                pokemon={selectedPokemon}
                isOpen={isPopupOpen}
                onClose={handleClosePopup}
                typeIcons={typeIcons}
                pokemonList={allPokemon}
            />
        </div>
    );
}

export default Homepage;