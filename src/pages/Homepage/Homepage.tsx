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

const formatString = (template: string, ...args: string[]): string => {
    return template.replace(/{([0-9]+)}/g, function (match, index) {
        return typeof args[index] === 'undefined' ? match : args[index];
    });
}

function Homepage() {
    const iaContextTemplate: string = `Tu joues à un jeu avec moi. Voici les règles, je vais penser à un pokemon, tu dois deviner lequel ` +
            `en me posant des questions à laquelle je devrais repondre par "oui", "non" ou "je sais pas. ` +
            `Les nom des pokemons et tes questions seront en {0}. ` +
            `La réponse devra être dans un format json. Un 1er attribut nommé "type" contenant soit "question" si le contenu est une question, ` +
            `soit "answer" si le contenu est une tentative à trouver un pokemon. Le second attribut "content" contiendra le contenu de ta question ou reponse. ` +
            `Lorsque le type est "answer" le content contiendra uniquement le nom du pokemeon et rien d'autre.Ta reponse devra comporter uniquement le json. ` +
            `Voici tous les pokemons possible: {1}.`

    const [iaContext, setIaContext] = useState<ChatBody>({
        "messages": [{
            "role": "system",
            "content": ""
        }]
    });
    const [ pokedex, setPokedex ] = useState<String[]>([]);
    const [pokemonData, setPokemonData] = useState<PokemonData[]>([]);
    const [typeIcons, setTypeIcons] = useState<{ name: string; image: string }[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<PokemonData | null>(null);
    const [settingsView, setSettingsView] = useState(false);
    const [allPokemon, setAllPokemon] = useState<PokemonData[]>([]);
    const [bodyPokemon, setBodyPokemon] = useState<ChatBody>(iaContext);
    
    // Page state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ErrorType | null>(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
    const [isThinking, setIsThinking] = useState<boolean>(false);
    
    // settings
    const [appLanguage, setAppLanguage] = useState('fr');
    const [AiTemperature, setAiTemperature] = useState(1);
    const [tempAppLanguage, setTempAppLanguage] = useState('fr');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [pokedex, allPokemon, settings] = await Promise.all([
            fetchPokemonsFromDatabase(),
            fetchAllPokemon(),
            fetchSettings(),
        ]);

        console.log(settings);

        await Promise.all([
            fetchPokemonData(pokedex, allPokemon),
            fetchTypeIcons(),
            updateContext(settings.language, allPokemon),
        ]);

        postAnswer(bodyPokemon);
    }

    const fetchSettings = async (): Promise<{ language: string, temperature: number }> => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        const settings = await fetch('api/setting', requestOptions)
            .then((data) => data.json());
        
        setAiTemperature(settings.temperature);
        setAppLanguage(settings.language);
        setTempAppLanguage(settings.language);

        return {
            language: settings.language,
            temperature: settings.temperature
        }
    }

    const fetchTypeIcons = async () => {
        try {
            const response = await fetch('https://pokebuildapi.fr/api/v1/types');
            if (!response.ok) {
                const errorMessage = `Erreur HTTP! Statut: ${response.status}`;
                console.error('Erreur lors de la récupération des icônes de type:', errorMessage);
                return;
            }
            const data = await response.json();
            setTypeIcons(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des icônes de type:', error);
        }
    };

    const fetchAllPokemon = async (): Promise<PokemonData[]> => {
        const response = await fetch('https://tyradex.vercel.app/api/v1/pokemon');
        if (!response.ok) {
            const errorMessage = `Erreur HTTP! Statut: ${response.status}`;
            console.error('Erreur lors de la récupération des données Pokémon:', errorMessage);
            return [];
        }
        const data: PokemonData[] = await response.json();
        setAllPokemon(data);
        return data;
    }

    const fetchPokemonData = async (pokemons: String[], allPokemons: PokemonData[]) => {
        setLoading(true);
        setError(null);

        try {
            const filteredPokemon = allPokemons.filter((pokemon) =>
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

    const updateContext = (language: string, allPokemon: PokemonData[]) => {
        const newIaContext = iaContext;
        const pokemonList = allPokemon.map(pokemon => language === "fr" ? pokemon.name.fr : pokemon.name.en).join(', ');
        newIaContext.messages[0].content = formatString(iaContextTemplate, language === "fr" ? "français" : "anglais", pokemonList);
        setIaContext(newIaContext);
        setBodyPokemon(iaContext);
    }

    const postAnswer = async (body: { messages: ChatMessage[]}) => {
        try {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            };
            const response = await fetch('api/chat', requestOptions);
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
            setIsThinking(false);
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la réponse ou du traitement de la réponse:', error);
            setIsThinking(false);
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

    const fetchPokemonsFromDatabase = async (): Promise<string[]> => {
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        const pokemons: { id: number, pokemonName: string}[] = await fetch('api/pokedex', requestOptions)
            .then(data => data.json());

        const pokedex = pokemons.map(pokemon => pokemon.pokemonName);
        setPokedex(pokedex);
        return pokedex;
    }

    const savePokemonInDatabase = async (pokemonName: string): Promise<void> => {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "pokemonName": pokemonName
            })
        };

        fetch('api/pokedex', requestOptions);
    }

    const modifyBodyAndPost = (answer: string) => {
        if (isThinking) {
            return;
        }
        setIsThinking(true);

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
            fetchPokemonData(newPokedex, allPokemon);
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

    const handleDeleteCard = (pokemon: PokemonData) => {
        const index = pokedex.findIndex((pokemonInList) => pokemonInList.toLowerCase() === pokemon.name.fr.toLowerCase());

        const newPokedex = pokedex;
        const deletedPokemonName = newPokedex.splice(index, 1);
        setPokedex(newPokedex);

        const requestOptions = {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "pokemonName": deletedPokemonName[0]
            })
        };
        fetch("api/pokedex", requestOptions);

        fetchPokemonData(newPokedex, allPokemon);
    }

    const handleClosePopup = () => {
        setIsPopupOpen(false);
        setSelectedPokemon(null);
    };

    const handleUpdateSettings = () => {
        setAppLanguage(tempAppLanguage);

        const requestOptions = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "language": tempAppLanguage,
                "temperature": AiTemperature
            })
        };

        fetch("api/setting", requestOptions);      
        window.location.reload();
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
                        <ChoiceBtnList language={appLanguage} onAnswer={modifyBodyAndPost} />
                    </div>
                    <div className="question_area_container">
                        <QuestionArea isThinking={isThinking} question={currentQuestion} />
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
                        onDeleteCard={handleDeleteCard}
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
                    <img src={settings_icon} alt="settings icon" onClick={() => setSettingsView(!settingsView)} />
                </div>
                <div className={`${settingsView ? 'active' : 'inactive'}`}>
                    <div className="language_btn_list">
                        <button onClick={() => setTempAppLanguage('fr')} className={`${tempAppLanguage === 'fr' ? 'btn_active' :  'btn_inactive'}`}>fr</button>
                        <button onClick={() => setTempAppLanguage('en')} className={`${tempAppLanguage === 'en' ? 'btn_active' :  'btn_inactive'}`}>en</button>
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