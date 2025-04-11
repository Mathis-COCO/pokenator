import React, { useState, useEffect } from 'react';
import ChoiceBtnList from '../../components/PokeballAnswers/PokeballAnswers';
import PokemonCard from '../../components/PokemonCard/PokemonCard';
import QuestionArea from '../../components/QuestionArea/QuestionArea';
import './Homepage.scss';
import pokinatorMascot from '../../img/pokinator_mascot.png';
import topBackgroundImg from '../../img/pokemon_map.png';
import pokinatorLogo from '../../img/pokinator_logo.png';
import settings_icon from '../../img/settings_icon.png';
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
    const [iaContext, setIaContext] = useState<ChatBody>({
        "messages": [{
            "role": "system",
            "content": `Tu joues à un jeu avec moi. Voici les règles, je vais penser à un pokemon, tu dois deviner lequel` +
            `en me posant des questions à laquelle je devrais repondre par "oui", "non" ou "je sais pas". Les nom des pokemons seront en français.` +
            `La réponse devra être dans un format json. Un 1er attribut nommé "type" contenant soit "question" si le contenu est une question,` +
            `soit "answer" si le contenu est une tentative à trouver un pokemon. Le second attribut "content" contiendra le contenu de ta question ou reponse.` +
            `Lorsque le type est "answer" le content contiendra uniquement le nom du pokemeon et rien d'autre.Ta reponse devra comporter uniquement le json.`
        }]
    });
    const [ pokedex, setPokedex ] = useState<String[]>([]);
    const [pokemonData, setPokemonData] = useState<PokemonData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorType | null>(null);
    const [typeIcons, setTypeIcons] = useState<{ name: string; image: string }[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<PokemonData | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [appLanguage, setAppLanguage] = useState('fr');
    const [settingsView, setSettingsView] = useState(false);
    const [AiTemperature, setAiTemperature] = useState(1);
    const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
    const [allPokemon, setAllPokemon] = useState<PokemonData[]>([]);
    const [bodyPokemon, setBodyPokemon] = useState<ChatBody>(iaContext);

    useEffect(() => {
        const storedLanguage = localStorage.getItem('appLanguage');
        if (storedLanguage) {
            setAppLanguage(JSON.parse(storedLanguage));
        }

        loadData();
    }, []);

    const loadData = async () => {
        const pokedex = (await fetchPokemonsFromDatabase()).map(pokemon => pokemon.pokemonName);
        setPokedex(pokedex)
        fetchPokemonData(pokedex);
        fetchTypeIcons();
        postAnswer(bodyPokemon);
    }

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
            const data: PokemonData[] = await response.json();
            setAllPokemon(data);

            const newIaContext = iaContext;
            newIaContext.messages[0].content = iaContext.messages[0].content + `Voici tous les pokemons possible: ${data.map(pokemon => pokemon.name.fr).join(', ')}.`;
            setIaContext(newIaContext);

            const filteredPokemon = data.filter((pokemon) =>
                pokemons.some(
                    (name) => pokemon.name.fr.toLowerCase() === name.toLowerCase()
                        || pokemon.name.en.toLowerCase() === name.toLowerCase()
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

    const fetchPokemonsFromDatabase = async (): Promise<{ id: number, pokemonName: string}[]> => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        return fetch('/pokedex', requestOptions)
            .then(data => data.json());
    }

    const savePokemonInDatabase = async (pokemonName: string): Promise<void> => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "pokemonName": pokemonName
            })
        };

        fetch('/pokedex', requestOptions);
    }

    const modifyBodyAndPost = (answer: string) => {
        const lastMessage = bodyPokemon.messages[bodyPokemon.messages.length - 1];
        const msgContent = lastMessage.content;
        let msgContentJson = { type: "", content: ""};
        if (msgContent.startsWith('```json')) {
            msgContentJson = JSON.parse(msgContent.substring(7, msgContent.length - 3))
        }

        if (lastMessage.role === "assistant" && msgContentJson.type === "answer" && answer === "oui") {
            const pokemonName = msgContentJson.content;
            const newPokedex = [
                ...pokedex, pokemonName
            ];
            setPokedex(newPokedex);
            fetchPokemonData(newPokedex);
            setBodyPokemon(iaContext);
            postAnswer(iaContext);

            if (!pokedex.includes(pokemonName)) {
                savePokemonInDatabase(msgContentJson.content);
            }
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

    const handleUpdateSettings = () => {
        localStorage.setItem('appLanguage', JSON.stringify(appLanguage));
    }

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
                        pokemonName={pokemon.name[appLanguage as keyof typeof pokemon.name]}
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
                appLanguage={appLanguage}
            />
            <div className={`${settingsView ? 'settings_fullsize' : 'settings'}`}>
                <div className="settings_visual">
                    <p className={`placeholder_text ${settingsView ? 'display_placeholder' : ''}`} onClick={() => setSettingsView(!settingsView)}>paramètres</p>
                    <img src={settings_icon} alt="" onClick={() => setSettingsView(!settingsView)} />
                </div>
                <div className={`${settingsView ? 'active' : 'inactive'}`}>
                    <div className="language_btn_list">
                        <button onClick={() => setAppLanguage('fr')}>fr</button>
                        <button onClick={() => setAppLanguage('en')}>en</button>
                        {/* <button onClick={() => setAppLanguage('jp')}>jp</button> */}
                    </div>
                    <p>temperature {AiTemperature}</p>
                    <div className="range_container">
                        <input type="range" name="" id="temperatureSlider" min={0} max={2} step={0.1} list='values' value={AiTemperature} onChange={(e) => setAiTemperature(parseFloat(e.target.value))} />
                    </div>
                    <div className="save_btn_container">
                        <button onClick={handleUpdateSettings}>enregistrer</button>
                    </div>
                    <datalist id="values">
                        <option value="0" label="0"></option>
                        <option value="0.5" label="0.5"></option>
                        <option value="1" label="1"></option>
                        <option value="1.5" label="1.5"></option>
                        <option value="2" label="2"></option>
                    </datalist>
                </div>
            </div>
        </div>
    );
}

export default Homepage;